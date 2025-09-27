'use client';
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaLink } from "react-icons/fa";
import DraggableTable from "../customComponents/DraaggableTable";
import Alert from "../customComponents/Alert";
import { getRandomColor } from "../constants/constant";
import { getAiNavigatorUsers, updateUserRoles, updateUserStatus } from "@/lib/services/adminServices";
import CustomButton from "../customComponents/CustomButton";
import CustomSelect from "../customComponents/CustomSelect";
import { appColors } from "@/lib/theme";
import { fetchUserCompanySlug } from "@/lib/services/companySlugServices";
import { ShowCustomToast } from "../customComponents/CustomToastify";

const ITEMS_PER_PAGE = 100;

const AiNavigatorUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemRoles, setSystemRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accountStatus, setAccountStatus] = useState(currentUser?.raw_user_meta_data?.account_status || 'Enabled');

  console.log('statusssss', currentUser);
  // Predefined system roles
  const availableRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'end-user', label: 'End User' }
  ];

  const columns = [
    { label: "Email", id: "email" },
    { label: "Title", id: "title_roles" },
    { label: "System Roles", id: "system_roles" },
    { label: "Status", id: "account_status" },
    { label: "Last Sign In", id: "last_sign_in_at" },
    { label: "Created At", id: "created_at" },
    { label: "Updated At", id: "updated_at" },
    // { label: "Actions", id: "action" },
  ];

  const arrayFields = ["title_roles", "system_roles"];
  const fetchUsers = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { users: fetchedUsers, total, error } = await getAiNavigatorUsers();

      if (error) throw error;

      const formattedUsers = fetchedUsers.map((user) => {
        // Handle title_roles
        const titleRoles = Array.isArray(user.raw_user_meta_data?.title_roles)
          ? user.raw_user_meta_data.title_roles
          : user.raw_user_meta_data?.title_roles
            ? [user.raw_user_meta_data.title_roles]
            : [];

        // Handle system_roles
        const systemRoles = Array.isArray(user.raw_user_meta_data?.system_roles)
          ? user.raw_user_meta_data.system_roles
          : user.raw_user_meta_data?.system_roles
            ? [user.raw_user_meta_data.system_roles]
            : [];

        // Format dates
        const lastSignIn = user.last_sign_in_at
          ? new Date(user.last_sign_in_at).toLocaleDateString()
          : 'Never';

        const createdAt = user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : '';

        const updatedAt = user.updated_at
          ? new Date(user.updated_at).toLocaleDateString()
          : '';

        return {
          ...user,
          id: user.id,
          email: user.email || '',
          title_roles: titleRoles.join(', '),
          system_roles: systemRoles.join(', '),
          account_status: user.raw_user_meta_data?.account_status || 'Enabled',
          last_sign_in_at: lastSignIn,
          created_at: createdAt,
          updated_at: updatedAt,
        };
      });

      if (isLoadMore) {
        setUsers(prev => [...prev, ...formattedUsers]);
      } else {
        setUsers(formattedUsers || []);
        setTotalRecords(fetchedUsers.length);
      }

    } catch (error) {
      console.log("Error fetching users:", error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);
  useEffect(() => {
    if (currentUser) {
      setAccountStatus(currentUser?.raw_user_meta_data?.account_status || 'Enabled');
    }
  }, [currentUser]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1, false);
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    const currentRoles = user.raw_user_meta_data?.system_roles || [];
    setCurrentUser(user);
    setSelectedRoles(currentRoles);
    setShowEditModal(true);
  };

  const loadMoreData = async () => {
    if (!loadingMore && users.length < totalRecords) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchUsers(nextPage, true);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentUser) return;

    const result = await updateUserStatus(currentUser.id, accountStatus);

    if (result?.error) {
      console.log("Error updating status:", result.error);
    } else {
      Alert.show("Success", `User has been ${accountStatus}.`, [{ text: "OK", primary: true }]);

      // ✅ Update local state for the updated user
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === currentUser.id
            ? {
              ...user,
              raw_user_meta_data: {
                ...user.raw_user_meta_data,
                account_status: accountStatus,
              },
              account_status: accountStatus,
            }
            : user
        )
      );


      setShowEditModal(false);
    }
  };

  const handleShareSignupLink = async () => {
    try {
      const slug = await fetchUserCompanySlug();
      const url = `${window.location.origin}/${slug}/sign-up`;

      await navigator.clipboard.writeText(url);
      ShowCustomToast("Signup Url copied to clipboard!", 'success', 2000);
    } catch (error) {
      ShowCustomToast("Failed to generate signup Url.", 'error', 2000);
    }
  };


  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-[90%] mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI-Navigator Users</h1>
        {/* Right-aligned action buttons */}
      <div className="flex gap-2">
        {["Share Signup Url"].map((text, i) => {
          const getIcon = (label) => {
            switch (label) {
              case "Share Signup Url": return <FaLink className="w-3 h-3" />;
              default: return null;
            }
          };
          return (
            <button
              key={i}
              className={`px-4 py-2 text-sm  bg-white/10 hover:bg-white/20
                         transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer`}
              onClick={() => {
                if (text === "Share Signup Url") handleShareSignupLink();
              }}
            >
              {getIcon(text)}
              {text}
            </button>
          );
        })}
      </div>
      </div>
      

      <div className="max-w-full mx-auto">
        <div className="overflow-y-auto overflow-x-auto shadow-md rounded-lg">
          <DraggableTable
            columns={columns}
            data={paginatedUsers}
            arrayFields={arrayFields}
            loading={loading}
            onEdit={handleEditClick}
            showActions={true}
            hasMoreRecords={users.length < totalRecords}
            onLoadMore={loadMoreData}
            loadingMore={loadingMore}
            alignRecord={true}
          />
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 px-4 py-2 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <span className="text-[#6c757d] text-sm font-sm flex items-center gap-1">
            Showing
            <span className="text-sm text-[#6c757d]">{currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE + 1}</span> -
            <span className="text-sm text-[#6c757d]">{Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)}</span>
            of
            <span className="text-sm text-[#6c757d]">{totalRecords}</span>
          </span>
          {/* <div>
                <nav className="relative z-0 inline-flex gap-2 rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-white/10'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <div
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-3 py-0 border rounded text-sm font-medium ${currentPage === page ? 'z-10 bg-[#3a86ff] border-gray-300 ' : 'bg-white/10  border-gray-300 text-gray-500 hover:bg-gray-200 cursor-pointer'}`}
                      >
                        {page}
                      </div>
                    );
                  })}

                  <div
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 bg-white/10 cursor-not-allowed' : 'text-gray-500 hover:bg-white/10 cursor-pointer'}`}
                  >
                    <span className="sr-only ">Next</span>
                    <FaChevronRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                </nav>
              </div> */}
        </div>
      </div>


      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: appColors.primaryColor }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold border-b w-full">Update User Status</h2>
            </div>
            <div className="mb-6 p-4 rounded-lg shadow-sm border border-gray-100" style={{ backgroundColor: appColors.primaryColor }}>
              <div className="flex items-start gap-4">
                {/* User Avatar/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1" >
                  <h3 className="text-lg  font-medium text-gray-300 ">{currentUser.email}</h3>

                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium text-gray-300 mr-2">Current Status:</span>
                    <div className="flex flex-wrap gap-1">
                      {accountStatus}

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-2 mt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-300">
                  Status: {accountStatus === 'Enabled' ? 'Enabled' : 'Disabled'}
                </label>
                <button
                  onClick={() => setAccountStatus(prev => prev === 'Enabled' ? 'Disabled' : 'Enabled')}
                  className={`w-12 h-6 rounded-full relative transition-all ${accountStatus === 'Enabled' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${accountStatus === 'Enabled' ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

            </div>

            <div className="flex justify-end space-x-3">
              <CustomButton
                title={"Cancel"}
                onClick={() => setShowEditModal(false)}
              />
              <CustomButton
                title={" Update Status"}
                onClick={handleUpdateStatus}
              />

            </div>
          </div>
        </div>
      )}
      {/* Bottom Left Footer */}
      <div className="fixed bottom-0 left-0 flex items-center gap-3 py-4 px-6">
        <img
          src="/ai-navigator-logo.png"
          alt="Logo"
          className="w-30 h-6 object-contain"
        />

        {/* Text container: stacked vertically */}
        {/* <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-400">
            AI - Navigator
          </span>
          <span className="text-xs text-gray-500">
            Powered by Content Strategies
          </span>
        </div> */}
      </div>

    </div>
  );
};

export default AiNavigatorUserManagement;
