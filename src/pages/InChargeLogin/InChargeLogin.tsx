import { useNavigate } from "react-router-dom";
import { developerWebsiteUrl, serverUrl } from "../../values";
import { useState, useEffect } from "react";
import axios from "axios";

const InChargeLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // If token cookie is present, navigate immediately
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith("inChargeAuthToken="));
        if (tokenCookie) {
            navigate("/incharge/panel");
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
                `${serverUrl}/api/incharge/login`,
                { username, password },
                { withCredentials: true }
            );

            if (response.data.status === "success") {
                navigate("/incharge/panel");
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
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                    <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-4000"></div>
                </div>

                <div
                    className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-500 hover:scale-105 animate-fade-in"
                    style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
                >
                    {/* Header with gradient text */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2 animate-fade-in-up">
                            InCharge Login
                        </h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="space-y-4 mb-6" style={{ marginBottom: "10px" }}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${loading
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-600 cursor-pointer shadow-lg hover:shadow-xl'
                            }`}
                        style={{ width: "100%", padding: "10px", cursor: "pointer" }}
                    >
                        <span className="flex items-center justify-center">
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? "Logging in..." : "Login"}
                        </span>
                    </button>

                    {error && (
                        <p
                            className="mt-4 text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm animate-shake"
                            style={{ color: "red", marginTop: "10px" }}
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </span>
                        </p>
                    )}

                    {/* Decorative element */}
                    {/* <div className="mt-8 flex justify-center space-x-2 mb-6">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-1000"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-2000"></div>
                    </div> */}

                    {/* Developer watermark */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>
                            Developed by{" "}
                            <a
                                href={developerWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:underline"
                            >
                                Palash Chatterjee
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InChargeLogin;