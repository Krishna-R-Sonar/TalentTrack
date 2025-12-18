// backend/controllers/newsController.js
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import axios from 'axios';
import NodeCache from 'node-cache';

const newsCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

export const getLatestNews = catchAsyncErrors(async (req, res, next) => {
  const cacheKey = 'latest_news';
  const cachedNews = newsCache.get(cacheKey);

  if (cachedNews) {
    return res.status(200).json({
      success: true,
      articles: cachedNews,
    });
  }

  const keywords = 'jobs OR internships OR education OR innovation OR technology';
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return next(new ErrorHandler('News API key is not configured.', 500));
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: keywords,
        language: 'en',
        sortBy: 'publishedAt',
        apiKey,
        pageSize: 20,
      },
    });

    const articles = response.data.articles.map((article) => ({
      title: article.title,
      description: article.description || 'No description available.',
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      image: article.urlToImage,
    }));

    newsCache.set(cacheKey, articles);

    res.status(200).json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error.message);
    return next(new ErrorHandler('Failed to fetch news articles.', 500));
  }
});