// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobSlice.js';
import userReducer from './slices/userSlice.js';
import applicationReducer from './slices/applicationSlice.js';
import updateProfileReducer from './slices/updateProfileSlice.js';
import newsReducer from './slices/newsSlice.js';

const store = configureStore({
  reducer: {
    user: userReducer,
    jobs: jobReducer,
    applications: applicationReducer,
    updateProfile: updateProfileReducer,
    news: newsReducer,
  },
});

export default store;