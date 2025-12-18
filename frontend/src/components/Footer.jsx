// frontend/src/components/Footer.jsx
import React from 'react';
import talentTrackLogo from './talenttracklogo.png';
const Footer = () => {
  return (
    <footer className="bg-dark text-white p-6">
      <div className="container mx-auto flex flex-wrap gap-6">
        <div className="flex-1 min-w-[200px]">
          <img src={talentTrackLogo} alt="Logo" className="w-32 mx-auto" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h4 className="text-xl font-bold mb-4">Links</h4>
          <ul className="flex flex-col gap-2">
            <li><a href="#" className="text-gray-300 hover:text-accent transition">Home</a></li>
            <li><a href="#" className="text-gray-300 hover:text-accent transition">Jobs</a></li>
            <li><a href="#" className="text-gray-300 hover:text-accent transition">Dashboard</a></li>
          </ul>
        </div>
        <div className="flex-1 min-w-[200px]">
          <h4 className="text-xl font-bold mb-4">Contact</h4>
          <ul className="flex flex-col gap-2">
            <li><a href="#" className="text-gray-300 hover:text-accent transition">Email Us</a></li>
            <li><a href="#" className="text-gray-300 hover:text-accent transition">Support</a></li>
          </ul>
        </div>
      </div>
      <div className="bg-dark text-center text-gray-400 p-4">
        &copy; 2025 TalentTrack. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;