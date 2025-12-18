// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/userSlice';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success('Logged out successfully!');
        navigate('/');
        setMobileMenuOpen(false);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-primary" onClick={closeMobileMenu}>
              TalentTrack
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/jobs" className="text-gray-700 hover:text-primary text-sm">
              Jobs
            </Link>
            <Link to="/groups" className="text-gray-700 hover:text-primary text-sm">
              Groups
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-primary text-sm">
              Events
            </Link>
            <Link to="/community" className="text-gray-700 hover:text-primary text-sm">
              Community
            </Link>
            <Link to="/connections" className="text-gray-700 hover:text-primary text-sm">
              Connections
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-primary text-sm">
              News
            </Link>
            <Link to="/post-job" className="text-gray-700 hover:text-primary text-sm">
              Post Job
            </Link>
            {isAuthenticated ? (
              <>
                {user?.totalImpactPoints !== undefined && (
                  <Link 
                    to="/dashboard/impact-points" 
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue-200"
                    title="View Impact Points"
                  >
                    <span>⭐</span>
                    <span className="hidden sm:inline">{user.totalImpactPoints || 0} Points</span>
                    <span className="sm:hidden">{user.totalImpactPoints || 0}</span>
                  </Link>
                )}
                <Link to="/dashboard/account" className="text-gray-700 hover:text-primary text-sm">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary text-sm">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/jobs" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                Jobs
              </Link>
              <Link to="/groups" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                Groups
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                Events
              </Link>
              <Link to="/community" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                Community
              </Link>
              <Link to="/connections" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                Connections
              </Link>
              <Link to="/news" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                News
              </Link>
              <Link to="/post-job" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                Post Job
              </Link>
              {isAuthenticated ? (
                <>
                  {user?.totalImpactPoints !== undefined && (
                    <Link 
                      to="/dashboard/impact-points" 
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold w-fit"
                      onClick={closeMobileMenu}
                    >
                      <span>⭐</span>
                      <span>{user.totalImpactPoints || 0} Points</span>
                    </Link>
                  )}
                  <Link to="/dashboard/account" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 hover:text-primary px-2 py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-primary px-2 py-1" onClick={closeMobileMenu}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;