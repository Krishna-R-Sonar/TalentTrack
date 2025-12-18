// frontend/src/store/slices/newsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchLatestNews = createAsyncThunk(
  'news/fetchLatestNews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/news');
      return response.data.articles;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    articles: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNewsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchLatestNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNewsError } = newsSlice.actions;
export default newsSlice.reducer;