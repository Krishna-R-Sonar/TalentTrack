// frontend/src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearUserErrors, login } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { loading, isAuthenticated, error, user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error("Please fill in all fields.");
        }
        dispatch(login({ email, password }));
    };

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearUserErrors());
        }
        if (isAuthenticated) {
            toast.success(`Welcome back, ${user.name}!`);
            navigateTo("/dashboard/account");
        }
    }, [dispatch, error, isAuthenticated, navigateTo, user]);

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
                <div className="mb-6 text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-dark">Login to your account</h3>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
                        <div className="relative">
                            <MdOutlineMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Password</label>
                        <div className="relative">
                            <RiLock2Fill className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    <Link to="/register" className="block text-center text-primary hover:underline mt-4 font-medium">
                        Don't have an account? Register Now
                    </Link>
                </form>
            </div>
        </section>
    );
};

export default Login;
