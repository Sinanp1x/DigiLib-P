import { useState, useEffect } from 'react';

export default function AdminCommunity() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution')) || {};
    setPosts(institution.communityPosts || []);
  }, []);

  const filteredPosts = posts.filter(post =>
    post.bookTitle.toLowerCase().includes(filter.toLowerCase()) ||
    post.studentName.toLowerCase().includes(filter.toLowerCase()) ||
    post.reviewText.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Community Reviews</h1>
        <input
          type="text"
          placeholder="Search reviews..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg w-80"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map(post => (
          <div key={post.postId} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{post.bookTitle}</h3>
                <p className="text-sm text-gray-600">
                  Reviewed by {post.studentName} • {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
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
            <p className="text-gray-700 mb-4">{post.reviewText}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                👍 {post.likes.length} likes
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          {filter ? 'No reviews found matching your search.' : 'No reviews yet.'}
        </p>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Community Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary-blue">{posts.length}</p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary-blue">
              {posts.reduce((sum, post) => sum + post.likes.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary-blue">
              {posts.reduce((sum, post) => sum + post.rating, 0) / posts.length || 0}
            </p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}