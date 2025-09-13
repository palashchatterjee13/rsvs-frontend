import { Link } from "react-router-dom";
import { APP_NAME } from "../../../resources/values";

export default function AppBar() {
    return <header id="header" className="header position-relative">
        <div className="main-header">
            <div className="container-fluid container-xl">
                <div className="d-flex py-3 align-items-center justify-content-between">
                    <Link className="logo d-flex align-items-center" to="/">
                        <h1 className="sitename">{APP_NAME}</h1>
                    </Link>

                    <div className="header-actions d-flex align-items-center justify-content-end">

                        <Link to="/profile">
                            <button className="header-action-btn">
                                <i className="bi bi-person"></i>
                            </button>
                        </Link>

                        {/* <button className="header-action-btn">
                            <i className="bi bi-bell"></i>
                        </button> */}

                    </div>
                </div>
            </div>
        </div>
    </header>
}