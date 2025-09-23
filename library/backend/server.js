const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
let JsBarcode;
let createCanvas;
try {
  JsBarcode = require('jsbarcode');
} catch (e) {
  console.warn('jsbarcode not available, using noop');
  JsBarcode = () => {};
}
try {
  const canvasModule = require('canvas');
  createCanvas = canvasModule.createCanvas;
} catch (e) {
  console.warn('canvas not available, using fallback canvas');
  createCanvas = function () {
    return {
      toBuffer: () => Buffer.from(''),
      getContext: () => ({})
    };
  };
}
const sharp = require('sharp');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

// Configure storage for different upload types
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const type = req.params.type || 'book_covers';
    const dir = path.join(__dirname, 'public', type);
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    // Support multiple possible fields for an identifier: id, bookId, or header x-file-id
    const id = req.body.id || req.body.bookId || req.headers['x-file-id'];
    if (id) {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${id}${ext}`);
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }
});

const upload = multer({ storage });

// Barcode generation endpoint
app.post('/api/generate-barcode', async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Create directory if it doesn't exist
    const dir = path.join(__dirname, 'public', 'book_barcodes');
    await fs.mkdir(dir, { recursive: true });

    // Generate barcode as SVG
    const canvas = createCanvas();
    JsBarcode(canvas, bookId, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true
    });

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Save barcode
    const filename = `${bookId}.png`;
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, buffer);

    res.json({
      barcodePath: `/public/book_barcodes/${filename}`
    });
  } catch (error) {
    console.error('Error generating barcode:', error);
    res.status(500).json({ error: 'Failed to generate barcode' });
  }
});

// Generic file upload endpoint (type is optional for backward compatibility)
const uploadHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process image with sharp
    const processedFilePath = path.join(
      path.dirname(req.file.path),
      'processed_' + path.basename(req.file.path)
    );

    await sharp(req.file.path)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(processedFilePath);

    // Delete original file
    await fs.unlink(req.file.path);

    const relativePath = path.relative(
      path.join(__dirname, 'public'),
      processedFilePath
    );

    const publicPath = `/public/${relativePath.replace(/\\/g, '/')}`;

    // Return both keys for compatibility: `imagePath` expected by frontend, `filePath` kept as legacy
    res.json({
      imagePath: publicPath,
      filePath: publicPath,
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
};

app.post('/api/upload', upload.single('file'), uploadHandler);
app.post('/api/upload/:type', upload.single('file'), uploadHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

// --- Simple user profile endpoints (file-backed storage under public/profiles)
app.post('/api/profile', upload.single('file'), async (req, res) => {
  try {
    const { id, name, role } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    // ensure profiles dir exists
    const dir = path.join(__dirname, 'public', 'profiles');
    await fs.mkdir(dir, { recursive: true });

    let avatarPath = null;
    if (req.file) {
      // process and save as predictable filename: <id>.jpg
      const processedFilePath = path.join(path.dirname(req.file.path), 'processed_' + path.basename(req.file.path));
      await sharp(req.file.path)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(processedFilePath);

      const destFilename = `${id}.jpg`;
      const dest = path.join(dir, destFilename);
      await fs.copyFile(processedFilePath, dest);
      avatarPath = `/public/profiles/${destFilename}`;

      // cleanup the uploaded and processed temp files
      try { await fs.unlink(req.file.path); } catch (e) {}
      try { await fs.unlink(processedFilePath); } catch (e) {}
    }

    // Simple JSON storage per profile
    const meta = { id, name: name || '', role: role || '', avatar: avatarPath };
    const metaPath = path.join(dir, `${id}.json`);
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

    res.json({ profile: meta });
  } catch (err) {
    console.error('Profile save error', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const metaPath = path.join(__dirname, 'public', 'profiles', `${id}.json`);
    const data = await fs.readFile(metaPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: 'Profile not found' });
  }
});

// Simple institution persistence endpoints (persist to data/institution.json)
const DATA_DIR = path.join(__dirname, 'data');
const INSTITUTION_FILE = path.join(DATA_DIR, 'institution.json');

app.get('/api/institution', async (req, res) => {
  try {
    const content = await fs.readFile(INSTITUTION_FILE, 'utf8');
    res.json(JSON.parse(content));
  } catch (err) {
    // If file not found return empty object
    if (err.code === 'ENOENT') return res.json({});
    console.error('Error reading institution file', err);
    res.status(500).json({ error: 'Failed to read institution data' });
  }
});

app.post('/api/institution', async (req, res) => {
  try {
    const institution = req.body || {};
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(INSTITUTION_FILE, JSON.stringify(institution, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error('Error saving institution file', err);
    res.status(500).json({ error: 'Failed to save institution data' });
  }
});
