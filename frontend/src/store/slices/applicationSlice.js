// frontend/src/store/slices/applicationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const postApplication = createAsyncThunk(
  'application/post',
  async ({ jobId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/application/post/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchEmployerApplications = createAsyncThunk(
  'application/employerGetAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/application/employer/getall');
      return response.data.applications;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchJobSeekerApplications = createAsyncThunk(
  'application/jobSeekerGetAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/application/jobseeker/getall');
      return response.data.applications;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteApplication = createAsyncThunk(
  'application/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/application/delete/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// New thunk for manual auto-apply
export const autoApplyJobs = createAsyncThunk(
  'application/autoApply',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/application/auto-apply');
      return response.data.appliedJobs;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState: {
    applications: [],
    autoAppliedJobs: [],  // New state
    loading: false,
    error: null,
    message: null,
    aiFeedback: null,
    compatibilityScore: null,
  },
  reducers: {
    clearApplicationErrors(state) {
      state.error = null;
    },
    clearApplicationMessage(state) {
      state.message = null;
      state.aiFeedback = null;
      state.compatibilityScore = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApplication.pending, (state) => { state.loading = true; })
      .addCase(postApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.aiFeedback = action.payload.aiFeedback;
        state.compatibilityScore = action.payload.compatibilityScore;
        state.error = null;
      })
      .addCase(postApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmployerApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployerApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchEmployerApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobSeekerApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchJobSeekerApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchJobSeekerApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteApplication.pending, (state) => {})
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.applications = state.applications.filter((app) => app._id !== action.payload.id);
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // New extra reducers for auto-apply
      .addCase(autoApplyJobs.pending, (state) => { state.loading = true; })
      .addCase(autoApplyJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.autoAppliedJobs = action.payload;
        state.message = 'Auto-apply completed successfully';
      })
      .addCase(autoApplyJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearApplicationErrors, clearApplicationMessage } = applicationSlice.actions;
export default applicationSlice.reducer;