import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// NOTE: For best scanning results install `@zxing/library` in the frontend:
// npm install @zxing/library
// The component will attempt to use it if present, otherwise it falls back to a naive approach that captures a frame and asks the user to type the code.

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(null);
  const [manualValue, setManualValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let stream;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
        }

        // Try to dynamically import @zxing/library for better scanning
        try {
          const ZXing = await import('@zxing/library');
          const codeReader = new ZXing.BrowserMultiFormatReader();
          codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (result) {
              setScanned(result.getText());
              codeReader.reset();
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
              console.error(err);
            }
          });
        } catch (e) {
          // library not available: fallback to manual capture
          console.warn('ZXing not available, falling back to manual capture');
        }
      } catch (err) {
        setError('Unable to access camera. Please allow camera access or use manual entry.');
        console.error(err);
      }
    };
    start();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    // Take a snapshot and show the image to the user for manual decode or future processing
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // For now we don't decode here; instruct user to enter code manually or rely on ZXing dynamic import
  };

  const lookupBook = (id) => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || { books: [] };
    const book = institution.books?.find(b => b.id === id);
    return book;
  };

  const handleCheckout = (id) => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || { books: [] };
    const idx = institution.books.findIndex(b => b.id === id);
    if (idx === -1) {
      setError('Book not found');
      return;
    }
    if (institution.books[idx].copies <= 0) {
      setError('No copies available');
      return;
    }
    institution.books[idx].copies = Math.max(0, institution.books[idx].copies - 1);
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    navigate('/catalogue');
  };

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-border-light">
        <h2 className="text-2xl font-bold mb-6 text-primary-blue">Scan Book Barcode</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="flex flex-col items-center gap-4">
          <video ref={videoRef} className="w-full max-h-96 rounded-lg border border-border-light" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="flex gap-2 w-full">
            <button onClick={handleCapture} className="flex-1 bg-primary-blue text-white px-4 py-2 rounded">Capture Frame</button>
            <button onClick={() => { setScanned(null); setError(''); }} className="flex-1 bg-gray-200 px-4 py-2 rounded">Reset</button>
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-text-dark mb-2">Manual entry</label>
            <div className="flex gap-2">
              <input value={manualValue} onChange={e => setManualValue(e.target.value)} placeholder="Enter scanned code manually" className="flex-1 px-3 py-2 border border-border-light rounded" />
              <button onClick={() => setScanned(manualValue)} className="bg-primary-blue text-white px-4 py-2 rounded">Use Value</button>
            </div>
          </div>

          {scanned && (
            <div className="w-full bg-bg-light p-4 rounded border border-border-light">
              <div className="font-bold text-primary-blue mb-2">Scanned Code: {scanned}</div>
              <div className="mb-2">
                {lookupBook(scanned) ? (
                  <>
                    <div>Book: {lookupBook(scanned).title} — Copies: {lookupBook(scanned).copies}</div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleCheckout(scanned)} className="bg-primary-blue text-white px-4 py-2 rounded">Checkout</button>
                      <button onClick={() => navigate('/catalogue')} className="bg-gray-200 px-4 py-2 rounded">Back to Catalogue</button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">No matching book found in the catalogue.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
