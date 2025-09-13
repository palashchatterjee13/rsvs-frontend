import { Routes, Route } from "react-router-dom";
import routes from "../../routes";

export default function RoutingService() {
    return <Routes>
        {routes.map(route => {
            return <Route key={route.path} path={route.path} element={route.page} />
        })}
    </Routes>
} 
