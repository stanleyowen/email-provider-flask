import React, { useState, useEffect } from "react";
import { Refresh } from "../lib/icons.component";
import axios from "axios";
import { Tooltip, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "../lib/icons.component";

const Home = ({ auth, refreshInbox }: any) => {
  const [greeting, setGreeting] = useState<string>();
  const [viewMode, setViewMode] = useState<string | number>("list");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
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
      .delete(`${process.env.REACT_APP_API_URL}/mail`, {
        data: { ...credentials, seqno },
      })
      .then((response) => {
        const newEmails = auth.emails.filter(
          (email: any) => email.seqno !== seqno
        );

        auth.emails = newEmails;
        setSelectedEmail(null);
        setViewMode("list");
      });
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
