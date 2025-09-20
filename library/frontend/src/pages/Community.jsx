import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { toast } from 'react-hot-toast';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [reviewForm, setReviewForm] = useState({
    reviewText: '',
    rating: 5
  });
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution')) || {};
    setPosts(institution.communityPosts || []);
    setBooks(institution.books || []);
  }, []);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setBookSearch(book.title);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedBook) {
      toast.error('Please select a book to review');
      return;
    }

    const institution = JSON.parse(localStorage.getItem('institution'));
    
    // Check if student has borrowed this book
    const hasHistory = (institution.history || []).some(
      h => h.studentId === student.uniqueStudentId && h.bookId === selectedBook.uniqueBookId
    );

    if (!hasHistory) {
      toast.error('You can only review books you have borrowed');
      return;
    }

    const newPost = {
      postId: `POST-${Date.now()}`,
      studentId: student.uniqueStudentId,
      studentName: student.name,
      bookId: selectedBook.uniqueBookId,
      bookTitle: selectedBook.title,
      reviewText: reviewForm.reviewText,
      rating: parseInt(reviewForm.rating),
      likes: [],
      date: new Date().toISOString()
    };

    const updatedInstitution = {
      ...institution,
      communityPosts: [...(institution.communityPosts || []), newPost]
    };

    localStorage.setItem('institution', JSON.stringify(updatedInstitution));
    setPosts([...posts, newPost]);
    setReviewForm({ reviewText: '', rating: 5 });
    setSelectedBook(null);
    setBookSearch('');
    toast.success('Review posted successfully!');
  };

  const handleLike = (postId) => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    const updatedPosts = institution.communityPosts.map(post => {
      if (post.postId === postId) {
        const likes = new Set(post.likes);
        if (likes.has(student.uniqueStudentId)) {
          likes.delete(student.uniqueStudentId);
        } else {
          likes.add(student.uniqueStudentId);
        }
        return { ...post, likes: Array.from(likes) };
      }
      return post;
    });

    institution.communityPosts = updatedPosts;
    localStorage.setItem('institution', JSON.stringify(institution));
    setPosts(updatedPosts);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-primary-blue mb-6">Community Reviews</h1>

      {/* Write Review Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Book
            </label>
            <div className="relative">
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Search for a book..."
                className="w-full p-2 border rounded"
              />
              {bookSearch && (
                <ul className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-60 overflow-auto">
                  {filteredBooks.map(book => (
                    <li
                      key={book.uniqueBookId}
                      onClick={() => handleBookSelect(book)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {book.title} by {book.author}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Write your review here..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-blue text-white p-2 rounded hover:bg-secondary-blue"
          >
            Post Review
          </button>
        </form>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.postId} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{post.bookTitle}</h3>
                <p className="text-sm text-gray-600">
                  Reviewed by {post.studentName} • {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < post.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{post.reviewText}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleLike(post.postId)}
                className={`flex items-center space-x-2 px-4 py-2 rounded ${
                  post.likes.includes(student.uniqueStudentId)
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>👍</span>
                <span>{post.likes.length} likes</span>
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-500">No reviews yet. Be the first to write one!</p>
        )}
      </div>
    </div>
  );
}