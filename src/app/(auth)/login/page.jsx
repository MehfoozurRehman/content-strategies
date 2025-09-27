
'use client';
import React, { useState } from "react";
import CustomButton from "@/app/customComponents/CustomButton";
import CustomInput from "@/app/customComponents/CustomInput";
import { useRouter } from "next/navigation";
import { isValidEmail, isValidPassword } from "@/lib/utils";
import { loginUser } from "@/lib/services/userServices";
import Link from "next/link";
import { appColors } from "@/lib/theme";


const SignInPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setEmailError("");
        setPasswordError("");

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        let isValid = true;
        if (!isValidEmail(email)) {
            setEmailError("Please enter a valid email address.");
            isValid = false;
        }

        if (!isValidPassword(password)) {
            setPasswordError("Password must be at least 6 characters long.");
            isValid = false;
        }

        if (!isValid) return;
        setLoading(true);

        try {
            const response = await loginUser({ email, password });
            if (response.error) {
                setError(response.error || "Login failed. Please try again.");
            } else {
                setSuccessMessage("Login successful! Redirecting...");
                setTimeout(() => {
                    router.push("/assistant");
                }, 2000);
            }
        } catch (err) {
            setError("An error occurred. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ color: appColors.textHeadingColor }}>
            <div className="bg-[#ffffff] p-8 rounded-2xl shadow-lg w-96" >
                <h2 className="text-2xl font-bold text-center mb-4">
                    <span className="border-l-4 border-[#1a1b41] pl-2">Content Strategies</span>
                </h2>
                <p className="text-center  mb-4">
                    Sign Into Your AI Navigator Account
                </p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSignIn} >
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Email</label>
                    <CustomInput
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ${emailError ? "border-red-500" : ""} mb-2 `}
                        disabled={loading}
                    />
                    {emailError && <p className="text-red-500 text-sm mb-2 mt-0">{emailError}</p>}
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Password</label>
                    <CustomInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full ${passwordError ? "border-red-500" : ""} mb-2`}
                        disabled={loading}
                    />
                    <div className="text-sm mb-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" onChange={togglePasswordVisibility} />
                            <span>Show password</span>
                        </label>
                    </div>

                    {passwordError && <p className="text-red-500 text-sm mb-0 mt-0">{passwordError}</p>}
                    <div className="w-full flex justify-end mt-0 underline">
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition mr-1"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <CustomButton
                        title={loading ? "Signing in..." : "SIGN IN"}
                        className="w-full bg-[#1a1b41] hover:bg-gray-600 text-white font-bold py-2 rounded-md transition mb-4 mt-4"
                        disabled={loading}
                    />
                    {successMessage && <p className="text-green-500 text-sm text-center mb-4">{successMessage}</p>}
                </form>


                {/* <div className="flex justify-center items-center">
                    <p className="text-sm font-medium text-gray-600">Don't have an account?</p>
                    <Link href="/sign-up" className="ml-2 text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition">
                        Create a new account
                    </Link>
                </div> */}
            </div>
        </div>
    );
};

export default SignInPage;
