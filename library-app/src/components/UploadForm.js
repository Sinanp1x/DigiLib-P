import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, doc, setDoc, updateDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import JsBarcode from 'jsbarcode';
import { toast } from 'react-toastify';

function UploadForm({ book, onSubmit, onCancel }) {
  const { db, storage, user, role } = useAuth();

  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    genre: book?.genre || '',
    language: book?.language || '',
    cover: null,  
    seriesTitle: book?.seriesTitle || '',
    volumeNumber: book?.volumeNumber || '',
    numberOfCopies: 1, // NEW: default to 1
  });
  const [error, setError] = useState('');

  const genrePrefixes = {
    'Adventure': 'AD',
    'Art & Photography': 'AP',
    'Biography/Autobiography': 'BA',
    'Business/Economics': 'BE',
    'Creative Non-Fiction': 'CN',
    'Crime': 'CR',
    'Drama/Plays': 'DP',
    'Education': 'ED',
    'Experimental': 'EX',
    'Fantasy': 'FA',
    'Graphic Novels/Comics': 'GN',
    'Health & Wellness': 'HW',
    'Historical Fiction': 'HF',
    'History': 'HI',
    'Horror': 'HO',
    'Humor/Satire': 'HS',
    'Interview': 'IN',
    'Journalism': 'JR',
    'Literary Fiction': 'LF',
    'Memoir': 'ME',
    'Mystery': 'MY',
    'Novels': 'NO',
    'Non-Fiction': 'NF',
    'Philosophy': 'PH',
    'Poetry': 'PO',
    'Politics/Current Affairs': 'PC',
    'Reference': 'RE',
    'Religion/Spirituality': 'RS',
    'Romance': 'RO',
    'Science': 'SC',
    'Science & Technology': 'ST',
    'Self-Help': 'SH',
    'Short Stories': 'SS',
    'Speculative Fiction': 'SF',
    'Thriller/Suspense': 'TS',
    'Travel': 'TR',
    'True Adventure': 'TA',
    'True Crime': 'TC',
    'Young Adult (YA)': 'YA'
  };

  const generateLCCNumber = (genre, author) => {
    const genrePrefix = genrePrefixes[genre] || 'Z';
    const authorCode = author ? author.slice(0, 3).toUpperCase() : 'UNK';
    return `${genrePrefix}${Math.floor(Math.random() * 1000)}.${authorCode}`;
  };

  const generateBarcode = (lccNumber) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, lccNumber, { format: 'CODE128', displayValue: true });
    return canvas.toDataURL('image/png');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user || role !== 'admin') {
      setError('Only admins can submit books');
      return;
    }

    if (!db || !storage) {
      setError('Database or storage is not initialized.');
      return;
    }

    try {
      if (!formData.title || !formData.author || !formData.genre || !formData.language) {
        setError('Please fill all required fields');
        return;
      }

      let coverUrl = book?.coverUrl || '';
      if (formData.cover) {
        const coverRef = ref(storage, `covers/${formData.title}_${Date.now()}`);
        try {
          await uploadBytes(coverRef, formData.cover);
          coverUrl = await getDownloadURL(coverRef);
        } catch (storageError) {
          console.error('Storage upload error:', storageError);
          setError('Failed to upload cover image: ' + storageError.message);
          return;
        }
      }

      if (book) {
        try {
          // Update main book document
          await updateDoc(doc(db, 'books', book.id), {
            title: formData.title,
            author: formData.author,
            genre: formData.genre,
            language: formData.language,
            coverUrl,
            seriesTitle: formData.seriesTitle,
            volumeNumber: formData.volumeNumber,
          });

          // Handle copy count changes
          const copiesRef = collection(db, 'books', book.id, 'copies');
          const copiesSnap = await getDocs(copiesRef);
          const currentCopies = copiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const currentTotalCopies = currentCopies.length;
          const newTotalCopies = Number(formData.numberOfCopies);

          if (newTotalCopies > currentTotalCopies) {
            const diff = newTotalCopies - currentTotalCopies;
            const lccNumber = book.lccNumber;
            const maxSerial = currentCopies.reduce((max, copy) => {
              const serialNum = parseInt(copy.serial.replace('C', ''), 10);
              return serialNum > max ? serialNum : max;
            }, 0);

            for (let i = 1; i <= diff; i++) {
              const copySerial = `C${maxSerial + i}`;
              const copyBarcodeValue = `${lccNumber}-${copySerial}`;
              const copyBarcodeDataUrl = generateBarcode(copyBarcodeValue);
              const copyBarcodeBlob = await (await fetch(copyBarcodeDataUrl)).blob();
              const copyBarcodeRef = ref(storage, `barcodes/${copyBarcodeValue}.png`);
              await uploadBytes(copyBarcodeRef, copyBarcodeBlob);
              const copyBarcodeUrl = await getDownloadURL(copyBarcodeRef);

              await addDoc(copiesRef, {
                barcode: copyBarcodeValue, barcodeUrl: copyBarcodeUrl, status: 'available', serial: copySerial, addedDate: new Date(),
              });
            }
            toast.success(`Added ${diff} new copies.`);
          } else if (newTotalCopies < currentTotalCopies) {
            const diff = currentTotalCopies - newTotalCopies;
            const availableCopies = currentCopies.filter(copy => copy.status === 'available');
            if (availableCopies.length < diff) {
              toast.error(`Cannot remove ${diff} copies. Only ${availableCopies.length} are available.`);
            } else {
              const copiesToRemove = availableCopies.slice(0, diff);
              for (const copy of copiesToRemove) {
                const barcodeToDeleteRef = ref(storage, `barcodes/${copy.barcode}.png`);
                await deleteObject(barcodeToDeleteRef).catch(err => console.warn("Could not delete barcode image:", err));
                await deleteDoc(doc(db, 'books', book.id, 'copies', copy.id));
              }
              toast.info(`Removed ${copiesToRemove.length} available copies.`);
            }
          }

          toast.success('Book updated successfully!');
          onSubmit();

        } catch (error) {
          console.error('Update failed:', error);
          toast.error('Failed to update book: ' + error.message);
          return;
        }
      } else {
        // Add new book
        const lccNumber = generateLCCNumber(formData.genre, formData.author);
        const barcodeDataUrl = generateBarcode(lccNumber);
        const barcodeBlob = await (await fetch(barcodeDataUrl)).blob();
        const barcodeRef = ref(storage, `barcodes/${lccNumber}.png`);
        try {
          await uploadBytes(barcodeRef, barcodeBlob);
        } catch (storageError) {
          console.error('Barcode upload error:', storageError);
          setError('Failed to upload barcode: ' + storageError.message);
          return;
        }
        const barcodeUrl = await getDownloadURL(barcodeRef);

        const bookId = doc(collection(db, 'books')).id;
        const newBook = {
          title: formData.title,
          author: formData.author,
          genre: formData.genre,
          language: formData.language,
          lccNumber,
          barcodeUrl,
          coverUrl,
          available: true,
          waitingList: [],
          seriesTitle: formData.seriesTitle,
          volumeNumber: formData.volumeNumber,
        };
        await setDoc(doc(db, 'books', bookId), newBook);

        // Create copies with unique barcodes
        for (let i = 1; i <= formData.numberOfCopies; i++) {
          // Generate a unique barcode for each copy (e.g., append serial)
          const copySerial = `C${i}`;
          const copyBarcodeValue = `${lccNumber}-${copySerial}`;
          const copyBarcodeDataUrl = generateBarcode(copyBarcodeValue);
          const copyBarcodeBlob = await (await fetch(copyBarcodeDataUrl)).blob();
          const copyBarcodeRef = ref(storage, `barcodes/${lccNumber}-${copySerial}.png`);
          await uploadBytes(copyBarcodeRef, copyBarcodeBlob);
          const copyBarcodeUrl = await getDownloadURL(copyBarcodeRef);

          await setDoc(doc(collection(db, 'books', bookId, 'copies')), {
            barcode: copyBarcodeValue,
            barcodeUrl: copyBarcodeUrl,
            status: 'available',
            serial: copySerial,
            addedDate: new Date()
          });
        }

        toast.success('Book added successfully!');
        onSubmit();
      }

      resetForm();
      if (book && onCancel) onCancel();
    } catch (error) {
      console.error('Error submitting book:', error);
      toast.error('Failed to submit book: ' + error.message);
    }
  };

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || '',
        language: book.language || '',
        cover: null,
        seriesTitle: book.seriesTitle || '',
      volumeNumber: typeof book.volumeNumber === 'number' ? book.volumeNumber : '', // allow empty for optional
      numberOfCopies: typeof book.numberOfCopies === 'number' ? book.numberOfCopies : 1,
      });
    } else {
      setFormData({
        title: '',
        author: '',
        genre: '',
        language: '',
        cover: null,
        seriesTitle: '',
        volumeNumber: '',
        numberOfCopies: 1,
      });
    }
  }, [book]);

  // Add this function to reset the form
  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      genre: '',
      language: '',
      cover: null,
      seriesTitle: '',
      volumeNumber: '',
      numberOfCopies: 1,
    });
    setError('');
  };

  return (
    <motion.form
      id="book-form" // <-- Add this line
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-6"
    >
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mb-4"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Book title"
          required
        />
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Author"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Book author"
          required
        />
        <select
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Book genre"
          required
        >
          <option value="">Select Genre</option>
          {Object.keys(genrePrefixes).map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Book language"
          required
        >
          <option value="">Select Language</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="Malayalam">Malayalam</option>
          <option value="Urdu">Urdu</option>
          <option value="Arabic">Arabic</option>
          <option value="Kannada">Kannada</option>
          <option value="Tamil">Tamil</option>
          <option value="Hindi">Hindi</option>
        </select>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              setFormData({ ...formData, cover: file });
            }
          }}
          onClick={() => document.getElementById('cover-upload').click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <p className="text-gray-600">📁 Drag & drop image here or click to select</p>
          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && file.type.startsWith('image/')) {
                setFormData({ ...formData, cover: file });
              }
            }}
          />
          {formData.cover && (
            <p className="text-sm mt-2 text-green-600">Selected: {formData.cover.name}</p>
          )}
        </div>
        <input
          type="text"
          value={formData.seriesTitle}
          onChange={e => setFormData({ ...formData, seriesTitle: e.target.value })}
          placeholder="Series Title, Only if the book is part of a series (optional)"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Series title"
        />
        <input
          type="number"
          value={formData.volumeNumber === '' ? '' : formData.volumeNumber}
          onChange={e => setFormData({ ...formData, volumeNumber: e.target.value === '' ? '' : Number(e.target.value) })}
          placeholder="Volume Number, Only if the book is part of a series (optional)"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Volume number"
          min={1}
        />
        <input
          type="number"
          value={typeof formData.numberOfCopies === 'number' ? formData.numberOfCopies : 1}
          min={1}
          onChange={e => setFormData({ ...formData, numberOfCopies: Number(e.target.value) })}
          placeholder="Number of Copies"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Number of copies"
          required
        />
      </div>
      <div className="mt-4 flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          aria-label={book ? 'Update book' : 'Add book'}
        >
          {book ? 'Update Book' : 'Add Book'}
        </motion.button>
        {book && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
            aria-label="Cancel editing"
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.form>
  );
}

export default UploadForm;