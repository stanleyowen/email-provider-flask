import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Slide,
  Snackbar,
  LinearProgress,
  SlideProps,
} from "@mui/material";

import Navbar from "./navbar.component";
import BaseLayout from "./base.component";

type TransitionProps = Omit<SlideProps, "direction">;

// eslint-disable-next-line
const App = ({
  auth,
  properties,
  handleChange,
  handleCredential,
  refreshInbox,
}: any) => {
  const HOST_DOMAIN: string =
    process.env.REACT_APP_HOST_DOMAIN ?? window.location.origin;
  const [transition, setTransition] = useState<
    React.ComponentType<TransitionProps> | undefined
  >(undefined);

  useEffect(() => {
    const themeURL = JSON.parse(
      localStorage.getItem("theme-session") || `{}`
    ).url;

    const backgroundElement = document.getElementById("backdrop-image");

    if (backgroundElement && themeURL)
      backgroundElement.style.background = `url(${themeURL})`;
  }, []); // eslint-disable-line

  return (
    <div>
      {auth.isLoading ? <LinearProgress /> : null}
      <div className="app" style={auth.isLoading ? { height: "99.3vh" } : {}}>
        <Navbar handleCredential={handleCredential} />

        <BaseLayout
          auth={auth}
          properties={properties}
          handleChange={handleChange}
          handleCredential={handleCredential}
          refreshInbox={refreshInbox}
        />
      </div>
    </div>
  );
};

export default App;
