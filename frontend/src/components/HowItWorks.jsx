// frontend/src/components/HowItWorks.jsx
import React from 'react';
import { LuUserPlus } from 'react-icons/lu';
import { VscTasklist } from 'react-icons/vsc';
import { BiSolidLike } from 'react-icons/bi';

const HowItWorks = () => {
  return (
    <section className="py-12 sm:py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-dark text-center mb-8">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <div className="text-4xl text-primary mb-4 flex justify-center">
              <LuUserPlus />
            </div>
            <h4 className="text-lg sm:text-xl font-medium text-dark mb-2">
              Create an Account
            </h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Sign up for a free account as a job seeker or employer. Set up your
              profile in minutes to start posting jobs or applying for jobs.
              Customize your profile to highlight your skills or requirements.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <div className="text-4xl text-primary mb-4 flex justify-center">
              <VscTasklist />
            </div>
            <h4 className="text-lg sm:text-xl font-medium text-dark mb-2">
              Post or Browse Jobs
            </h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Employers can post detailed job descriptions, and job seekers can
              browse a comprehensive list of available positions. Utilize filters
              to find jobs that match your skills and preferences.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <div className="text-4xl text-primary mb-4 flex justify-center">
              <BiSolidLike />
            </div>
            <h4 className="text-lg sm:text-xl font-medium text-dark mb-2">
              Hire or Get Hired
            </h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Employers can shortlist candidates and extend job offers. Job
              seekers can review job offers and accept positions that align with
              their career goals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;