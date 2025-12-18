// frontend/src/store/slices/jobSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunks for AI-based job search
export const fetchResumeBasedJobs = createAsyncThunk(
  "job/fetchResumeBasedJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/job/resume-based');
      return response.data.recommendedJobs;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchPersonalizedJobs = createAsyncThunk(
  "job/fetchPersonalizedJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/job/personalized');
      return response.data.recommendedJobs;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Other thunks (getAllJobs, fetchSingleJob, etc.) remain the same
export const getAllJobs = createAsyncThunk(
  "job/getAllJobs",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get("/job/getall", { params: filters });
      return response.data.jobs;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchSingleJob = createAsyncThunk(
  "job/fetchSingleJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/job/get/${jobId}`);
      return response.data.job;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const postJob = createAsyncThunk(
  "job/postJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/job/post', jobData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchMyJobs = createAsyncThunk(
  'job/fetchMyJobs',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/job/getmyjobs');
      return data.myJobs;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/job/delete/${jobId}`);
      return { jobId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// New thunk for updating job
export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/job/update/${jobId}`, jobData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs: [],
    singleJob: null,
    myJobs: [],
    recommendedJobs: [], // New state for AI recommendations
    loading: false,
    recommendationsLoading: false, // Separate loading for recommendations
    error: null,
    message: null,
  },
  reducers: {
    clearJobErrors: (state) => { state.error = null; },
    clearJobMessage: (state) => { state.message = null; },
    resetJobPostState: (state) => {
      state.message = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // AI-Based Job Fetching
      .addCase(fetchResumeBasedJobs.pending, (state) => { state.recommendationsLoading = true; })
      .addCase(fetchResumeBasedJobs.fulfilled, (state, action) => {
        state.recommendationsLoading = false;
        state.recommendedJobs = action.payload;
      })
      .addCase(fetchResumeBasedJobs.rejected, (state, action) => {
        state.recommendationsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPersonalizedJobs.pending, (state) => { state.recommendationsLoading = true; })
      .addCase(fetchPersonalizedJobs.fulfilled, (state, action) => {
        state.recommendationsLoading = false;
        state.recommendedJobs = action.payload;
      })
      .addCase(fetchPersonalizedJobs.rejected, (state, action) => {
        state.recommendationsLoading = false;
        state.error = action.payload;
      })
      // Other builders remain the same
      .addCase(getAllJobs.pending, (state) => { state.loading = true; })
      .addCase(getAllJobs.fulfilled, (state, action) => { state.loading = false; state.jobs = action.payload; })
      .addCase(getAllJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchSingleJob.pending, (state) => { state.loading = true; })
      .addCase(fetchSingleJob.fulfilled, (state, action) => { state.loading = false; state.singleJob = action.payload; })
      .addCase(fetchSingleJob.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(postJob.pending, (state) => { state.loading = true; })
      .addCase(postJob.fulfilled, (state, action) => { state.loading = false; state.message = action.payload.message; })
      .addCase(postJob.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchMyJobs.fulfilled, (state, action) => { state.loading = false; state.myJobs = action.payload; })
      .addCase(fetchMyJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.myJobs = state.myJobs.filter((job) => job._id !== action.payload.jobId);
        state.message = action.payload.message;
      })
      .addCase(deleteJob.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // New extra reducers for updateJob
      .addCase(updateJob.pending, (state) => { state.loading = true; })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.myJobs = state.myJobs.map(job => job._id === action.payload._id ? action.payload : job);
        state.message = 'Job updated successfully';
      })
      .addCase(updateJob.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearJobErrors, clearJobMessage, resetJobPostState } = jobSlice.actions;
export default jobSlice.reducer;