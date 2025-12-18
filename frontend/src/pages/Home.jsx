// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import TopNiches from '../components/TopNiches';
import HowItWorks from '../components/HowItWorks';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Hero />
      <TopNiches />
      <HowItWorks />
      
      {/* Community Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Thriving Community</h2>
            <p className="text-xl text-gray-600">Connect, collaborate, and grow with professionals in your field</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Groups */}
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional Groups</h3>
              <p className="text-gray-600 mb-4">Join niche-specific groups to connect with like-minded professionals</p>
              <Link 
                to="/groups" 
                className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Explore Groups
              </Link>
            </div>

            {/* Events */}
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Industry Events</h3>
              <p className="text-gray-600 mb-4">Attend webinars, workshops, and networking events</p>
              <Link 
                to="/events" 
                className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Browse Events
              </Link>
            </div>

            {/* Community */}
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Posts</h3>
              <p className="text-gray-600 mb-4">Share insights, ask questions, and discover opportunities</p>
              <Link 
                to="/community" 
                className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                View Community
              </Link>
            </div>

            {/* Connections */}
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional Network</h3>
              <p className="text-gray-600 mb-4">Build meaningful connections with industry professionals</p>
              <Link 
                to="/connections" 
                className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Connect Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Community?</h2>
          <p className="text-xl text-primary-light mb-8">Start building your professional network today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-block bg-white text-primary px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;