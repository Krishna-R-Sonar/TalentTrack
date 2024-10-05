import { createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applications: [],
        loading: false,
        error: null,
        message: null,
    },
    reducers: {
        requestForAllApplications(state, action){
            state.loading = true;
            state.error = null;
        },
        successForAllApplications(state, action){
            state.loading = false;
            state.error = null;
            state.applications = action.payload;
        },
        failureForAllApplications(state, action){
            state.loading = false;
            state.error = action.payload;
        },
        requestForMyApplications(state, action){
            state.loading = true;
            state.error = null;
        },
        successForMyApplications(state, action){
            state.loading = false;
            state.error = null;
            state.applications = action.payload;
        },
        failureForMyApplications(state, action){
            state.loading = false;
            state.error = action.payload;
        },
        requestForPostApplication(state, action){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        successForPostApplication(state, action){
            state.loading = false;
            state.error = null;
            state.message = action.payload;},
        failureForPostApplication(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        requestForDeleteApplication(state, action){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        successForDeleteApplication(state, action){
            state.loading = false;
            state.error = null;
            state.message = action.payload;
        },
        failedForDeleteApplication(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        clearAllErrors(state, action){
            state.error = null;
            state.applications = state.applications;
        },
        resetApplicationSlice(state, action){
            state.error = null;
            state.applications = state.applications;
            state.message = null;
            state.loading = false;
        },
    },
});


export const deleteApplication = (id) =>async (dispatch) => {
    dispatch(applicationSlice.actions.requestForDeleteApplication());
    try {
        const response = await axios.delete(`http://localhost:4000/api/v1/application/delete/${id}`, {
            withCredentials: true
        });
        dispatch(applicationSlice.actions.successForDeleteApplication(response.data.message));
        dispatch(clearAllApplicationErrors());
    } catch (error) {
        dispatch(applicationSlice.actions.failedForDeleteApplication(error.response.data.message));
    }
}

export const fetchEmployerApplications = () => async (dispatch) => {
    dispatch(applicationSlice.actions.requestForAllApplications()); // Dispatch the action to indicate loading has started
    try {
        const response = await axios.get('http://localhost:4000/api/v1/application/employer/getall', {
            withCredentials: true, // Include cookies for authentication
        });
        dispatch(applicationSlice.actions.successForAllApplications(response.data.applications)); // Dispatch success with the fetched applications
        dispatch(applicationSlice.actions.clearAllErrors()); // Clear any previous errors
    } catch (error) {
        dispatch(applicationSlice.actions.failureForAllApplications(error.response.data.message)); // Dispatch failure with the error message
    }
};


export const fetchJobSeekerApplications = () => async (dispatch) => {
    dispatch(applicationSlice.actions.requestForMyApplications()); // Dispatch the action to set loading to true
    try {
        const response = await axios.get('http://localhost:4000/api/v1/application/jobseeker/getall', {
            withCredentials: true, // To ensure the request carries credentials such as cookies
        });
        dispatch(applicationSlice.actions.successForMyApplications(response.data.applications)); // Dispatch success action and pass the fetched applications
        dispatch(applicationSlice.actions.clearAllErrors()); // Clear errors if any
    } catch (error) {
        dispatch(applicationSlice.actions.failureForMyApplications(error.response.data.message)); // Dispatch failure action in case of an error
    }
};


export const postApplication = (data, jobId) =>async (dispatch) => {
    dispatch(applicationSlice.actions.requestForPostApplication());
    try {
        const response = await axios.post(`http://localhost:4000/api/v1/application/post/${jobId}`, data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
        dispatch(applicationSlice.actions.successForPostApplication(response.data.message));
        dispatch(applicationSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(applicationSlice.actions.failureForPostApplication(error.response.data.message));
    }
};

export const clearAllApplicationErrors = () => (dispatch) => {
    dispatch(applicationSlice.actions.clearAllErrors())
}

export const resetApplicationSlice = () => (dispatch) => {
    dispatch(applicationSlice.actions.resetApplicationSlice());
}

export default applicationSlice.reducer;