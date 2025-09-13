import { getSavedAdminLoginDetails } from "../../../resources/util";
import AppLogo from "../../../assets/img/icon/icon.svg";
import { Link } from "react-router-dom";
import strings from "../../../strings";

function ProfileDropdownItem({ path, title, icon }: { path: string; title: string, icon: string }) {
    return <>
        <li>
            <Link className="dropdown-item d-flex align-items-center" to={path}>
                <i className={`bi ${icon}`}></i>
                <span>{title}</span>
            </Link>
        </li>
        <li>
            <hr className="dropdown-divider" />
        </li>
    </>
}

function PanelPageHeader() {
    return <header id="header" className="header fixed-top d-flex align-items-center">

        <div className="d-flex align-items-center justify-content-between">
            <Link to="/" className="logo d-flex align-items-center">
                <img src={AppLogo} alt="" />
                <span className="d-none d-lg-block">{strings.appName}</span>
            </Link>
            <i className="bi bi-list toggle-sidebar-btn"></i>
        </div>

        <nav className="header-nav ms-auto">
            <ul className="d-flex align-items-center">
                <li className="nav-item d-block d-lg-none">
                    <a className="nav-link nav-icon search-bar-toggle " href="#">
                        <i className="bi bi-search"></i>
                    </a>
                </li>
                <li className="nav-item dropdown pe-3">

                    <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                        <span style={{ background: `red`, backgroundRepeat: 'no-repeat', backgroundSize: "50%", backgroundPosition: "center" }} className="rounded-circle user-icon" />
                        <span className="d-none d-md-block dropdown-toggle ps-2">{getSavedAdminLoginDetails()?.username}</span>
                    </a>

                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                        <li className="dropdown-header">
                            <h6>{getSavedAdminLoginDetails()?.username}</h6>
                            <span>Administrator</span>
                        </li>
                        <li>
                            <hr className="dropdown-divider" />
                        </li>

                        <ProfileDropdownItem title="Account" path="/administrator/account" icon="bi-person" />
                        <ProfileDropdownItem title="Settings" path="/administrator/settings" icon="bi-gear" />
                        <ProfileDropdownItem title="Logout" path="/log-out" icon="bi-box-arrow-right" />

                    </ul>
                </li>
            </ul>
        </nav>
    </header>
}

export { ProfileDropdownItem, PanelPageHeader }