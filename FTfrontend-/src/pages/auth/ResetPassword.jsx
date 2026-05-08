import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
const API_URL = "http://127.0.0.1:8000";
export default function ResetPassword() {
  const { token } = useParams(); // token from URL path
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email"); // email from URL query

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  // Check if token and email exist
  useEffect(() => {
    if (!token && !email) {
      setMessage("❌ Missing password reset token and email.");
    } else if (!token) {
      setMessage("❌ Missing password reset token.");
    } else if (!email) {
      setMessage("❌ Missing email in password reset link.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return; // prevent submission if missing

    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: confirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Password reset successfully! You can log in now.");
      } else if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(" ");
        setMessage("❌ " + errorMessages);
      } else {
        setMessage(data.message || "❌ Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-96"
      >
        <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>

        {message && <p className="mb-4 text-red-500">{message}</p>}

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email
        </label>
        <input
          type="email"
          value={email || ""}
          readOnly
          className="shadow border rounded w-full py-2 px-3 mb-4 bg-gray-100 cursor-not-allowed"
        />

        <label className="block text-gray-700 text-sm font-bold mb-2">
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 mb-4"
          required
        />

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 mb-4"
          required
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!token || !email}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
