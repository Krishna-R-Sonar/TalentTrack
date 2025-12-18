// frontend/src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          Discover Your Ideal Job Today
        </h1>
        <h4 className="text-lg sm:text-xl lg:text-2xl font-medium mb-6">
          Bridging Talent with Opportunities Across the Nation for Every Skill Level
        </h4>
        <div className="max-w-2xl mx-auto text-base sm:text-lg text-gray-100">
          Dive into a diverse selection of job listings tailored to various industries. Whether you are an experienced professional or embarking on your career journey, we are dedicated to helping you find the perfect role that propels your career forward. Our platform simplifies the job search process, making it seamless and efficient, and brings you one step closer to your next exciting opportunity.
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/jobs"
            className="px-6 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-200 transition-colors"
          >
            Browse Jobs
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-secondary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;