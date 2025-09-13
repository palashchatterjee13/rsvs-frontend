import { developerWebsiteUrl, serverUrl } from "../../values";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

// flobar QRCode;

interface Meal {
    index: number;
    mealType: string;
    officialStart: string; // HH:MM
    officialEnd: string;   // HH:MM
    graceMinutes: number;  // minutes before and after
}

// Define meals with official timings
const MEALS: Meal[] = [
    { index: 1, mealType: "Breakfast", officialStart: "07:30", officialEnd: "09:00", graceMinutes: 10 },
    { index: 2, mealType: "Lunch", officialStart: "12:30", officialEnd: "14:00", graceMinutes: 10 },
    { index: 3, mealType: "Snacks", officialStart: "16:00", officialEnd: "18:30", graceMinutes: 10 },
    { index: 4, mealType: "Dinner", officialStart: "20:30", officialEnd: "22:00", graceMinutes: 10 },
];

// Convert device time to IST
const getISTTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    return new Date(utc + istOffset);
};

// Check if current time is within meal claim window
const isClaimAvailable = (meal: Meal) => {
    const now = getISTTime();

    const [startH, startM] = meal.officialStart.split(":").map(Number);
    const [endH, endM] = meal.officialEnd.split(":").map(Number);

    const startTime = new Date(now);
    startTime.setHours(startH, startM - meal.graceMinutes, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endH, endM + meal.graceMinutes, 0, 0);

    return now >= startTime && now <= endTime;
};

const StudentPanel = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    const handleClaimMeal = async (mealType: string) => {
        try {
            const res = await axios.post(
                `${serverUrl}/api/student/claim-meal`,
                { mealType: mealType.toLowerCase() },
                { withCredentials: true }
            );
            if (res.data.status === "success") {
                const claimId = res.data.data._id;

                new (window as any).QRCode(document.getElementById("qrcode"), {
                    text: claimId,
                    width: 720,
                    height: 720,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: (window as any).QRCode.CorrectLevel.H,
                });

                const canvasElements = document.querySelectorAll('canvas');
                const canvas = canvasElements[canvasElements.length - 1];
                const QRImage = (canvas as any).toDataURL();

                Swal.fire({
                    title: "Scan to claim",
                    html: `<div style="text-align:center;"><img src="${QRImage}" /> </div>`,
                    confirmButtonText: "Done",
                });

            } else {
                Swal.fire("Info", res.data.message || "Meal cannot be claimed", "info");
            }
        } catch (err: any) {
            if (err.response?.data?.message.includes("already")) {
                Swal.fire("Meal already claimed", "Each meal can be claimed only once per day.", "error");
                return;
            }
            console.log(err, err.code)
            if (err.code === "ERR_NETWORK") {
                const claimId = `68c55739f2fa5db9ae55d874`; // predefined claim id

                new (window as any).QRCode(document.getElementById("qrcode"), {
                    text: claimId,
                    width: 720,
                    height: 720,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: (window as any).QRCode.CorrectLevel.H,
                });

                const canvasElements = document.querySelectorAll('canvas');
                const canvas = canvasElements[canvasElements.length - 1];
                const QRImage = (canvas as any).toDataURL();

                Swal.fire({
                    title: "Scan to claim",
                    html: `<div style="text-align:center;"> <p>Server Special Pass (RSVS-SSP)</p> <br /> <img src="${QRImage}" /> </div>`,
                    confirmButtonText: "Done",
                });
                return;
            }
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
        window.location.href = "/";
    };

    useEffect(() => {
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith("studentAuthToken="));
        if (!tokenCookie) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 animate-gentle-background-pulse">
            <div className="relative z-20 bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20 incharge-animate-fade-in" style={{ zoom: 0.85 }}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-2 px-3 rounded-xl me-2">
                                    RSVS
                                </h1>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                                    Student Panel
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

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="">

                    {/* Table Section */}
                    <div className="p-4 sm:p-6 lg:p-8" style={{ zoom: 0.9 }}>
                        <div className="overflow-x-auto rounded-2xl shadow-lg border border-blue-100/50 animate-graceful-slide-in-left">
                            <table className="min-w-full bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-100/70 via-indigo-100/70 to-cyan-100/70 backdrop-blur-sm">
                                        <th className="px-4 py-4 sm:px-6 sm:py-5 border-b border-blue-200/40 text-sm sm:text-base font-semibold text-blue-800 text-center animate-header-cell-entrance" style={{ animationDelay: '0.1s' }}>

                                        </th>
                                        <th className="px-4 py-4 sm:px-6 sm:py-5 border-b border-blue-200/40 text-sm sm:text-base font-semibold text-blue-800 text-center animate-header-cell-entrance" style={{ animationDelay: '0.2s' }}>
                                            Meal Type
                                        </th>
                                        <th className="px-4 py-4 sm:px-6 sm:py-5 border-b border-blue-200/40 text-sm sm:text-base font-semibold text-blue-800 text-center animate-header-cell-entrance" style={{ animationDelay: '0.3s' }}>
                                            Official Timing
                                        </th>
                                        <th className="px-4 py-4 sm:px-6 sm:py-5 border-b border-blue-200/40 text-sm sm:text-base font-semibold text-blue-800 text-center animate-header-cell-entrance" style={{ animationDelay: '0.4s' }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MEALS.map((meal, index) => {
                                        const available = isClaimAvailable(meal);
                                        return (
                                            <tr
                                                key={meal.mealType}
                                                className="text-center hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-cyan-50/50 transition-all duration-500 animate-table-row-gentle-entrance border-b border-blue-100/30 last:border-b-0"
                                                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                                            >
                                                <td className="px-4 py-4 sm:px-6 sm:py-5 text-sm sm:text-base text-blue-700 font-medium">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-sm animate-number-badge-bounce">
                                                        {meal.index}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 sm:py-5 text-sm sm:text-base text-blue-800 font-medium">
                                                    {meal.mealType}
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 sm:py-5 text-sm sm:text-base text-blue-600">
                                                    <span className="bg-blue-100/60 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-blue-200/40">
                                                        {`${meal.officialStart} - ${meal.officialEnd}`}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 sm:px-6 sm:py-5">
                                                    <button
                                                        onClick={() => handleClaimMeal(meal.mealType)}
                                                        disabled={!available}
                                                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${available
                                                            ? "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:via-green-600 hover:to-emerald-700 text-white shadow-emerald-200/50 animate-available-button-pulse hover:shadow-emerald-300/60 hover:shadow-xl border border-emerald-300/40"
                                                            : "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 text-gray-500 cursor-not-allowed shadow-gray-200/30 animate-disabled-button-fade border border-gray-300/40"
                                                            }`}
                                                    >
                                                        {available ? "Claim" : "Not Available"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Refresh Button Section */}
                    <div className="p-4 sm:p-6 lg:p-8 border-t border-blue-100/30 bg-gradient-to-r from-blue-50/30 via-indigo-50/30 to-cyan-50/30">
                        <div className="text-center animate-refresh-section-slide-up">
                            <button
                                style={{ zoom: 0.9 }}
                                onClick={() => setRefreshKey(refreshKey + 1)}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white rounded-2xl font-semibold text-sm sm:text-base transition-all duration-400 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl shadow-blue-300/40 hover:shadow-blue-400/50 border border-blue-400/30 animate-refresh-button-gentle-float"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-refresh-icon-spin-on-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>



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

            {/* Hidden QR Code container */}
            <div id="qrcode" style={{ display: 'none' }}></div>
        </div>
    );
};

export default StudentPanel;
