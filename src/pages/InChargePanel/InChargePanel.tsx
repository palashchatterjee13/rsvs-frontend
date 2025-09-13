import React, { useEffect, useState, ChangeEvent } from "react";
import { developerWebsiteUrl, serverUrl } from "../../values";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

// Types
type MessID = {
    hostelNumber: number;
    academicYear: number;
    academicSession: "monsoon" | "spring";
};

type Admin = {
    name: string;
};

type Mess = {
    messID: MessID;
    admin: Admin;
};

type MessData = {
    currentYearMesses: Mess[];
    previousYearMesses: Mess[];
};

const InChargePanel: React.FC = () => {
    const [messData, setMessData] = useState<MessData>({
        currentYearMesses: [],
        previousYearMesses: []
    });
    const navigate = useNavigate();

    const [newMess, setNewMess] = useState({
        hostelNumber: "",
        academicYear: "",
        academicSession: "monsoon" as "monsoon" | "spring",
        startDate: "",
        endDate: "",
        adminName: "",
        adminPassword: ""
    });

    useEffect(() => {
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith("inChargeAuthToken="));
        if (!tokenCookie) {
            navigate("/incharge/login");
        }
        fetchMesses();
    }, [navigate]);

    const fetchMesses = async () => {
        try {
            const res = await axios.post(`${serverUrl}/api/incharge/view-mess`, {}, { withCredentials: true });
            if (res.data.status === "success") {
                setMessData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch messes", error);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewMess(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter') {
            addMess();
        }
    };

    const handleLogout = () => {
        // Clear all cookies
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        // Navigate to login
        window.location.href = "/incharge/login";
    };

    const validateAddMess = (): { valid: boolean; message?: string } => {
        if (!newMess.hostelNumber.trim()) {
            return { valid: false, message: "Hostel number is required" };
        }
        const hostelNum = Number(newMess.hostelNumber);
        if (isNaN(hostelNum) || hostelNum <= 0) {
            return { valid: false, message: "Hostel number must be a positive number" };
        }

        if (!newMess.academicYear.trim()) {
            return { valid: false, message: "Academic year is required" };
        }

        const academicYr = Number(newMess.academicYear);
        if (isNaN(academicYr) || academicYr < ((new Date()).getFullYear())) {
            return { valid: false, message: `Enter a valid academic year (minimum ${((new Date()).getFullYear())})` };
        }

        if (!newMess.startDate.trim()) {
            return { valid: false, message: "Start date is required" };
        }
        if (!newMess.endDate.trim()) {
            return { valid: false, message: "End date is required" };
        }
        if (new Date(newMess.startDate) > new Date(newMess.endDate)) {
            return { valid: false, message: "Start date must be before end date" };
        }

        if (!newMess.adminName.trim() || newMess.adminName.trim().length < 3) {
            return { valid: false, message: "Admin name must be at least 3 characters" };
        }

        if (!newMess.adminPassword.trim() || newMess.adminPassword.trim().length < 8) {
            return { valid: false, message: "Admin password must be at least 8 characters" };
        }

        if (!["monsoon", "spring"].includes(newMess.academicSession)) {
            return { valid: false, message: "Academic session must be either 'monsoon' or 'spring'" };
        }

        return { valid: true };
    };

    const addMess = async () => {
        const validation = validateAddMess();
        if (!validation.valid) {
            Swal.fire("Validation Error", validation.message || "Invalid input", "error");
            return;
        }

        try {
            const res = await axios.post(`${serverUrl}/api/incharge/add-mess`, {
                messID: {
                    hostelNumber: Number(newMess.hostelNumber.trim()),
                    academicYear: Number(newMess.academicYear.trim()),
                    academicSession: newMess.academicSession,
                },
                startDate: newMess.startDate.trim(),
                endDate: newMess.endDate.trim(),
                adminName: newMess.adminName.trim(),
                adminPassword: newMess.adminPassword.trim()
            }, { withCredentials: true });

            if (res.data.status === "success") {
                Swal.fire("Success", res.data.message, "success");
                setNewMess({
                    hostelNumber: "",
                    academicYear: "",
                    academicSession: "monsoon",
                    startDate: "",
                    endDate: "",
                    adminName: "",
                    adminPassword: ""
                });
                fetchMesses();
            } else {
                Swal.fire("Error", res.data.message, "error");
            }
        } catch (error: any) {
            console.error("Add mess failed", error);
            if (error.response && error.response.data && error.response.data.message) {
                Swal.fire("Error", error.response.data.message, "error");
            } else {
                Swal.fire("Error", "Server error", "error");
            }
        }
    };

    const changeAdminName = async (mess: Mess) => {
        const { value: newAdminName } = await Swal.fire({
            title: "Enter new admin name",
            input: "text",
            inputValue: mess.admin.name,
            showCancelButton: true,
            inputValidator: value => {
                if (!value || value.length < 3) {
                    return "Name must be at least 3 characters";
                }
                return undefined;
            }
        });

        if (newAdminName) {
            try {
                const res = await axios.post(`${serverUrl}/api/incharge/change-admin-name`, {
                    messID: mess.messID,
                    newAdminName
                }, { withCredentials: true });

                if (res.data.status === "success") {
                    Swal.fire("Success", res.data.message, "success");
                    fetchMesses();
                } else {
                    Swal.fire("Error", res.data.message, "error");
                }
            } catch (error) {
                console.error("Change admin name failed", error);
                Swal.fire("Error", "Server error", "error");
            }
        }
    };

    const changeAdminPassword = async (mess: Mess) => {
        const { value: newAdminPassword } = await Swal.fire({
            title: "Enter new admin password",
            input: "password",
            inputAttributes: {
                minlength: "8"
            },
            showCancelButton: true,
            inputValidator: value => {
                if (!value || value.length < 8) {
                    return "Password must be at least 8 characters";
                }
                return undefined;
            }
        });

        if (newAdminPassword) {
            try {
                const res = await axios.post(`${serverUrl}/api/incharge/change-admin-password`, {
                    messID: mess.messID,
                    newAdminPassword
                }, { withCredentials: true });

                if (res.data.status === "success") {
                    Swal.fire("Success", res.data.message, "success");
                } else {
                    Swal.fire("Error", res.data.message, "error");
                }
            } catch (error) {
                console.error("Change admin password failed", error);
                Swal.fire("Error", "Server error", "error");
            }
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse incharge-animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse incharge-animation-delay-4000"></div>
                </div>

                {/* App Bar */}
                <div className="relative z-20 bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20 incharge-animate-fade-in">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-2 px-3 rounded-xl me-2">
                                        RSVS
                                    </h1>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                                        InCharge Panel
                                    </h1>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                            >
                                <i className="bx bx-log-out text-lg"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 p-6 max-w-7xl mx-auto" style={{ padding: "20px" }}>

                    {/* Add New Mess Form */}
                    <div
                        className="mb-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-500 hover:scale-[1.02] incharge-animate-fade-in mt-8"
                        style={{ marginBottom: "80px" }}
                    >
                        <div className="flex items-center justify-center space-x-2 mb-8">
                            <i className="bx bx-clock text-3xl text-blue-600"></i>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Add New Mess
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Row 1 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Hostel Number</label>
                                <input
                                    type="number"
                                    name="hostelNumber"
                                    placeholder="Hostel Number"
                                    value={newMess.hostelNumber}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Academic Year</label>
                                <input
                                    type="number"
                                    name="academicYear"
                                    placeholder="Academic Year"
                                    value={newMess.academicYear}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                                />
                            </div>

                            {/* Row 2 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Academic Session</label>
                                <select
                                    name="academicSession"
                                    value={newMess.academicSession}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-gray-700 hover:bg-white/70"
                                >
                                    <option value="monsoon">Monsoon</option>
                                    <option value="spring">Spring</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={newMess.startDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-gray-700 hover:bg-white/70"
                                />
                            </div>

                            {/* Row 3 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={newMess.endDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-gray-700 hover:bg-white/70"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Admin Name</label>
                                <input
                                    type="text"
                                    name="adminName"
                                    placeholder="Admin Name"
                                    value={newMess.adminName}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                                />
                            </div>

                            {/* Admin Password - Full Width */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Admin Password</label>
                                <input
                                    type="password"
                                    name="adminPassword"
                                    placeholder="Admin Password"
                                    value={newMess.adminPassword}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-blue-400 text-gray-700 hover:bg-white/70"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={addMess}
                                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                            >
                                <i className="bx bx-plus text-lg"></i>
                                <span>Add Mess</span>
                            </button>
                        </div>
                    </div>

                    {/* Current Year Messes */}
                    <div className="mb-16 incharge-animate-fade-in incharge-animation-delay-1000">
                        <div className="flex items-center justify-start space-x-2 mb-8">
                            <i className="bx bx-time text-3xl text-blue-600"></i>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Current Year Messes
                            </h2>
                        </div>
                        {messData.currentYearMesses.length === 0 && (
                            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-200">
                                <i className="bx bx-info-circle text-4xl text-gray-400 mb-2"></i>
                                <p className="text-gray-500 text-lg">No messes available</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {messData.currentYearMesses.map((mess, index) => (
                                <div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                                    style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "20px" }}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-building text-blue-500"></i>
                                            <p className="font-semibold text-gray-700">
                                                <strong>Hostel:</strong> {mess.messID.hostelNumber}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-calendar text-indigo-500"></i>
                                            <p className="font-semibold text-gray-700">
                                                <strong>Academic Year:</strong> {mess.messID.academicYear}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-time-five text-cyan-500"></i>
                                            <p className="font-semibold text-gray-700">
                                                <strong>Session:</strong> <span className="capitalize">{mess.messID.academicSession}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-user text-purple-500"></i>
                                            <p className="font-semibold text-gray-700">
                                                <strong>Admin Name:</strong> {mess.admin.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex space-x-2">
                                        <button
                                            onClick={() => changeAdminName(mess)}
                                            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 text-sm"
                                        >
                                            <i className="bx bx-user-check text-sm"></i>
                                            <span>Change Name</span>
                                        </button>
                                        <button
                                            onClick={() => changeAdminPassword(mess)}
                                            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 text-sm"
                                        >
                                            <i className="bx bx-key text-sm"></i>
                                            <span>Change Password</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Previous Year Messes */}
                    <div className="incharge-animate-fade-in incharge-animation-delay-2000" style={{ marginTop: "80px" }}>
                        <div className="flex items-center justify-start space-x-2 mb-8">
                            <i className="bx bx-history text-3xl text-blue-600"></i>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Previous Year Messes
                            </h2>
                        </div>
                        {messData.previousYearMesses.length === 0 && (
                            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-200">
                                <i className="bx bx-info-circle text-4xl text-gray-400 mb-2"></i>
                                <p className="text-gray-500 text-lg">No previous messes available</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {messData.previousYearMesses.map((mess, index) => (
                                <div
                                    key={index}
                                    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 opacity-75 hover:opacity-100"
                                    style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "20px" }}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-building text-gray-500"></i>
                                            <p className="font-semibold text-gray-600">
                                                <strong>Hostel:</strong> {mess.messID.hostelNumber}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-calendar text-gray-500"></i>
                                            <p className="font-semibold text-gray-600">
                                                <strong>Academic Year:</strong> {mess.messID.academicYear}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-time-five text-gray-500"></i>
                                            <p className="font-semibold text-gray-600">
                                                <strong>Session:</strong> <span className="capitalize">{mess.messID.academicSession}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <i className="bx bx-user text-gray-500"></i>
                                            <p className="font-semibold text-gray-600">
                                                <strong>Admin Name:</strong> {mess.admin.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                                            <i className="bx bx-archive-in text-xs"></i>
                                            <span>Previous Year</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Developer watermark */}
                    <div className="text-center mt-16 text-sm text-gray-500">
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

export default InChargePanel;