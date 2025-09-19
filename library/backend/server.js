const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/book_covers', express.static(path.join(__dirname, 'public/book_covers')));

const uploadFolder = path.join(__dirname, 'public/book_covers');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueBookId = req.body.bookId || req.headers['x-book-id'];
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueBookId}${ext}`);
  }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  const uniqueBookId = req.body.bookId || req.headers['x-book-id'];
  if (!req.file || !uniqueBookId) {
    return res.status(400).json({ error: 'Upload failed' });
  }
  const imagePath = `/book_covers/${req.file.filename}`;
  res.json({ imagePath });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
