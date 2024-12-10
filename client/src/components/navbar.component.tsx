import React, { useState, useEffect } from "react";
import { Tooltip, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, Logout } from "../lib/icons.component";

// eslint-disable-next-line
const Navbar = ({ handleCredential }: any) => {
  const logout = () => {
    // Remove the local storage session
    localStorage.removeItem("credentials");

    // Remove the user from the session
    handleCredential({
      isLoading: false,
      loggedIn: false,
      emails: [],
    });
  };

  return (
    <div className="navbar">
      <div className="mrl-10">
        <Tooltip title="Logout" enterDelay={500} enterNextDelay={500}>
          <IconButton onClick={() => logout()} className="p-10">
            <Logout />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default Navbar;
