// frontend/src/components/AuthRequired.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AuthRequired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please login/register to track your talent
          </p>
        </div>
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthRequired;

