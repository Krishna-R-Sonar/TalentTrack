// frontend/src/components/MyJobs.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMyJobs, deleteJob, clearJobErrors, clearJobMessage } from '../store/slices/jobSlice';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';

const MyJobs = () => {
  const { myJobs, loading, error, message } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyJobs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearJobErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(clearJobMessage());
      // Re-fetch jobs after a deletion or update to ensure the list is up-to-date
      dispatch(fetchMyJobs());
    }
  }, [error, message, dispatch]);

  const handleDeleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      dispatch(deleteJob(id));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-semibold text-primary">My Posted Jobs</h3>
        <Link to="/post-job" className="px-5 py-2.5 bg-secondary text-white font-medium rounded-md hover:bg-green-600 transition-colors">
          Post New Job
        </Link>
      </div>
      {loading && (!myJobs || myJobs.length === 0) ? (
        <Spinner />
      ) : !myJobs || myJobs.length === 0 ? (
        <div className="text-center py-10 bg-neutral rounded-lg">
          <h1 className="text-xl font-semibold text-dark mb-4">You have not posted any jobs yet.</h1>
        </div>
      ) : (
        <div className="space-y-6">
          {myJobs.map((job) => (
            <div key={job._id} className="bg-neutral p-4 sm:p-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row justify-between">
                <div>
                  <p className="text-xl font-bold text-dark">{job.title}</p>
                  <p className="text-gray-600">{job.companyName} - {job.location}</p>
                  <p className="text-gray-500 text-sm mt-1">Posted On: {new Date(job.jobPostedOn).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-4 items-start">
                  <Link to={`/dashboard/edit-job/${job._id}`} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;