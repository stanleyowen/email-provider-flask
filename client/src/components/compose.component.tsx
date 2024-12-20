import React, { useState } from "react";
import { Alert, TextField, Grid2 } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import axios from "axios";

const ComposeEmail = ({ auth, parseError }: any) => {
  const credentials = JSON.parse(localStorage.getItem("credentials") || "{}");

  const [data, setData] = useState<{
    email: string;
    password: string;
    outgoingMailServer: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    text: string;
  }>({
    email: credentials.email || "",
    password: credentials.password || "",
    outgoingMailServer: credentials.outgoingMailServer || "",
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    text: "",
  });

  const [isLoading, setLoading] = useState<boolean>(false);

  // Handle the login data changes from the input fields
  const handleData = (key: string, value: string | number) => {
    setData({ ...data, [key]: value });
  };

  // Handle the login button click
  const handleEmail = async () => {
    setLoading(true);

    // Check if the required fields are filled
    if (
      data.email === "" ||
      data.password === "" ||
      data.outgoingMailServer === ""
    ) {
      parseError("Something went wrong. Please try again");
    }

    // Check if the required fields are filled
    else if (data.to === "" || data.subject === "" || data.text === "") {
      parseError("Please fill in the required fields");
    }

    // Check if the email is valid and between 6 to 254 characters
    else if (data.to.length < 6 || data.to.length > 254) {
      parseError("Email address must be between 6 to 254 characters");
    }

    // Check if the email is valid
    else if (!data.to.includes("@") || !data.to.includes(".")) {
      parseError("Invalid email address");
    }

    // Check if the subject is not more than 989 characters
    else if (data.subject.length > 989) {
      parseError("Subject is too long. Please make it under 989 characters");
    }

    // Check if the message size is more than 10MB
    else if (data.text.length > 100000000) {
      parseError("Message is too large");
    }

    // Make the POST request to the server
    else {
      const sendData = {
        ...data,
        to: data.to.split(",") || [],
        cc: data.cc.split(",") || [],
        bcc: data.bcc.split(",") || [],
      };

      await axios
        .post(`${process.env.REACT_APP_API_URL}/mail/send`, sendData)
        .then((res) => {
          console.log(res.data);
          parseError(res.data.message, true); // Display the success message

          // Reset the input fields
          setData({
            ...data,
            to: "",
            cc: "",
            bcc: "",
            subject: "",
            text: "",
          });
        })
        .catch((err) => {
          parseError(err.response.data.error); // Display the error message
        });
    }

    setLoading(false); // Set the loading state to false
  };

  return (
    <div>
      <div style={{ padding: "20px" }}>
        <h1 style={{ marginBottom: "10px" }}>Compose Email</h1>

        <Alert
          severity="info"
          style={{ marginBottom: "40px" }}
          className="w-auto"
        >
          To send an email to multiple recipients, separate the email addresses
          with a comma.
          <br />
          <strong>Example:</strong> hello@world.com,hi@world.com
        </Alert>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              label="From"
              variant="outlined"
              className="w-100"
              value={data.email}
              required
              disabled
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              label="To"
              variant="outlined"
              className="w-100"
              value={data.to}
              required
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("to", e.target.value)}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              label="CC"
              variant="outlined"
              className="w-100"
              value={data.cc}
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("cc", e.target.value)}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              label="BCC"
              variant="outlined"
              className="w-100"
              value={data.bcc}
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("bcc", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Subject"
              variant="outlined"
              className="w-100"
              value={data.subject}
              required
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("subject", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Message"
              variant="outlined"
              className="w-100"
              value={data.text}
              required
              multiline
              rows={4}
              disabled={isLoading || auth.isLoading}
              onChange={(e) => handleData("text", e.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <LoadingButton
              variant="outlined"
              loading={isLoading || auth.isLoading}
              onClick={() => handleEmail()}
            >
              Send
            </LoadingButton>
          </Grid2>
        </Grid2>
      </div>
    </div>
  );
};

export default ComposeEmail;
