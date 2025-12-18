// frontend/src/pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllJobs, clearJobErrors } from "../store/slices/jobSlice.js";
import Spinner from "../components/Spinner.jsx";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthRequired from "../components/AuthRequired.jsx";

const Jobs = () => {
    const [filters, setFilters] = useState({
        city: "",
        niche: "",
        searchKeyword: "",
        workArrangement: ""
    });

    const { jobs, loading, error } = useSelector((state) => state.jobs);
    const { isAuthenticated } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setAuthError(true);
            return;
        }
        dispatch(getAllJobs(filters));
    }, [dispatch, filters, isAuthenticated]);

    useEffect(() => {
        if (error) {
            if (error.includes('not authenticated') || error.includes('401') || error.includes('403')) {
                setAuthError(true);
                return;
            }
            toast.error(error);
            dispatch(clearJobErrors());
        }
    }, [error, dispatch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
        "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur", "Surat",
        "Nagpur", "Patna", "Indore", "Bhopal", "Vadodara", "Coimbatore",
        "Thiruvananthapuram", "Visakhapatnam",
    ];
    const nichesArray = [
        "Software Development", "Web Development", "Cybersecurity", "Data Science",
        "Artificial Intelligence", "Cloud Computing", "DevOps", "Mobile App Development",
        "UI/UX Design", "Machine Learning", "IT Project Management"
    ];
    const workArrangements = ["Remote", "On-site", "Hybrid"];

    if (authError || !isAuthenticated) {
        return <AuthRequired />;
    }

    return (
        <>
            {loading ? (
                <Spinner />
            ) : (
                <section className="py-6 px-4 sm:px-6 bg-gray-100 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <input
                                    type="text"
                                    name="searchKeyword"
                                    value={filters.searchKeyword}
                                    onChange={handleFilterChange}
                                    placeholder="Search by title, company, or keyword..."
                                    className="w-full p-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6">
                            <aside className="lg:w-1/4 space-y-6">
                                {/* Filters */}
                                <div className="bg-white p-4 rounded-md shadow-md">
                                    <h2 className="text-lg font-semibold text-dark mb-4">Filter by City</h2>
                                    <select name="city" value={filters.city} onChange={handleFilterChange} className="w-full p-2 rounded-md border border-gray-300">
                                        <option value="">All Cities</option>
                                        {cities.map((city, index) => <option key={index} value={city}>{city}</option>)}
                                    </select>
                                </div>
                                <div className="bg-white p-4 rounded-md shadow-md">
                                    <h2 className="text-lg font-semibold text-dark mb-4">Filter by Niche</h2>
                                     <select name="niche" value={filters.niche} onChange={handleFilterChange} className="w-full p-2 rounded-md border border-gray-300">
                                        <option value="">All Niches</option>
                                        {nichesArray.map((niche, index) => <option key={index} value={niche}>{niche}</option>)}
                                    </select>
                                </div>
                                <div className="bg-white p-4 rounded-md shadow-md">
                                    <h2 className="text-lg font-semibold text-dark mb-4">Work Arrangement</h2>
                                     <select name="workArrangement" value={filters.workArrangement} onChange={handleFilterChange} className="w-full p-2 rounded-md border border-gray-300">
                                        <option value="">All Types</option>
                                        {workArrangements.map((wa, index) => <option key={index} value={wa}>{wa}</option>)}
                                    </select>
                                </div>
                            </aside>
                            <div className="lg:w-3/4">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {jobs && jobs.length > 0 ? (
                                        jobs.map((job) => (
                                            <div key={job._id} className="bg-white p-4 rounded-md shadow-md flex flex-col justify-between">
                                                <div>
                                                    <p className="text-lg font-semibold text-dark">{job.title}</p>
                                                    <p className="text-gray-600">{job.companyName}</p>
                                                    <p className="text-gray-500 text-sm">{job.location}</p>
                                                    <p className="text-gray-800 mt-2"><span className="font-medium">Salary:</span> {job.salary}</p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        <span className="font-medium">Posted:</span>{" "}
                                                        {new Date(job.jobPostedOn).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="mt-4">
                                                    <Link
                                                        className="w-full text-center block px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                                                        to={`/jobs/${job._id}`}
                                                    >
                                                        View & Apply
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-dark text-lg col-span-full text-center">No jobs found matching your criteria.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default Jobs;