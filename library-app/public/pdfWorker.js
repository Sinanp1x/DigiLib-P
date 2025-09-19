/* eslint-disable no-restricted-globals */
/* eslint-env worker */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.3/jspdf.plugin.autotable.min.js');
importScripts('/assets/fonts/Rachana-Regular-bold.js'); // Adjust to your font file path

const { jsPDF } = jspdf;

self.onmessage = async (e) => {
  try {
    const { books, copyCounts } = e.data;
    if (!books || books.length === 0) {
      self.postMessage({ error: 'No books to generate PDF' });
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const chunkSize = 50; // Reduced for better memory management
    const booksPerPage = 6;
    // Cache for barcode images
    const imageCache = {};

    const loadImage = async (url, id) => {
      if (!url) return null;
      if (imageCache[id]) return imageCache[id];
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            imageCache[id] = reader.result;
            resolve(reader.result);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };

    // Load images in chunks
    const images = [];
    for (let i = 0; i < books.length; i += chunkSize) {
      const batch = books.slice(i, i + chunkSize);
      const batchImages = await Promise.all(
        batch.map(book => loadImage(book.barcodeUrl, book.id))
      );
      images.push(...batchImages);
      const progress = Math.round(((i + batch.length) / books.length) * 50);
      self.postMessage({ progress });
    }

    // Generate PDF pages
    const pages = Math.ceil(books.length / booksPerPage);
    for (let page = 0; page < pages; page++) {
      if (page > 0) doc.addPage();

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Book Catalogue', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 14, 28);

      const startIdx = page * booksPerPage;
      const endIdx = Math.min(startIdx + booksPerPage, books.length);
      const pageBooks = books.slice(startIdx, endIdx);
      const pageImages = images.slice(startIdx, endIdx);

      doc.setFont('Rachana', 'bold');
      doc.setFontSize(17);

      const tableBody = pageBooks.map((book, i) => {
        const isMalayalam = /[\u0D00-\u0D7F]/.test(book.title);
        const available = copyCounts[book.id]?.available || 0;
        const titleContent = isMalayalam
          ? {
              content: `${book.title}\n${available > 0 ? `${available} copies available` : 'No copies available'}`,
              styles: { font: 'Rachana', fontStyle: 'bold' }
            }
          : `${book.title}\n${available > 0 ? `${available} copies available` : 'No copies available'}`;
        return [
          book.serial,
          titleContent,
          book.genre,
          pageImages[i] ? { image: pageImages[i], width: 50, height: 20 } : 'No Barcode'
        ];
      });

      doc.autoTable({
        startY: 35,
        head: [['S.No', 'Title', 'Genre', 'Barcode']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          valign: 'middle',
          minCellHeight: 25
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 132 }, // 120 + 12 = 132
          2: { cellWidth: 50, halign: 'center' },
          3: { cellWidth: 70, halign: 'center' }
        },
        margin: { left: 10, right: 10 },
        didDrawCell: (data) => {
          if (
            data.column.index === 3 &&
            data.cell.raw &&
            typeof data.cell.raw === 'object' &&
            data.cell.raw.image
          ) {
            const { image, width, height } = data.cell.raw;
            doc.addImage(
              image, // now a dataURL string
              'PNG',
              data.cell.x + (data.cell.width - width) / 2,
              data.cell.y + (data.cell.height - height) / 2,
              width,
              height
            );
          }
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Page ${page + 1} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      doc.text('Al-Burhan Library', 14, doc.internal.pageSize.height - 10);

      // Progress for page rendering
      const progress = 50 + Math.round(((page + 1) / pages) * 50);
      self.postMessage({ progress });
    }

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    self.postMessage({ blobUrl });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};