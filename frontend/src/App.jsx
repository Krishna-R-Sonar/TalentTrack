import React, { useEffect } from 'react'
import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Jobs from "./pages/Jobs.jsx"
import Login from "./pages/Login.jsx"
import NotFound from "./pages/NotFound.jsx"
import PostApplication from "./pages/PostApplication.jsx"
import Register from "./pages/Register.jsx"
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { getUser } from './store/slices/userSlice.js';

const App = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [])
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post/application/:jobId" element={<PostApplication />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <ToastContainer position='top-right' theme='dark'/>
      </Router>
    </>
  )
}

export default App

// BrowserRouter is a component in React that helps keep a website's user interface in sync with its URL
// routes is like a collection of possible routes(or paths) that your app can navigate to
// route defines a specific url path and tells the app what to display when that url is visited