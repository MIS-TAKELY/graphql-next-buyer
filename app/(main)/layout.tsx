import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/common/Navbar";

const Footer = dynamic(() => import("@/components/common/Footer"));

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background max-w-[1920px] mx-auto shadow-2xl">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default layout;
