import { adminLoginDetailsSaved } from "../../../resources/util";
import { Navigate } from "react-router-dom";

export default function LoginPageWrapper(props: any) {
    return <main>
        <div className="container">
            <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

                            <div className="d-flex justify-content-center py-4">
                                <a href="index.html" className="logo d-flex align-items-center w-auto">
                                    <img src="assets/img/logo.png" alt="" />
                                    <span className="d-none d-lg-block">Bold Elevate</span>
                                </a>
                            </div>
                            {
                                (adminLoginDetailsSaved()) ?
                                    <Navigate to="/admin-panel/dashboard" />
                                    :
                                    props.children
                            }
                            <div className="credits">
                                All rights reserved
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
}