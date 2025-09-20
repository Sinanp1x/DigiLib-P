const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
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
app.post('/api/upload/:type?', upload.single('file'), async (req, res) => {
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
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
