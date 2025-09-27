"use client";

import { appColors } from '@/lib/theme';
import React, { useState, useEffect } from 'react';
import CustomButton from '../customComponents/CustomButton';
import CustomInput from '../customComponents/CustomInput';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiCamera, FiArrowLeft, FiCheck, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';

const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AccountSettingsPage = () => {
    const router = useRouter();
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [showEmailField, setShowEmailField] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [systemRole, setSystemRole] = useState('');
    const [accountStatus, setAccountStatus] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : '';
    const currentEmail = storedEmail;

    useEffect(() => {
        setAvatarUrl(typeof window !== 'undefined' ? localStorage.getItem('avatar_url') : null);
        setSystemRole(typeof window !== 'undefined' ? localStorage.getItem('system_roles') : '');
        setAccountStatus(typeof window !== 'undefined' ? localStorage.getItem('account_status') : '');
    }, []);
    useEffect(() => {
        const dirty =
            avatarFile !== null ||
            (showEmailField && newEmail && newEmail !== currentEmail) ||
            (showPasswordFields && (newPassword || currentPassword || confirmPassword));
        setIsDirty(dirty);
    }, [avatarFile, showEmailField, newEmail, currentEmail, showPasswordFields, newPassword, currentPassword, confirmPassword]);
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadAvatar = async () => {
        if (!avatarFile) return;

        try {
            setIsUpdating(true);
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            localStorage.setItem("avatar_url", publicUrl);
            window.location.reload();
            setAvatarUrl(publicUrl);
            if (updateError) throw updateError;

            setMessage({ text: "Profile picture updated successfully", type: 'success' });
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            setIsUpdating(true);
            let updates = [];

            // Update password if provided
            if (showPasswordFields && newPassword) {
                if (newPassword !== confirmPassword) {
                    setMessage({ text: "New passwords don't match", type: 'error' });
                    return;
                }

                if (!currentPassword) {
                    setMessage({ text: "Please enter current password", type: 'error' });
                    return;
                }

                const { error } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (error) throw error;
                updates.push('password');
                setShowPasswordFields(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }

            // Update email if changed
            if (showEmailField && newEmail && newEmail !== currentEmail) {
                const { error } = await supabase.auth.updateUser({ email: newEmail });
                if (error) throw error;
                updates.push('email');
                localStorage.setItem('email', newEmail);
                setShowEmailField(false);
                setNewEmail('');
            }

            // Update avatar if selected
            if (avatarFile) {
                await uploadAvatar();
                updates.push('profile picture');
            }

            if (updates.length > 0) {
                setMessage({
                    text: `Successfully updated ${updates.join(', ')}`,
                    type: 'success'
                });

                if (updates.includes('email')) {
                    setMessage(prev => ({
                        text: `${prev.text}. Check both email inboxes to confirm email change`,
                        type: 'info'
                    }));
                }
            } else {
                setMessage({ text: "No changes were made", type: 'info' });
            }

            setAvatarFile(null);

        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const renderMessage = () => {
        if (!message.text) return null;

        const colorMap = {
            success: 'text-green-400 border-green-500/20',
            error: 'text-red-400 border-red-500/20',
            info: ' text-blue-400 border-blue-500/20'
        };

        return (
            <div className={`mt-4 p-3  rounded-md ${colorMap[message.type] || colorMap.info} max-w-2xl ml-auto -mr-20`}>
                {message.text}
            </div>
        );
    };


    return (
        <div className="bg-gray-50" style={{ backgroundColor: appColors.primaryColor }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8 border-b border-white/20 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="mr-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FiArrowLeft size={20} className="text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center">
                                <FiUser className="mr-3" />
                                Account Settings
                            </h1>
                            <p className="mt-2 text-white/80">Manage your account information and security settings</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden" style={{ backgroundColor: appColors.primaryColor }}>
                    <div className="p-6 md:p-2">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                {/* Profile Picture Section */}
                                <div className="pb-2 mt-0">
                                    <h2 className="text-lg font-medium text-white mb-6">Profile Picture</h2>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                {avatarUrl || avatarPreview ? (
                                                    <img
                                                        src={avatarPreview || avatarUrl}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                                                        {storedEmail ? storedEmail.charAt(0).toUpperCase() : '👤'}
                                                    </div>
                                                )}
                                            </div>
                                            <label
                                                htmlFor="avatar"
                                                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer transition-all hover:bg-blue-400 group-hover:opacity-100 opacity-90"
                                                title="Change photo"
                                            >
                                                <FiCamera size={16} />
                                                <input
                                                    type="file"
                                                    id="avatar"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white/80 mb-2 py-14">
                                                Upload a new photo to update your profile picture. JPG, GIF or PNG. Max size 2MB.
                                            </p>
                                            {avatarFile && (
                                                <div className="flex items-center -mt-8 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={uploadAvatar}
                                                        disabled={isUpdating}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-400 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        {isUpdating ? 'Uploading...' : 'Save Photo'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAvatarFile(null);
                                                            setAvatarPreview('');
                                                        }}
                                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information Section */}
                                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 border-white/20 border-t pt-8">
                                    {/* LEFT: Account Info */}
                                    <div className="w-full lg:w-1/2 pr-0 lg:pr-6 border-white/20 lg:border-r">
                                        <div className="pb-8">
                                            <h2 className="text-lg font-medium text-white mb-6">Account Information</h2>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                {/* System Role */}
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">System Role</label>
                                                    <div className="mt-1 text-sm p-3 bg-white/10 rounded-md border border-white/20 text-white">
                                                        {systemRole || 'N/A'}
                                                    </div>
                                                </div>

                                                {/* Account Status */}
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Account Status</label>
                                                    <div className="mt-1 text-sm p-3 bg-white/10 rounded-md border border-white/20 text-white">
                                                        {accountStatus || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: Email + Password */}
                                    <div className="w-full lg:w-1/2 pl-0 lg:pl-6 space-y-8">
                                        {/* Email Section */}

                                        <div className="border-b border-white/20 pb-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                                        <FiMail className="mr-2" />
                                                        Email Address
                                                    </label>
                                                    <div className="text-sm text-white">{currentEmail}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmailField(!showEmailField)}
                                                    className="text-white hover:text-gray-300 text-sm font-medium flex items-center"
                                                >
                                                    <FiEdit className="mr-1" />
                                                    {showEmailField ? 'Cancel' : 'Change Email'}
                                                </button>
                                            </div>

                                            {showEmailField && (
                                                <div className="mt-4 max-w-md w-full">
                                                    <CustomInput
                                                        type="email"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                        placeholder="Enter new email address"
                                                        className="w-full text-white"
                                                        style={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Password Section */}
                                        <div className="border-b border-white/20 pb-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                                        <FiLock className="mr-2" />
                                                        Password
                                                    </label>
                                                    <div className="text-sm text-white">••••••••••</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                                    className="text-white hover:text-white/80 text-sm font-medium flex items-center"
                                                >
                                                    <FiEdit className="mr-1" />
                                                    {showPasswordFields ? 'Cancel' : 'Change Password'}
                                                </button>
                                            </div>

                                            {showPasswordFields && (
                                                <div className="mt-4 space-y-4 max-w-md w-full">
                                                    {/* Current Password */}
                                                    <div className="relative">
                                                        <CustomInput
                                                            label="Current Password"
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            placeholder="Enter current password"
                                                            className="w-full text-white"
                                                            style={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            className="absolute right-3 top-9 text-white/70 hover:text-white"
                                                        >
                                                            {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                                                        </button>
                                                    </div>

                                                    {/* New Password */}
                                                    <div className="relative">
                                                        <CustomInput
                                                            label="New Password"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="Enter new password"
                                                            className="w-full text-white"
                                                            style={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-3 top-9 text-white/70 hover:text-white"
                                                        >
                                                            {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                                        </button>
                                                    </div>

                                                    {/* Confirm Password */}
                                                    <div className="relative">
                                                        <CustomInput
                                                            label="Confirm New Password"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Confirm new password"
                                                            className="w-full text-white"
                                                            style={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-9 text-white/70 hover:text-white"
                                                        >
                                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                                        </button>
                                                    </div>

                                                    <p className="text-xs text-white/70">
                                                        Password must be at least 6 characters
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Message display */}
                                {renderMessage()}

                                {/* Form Actions */}
                                {isDirty && (
                                    <div className="flex justify-end pt-2">
                                        <div className="flex gap-3">
                                            <CustomButton
                                                type="button"
                                                onClick={() => router.push('/assistant')}
                                                variant="outline"
                                                className="px-4 py-2 text-sm border-white/30 text-white"
                                            >
                                                Cancel
                                            </CustomButton>
                                            <CustomButton
                                                type="submit"
                                                disabled={isUpdating}
                                                className="px-4 py-2 text-sm text-white"
                                            >
                                                {isUpdating ? (
                                                    <span className="flex items-center">
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Saving...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <FiCheck className="mr-2" />
                                                        Save Changes
                                                    </span>
                                                )}
                                            </CustomButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;