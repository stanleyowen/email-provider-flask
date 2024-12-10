import React, { useState } from "react";
import { Alert, Snackbar, SlideProps, TextField, Grid2 } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import axios from "axios";

import { AuthInterface } from "../lib/interfaces.lib";

type TransitionProps = Omit<SlideProps, "direction">;

const Auth = ({ auth, handleCredential }: AuthInterface) => {
  const [status, setStatus] = useState<{
    isError: boolean;
    message: string | null;
  }>({
    isError: false,
    message: "",
  });

  const [data, setData] = useState<{
    email: string;
    password: string;
    incomingMailServer: string;
    outgoingMailServer: string;
    startId: number;
  }>({
    email: "",
    password: "",
    incomingMailServer: "",
    outgoingMailServer: "",
    startId: 1,
  });

  const [isLoading, setLoading] = useState<boolean>(false);

  const [transition, setTransition] = useState<
    React.ComponentType<TransitionProps> | undefined
  >(undefined);

  // Handle the login data changes from the input fields
  const handleData = (key: string, value: string | number) => {
    setData({ ...data, [key]: value });
  };

  // Handle the login button click
  const handleLogin = async () => {
    // Check if the required fields are filled
    if (
      data.email === "" ||
      data.password === "" ||
      data.incomingMailServer === "" ||
      data.outgoingMailServer === ""
    ) {
      parseError("Make sure to fill all the required fields");
    }

    // Check if the emial is valid and between 6 to 254 characters
    else if (data.email.length < 6 || data.email.length > 254) {
      parseError("Email address must be between 6 to 254 characters");
    }

    // Check if the email has a valid format
    else if (!data.email.includes("@") || !data.email.includes(".")) {
      parseError("Invalid email address");
    }

    // Check if the mail server is valid and between 4 to 254 characters
    else if (
      data.incomingMailServer.length < 4 ||
      data.incomingMailServer.length > 254 ||
      data.outgoingMailServer.length < 4 ||
      data.outgoingMailServer.length > 254
    ) {
      parseError("Mail server must be between 4 to 254 characters");
    }

    // Check if the mail server has a valid domain
    else if (
      !data.incomingMailServer.includes(".") ||
      !data.outgoingMailServer.includes(".")
    ) {
      parseError("Invalid mail server domain");
    }

    // Make the POST request to the server
    else {
      await axios
        .post(`${process.env.REACT_APP_API_URL}/mail/`, data)
        .then((res) => {
          // Set the data to the local storage
          localStorage.setItem("credentials", JSON.stringify(data));

          handleCredential({
            isLoading: false,
            loggedIn: true,
            emails: res.data,
          });
        })
        .catch((err) => {
          parseError(err.response.data.error); // Display the error message
        });
    }

    setLoading(false); // Set the loading state to false
  };

  // Parse the error message and display it in the snackbar
  function parseError(errorMessage: string) {
    setLoading(false);

    setStatus({
      isError: true,
      message: errorMessage,
    });

    // Hide the snackbar after 5 seconds
    setTimeout(
      () =>
        setStatus({
          isError: false,
          message: null,
        }),
      10000
    );
  }

  return (
    <div>
      <div className="backdrop-overlay"></div>
      <div className="backdrop">
        <div className="acrylic-material"></div>
        <div className="backdrop-image" id="backdrop-image"></div>
      </div>

      <div
        className="bg-white container rounded-corner"
        style={{ padding: "40px" }}
      >
        <h1 className="center-align" style={{ marginBottom: "40px" }}>
          Welcome to
          <br />
          Email Service Portal
        </h1>

        <Grid2 container spacing={3}>
          <Grid2 size={12}>
            <TextField
              label="Email Address"
              variant="outlined"
              className="w-100"
              value={data.email}
              required
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("email", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              className="w-100"
              value={data.password}
              required
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("password", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Incoming Mail Server"
              variant="outlined"
              className="w-100"
              value={data.incomingMailServer}
              required
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("incomingMailServer", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Outgoing Mail Server"
              variant="outlined"
              className="w-100"
              value={data.outgoingMailServer}
              required
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("outgoingMailServer", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <LoadingButton
              variant="outlined"
              loading={isLoading || auth.isLoading}
              onClick={() => {
                setLoading(true);
                handleLogin();
              }}
            >
              Login
            </LoadingButton>
          </Grid2>
        </Grid2>
      </div>

      <Snackbar
        open={status.isError}
        TransitionComponent={transition}
        style={{
          right: "24px",
        }}
      >
        <Alert severity="error">{status.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default Auth;
