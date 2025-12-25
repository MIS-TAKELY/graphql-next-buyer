"use client";

import dynamic from "next/dynamic";

const CompareButtonBar = dynamic(
    () => import("./CompareButtonBar"),
    { ssr: false }
);

export default function CompareFloater() {
    return <CompareButtonBar />;
}
