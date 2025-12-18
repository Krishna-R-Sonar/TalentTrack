// frontend/src/components/Account.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Account = () => {
  const { user } = useSelector((state) => state.user);

  if (!user) {
    return <p className="text-center text-dark text-lg font-medium">Loading user data...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-lg">
      <h3 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">Account Information</h3>
      <div className="space-y-4">
        <p className="text-dark text-base sm:text-lg"><strong>Name:</strong> {user.name}</p>
        <p className="text-dark text-base sm:text-lg"><strong>Email:</strong> {user.email}</p>
        <p className="text-dark text-base sm:text-lg"><strong>Phone:</strong> {user.phone}</p>
        <p className="text-dark text-base sm:text-lg"><strong>Address:</strong> {user.address}</p>
        <p className="text-dark text-base sm:text-lg"><strong>Role:</strong> {user.role}</p>
        {user.role === 'Job Seeker' && (
          <>
            <p className="text-dark text-base sm:text-lg"><strong>Preferred Niches:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li className="text-dark">{user.niches?.firstNiche}</li>
              <li className="text-dark">{user.niches?.secondNiche}</li>
              <li className="text-dark">{user.niches?.thirdNiche}</li>
            </ul>
            {user.resume?.url && (
              <p className="text-dark text-base sm:text-lg">
                <strong>Resume:</strong>{' '}
                <a
                  href={user.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Resume
                </a>
              </p>
            )}
          </>
        )}
        <div className="mt-6">
          <Link
            to="/dashboard/update-profile"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Account;