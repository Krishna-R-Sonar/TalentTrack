import {createSlice} from "@reduxjs/toolkit";
import axios from 'axios';

const jobSlice = createSlice({
    name: "jobs",
    initialState: {
        jobs: [],
        loading: false,
        error: null,
        message: null,
        singleJob: {},
        myJobs: [],
    },
    reducers: {
        requestForAllJobs(state, action){
            state.loading = true;
            state.error = null;
        },
        successForAllJobs(state, action){
            state.loading = false;
            state.jobs = action.payload;
            state.error = null;
        },
        failureForAllJobs(state, action){
            state.loading = false;
            state.error = action.payload;
        },
        requestForSingleJob(state, action){
            state.message = null;
            state.loading = true;
            state.error = null;
        },
        successForSingleJob(state, action){
            state.loading = false;
            state.error = null;
            state.singleJob = action.payload;
        },
        failureForSingleJob(state, action){
            state.singleJob = state.singleJob;
            state.loading = false;
            state.error = action.payload;
        },
        requestForPostJob(state, action){
            state.message = null;
            state.loading = true;
            state.error = null;
        },
        successForPostJob(state, action){
            state.loading = false;
            state.error = null;
            state.message = action.payload;
        },
        failureForPostJob(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        requestForMyJobs(state, action){
            state.loading = true;
            state.error = null;
            state.myJobs = [];
        },
        successForMyJobs(state, action){
            state.loading = false;
            state.error = null;
            state.myJobs = action.payload;
        },
        failureForMyJobs(state, action){
            state.loading = false;
            state.error = action.payload;
            state.myJobs = state.myJobs;
        },
        requestForDeleteJob(state, action){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        successForDeleteJob(state, action){
            state.loading = false;
            state.error = null;
            state.message = action.payload;
        },
        failedForDeleteJob(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        clearAllErrors(state, action){
            state.error = null;
            state.jobs = state.jobs;
        },
        resetJobSlice(state, action){
            state.error = null;
            state.jobs = action.payload;
            state.loading = false;
            state.message = null;
            state.myJobs = state.myJobs;
            state.singleJob = {};
        },
    },
});

export const deleteJob = (id) =>async (dispatch) => {
    dispatch(jobSlice.actions.requestForDeleteJob());
    try {
        const response = await axios.delete(`http://localhost:4000/api/v1/job/delete/${id}`, {withCredentials: true});
        dispatch(jobSlice.actions.successForDeleteJob(response.data.message));
    } catch (error) {
        dispatch(jobSlice.actions.failedForDeleteJob(error.response.data.message));
    }
}

export const getMyJobs = () =>async (dispatch) => {
    dispatch(jobSlice.actions.requestForMyJobs());
    try {
        const response = await axios.post(`http://localhost:4000/api/v1/job/getmyjobs`, data, {
            withCredentials: true,
            headers: {"Content-Type": "application/json"}
        });
        dispatch(jobSlice.actions.successForMyJobs(response.data.message));
        dispatch(jobSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(jobSlice.actions.failureForMyJobs(error.response.data.message));
    }
}

export const postJob = (data) =>async (dispatch) => {
    dispatch(jobSlice.actions.requestForPostJob());
    try {
        const response = await axios.post(`http://localhost:4000/api/v1/job/post`, data, {
            withCredentials: true,
            headers: {"Content-Type": "application/json"}
        });
        dispatch(jobSlice.actions.successForPostJob(response.data.message));
        dispatch(jobSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(jobSlice.actions.failureForPostJob(error.response.data.message));
    }
}

export const fetchJobs = (city, niche, searchKeyword = "") => async(dispatch) => {
    dispatch(jobSlice.actions.requestForAllJobs());
    try {
        let link = "http://localhost:4000/api/v1/job/getall?";
        let queryParams = [];
        if(searchKeyword){
            queryParams.push(`searchKeyword=${searchKeyword}`);
        }
        if(city){
            queryParams.push(`city=${city}`);
        }
        if(niche){
            queryParams.push(`niche=${niche}`);
        }
        link += queryParams.join("&");
        const response = await axios.get(link, {withCredentials: true});
        dispatch(jobSlice.actions.successForAllJobs(response.data.jobs));
        dispatch(jobSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(jobSlice.actions.failureForAllJobs(error.response.data.message));
    }
};

export const fetchSingleJob = (jobId) =>async (dispatch) => {
    dispatch(jobSlice.actions.requestForSingleJob());
    try {
        const response = await axios.get(`http://localhost:4000/api/v1/job/get/${jobId}`, {withCredentials: true});
        dispatch(jobSlice.actions.successForSingleJob(response.data.job));
        dispatch(jobSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(jobSlice.actions.failureForSingleJob(error.response.data.message));
    }
}

export const clearAllJobErrors = () => (dispatch) => {
    dispatch(jobSlice.actions.clearAllErrors())
}

export const resetJobSlice = () => (dispatch) => {
    dispatch(jobSlice.actions.resetJobSlice());
}

export default jobSlice.reducer;