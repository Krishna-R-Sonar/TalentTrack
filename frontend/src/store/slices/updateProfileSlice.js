// frontend/src/store/slices/updateProfileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const updateProfile = createAsyncThunk(
    "profile/update",
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await axios.put("/user/update/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data.message;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updatePassword = createAsyncThunk(
    "profile/updatePassword",
    async (passwords, { rejectWithValue }) => {
        try {
            const { data } = await axios.put("/user/update/password", passwords, {
                headers: { "Content-Type": "application/json" },
            });
            return data.message;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const updateProfileSlice = createSlice({
    name: 'updateProfile',
    initialState: {
        loading: false,
        error: null,
        isUpdated: false,
        message: null
    },
    reducers: {
        clearUpdateProfileState(state) {
            state.error = null;
            state.isUpdated = false;
            state.message = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.isUpdated = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.isUpdated = true;
                state.message = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updatePassword.pending, (state) => {
                state.loading = true;
                state.isUpdated = false;
            })
            .addCase(updatePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.isUpdated = true;
                state.message = action.payload;
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearUpdateProfileState } = updateProfileSlice.actions;
export default updateProfileSlice.reducer;