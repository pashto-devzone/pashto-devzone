"use client";

import {
  FaGlobe,
  FaEnvelope,
  FaWhatsapp,
  FaGithub,
  FaHashtag,
} from "react-icons/fa";

const BRAND = {
  name: "Pashto DevZone",
  website: "pashto-devzone.vercel.app",
  email: "m.yaseen.dev1@gmail.com",
  whatsappPrimary: "03245020658",
  whatsappSecondary: "03078527457",
  github: "https://github.com/pashto-devzone",
  hashnode: "https://pdz-blogs.hashnode.dev/",
  ad: "Need a professional website, software, AI solution, or business automation? Contact Pashto DevZone.",
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReceiptPreview({ receipt }) {
  const customer = receipt.customer || {};
  const app = receipt.app || null;
  const account = receipt.paymentAccount || null;
  const projectName = receipt.projectName || app?.name || "-";
  const currency = receipt.currency || "PKR";
  const amount = (receipt.price || receipt.amountPaid || 0).toLocaleString();

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 text-gray-900"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-indigo-600 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/pd_logo.png"
            alt="Pashto DevZone"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h2 className="text-xl font-bold text-indigo-700">Pashto DevZone</h2>
            <p className="text-xs text-gray-500">Professional Receipt</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Receipt #</p>
          <p className="text-sm text-gray-600 font-mono">{receipt.receiptNumber || "-"}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(receipt.issueDate || receipt.createdAt)}</p>
        </div>
      </div>

      {/* Bill To / Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Bill To</p>
          <p className="font-semibold">{customer.name || "-"}</p>
          {customer.phone && <p className="text-sm">{customer.phone}</p>}
          {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs text-gray-500 uppercase">Project / Item</p>
          <p className="font-semibold">{projectName}</p>
        </div>
      </div>

      {/* Amount */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left px-3 py-2">Item</th>
              <th className="text-right px-3 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2">{projectName}</td>
              <td className="px-3 py-2 text-right font-semibold text-green-700">
                {currency} {amount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment method */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase">Payment Method</p>
          <p className="font-medium">{receipt.paymentMethod || "Cash"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase">Total Paid</p>
          <p className="font-semibold text-green-700">
            {currency} {amount}
          </p>
        </div>
      </div>

      {/* Payment Account */}
      {account &&
        (account.accountHolder ||
          account.iban ||
          account.accountNumber ||
          account.phone ||
          account.accountName) && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase mb-2">Payment Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {account.accountName && (
                <p>
                  <span className="text-gray-500">Account:</span>{" "}
                  <span className="font-medium">{account.accountName}</span>
                </p>
              )}
              {account.bankType && (
                <p>
                  <span className="text-gray-500">Type:</span> {account.bankType}
                </p>
              )}
              {account.accountHolder && (
                <p>
                  <span className="text-gray-500">Holder:</span>{" "}
                  {account.accountHolder}
                </p>
              )}
              {account.iban && (
                <p>
                  <span className="text-gray-500">IBAN:</span> {account.iban}
                </p>
              )}
              {account.accountNumber && (
                <p>
                  <span className="text-gray-500">Account No:</span>{" "}
                  {account.accountNumber}
                </p>
              )}
              {account.phone && (
                <p>
                  <span className="text-gray-500">Phone:</span> {account.phone}
                </p>
              )}
            </div>
          </div>
        )}

      {receipt.notes && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
          <p className="text-sm text-gray-700">{receipt.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <FaGlobe className="text-indigo-600" /> {BRAND.website}
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-indigo-600" /> {BRAND.email}
            </p>
            <p className="flex items-center gap-2">
              <FaWhatsapp className="text-green-600" /> {BRAND.whatsappPrimary}
            </p>
            <p className="flex items-center gap-2">
              <FaWhatsapp className="text-green-600" /> {BRAND.whatsappSecondary}
            </p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <FaGithub className="text-gray-700" /> {BRAND.github}
            </p>
            <p className="flex items-center gap-2 break-all">
              <FaHashtag className="text-blue-600" /> {BRAND.hashnode}
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
          {BRAND.ad}
        </p>
      </div>
    </div>
  );
}
