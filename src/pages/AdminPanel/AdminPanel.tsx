import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../../values";

const AdminPanel = () => {
    const [roomNumber, setRoomNumber] = useState("");
    const [studentName, setStudentName] = useState("");
    const [messStaffName, setMessStaffName] = useState("");
    const [studentPassword, setStudentPassword] = useState("");
    const [messStaffPassword, setMessStaffPassword] = useState("");
    const [studentUsernameLookup, setStudentUsernameLookup] = useState("");
    const [messStaffUsernameLookup, setMessStaffUsernameLookup] = useState("");
    const [currentMessID, setCurrentMessID] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith("adminAuthToken="));
        if (!tokenCookie) {
            navigate("/admin/login");
        } else {
            // Optionally decode token to extract messID or fetch it from backend
            // Here, assuming it's fetched from backend or stored somewhere
            // This is placeholder logic; replace with actual messID fetching logic
            setCurrentMessID("exampleMessID");
        }
    }, [navigate]);

    const handleAddStudent = async () => {
        if (!roomNumber.trim()) {
            Swal.fire("Error", "Room number is required", "error");
            return;
        }
        if (!/^[1-9]\d*$/.test(roomNumber)) {
            Swal.fire("Error", "Room number must be a positive whole number", "error");
            return;
        }
        if (!studentName.trim() || studentName.trim().length < 3) {
            Swal.fire("Error", "Name must be at least 3 characters", "error");
            return;
        }
        if (studentPassword.length < 8) {
            Swal.fire("Error", "Password must be at least 8 characters", "error");
            return;
        }

        try {
            const res = await axios.post(
                `${serverUrl}/api/admin/add-student`,
                {
                    roomNumber,
                    password: studentPassword,
                    name: studentName.trim(),
                },
                { withCredentials: true }
            );

            if (res.status === 201 && res.data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Student Added",
                    html: `Student added with name <b>${res.data.data.name}</b> and username <b>${res.data.data.username}</b>`,
                    showCloseButton: true,
                    confirmButtonText: "OK",
                });
                setRoomNumber("");
                setStudentName("");
                setStudentPassword("");
            } else {
                Swal.fire("Error", res.data.message || "Failed to add student", "error");
            }
        } catch (err: any) {
            Swal.fire("Error", err.response?.data?.message || "Server error", "error");
        }
    };

    const handleAddMessStaff = async () => {
        if (messStaffName.trim().length < 3) {
            Swal.fire("Error", "Name must be at least 3 characters", "error");
            return;
        }
        if (messStaffPassword.length < 8) {
            Swal.fire("Error", "Password must be at least 8 characters", "error");
            return;
        }

        try {
            const res = await axios.post(
                `${serverUrl}/api/admin/add-mess-staff`,
                { name: messStaffName, password: messStaffPassword },
                { withCredentials: true }
            );

            if (res.data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Mess Staff Added",
                    html: `Mess staff added with username <b>${res.data.data.username}</b>`,
                    showCloseButton: true,
                    confirmButtonText: "OK"
                });
                setMessStaffName("");
                setMessStaffPassword("");
            } else {
                Swal.fire("Error", res.data.message || "Failed to add mess staff", "error");
            }
        } catch (err: any) {
            Swal.fire("Error", err.response?.data?.message || "Server error", "error");
        }
    };

    const handleCheckStudent = async () => {
        if (studentUsernameLookup.trim().length < 3) {
            Swal.fire("Error", "Username must be at least 3 characters", "error");
            return;
        }

        try {
            const res = await axios.post(
                `${serverUrl}/api/admin/check-student`,
                { username: studentUsernameLookup },
                { withCredentials: true }
            );

            if (res.data.status === "success") {
                const student = res.data.data;
                Swal.fire({
                    title: "Student Found",
                    html: `
                        <p>Name: <b>${student.name}</b></p>
                        <p>Room Number: <b>${student.roomNumber}</b></p>
                        <p>Student Number: <b>${student.studentNumber}</b></p>
                    `,
                    showCloseButton: false,
                    showCancelButton: true,
                    confirmButtonText: "Change Name",
                    cancelButtonText: "Change Password",
                    showDenyButton: false,
                    denyButtonText: "Close"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const { value: newName } = await Swal.fire({
                            title: "Enter new name",
                            input: "text",
                            inputValue: student.name,
                            inputValidator: (value) => {
                                if (!value.trim()) return "Name cannot be empty";
                            }
                        });
                        if (newName && currentMessID) {
                            try {
                                const updateRes = await axios.post(
                                    `${serverUrl}/api/admin/change-student-name`,
                                    {
                                        messID: currentMessID,
                                        roomNumber: student.roomNumber,
                                        studentNumber: student.studentNumber,
                                        newStudentName: newName
                                    },
                                    { withCredentials: true }
                                );
                                if (updateRes.data.status === "success") {
                                    Swal.fire("Success", "Student name updated", "success");
                                } else {
                                    Swal.fire("Error", updateRes.data.message || "Failed to update name", "error");
                                }
                            } catch (err: any) {
                                Swal.fire("Error", err.response?.data?.message || "Server error", "error");
                            }
                        }
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        const { value: newPassword } = await Swal.fire({
                            title: "Enter new password",
                            input: "password",
                            inputValidator: (value) => {
                                if (value.length < 8) return "Password must be at least 8 characters";
                            }
                        });
                        if (newPassword && currentMessID) {
                            try {
                                const updateRes = await axios.post(
                                    `${serverUrl}/api/admin/change-student-password`,
                                    {
                                        messID: currentMessID,
                                        roomNumber: student.roomNumber,
                                        studentNumber: student.studentNumber,
                                        newStudentPassword: newPassword
                                    },
                                    { withCredentials: true }
                                );
                                if (updateRes.data.status === "success") {
                                    Swal.fire("Success", "Student password updated", "success");
                                } else {
                                    Swal.fire("Error", updateRes.data.message || "Failed to update password", "error");
                                }
                            } catch (err: any) {
                                Swal.fire("Error", err.response?.data?.message || "Server error", "error");
                            }
                        }
                    }
                });
            } else {
                Swal.fire("Error", res.data.message || "Student not found", "error");
            }
        } catch (err: any) {
            Swal.fire("Error", err.response?.data?.message || "Server error", "error");
        }
    };

    const handleCheckMessStaff = async () => {
        if (messStaffUsernameLookup.trim().length < 3) {
            Swal.fire("Error", "Username must be at least 3 characters", "error");
            return;
        }

        try {
            const res = await axios.post(
                `${serverUrl}/api/admin/check-mess-staff`,
                { username: messStaffUsernameLookup },
                { withCredentials: true }
            );

            if (res.data.status === "success") {
                const staff = res.data.data;
                Swal.fire({
                    title: "Mess Staff Found",
                    html: `
                        <p>Name: <b>${staff.name}</b></p>
                        <p>Staff Number: <b>${staff.staffNumber}</b></p>
                    `,
                    showCloseButton: false,
                    showCancelButton: true,
                    confirmButtonText: "Change Name",
                    cancelButtonText: "Change Password",
                    showDenyButton: false,
                    denyButtonText: "Close"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const { value: newName } = await Swal.fire({
                            title: "Enter new name",
                            input: "text",
                            inputValue: staff.name,
                            inputValidator: (value) => {
                                if (!value.trim()) return "Name cannot be empty";
                            }
                        });
                        if (newName && currentMessID) {
                            try {
                                const updateRes = await axios.post(
                                    `${serverUrl}/api/admin/change-mess-staff-name`,
                                    {
                                        staffNumber: staff.staffNumber,
                                        newMessStaffName: newName
                                    },
                                    { withCredentials: true }
                                );
                                if (updateRes.data.status === "success") {
                                    Swal.fire("Success", "Mess staff name updated", "success");
                                } else {
                                    Swal.fire("Error", updateRes.data.message || "Failed to update name", "error");
                                }
                            } catch (err: any) {
                                Swal.fire("Error", err.response?.data?.message || "Server error", "error");
                            }
                        }
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        const { value: newPassword } = await Swal.fire({
                            title: "Enter new password",
                            input: "password",
                            inputValidator: (value) => {
                                if (value.length < 8) return "Password must be at least 8 characters";
                            }
                        });
                        if (newPassword && currentMessID) {
                            try {
                                const updateRes = await axios.post(
                                    `${serverUrl}/api/admin/change-mess-staff-password`,
                                    {
                                        staffNumber: staff.staffNumber,
                                        newMessStaffPassword: newPassword
                                    },
                                    { withCredentials: true }
                                );
                                if (updateRes.data.status === "success") {
                                    Swal.fire("Success", "Mess staff password updated", "success");
                                } else {
                                    Swal.fire("Error", updateRes.data.message || "Failed to update password", "error");
                                }
                            } catch (err: any) {
                                Swal.fire("Error", err.response?.data?.message || "Server error", "error");
                            }
                        }
                    }
                });
            } else {
                Swal.fire("Error", res.data.message || "Mess staff not found", "error");
            }
        } catch (err: any) {
            Swal.fire("Error", err.response?.data?.message || "Server error", "error");
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
        window.location.href = "/admin/login";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-gentle-background-shift">
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
                                    Admin Panel
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

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

                {/* Responsive grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

                    {/* Add Student Form */}
                    <div className="group bg-white/80 backdrop-blur-sm border border-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-graceful-slide-up-delayed-1 hover:bg-white/90 hover:border-blue-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 animate-subtle-pulse">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">Add Student</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Room Number"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="w-full p-4 border-2 border-blue-100 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-blue-200 animate-smooth-input-focus"
                            />
                            <input
                                type="text"
                                placeholder="Name"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full p-4 border-2 border-blue-100 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-blue-200 animate-smooth-input-focus"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={studentPassword}
                                onChange={(e) => setStudentPassword(e.target.value)}
                                className="w-full p-4 border-2 border-blue-100 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-blue-200 animate-smooth-input-focus"
                            />
                        </div>

                        <button
                            onClick={handleAddStudent}
                            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 animate-confident-button-bounce"
                        >
                            Add Student
                        </button>
                    </div>

                    {/* Add Mess Staff Form */}
                    <div className="group bg-white/80 backdrop-blur-sm border border-emerald-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-graceful-slide-up-delayed-2 hover:bg-white/90 hover:border-emerald-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 animate-subtle-pulse">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">Add Mess Staff</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={messStaffName}
                                onChange={(e) => setMessStaffName(e.target.value)}
                                className="w-full p-4 border-2 border-emerald-100 rounded-xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-emerald-200 animate-smooth-input-focus"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={messStaffPassword}
                                onChange={(e) => setMessStaffPassword(e.target.value)}
                                className="w-full p-4 border-2 border-emerald-100 rounded-xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-emerald-200 animate-smooth-input-focus"
                            />
                        </div>

                        <button
                            onClick={handleAddMessStaff}
                            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 animate-confident-button-bounce"
                        >
                            Add Mess Staff
                        </button>
                    </div>

                    {/* Check Student Form */}
                    <div className="group bg-white/80 backdrop-blur-sm border border-amber-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-graceful-slide-up-delayed-3 hover:bg-white/90 hover:border-amber-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 animate-subtle-pulse">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-amber-700 transition-colors duration-300">Check Student</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={studentUsernameLookup}
                                onChange={(e) => setStudentUsernameLookup(e.target.value)}
                                className="w-full p-4 border-2 border-amber-100 rounded-xl bg-gradient-to-r from-amber-50/50 to-yellow-50/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-amber-200 animate-smooth-input-focus"
                            />
                        </div>

                        <button
                            onClick={handleCheckStudent}
                            className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 animate-confident-button-bounce"
                        >
                            Lookup Student
                        </button>
                    </div>

                    {/* Check Mess Staff Form */}
                    <div className="group bg-white/80 backdrop-blur-sm border border-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-graceful-slide-up-delayed-4 hover:bg-white/90 hover:border-purple-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 animate-subtle-pulse">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">Check Mess Staff</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={messStaffUsernameLookup}
                                onChange={(e) => setMessStaffUsernameLookup(e.target.value)}
                                className="w-full p-4 border-2 border-purple-100 rounded-xl bg-gradient-to-r from-purple-50/50 to-indigo-50/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 placeholder-gray-500 text-gray-700 hover:border-purple-200 animate-smooth-input-focus"
                            />
                        </div>

                        <button
                            onClick={handleCheckMessStaff}
                            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 animate-confident-button-bounce"
                        >
                            Lookup Mess Staff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
