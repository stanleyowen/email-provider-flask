import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import {
  HomeSolid,
  HomeOutline,
  SettingsSolid,
  SettingsOutline,
  SearchSolid,
  SearchOutline,
  ComposeOutline,
  ComposeSolid,
} from "../lib/icons.component";

// eslint-disable-next-line
const SideBar = ({ handleChange, properties }: any) => {
  useEffect(() => {
    document
      .getElementById("tabs")
      ?.childNodes.forEach((tab) =>
        (tab.childNodes[1] as HTMLElement).innerText.toLowerCase() ===
        properties.activeTab
          ? (tab as HTMLElement).classList.add("active")
          : (tab as HTMLElement).classList.remove("active")
      );
  }, [properties]);

  const switchTab = (target: string) => {
    if (target !== properties.activeTab)
      handleChange({ id: "activeTab", value: target });
  };

  return (
    <div className="sidebar">
      <div id="tabs">
        {["Home", "Compose", "Search", "Settings"].map((tab, index) => {
          const components: { [key: string]: any } = {
            HomeSolid,
            HomeOutline,
            SettingsSolid,
            SettingsOutline,
            SearchSolid,
            SearchOutline,
            ComposeOutline,
            ComposeSolid,
          };
          const SolidIcon = components[`${tab}Solid`];
          const OutlineIcon = components[`${tab}Outline`];

          return (
            <Tooltip
              title={tab}
              enterDelay={500}
              enterNextDelay={500}
              key={index}
              onClick={() => switchTab(tab.toLowerCase())}
            >
              <Button
                className="w-100 rounded-corner p-10 tab"
                id={tab.toLowerCase()}
              >
                <div className="w-30">
                  {properties.activeTab === tab.toLowerCase() ? (
                    <SolidIcon />
                  ) : (
                    <OutlineIcon />
                  )}
                </div>
                <div className="w-70 left-align">{tab.toLowerCase()}</div>
              </Button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
