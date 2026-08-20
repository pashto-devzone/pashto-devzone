"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FaSave, FaFilePdf, FaFileImage, FaImage, FaEye } from "react-icons/fa";
import ReceiptPreview from "../../components/admin/ReceiptPreview";
import ReceiptCard from "../../components/admin/ReceiptCard";
import { exportReceipt } from "../../components/admin/receiptUtils";

const paymentMethodMap = ["Cash", "EasyPaisa", "Bank Transfer", "Other"];

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

const emptyForm = {
  customerName: "",
  phone: "",
  email: "",
  appId: "",
  projectName: "",
  price: "",
  paymentMethod: "Cash",
  paymentAccountId: "",
  currency: "PKR",
  issueDate: todayISO(),
  notes: "",
};

export default function AdminReceipts() {
  const [apps, setApps] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [printReceipt, setPrintReceipt] = useState(null);
  const previewRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [appsRes, accountsRes, receiptsRes] = await Promise.all([
        fetch("/api/admin/apps?all=true"),
        fetch("/api/admin/payment-accounts"),
        fetch("/api/admin/receipts"),
      ]);
      const [a, ac, r] = await Promise.all([
        appsRes.json(),
        accountsRes.json(),
        receiptsRes.json(),
      ]);
      if (Array.isArray(a)) setApps(a);
      if (Array.isArray(ac)) {
        setAccounts(ac);
        if (ac.length > 0) {
          const def = ac.find((x) => x.isDefault) || ac[0];
          setForm((f) => ({ ...f, paymentAccountId: String(def.id) }));
        }
      }
      if (Array.isArray(r)) setReceipts(r);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => String(a.id) === String(form.paymentAccountId)),
    [accounts, form.paymentAccountId]
  );

  const selectedApp = useMemo(
    () => apps.find((a) => String(a.id) === String(form.appId)),
    [apps, form.appId]
  );

  // Build a preview receipt object from the form
  const previewReceipt = useMemo(() => {
    return {
      receiptNumber: editing?.receiptNumber || "PDZ-YYYYMMDD-0001",
      issueDate: form.issueDate,
      createdAt: new Date().toISOString(),
      customer: {
        name: form.customerName || "-",
        phone: form.phone || "",
        email: form.email || "",
      },
      app: selectedApp || null,
      projectName: form.projectName || null,
      price: parseFloat(form.price) || 0,
      amountPaid: parseFloat(form.price) || 0,
      paymentMethod: form.paymentMethod,
      currency: form.currency,
      paymentAccount: selectedAccount || null,
      notes: form.notes || null,
    };
  }, [form, selectedApp, selectedAccount, editing]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear the other field: if app selected, clear project; if project entered, clear app
    if (field === "appId" && value) {
      setForm((f) => ({ ...f, projectName: "" }));
    }
    if (field === "projectName" && value) {
      setForm((f) => ({ ...f, appId: "" }));
    }
  };

  const resetForm = () => {
    setEditing(null);
    const def = accounts.find((a) => a.isDefault) || accounts[0];
    setForm({
      ...emptyForm,
      issueDate: todayISO(),
      paymentAccountId: def ? String(def.id) : "",
    });
    setShowPreview(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (!form.customerName.trim()) {
      setError("Customer name is required");
      setSaving(false);
      return;
    }
    if (!form.appId && !form.projectName.trim()) {
      setError("Select an application or enter a project name");
      setSaving(false);
      return;
    }

    const body = {
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      appId: form.appId ? parseInt(form.appId) : null,
      projectName: form.projectName,
      price: parseFloat(form.price) || 0,
      paymentMethod: form.paymentMethod,
      paymentAccountId: form.paymentAccountId
        ? parseInt(form.paymentAccountId)
        : null,
      currency: form.currency,
      issueDate: form.issueDate,
      notes: form.notes,
    };

    try {
      const url = editing
        ? `/api/admin/receipts/${editing.id}`
        : "/api/admin/receipts";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save receipt");
        return;
      }
      setMessage(
        editing
          ? `Receipt updated: ${data.receiptNumber}`
          : `Receipt saved: ${data.receiptNumber}`
      );
      setTimeout(() => setMessage(""), 3000);
      resetForm();
      loadData();
    } catch {
      setError("Failed to save receipt");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (receipt) => {
    setEditing(receipt);
    setForm({
      customerName: receipt.customer?.name || "",
      phone: receipt.customer?.phone || "",
      email: receipt.customer?.email || "",
      appId: receipt.app ? String(receipt.app.id) : "",
      projectName: receipt.projectName || "",
      price: String(receipt.price || receipt.amountPaid || ""),
      paymentMethod: receipt.paymentMethod || "Cash",
      paymentAccountId: receipt.paymentAccountId
        ? String(receipt.paymentAccountId)
        : "",
      currency: receipt.currency || "PKR",
      issueDate: receipt.issueDate
        ? new Date(receipt.issueDate).toISOString().slice(0, 10)
        : todayISO(),
      notes: receipt.notes || "",
    });
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicate = async (receipt) => {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: receipt.customer?.name || "",
          phone: receipt.customer?.phone || "",
          email: receipt.customer?.email || "",
          appId: receipt.app ? receipt.app.id : null,
          projectName: receipt.projectName || "",
          price: receipt.price || receipt.amountPaid || 0,
          paymentMethod: receipt.paymentMethod || "Cash",
          paymentAccountId: receipt.paymentAccountId || null,
          currency: receipt.currency || "PKR",
          issueDate: receipt.issueDate,
          notes: receipt.notes || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to duplicate receipt");
        return;
      }
      setMessage(`Receipt duplicated: ${data.receiptNumber}`);
      setTimeout(() => setMessage(""), 3000);
      loadData();
    } catch {
      setError("Failed to duplicate receipt");
    }
  };

  const handleDelete = async (receipt) => {
    if (!confirm(`Delete receipt "${receipt.receiptNumber}"?`)) return;
    try {
      const res = await fetch(`/api/admin/receipts/${receipt.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete receipt");
        return;
      }
      loadData();
    } catch {
      setError("Failed to delete receipt");
    }
  };

  const handlePrint = async (receipt) => {
    // Render the receipt into the dedicated hidden print root, then print.
    setPrintReceipt(receipt);
    await new Promise((r) => setTimeout(r, 150));
    window.print();
  };

  const handleLiveExport = async (format) => {
    setShowPreview(true);
    await new Promise((r) => setTimeout(r, 400));
    try {
      await exportReceipt(previewRef.current, format, "receipt-preview");
    } catch (e) {
      console.error(e);
      setError("Export failed.");
    }
  };

  const inputCls =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <p className="text-gray-500 text-center">
        Loading receipt generator...
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {editing ? "Edit Receipt" : "Receipt Generator"}
      </h1>

      {message && (
        <p className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Receipt Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Customer Name *</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                className={inputCls}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputCls}
                  placeholder="Customer phone"
                />
              </div>
              <div>
                <label className={labelCls}>Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputCls}
                  placeholder="customer@email.com"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-3">
                Select an application OR enter a project name. Only one is
                required.
              </p>
              <div>
                <label className={labelCls}>Application</label>
                <select
                  value={form.appId}
                  onChange={(e) => update("appId", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select application (optional if project name)</option>
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                <label className={labelCls}>Project / Item Name</label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={(e) => update("projectName", e.target.value)}
                  className={inputCls}
                  placeholder="Project or item name"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Amount *</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={inputCls}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  className={inputCls}
                >
                  {paymentMethodMap.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className={inputCls}
                >
                  <option>PKR</option>
                  <option>USD</option>
                  <option>AED</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Payment Account</label>
              <select
                value={form.paymentAccountId}
                onChange={(e) => update("paymentAccountId", e.target.value)}
                className={inputCls}
              >
                <option value="">Select account (optional)</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountName} ({a.bankType})
                    {a.isDefault ? " — Default" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Issue Date</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => update("issueDate", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className={inputCls}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <FaSave /> {saving ? "Saving..." : editing ? "Update Receipt" : "Generate Receipt"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PREVIEW */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Receipt Preview</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <FaEye /> {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {showPreview ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="print-area">
                <div ref={previewRef}>
                  <ReceiptPreview receipt={previewReceipt} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleLiveExport("pdf")}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <FaFilePdf /> PDF
                </button>
                <button
                  onClick={() => handleLiveExport("png")}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <FaFileImage /> PNG
                </button>
                <button
                  onClick={() => handleLiveExport("jpg")}
                  className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  <FaImage /> JPG
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-sm text-center py-6">
                Click "Show Preview" to see the live receipt.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT HISTORY */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Receipt History</h2>
        {receipts.length === 0 ? (
          <p className="text-gray-500 text-center py-10 bg-white rounded-xl border border-gray-200">
            No receipts generated yet. Receipts will appear here automatically.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {receipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden print root - only visible when printing */}
      <div id="receipt-print-root">
        {printReceipt && <ReceiptPreview receipt={printReceipt} />}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-root,
          #receipt-print-root * {
            visibility: visible;
          }
          #receipt-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: #ffffff;
          }
        }
      `}</style>
    </div>
  );
}
