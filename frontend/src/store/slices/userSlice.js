// frontend/src/store/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk for fetching AI career advice
export const fetchCareerAdvice = createAsyncThunk(
    "user/fetchCareerAdvice",
    async (query, { rejectWithValue }) => {
        try {
            const response = await axios.post("/user/career-advice", { query });
            return response.data.response;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);


// Other thunks (register, login, etc.) remain the same.
export const register = createAsyncThunk("user/register", async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post("/user/register", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
});

export const login = createAsyncThunk("user/login", async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post("/user/login", data, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

export const getUser = createAsyncThunk("user/getUser", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get("/user/me");
        return response.data.user;
    } catch (error) {
        // Don't reject for 401 errors (not authenticated) - this is expected when user is not logged in
        if (error.response && error.response.status === 401) {
            return rejectWithValue(null); // Return null to indicate not authenticated
        }
        return rejectWithValue(error.response?.data?.message || "Failed to get user");
    }
});

export const logout = createAsyncThunk("user/logout", async (_, { rejectWithValue }) => {
    try {
        await axios.get("/user/logout");
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});


const userSlice = createSlice({
    name: "user",
    initialState: {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
        // New state for career advice
        adviceLoading: false,
        adviceError: null,
        careerAdvice: "",
    },
    reducers: {
        clearUserErrors(state) {
            state.error = null;
        },
        clearAdvice(state) {
            state.careerAdvice = "";
            state.adviceError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Career Advice
            .addCase(fetchCareerAdvice.pending, (state) => { state.adviceLoading = true; })
            .addCase(fetchCareerAdvice.fulfilled, (state, action) => {
                state.adviceLoading = false;
                state.careerAdvice = action.payload;
            })
            .addCase(fetchCareerAdvice.rejected, (state, action) => {
                state.adviceLoading = false;
                state.adviceError = action.payload;
            })
            // Other builders remain the same
            .addCase(register.pending, (state) => { state.loading = true; })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload;
            })
            .addCase(login.pending, (state) => { state.loading = true; })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload;
            })
            .addCase(getUser.pending, (state) => { state.loading = true; })
            .addCase(getUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                // Don't set error for 401 (not authenticated) - this is expected
                if (action.payload !== null) {
                    state.error = action.payload;
                }
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserErrors, clearAdvice } = userSlice.actions;
export default userSlice.reducer;