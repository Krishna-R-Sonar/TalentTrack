// frontend/src/pages/News.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestNews } from '../store/slices/newsSlice';
import { toast } from 'react-toastify';
import AuthRequired from '../components/AuthRequired';

const News = () => {
  const dispatch = useDispatch();
  const { articles, loading, error } = useSelector((state) => state.news);
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    dispatch(fetchLatestNews());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Latest News</h1>
      {loading ? (
        <p className="text-center text-gray-500">Loading news...</p>
      ) : error ? (
        <p className="text-center text-red-500">Failed to load news.</p>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-500">No news articles available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4">
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h2 className="text-xl font-semibold text-dark mb-2">{article.title}</h2>
              <p className="text-gray-600 mb-2">{article.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                Source: {article.source} | Published: {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Read More
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default News;