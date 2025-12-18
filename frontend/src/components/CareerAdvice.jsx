// frontend/src/components/CareerAdvice.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCareerAdvice, clearAdvice, clearUserErrors } from '../store/slices/userSlice';
import Spinner from './Spinner';

const CareerAdvice = () => {
    const { isAuthenticated, adviceLoading, adviceError, careerAdvice } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [query, setQuery] = useState('');

    useEffect(() => {
        if (adviceError) {
            toast.error(adviceError);
            dispatch(clearUserErrors());
        }
        // Clear previous advice when component mounts
        return () => {
            dispatch(clearAdvice());
        };
    }, [adviceError, dispatch]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!query.trim()) {
            toast.info("Please enter a question.");
            return;
        }
        dispatch(fetchCareerAdvice(query));
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <h3 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">AI Career Assistant</h3>
            <p className="text-gray-600 mb-6">
                Have questions about your career path, skills, or job search strategy? Ask our AI assistant for personalized advice based on your profile.
            </p>
            
            <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What skills should I learn for a career in DevOps?"
                    disabled={adviceLoading || !isAuthenticated}
                    className="flex-1 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={adviceLoading || !isAuthenticated}
                    className="px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {adviceLoading ? 'Thinking...' : 'Get Advice'}
                </button>
            </form>

            {adviceLoading && <Spinner />}

            {careerAdvice && !adviceLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-semibold text-dark mb-2">AI Response:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{careerAdvice}</p>
                </div>
            )}
        </div>
    );
};

export default CareerAdvice;