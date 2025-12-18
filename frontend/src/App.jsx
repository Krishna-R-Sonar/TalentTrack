// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PostApplication from './pages/PostApplication';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import Register from './pages/Register';
import News from './pages/News';
import Groups from './components/Groups';
import Events from './components/Events';
import Connections from './components/Connections';
import Community from './components/Community';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from './store/slices/userSlice';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000/api/v1';
axios.defaults.withCredentials = true;

// Add interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Don't show error toast for auth errors, let components handle it
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<Groups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/community" element={<Community />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/news" element={<News />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-job" element={<PostJob />} />
          {isAuthenticated && (
            <>
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/post/application/:jobId" element={<PostApplication />} />
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" theme="colored" />
    </Router>
  );
};

export default App;