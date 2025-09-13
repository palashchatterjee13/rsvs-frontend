import { Link } from "react-router-dom";

function PanelPageNavigationLink({ path, title, icon }: { path: string; title: string, icon: string }) {
    return <li className="nav-item">
        <Link className="nav-link collapsed" to={path}>
            <i className={`bi ${icon}`}></i>
            <span>{title}</span>
        </Link>
    </li>
}

function PanelPageNavigationTitle({ title }: { title: string }) {
    return <li className="nav-heading">{title}</li>
}

function PanelPageNavigation() {
    return <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
            <PanelPageNavigationTitle title="Admin Panel" />
            <PanelPageNavigationLink title="Dashboard" path="/admin-panel/dashboard" icon="bi-graph-up-arrow" />
            <PanelPageNavigationLink title="Manage Users" path="/admin-panel/manage-users" icon="bi-sliders" />
            <PanelPageNavigationLink title="Manage Admins" path="/admin-panel/manage-administrators" icon="bi-sliders" />
            <PanelPageNavigationTitle title="APPLICATION" />
            <PanelPageNavigationLink title="Account" path="/administrator/account" icon="bi-person" />
            <PanelPageNavigationLink title="Settings" path="/administrator/settings" icon="bi-gear" />
            <PanelPageNavigationLink title="Logout" path="/log-out" icon="bi-box-arrow-right" />
        </ul>
    </aside>
}

export { PanelPageNavigationLink, PanelPageNavigationTitle, PanelPageNavigation }