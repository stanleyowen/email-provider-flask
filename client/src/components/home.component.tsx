import React, { useState, useEffect } from "react";

import { Refresh } from "../lib/icons.component";
import axios from "axios";
import { Tooltip, IconButton, TextField, Grid2 } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { ChevronLeft, ChevronRight } from "../lib/icons.component";

const Home = ({ auth, refreshInbox, parseError }: any) => {
  const [greeting, setGreeting] = useState<string>();
  const [viewMode, setViewMode] = useState<string | number>("list");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [replyMode, setReplyMode] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ text: string }>({
    text: "",
  });

  console.log(auth.emails);
  const emailsPerPage = 50;

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting("Morning");
    else if (currentHour < 18) setGreeting("Afternoon");
    else setGreeting("Evening");
  }, []);

  const switchMode = (target: number | string) => {
    setViewMode(target);

    if (target !== "list")
      setSelectedEmail(
        auth.emails.find((email: any) => email.seqno === target)
      );
  };

  const handleData = (key: string, value: string | number) => {
    setData({ ...data, [key]: value });
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = auth.emails.slice(indexOfFirstEmail, indexOfLastEmail);

  const deleteEmail = async (seqno: number) => {
    const credentials = JSON.parse(localStorage.getItem("credentials") || "{}");

    await axios
      .delete(`${process.env.REACT_APP_API_URL}/mail/`, {
        data: { ...credentials, seqno: seqno.toString() },
      })
      .then((response) => {
        const newEmails = auth.emails.filter(
          (email: any) => email.seqno !== seqno
        );

        parseError(response.data.message, true);

        auth.emails = newEmails;
        setSelectedEmail(null);
        setViewMode("list");
      });
  };

  const replyEmail = async () => {
    setLoading(true);

    const credentials = JSON.parse(localStorage.getItem("credentials") || "{}");

    await axios
      .post(`${process.env.REACT_APP_API_URL}/mail/reply`, {
        ...credentials,
        to: selectedEmail.from.split(","),
        subject: `Re: ${selectedEmail.subject}`,
        text: data.text,
        inReplyTo: selectedEmail.message_id || "",
        references: selectedEmail.references || "",
      })
      .then((response) => {
        parseError(response.data.message, true);
      })
      .catch((err) => {
        parseError(err.response.data.message);
      });

    setLoading(false);
    setReplyMode(false);
  };

  return (
    <div className="m-10">
      {viewMode === "list" ? (
        <div>
          <h2>Good {greeting}</h2>

          <div className="email-menu">
            <div className="m-10-auto">
              <Tooltip
                title="Refresh Inbox"
                enterDelay={500}
                enterNextDelay={500}
              >
                <div>
                  <IconButton onClick={refreshInbox} disabled={auth.isLoading}>
                    <Refresh />
                  </IconButton>
                </div>
              </Tooltip>
            </div>
            <div className="m-10-auto">
              <Tooltip title="Go Back" enterDelay={500} enterNextDelay={500}>
                <div>
                  <IconButton
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft />
                  </IconButton>
                </div>
              </Tooltip>
            </div>
            <div className="m-10-auto">
              <Tooltip title="Go Forward" enterDelay={500} enterNextDelay={500}>
                <div>
                  <IconButton
                    onClick={handleNextPage}
                    disabled={currentEmails.length < emailsPerPage}
                  >
                    <ChevronRight />
                  </IconButton>
                </div>
              </Tooltip>
            </div>
            Page {currentPage} of{" "}
            {Math.ceil(auth.emails.length / emailsPerPage)}
          </div>

          <div className="emails mt-10">
            {currentEmails && currentEmails.length > 0 ? (
              currentEmails.map((email: any, index: number) => (
                <button
                  key={index}
                  className="card p-10 mb-10"
                  style={{ textAlign: "left" }}
                  onClick={() => switchMode(email.seqno)}
                >
                  <h3>From: {email.from}</h3>
                  <p>Subject: {email.subject}</p>
                  <p>Date: {new Date(email.date).toDateString()}</p>
                </button>
              ))
            ) : (
              <p>No emails to display</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="email p-10">
            {selectedEmail ? (
              <>
                <button
                  className="card p-10 mb-10"
                  style={{
                    textAlign: "left",
                    width: "auto",
                    marginRight: "10px",
                  }}
                  onClick={() => switchMode("list")}
                >
                  Back
                </button>
                <button
                  className="card p-10 mb-10"
                  style={{
                    textAlign: "left",
                    width: "auto",
                    marginRight: "10px",
                  }}
                  disabled={selectedEmail.seqno === 1}
                  onClick={() => switchMode(selectedEmail.seqno - 1)}
                >
                  Previous
                </button>
                <button
                  className="card p-10 mb-10"
                  style={{
                    textAlign: "left",
                    width: "auto",
                    marginRight: "10px",
                  }}
                  disabled={selectedEmail.seqno === auth.emails.length}
                  onClick={() => switchMode(selectedEmail.seqno + 1)}
                >
                  Next
                </button>
                <button
                  className="card p-10 mb-10"
                  style={{ textAlign: "left", width: "auto" }}
                  onClick={() => deleteEmail(selectedEmail.seqno)}
                >
                  Delete
                </button>
                <pre>
                  From &nbsp;&nbsp;&nbsp;: {selectedEmail.from}
                  <br />
                  Subject : {selectedEmail.subject}
                  <br />
                  Date &nbsp;&nbsp;&nbsp;:{" "}
                  {new Date(selectedEmail.date).toDateString()}
                </pre>

                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.body,
                  }}
                ></div>

                {!replyMode ? (
                  <>
                    <button
                      className="card p-10 mt-10"
                      style={{
                        textAlign: "left",
                        width: "auto",
                        marginRight: "10px",
                      }}
                      disabled={auth.isLoading}
                      onClick={() => setReplyMode(!replyMode)}
                    >
                      Reply
                    </button>
                    <button
                      className="card p-10 mb-10"
                      style={{
                        textAlign: "left",
                        width: "auto",
                        marginRight: "10px",
                      }}
                      disabled={auth.isLoading}
                    >
                      Forward
                    </button>
                  </>
                ) : (
                  <></>
                )}

                {replyMode ? (
                  <div>
                    <div style={{ padding: "20px" }}>
                      <h1 style={{ marginBottom: "10px" }}>Reply Email</h1>

                      <Grid2 container spacing={3}>
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
                            onClick={() => replyEmail()}
                          >
                            Send
                          </LoadingButton>
                        </Grid2>
                      </Grid2>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <p>Email not found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
