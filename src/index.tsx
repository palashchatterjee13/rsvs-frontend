import RoutingService from './services/RoutingService/RoutingService';
import ScrollToTop from './services/ScrollToTop/ScrollToTop';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import "./assets/css/main.css";

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <BrowserRouter>
        <ScrollToTop />
        <RoutingService />
    </BrowserRouter>
);