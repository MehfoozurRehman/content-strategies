'use client';
import React, { useState, useEffect } from "react";
import CustomButton from "@/app/customComponents/CustomButton";
import CustomInput from "@/app/customComponents/CustomInput";
import CustomSelect from "@/app/customComponents/CustomSelect";
import { isValidEmail, isValidPassword } from "@/lib/utils";
import { signUpUser } from "@/lib/services/userServices";
import Link from "next/link";
import { appColors } from "@/lib/theme";
import { useParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { CustomSpinner } from "@/app/customComponents/Spinner";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Signup = () => {
    const [selectedTitles, setSelectedTitles] = useState([]);
    const [emailSentMessage, setEmailSentMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [serverError, setServerError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [company, setCompany] = useState(null);
    const [companyError, setCompanyError] = useState("");

    const params = useParams();
    const companySlug = params.companySlug;

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                // Decode the company name from the URL
                const companyName = decodeURIComponent(companySlug);
                console.log("Looking for company:", companyName); // Debug log
                const { data, error } = await supabase
                    .from('companies')
                    .select('id, company_name')
                    .eq('slug', companySlug)
                    .single();

                if (error) throw error;
                if (!data) {
                    setCompanyError("Company not found");
                    return;
                }

                setCompany(data);
            } catch (error) {
                setCompanyError("Error loading company information");
                console.log("Error fetching company:", error);
            }
        };

        if (companySlug) {
            fetchCompany();
        }
    }, [companySlug]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setEmailError("");
        setPasswordError("");
        setServerError("");
        setTitleError("");

        if (!company) {
            setServerError("Invalid company");
            return;
        }

        let isValid = true;
        if (selectedTitles.length === 0) {
            setTitleError("Please select at least one title.");
            isValid = false;
        }

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
            const signUpData = {
                email,
                password,
                title_roles: selectedTitles.map((title) => title),
            };

            const response = await signUpUser(signUpData, company.id);
            if (response.error) {
                setServerError(response.error);
            } else {
                const user = response.user;
                console.log('userrrr', user);

                if (user?.user_metadata?.email_verified === undefined) {
                    setServerError("This email is already registered and verified. Try signing in.");
                } else if (user.code === 'over_email_send_rate_limit') {
                    setServerError(user.message || "For security purposes, you can only request again after 1 minute")

                } else {
                    setEmailSentMessage("We have sent a verification email. Please check your inbox.");
                }

            }
        } catch (error) {
            setServerError("An unexpected error occurred.");
            console.log(error);
        }

        setLoading(false);
    };

    if (companyError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-[#ffffff] p-8 rounded-2xl shadow-lg w-100">
                    <h2 className="text-2xl font-bold text-center mb-4">
                        <span className="border-l-4 border-[#1a1b41] pl-2">Error</span>
                    </h2>
                    <p className="text-center mb-4">{companyError}</p>
                    <Link href={`/${companySlug}/login`} className="ml-2 text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition">
                        Go to homepage
                    </Link>
                </div>
            </div>
        );
    }

    // if (!company) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             {/* <div className="bg-[#ffffff] p-8 rounded-2xl shadow-lg w-100"> */}
    //             <div className="flex items-center justify-center gap-2 text-white font-bold">
    //                 <CustomSpinner className="w-8 h-8" />
    //                 <span>Loading...</span>

    //             </div>
    //             {/* </div> */}
    //         </div>
    //     );
    // }

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ color: appColors.textHeadingColor }}>
            <div className="bg-[#ffffff] p-8 rounded-2xl shadow-lg w-96">
                <form onSubmit={handleSignUp}>
                    <h2 className="text-2xl font-bold text-center mb-4">
                        <span className="border-l-4 border-[#1a1b41] pl-2">Content Strategies</span>
                    </h2>
                    <p className="text-center mb-4 w-[100%]">
                        Sign Up For Your Podcast Database

                    </p>
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1">Select Titles</label>
                    <CustomSelect
                        id="titles"
                        value={selectedTitles}
                        onChange={setSelectedTitles}
                        placeholder="Select Titles"
                        options={[
                            { value: "Marketing", label: "Marketing" },
                            { value: "Sales", label: "Sales" },
                            { value: "Product", label: "Product" },
                            { value: "Operations", label: "Operations" },
                            { value: "Finance", label: "Finance" },
                            { value: "Executive", label: "Executive" },
                        ]}
                        isMulti={true}
                        className="w-full mb-2"
                    />
                    {titleError && <p className="text-red-500 text-sm mt-0 mb-3">{titleError}</p>}
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1">Email</label>
                    <CustomInput
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ${emailError ? "border-red-500" : ""} mb-2`}
                        disabled={loading}
                    />
                    {emailError && <p className="text-red-500 text-sm mt-0 mb-2">{emailError}</p>}
                    <label className="block text-sm text-[#1a1b41] font-bold mb-1">Password</label>
                    <CustomInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full ${passwordError ? "border-red-500" : ""} mb-1`}
                        disabled={loading}
                    />
                    <div className="text-sm mb-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" onChange={togglePasswordVisibility} />
                            <span>Show password</span>
                        </label>
                    </div>
                    {passwordError && <p className="text-red-500 text-sm mb-6 mt-2">{passwordError}</p>}
                    {emailSentMessage && <p className="text-green-500 text-sm text-center mb-0">{emailSentMessage}</p>}
                    {serverError && <p className="text-red-500 text-sm mb-4">{serverError}</p>}

                    <CustomButton
                        title={loading ? "Signing up..." : "SIGN UP"}
                        className="w-full bg-[#1a1b41] hover:bg-gray-600 font-bold py-2 rounded-md transition mb-4 mt-4"
                        disabled={loading}
                    />


                    <div className="flex justify-center items-center">
                        <p className="text-sm font-medium text-gray-600">Already have an account?</p>
                        <Link href="/login" className="ml-2 text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;