import React, { useState, useEffect, useCallback } from "react";
import { Alert, Snackbar, LinearProgress, SlideProps } from "@mui/material";

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
  const [status, setStatus] = useState<{
    isError: boolean;
    isSuccess: boolean;
    message: string | null;
  }>({
    isError: false,
    isSuccess: false,
    message: "",
  });

  const [transition, setTransition] = useState<
    React.ComponentType<TransitionProps> | undefined
  >(undefined);

  // Parse the error message and display it in the snackbar
  function parseError(errorMessage: string, success?: boolean) {
    setStatus({
      isSuccess: success || false,
      isError: !success || false,
      message: errorMessage,
    });

    // Hide the snackbar after 5 seconds
    setTimeout(
      () =>
        setStatus({
          isError: false,
          isSuccess: false,
          message: errorMessage,
        }),
      5000
    );
  }

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
          parseError={parseError}
        />

        <Snackbar
          open={status.isError || status.isSuccess}
          TransitionComponent={transition}
          style={{
            right: "24px",
          }}
        >
          <Alert severity={status.isSuccess ? "success" : "error"}>
            {status.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default App;
