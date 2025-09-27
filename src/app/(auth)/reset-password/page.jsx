"use client";
import React, { useState } from "react";
import CustomButton from "@/app/customComponents/CustomButton";
import CustomInput from "@/app/customComponents/CustomInput";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/services/userServices";
import Link from "next/link";
import { appColors } from "@/lib/theme";

const ResetPassword = () => {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!password) return setError("Password is required.");
        if (password.length < 6) return setError("Password must be at least 6 characters long.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        setLoading(true);
        try {
            const response = await updatePassword(password);
            if (response.error) throw new Error(response.error);
            setSuccessMessage("Password updated! Redirecting to sign in...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to update password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen " style={{ color: appColors.textHeadingColor }}>
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96" >
                <h2 className="text-2xl font-bold text-center mb-4">
                    <span className="border-l-4 border-[#1a1b41] pl-2">Reset Password</span>
                </h2>
                <form onSubmit={handleResetPassword}>
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1" >New Password</label>
                    <CustomInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-2"
                        labelClassName="text-[#1a1b41]"
                        disabled={loading}
                    />
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Confirm Password</label>
                    <CustomInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full mb-2"
                        disabled={loading}
                    />
                     <div className="text-sm mb-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" onChange={togglePasswordVisibility} />
                            <span>Show password</span>
                        </label>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm text-center mb-4">{successMessage}</p>}
                   

                    <CustomButton
                        title={loading ? "Updating..." : "Update Password"}
                        className="w-full bg-[#1a1b41] hover:bg-gray-600 text-white font-bold py-2 rounded-md transition mb-4 mt-4"
                        disabled={loading}
                    />
                </form>

                <div className="flex justify-center items-center">
                    <p className="text-sm font-medium text-gray-600">Remember your password?</p>
                    <Link href="/login" className="ml-2 text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
