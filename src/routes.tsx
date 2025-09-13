import MessStaffLogin from "./pages/MessStaffLogin/MessStaffLogin";
import InChargeLogin from "./pages/InChargeLogin/InChargeLogin";
import InChargePanel from "./pages/InChargePanel/InChargePanel";
import StudentLogin from "./pages/StudentLogin/StudentLogin";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
import { Navigate } from "react-router-dom";
import StudentPanel from "./pages/StudentPanel/StudentPanel";
import MessStaffPanel from "./pages/MessStaffPanel/MessStaffPanel";

const routes = [
    {
        path: "*",
        page: <Navigate to="/" />
    },
    {
        path: "/",
        page: <StudentLogin />
    },
    {
        path: "/student/panel",
        page: <StudentPanel />
    },
    {
        path: "/admin/login",
        page: <AdminLogin />
    },
    {
        path: "/admin/panel",
        page: <AdminPanel />
    },
    {
        path: "/incharge/login",
        page: <InChargeLogin />
    },
    {
        path: "/incharge/panel",
        page: <InChargePanel />
    },
    {
        path: "/mess-staff/login",
        page: <MessStaffLogin />
    },
    {
        path: "/mess-staff/panel",
        page: <MessStaffPanel />
    },
];

export default routes;