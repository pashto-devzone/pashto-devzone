"use client";

import { memo, useRef, useState } from "react";
import {
  FaEye,
  FaEdit,
  FaCopy,
  FaTrash,
  FaPrint,
  FaFilePdf,
  FaFileImage,
  FaImage,
  FaShareAlt,
  FaWhatsapp,
  FaTelegram,
  FaEnvelope,
  FaLink,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import ReceiptPreview from "./ReceiptPreview";
import {
  exportReceipt,
  shareReceipt,
  buildShareLinks,
  copyLink,
  copyImage,
} from "./receiptUtils";

function ReceiptCard({
  receipt,
  onEdit,
  onDelete,
  onDuplicate,
  onPrint,
}) {
  const [expanded, setExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exporting, setExporting] = useState("");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  };

  const ensurePreview = async () => {
    if (!previewRef.current) {
      setExpanded(true);
      await new Promise((r) => setTimeout(r, 350));
    } else {
      await new Promise((r) => setTimeout(r, 50));
    }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await ensurePreview();
      await exportReceipt(
        previewRef.current,
        format,
        `receipt-${receipt.receiptNumber}`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setExporting("");
    }
  };

  const handlePrint = async () => {
    await ensurePreview();
    onPrint(receipt);
  };

  const handleShare = async () => {
    const result = await shareReceipt(receipt);
    if (result === "shared" || result === "cancelled") {
      setShareOpen(false);
      return;
    }
    setShareOpen((s) => !s);
  };

  const handleCopyLink = async () => {
    const ok = await copyLink();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyImage = async () => {
    setExporting("copy");
    try {
      await ensurePreview();
      const ok = await copyImage(previewRef.current);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExporting("");
    }
  };

  const shareLinks = buildShareLinks(receipt);
  const projectName = receipt.projectName || receipt.app?.name || "-";
  const amount = (receipt.price || receipt.amountPaid || 0).toLocaleString();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-gray-900 truncate">
              {receipt.receiptNumber}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(receipt.createdAt)}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors shrink-0"
            title={expanded ? "Hide Preview" : "View Receipt"}
          >
            <FaEye /> {expanded ? "Hide" : "View"}
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm flex-1">
          <div>
            <p className="text-xs text-gray-500 uppercase">Customer</p>
            <p className="font-semibold text-gray-900 truncate">
              {receipt.customer?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Application / Project</p>
            <p className="text-gray-700 truncate">{projectName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Amount</p>
            <p className="font-bold text-green-700">
              {receipt.currency || "PKR"} {amount}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-1.5">
          <button
            onClick={() => onEdit(receipt)}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDuplicate(receipt)}
            className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            title="Duplicate"
          >
            <FaCopy />
          </button>
          <button
            onClick={() => onDelete(receipt)}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <FaTrash />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Print"
          >
            <FaPrint />
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            title="Download PDF"
          >
            <FaFilePdf />
          </button>
          <button
            onClick={() => handleExport("png")}
            disabled={!!exporting}
            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            title="Download PNG"
          >
            <FaFileImage />
          </button>
          <button
            onClick={() => handleExport("jpg")}
            disabled={!!exporting}
            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
            title="Download JPG"
          >
            <FaImage />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            title="Share"
          >
            <FaShareAlt />
          </button>
        </div>
      </div>

      {/* Expanded preview (capture target) */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="print-receipt">
            <div ref={previewRef}>
              <ReceiptPreview receipt={receipt} />
            </div>
          </div>

          {/* Share fallback panel */}
          {shareOpen && (
            <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Share Receipt</p>
                <button
                  onClick={() => setShareOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg text-xs font-medium hover:bg-sky-200 transition-colors"
                >
                  <FaTelegram /> Telegram
                </a>
                <a
                  href={shareLinks.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  <FaEnvelope /> Messenger
                </a>
                <a
                  href={shareLinks.email}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  <FaEnvelope /> Email
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  {copied ? <FaCheck className="text-green-600" /> : <FaLink />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={handleCopyImage}
                  disabled={!!exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaFileImage /> {exporting === "copy" ? "..." : "Copy Image"}
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={!!exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <FaFilePdf /> {exporting === "pdf" ? "..." : "Copy PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ReceiptCard);
