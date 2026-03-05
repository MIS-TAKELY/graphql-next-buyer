"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";

interface ReturnLabelPreviewProps {
    ret: any;
}

export default function ReturnLabelPreview({ ret }: ReturnLabelPreviewProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!ret || (ret.status !== "APPROVED" && ret.status !== "ACCEPTED")) {
        return null;
    }

    // Find the first seller profile from the items (assuming all items go to the same seller for a single return)
    let sellerShopName = "Seller Shop";
    let sellerAddress = {
        line1: "123 Seller St",
        line2: "",
        city: "City",
        state: "State",
        postalCode: "00000",
        country: "Country",
    };

    const firstItem = ret.items?.[0];
    const product = firstItem?.orderItem?.variant?.product;
    const sellerProfile = product?.seller?.sellerProfile;

    if (sellerProfile) {
        sellerShopName = sellerProfile.shopName || sellerShopName;
        if (sellerProfile.address) {
            sellerAddress = sellerProfile.address;
        }
    }

    const labelContent = (
        <div className="hidden print:block print-label-wrapper absolute inset-0 bg-white text-black z-[9999] w-[4in] h-[6in] p-4 box-border overflow-hidden">
            {/* Style specific to print */}
            <style dangerouslySetInnerHTML={{
                __html: `
            @media print {
                @page {
                    size: 4in 6in;
                    margin: 0;
                }
                body {
                    margin: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background-color: white !important;
                }
                /* Hide all other elements when printing */
                body > *:not(.print-label-wrapper) {
                    display: none !important;
                }
            }
        `}} />

            <div className="h-full w-full border-2 border-black p-4 flex flex-col font-sans">

                {/* Header content */}
                <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-wider mb-1">RETURN LABEL</h1>
                        <p className="text-sm font-bold">RMA: {ret.id}</p>
                        <p className="text-xs">Order: #{ret.order?.orderNumber}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs mb-1">Date Printed: {format(new Date(), "MMM dd, yyyy")}</div>
                        <div className="border border-black px-2 py-1 text-xs font-bold uppercase">{ret.logisticsMode || "SELF_SHIP"}</div>
                    </div>
                </div>

                {/* Sender details */}
                <div className="flex text-xs mb-4">
                    <div className="w-[50%] pr-2">
                        <p className="font-bold underline mb-1">FROM (BUYER):</p>
                        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            ________________________<br />
                            ________________________<br />
                            ________________________
                        </div>
                    </div>

                    <div className="w-[50%] pl-2 border-l border-black overflow-hidden" style={{ wordBreak: 'break-word' }}>
                        <p className="font-bold underline mb-1">TO (SELLER):</p>
                        <p className="font-bold text-sm uppercase">{sellerShopName}</p>
                        <p>{sellerAddress.line1}</p>
                        {sellerAddress.line2 && <p>{sellerAddress.line2}</p>}
                        <p>{sellerAddress.city}, {sellerAddress.state} {sellerAddress.postalCode}</p>
                        <p>{sellerAddress.country}</p>
                    </div>
                </div>

                {/* Return Items List */}
                <div className="flex-1 border-t-2 border-black pt-2 overflow-hidden">
                    <p className="font-bold text-sm mb-2 uppercase text-center bg-gray-200 py-1">Return Details</p>
                    <table className="w-full text-xs text-left mb-2 table-fixed">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="pb-1 w-[80%]">Item</th>
                                <th className="pb-1 w-[20%] text-right text-xs">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ret.items?.map((item: any) => (
                                <tr key={item.id} className="border-b border-gray-300">
                                    <td className="py-1 pr-2 truncate">
                                        {item.orderItem?.variant?.product?.name}
                                    </td>
                                    <td className="py-1 text-right">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-2 text-xs overflow-hidden max-h-[60px]">
                        <p className="font-bold mb-1">Customer Reason:</p>
                        <p className="italic border border-gray-300 p-2 text-[10px] leading-tight line-clamp-2">{ret.reason} {ret.description ? `- ${ret.description}` : ""}</p>
                    </div>
                </div>

                {/* Footer Barcode Area */}
                <div className="border-t-2 border-black pt-2 mt-auto text-center flex flex-col items-center">
                    <p className="text-[10px] mb-1">SCAN AT DROP-OFF</p>
                    <div className="h-10 w-3/4 max-w-[200px] mb-1 flex justify-between tracking-[-3px] font-mono text-[40px] leading-none select-none overflow-hidden"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(to right, black 0, black 2px, white 2px, white 4px, black 4px, black 8px, white 8px, white 10px, black 10px, black 11px, white 11px, white 14px, black 14px, black 17px, white 17px, white 20px)',
                        }}>
                    </div>
                    <p className="text-xs font-mono tracking-widest">{ret.id.substring(0, 16)}...</p>
                </div>
            </div>
        </div>
    );

    return mounted ? createPortal(labelContent, document.body) : null;
}
