import { useNavigate } from "react-router-dom";
import { developerWebsiteUrl, serverUrl } from "../../values";
import { useState, useEffect } from "react";
import axios from "axios";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // If token cookie is present, navigate immediately
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith("adminAuthToken="));
        if (tokenCookie) {
            navigate("/admin/panel");
        }
    }, [navigate]);

    const handleLogin = async () => {
        setError(null);

        if (username.length < 3) {
            setError("Username must be at least 3 characters long");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${serverUrl}/api/admin/login`,
                { username, password },
                { withCredentials: true }
            );

            if (response.data.status === "success") {
                navigate("/admin/panel");
            } else {
                setError(response.data.message || "Login failed");
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Server error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-500 hover:scale-105 animate-fade-in">
                <div className="mb-8">
                    <h2 className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2 animate-fade-in-up">
                        Admin Login
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4 mb-6">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-600'}`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {error && (
                    <p className="mt-4 text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
                        {error}
                    </p>
                )}

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Developed by{" "}
                        <a
                            href={developerWebsiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:underline"
                        >
                            Palash Chatterjee
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
