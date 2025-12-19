"use client"

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export const useAccount = () => {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("v");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "profile");

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  return {
    activeTab,
    setActiveTab,
  };
};
