// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-dark mb-4">404 Not Found</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6">Your visited page was not found. You may go to the home page.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Home Page
        </Link>
      </div>
    </section>
  );
};

export default NotFound;