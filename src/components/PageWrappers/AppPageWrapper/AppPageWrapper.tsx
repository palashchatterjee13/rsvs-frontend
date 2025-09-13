import { ensurUserIsLoggedIn } from "../../../resources/util";
import { ReactElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "./AppBar";

type AppPageWrapperArguments = {
  userSignedInNotNecessary?: boolean,
  content: ReactElement,
  hideAppBar?: boolean,
}

export default function AppPageWrapper({ userSignedInNotNecessary, content, hideAppBar, }: AppPageWrapperArguments) {

  const navigator = useNavigate();

  /* Set default values for arguments */
  userSignedInNotNecessary = (userSignedInNotNecessary === null || userSignedInNotNecessary === undefined) ? false : true;
  hideAppBar = (hideAppBar === null || hideAppBar === undefined) ? false : true;

  useEffect(() => {

    if (!userSignedInNotNecessary) ensurUserIsLoggedIn(navigator);

  }, []);

  return <>
    {(hideAppBar) ? null : <AppBar />}
    <main id="main" className="main">

      {content}

    </main>
  </>
}
