"use client";
import React, { useState, useEffect } from "react";
import CustomButton from "@/app/customComponents/CustomButton";
import CustomInput from "@/app/customComponents/CustomInput";
import { isValidEmail } from "@/lib/utils";
import { resetPasswordLink } from "@/lib/services/userServices";
import Link from "next/link";
import { appColors } from "@/lib/theme";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setError("");
    setSuccessMessage("");
  }, [email]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) return setError("Email is required.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");

    setLoading(true);
    try {
      const response = await resetPasswordLink(email);
      if (response.error) throw new Error(response.error);
      setSuccessMessage("Please check your email for the reset link.");
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ color: appColors.textHeadingColor }}>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">
          <span className="border-l-4 border-[#1a1b41] pl-2">Forgot Password</span>
        </h2>
        <form onSubmit={handleForgotPassword}>
          <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Email</label>
          <CustomInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2"
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm text-center mb-4">{successMessage}</p>}
          <CustomButton
            title={loading ? "Sending..." : "Send Reset Link"}
            className="w-full bg-[#1a1b41] hover:bg-gray-600 text-white font-bold py-2 rounded-md transition mb-4 mt-4"
            disabled={loading}
          />
        </form>
        <div className="flex justify-center items-center">
          <p className="text-sm font-medium text-gray-600">Back to sign in?</p>
          <Link href="/login" className="ml-2 text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
