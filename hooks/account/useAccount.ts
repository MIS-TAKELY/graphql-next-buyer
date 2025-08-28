"use client"

import { useState } from "react";

export const useAccount = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return {
    activeTab,
    setActiveTab,   
  };
};
