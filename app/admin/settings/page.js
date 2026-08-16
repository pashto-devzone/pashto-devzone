"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaLock,
  FaSignOutAlt,
  FaSave,
  FaGlobe,
  FaGithub,
  FaWhatsapp,
  FaEnvelope,
  FaCodeBranch,
  FaRocket,
  FaHashtag,
  FaPlus,
  FaTrash,
  FaEdit,
  FaStar,
  FaUniversity,
} from "react-icons/fa";

const bankTypes = ["BANK", "EASYPAISA", "JAZZCASH", "OTHER"];

const emptyAccount = {
  accountName: "",
  bankType: "BANK",
  accountHolder: "",
  iban: "",
  accountNumber: "",
  phone: "",
  branch: "",
  active: true,
  isDefault: false,
};

export default function AdminSettings() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Payment accounts state
  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => setUsername(data.username || ""))
      .catch(() => router.push("/admin"));
  }, [router]);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const res = await fetch("/api/admin/payment-accounts");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setAccounts(data);
    } catch {}
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update settings");
        return;
      }

      setMessage("Settings updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  // Account CRUD
  function openCreateAccount() {
    setEditingAccount(null);
    setAccountForm(emptyAccount);
    setShowAccountModal(true);
    setAccountError("");
  }

  function openEditAccount(acc) {
    setEditingAccount(acc);
    setAccountForm({
      accountName: acc.accountName,
      bankType: acc.bankType,
      accountHolder: acc.accountHolder || "",
      iban: acc.iban || "",
      accountNumber: acc.accountNumber || "",
      phone: acc.phone || "",
      branch: acc.branch || "",
      active: acc.active,
      isDefault: acc.isDefault,
    });
    setShowAccountModal(true);
    setAccountError("");
  }

  async function handleSaveAccount(e) {
    e.preventDefault();
    setAccountSaving(true);
    setAccountError("");
    try {
      const url = editingAccount
        ? `/api/admin/payment-accounts/${editingAccount.id}`
        : "/api/admin/payment-accounts";
      const method = editingAccount ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountError(data.error || "Failed to save account");
        return;
      }
      setShowAccountModal(false);
      loadAccounts();
    } catch {
      setAccountError("Failed to save account");
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleDeleteAccount(acc) {
    if (!confirm(`Delete payment account "${acc.accountName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/payment-accounts/${acc.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete account");
        return;
      }
      loadAccounts();
    } catch {
      alert("Failed to delete account");
    }
  }

  const inputCls =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h1>

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

      {/* Payment Accounts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FaUniversity className="text-indigo-600" /> Payment Accounts
          </h2>
          <button
            onClick={openCreateAccount}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <FaPlus /> Add Account
          </button>
        </div>

        {accounts.length === 0 ? (
          <p className="text-gray-500 text-sm py-6 text-center">
            No payment accounts yet. Add your first account to display on receipts.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Holder</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Details</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Default</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{acc.accountName}</td>
                    <td className="py-3 px-4">
                      <span className={"inline-block px-3 py-1 rounded-full text-xs font-medium " + (acc.bankType === "BANK" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>
                        {acc.bankType}
                      </span>
                    </td>
                    <td className="py-3 px-4">{acc.accountHolder || "-"}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {acc.iban || acc.accountNumber || acc.phone || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.isDefault ? (
                        <FaStar className="text-amber-500 inline" />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={"inline-block px-3 py-1 rounded-full text-xs font-medium " + (acc.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {acc.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditAccount(acc)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Credentials */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5 mb-6"
      >
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <FaUser className="text-indigo-600" /> Admin Credentials
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FaLock className="text-indigo-600" /> Change Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Required to change password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <FaSave /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Developer Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FaRocket className="text-indigo-600" /> Developer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaGlobe className="text-indigo-600" />
            <span className="text-gray-500">Current Website:</span>
            <a href="https://pashto-devzone.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              pashto-devzone.vercel.app
            </a>
          </div>
          <div className="flex items-center gap-2">
            <FaGithub className="text-gray-700" />
            <span className="text-gray-500">Current GitHub:</span>
            <a href="https://github.com/pashto-devzone" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              pashto-devzone
            </a>
          </div>
          <div className="flex items-center gap-2">
            <FaHashtag className="text-blue-600" />
            <span className="text-gray-500">Current Hashnode:</span>
            <a href="https://pdz-blogs.hashnode.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              pdz-blogs.hashnode.dev
            </a>
          </div>
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-600" />
            <span className="text-gray-500">Primary WhatsApp:</span>
            <span>03245020658</span>
          </div>
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-600" />
            <span className="text-gray-500">Secondary WhatsApp:</span>
            <span>03078527457</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-red-500" />
            <span className="text-gray-500">Primary Email:</span>
            <span>m.yaseen.dev1@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCodeBranch className="text-purple-600" />
            <span className="text-gray-500">Application Version:</span>
            <span>0.1.0</span>
          </div>
        </div>
      </div>

      {/* Session */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FaSignOutAlt className="text-red-600" /> Session
        </h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Payment Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingAccount ? "Edit Payment Account" : "Add Payment Account"}
              </h2>
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <label className={labelCls}>Account Name *</label>
                  <input
                    type="text"
                    value={accountForm.accountName}
                    onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Main Bank Account"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Bank Type *</label>
                  <select
                    value={accountForm.bankType}
                    onChange={(e) => setAccountForm({ ...accountForm, bankType: e.target.value })}
                    className={inputCls}
                  >
                    {bankTypes.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Account Holder</label>
                  <input
                    type="text"
                    value={accountForm.accountHolder}
                    onChange={(e) => setAccountForm({ ...accountForm, accountHolder: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>IBAN</label>
                    <input
                      type="text"
                      value={accountForm.iban}
                      onChange={(e) => setAccountForm({ ...accountForm, iban: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Account Number</label>
                    <input
                      type="text"
                      value={accountForm.accountNumber}
                      onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      type="text"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Branch</label>
                    <input
                      type="text"
                      value={accountForm.branch}
                      onChange={(e) => setAccountForm({ ...accountForm, branch: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={accountForm.active}
                      onChange={(e) => setAccountForm({ ...accountForm, active: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={accountForm.isDefault}
                      onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Set as Default
                  </label>
                </div>
                {accountError && <p className="text-red-600 text-sm">{accountError}</p>}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={accountSaving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {accountSaving ? "Saving..." : editingAccount ? "Update Account" : "Add Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
