"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaClock, FaLink, FaPlus, FaTimes, FaUpload } from "react-icons/fa";
import CustomCrudForm from "../customComponents/CustomCrud";
import Alert from "../customComponents/Alert";
import SearchByDateModal from "../customComponents/SearchByDateModal";
import CustomInput from "../customComponents/CustomInput";
import { debounce } from "@/lib/utils";
import DynamicBranding from "../customComponents/DynamicLabelAndLogo";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 20;

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateSearchApplied, setDateSearchApplied] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [currentEditingCategory, setCurrentEditingCategory] = useState(null);
    const [showUploadCategoryModal, setShowUploadCategoryModal] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const columns = [
        { label: "Company Specific", id: "company_specific" },
        { label: "Competitive", id: "competitive" },
        { label: "External Research Studies", id: "external_research_studies" },
        { label: "Presentations", id: "presentations" },
        { label: "Emails", id: "emails" },
        { label: "Scripts", id: "scripts" },
        { label: "Sales Call Recordings", id: "sales_call_recordings" },
        { label: "External Links", id: "external_links", type: 'url' },
        // { label: "Actions", id: "action" },
    ];

    const categoryCrudDetails = [
        { label: "Company Specific", key: "company_specific", placeholder: "Enter company specific data", type: "text", required: true },
        { label: "Competitive", key: "competitive", placeholder: "Enter competitive data", type: "text", required: true },
        { label: "External Research Studies", key: "external_research_studies", placeholder: "Enter external research studies", type: "text", required: true },
        { label: "Presentations", key: "presentations", placeholder: "Enter presentations data", type: "text", required: true },
        { label: "Emails", key: "emails", placeholder: "Enter emails data", type: "text", required: true },
        { label: "Scripts", key: "scripts", placeholder: "Enter scripts data", type: "text", required: true },
        { label: "Sales Call Recordings", key: "sales_call_recordings", placeholder: "Enter sales call recordings", type: "text", required: true },
        { label: "External Links", key: "external_links", placeholder: "Enter external links", type: "text", required: true },
        { label: "Date Recorded", key: "uploaded_at", placeholder: "Select date", type: "date", required: true },
    ];

    const [isEndUser, setIsEndUser] = useState(false);

    const totalPages = useMemo(() => Math.ceil(totalRecords / ITEMS_PER_PAGE), [totalRecords]);
    useEffect(() => {
        const storedRole = localStorage.getItem("system_roles");
        setIsEndUser(storedRole === "end-user");
    }, []);

    const fetchCategories = useCallback(async (page = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const fromDateISO = fromDate ? new Date(fromDate).toISOString() : null;
            const toDateISO = toDate ? new Date(toDate).toISOString() : null;

            const { data, error } = await supabase.rpc('combined_search_category', {
                search_term: searchText.trim() || null,
                from_date: fromDateISO,
                to_date: toDateISO,
                current_user_id: localStorage.getItem('current_user_id'),
                // current_company_id: localStorage.getItem('company_id'),
                page_num: page,
                page_size: ITEMS_PER_PAGE
            });

            if (error) throw error;

            const formattedData = data.map(item => {
                return { 
                    ...item,
                    company_specific: item.company_specific || '',
                    competitive: item.competitive || '',
                    external_research_studies: item.external_research_studies || '',
                    presentations: item.presentations || '',
                    emails: item.emails || '',
                    scripts: item.scripts || '',
                    sales_call_recordings: item.sales_call_recordings || '',
                    external_links: item.external_links || ''
                };
            });

            if (isLoadMore) {
                setCategories(prev => [...prev, ...formattedData]);
                setFilteredCategories(prev => [...prev, ...formattedData]);
            } else {
                setCategories(formattedData || []);
                setFilteredCategories(formattedData || []);
            }

            setTotalRecords(data[0]?.total_count || 0);

        } catch (err) {
            console.log("Fetch error:", {
                message: err.message,
                details: err.details,
            });
        } finally {
            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
                setIsSearchActive(false);
            }
        }
    }, [isSearchActive, fromDate, toDate, searchText]);

    useEffect(() => {
        // Reset to first page when search/filter changes
        setCurrentPage(1);
        fetchCategories(1, false);
    }, [searchText, fromDate, toDate]);

    const loadMoreData = async () => {
        if (!loadingMore && categories.length < totalRecords) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            await fetchCategories(nextPage, true);
        }
    };

    const handleUploadCategorySubmit = () => {
        setShowUploadCategoryModal(false);
        fetchCategories(1, false);
    };

    const handleEditCategorySubmit = () => {
        setShowEditCategoryModal(false);
        fetchCategories(currentPage, false);
    };

    const handleEditClick = (category) => {
        setCurrentEditingCategory(category);
        setShowEditCategoryModal(true);
    };

    const handleDeleteClick = async (id) => {
        Alert.show('Delete Confirmation', 'Are you sure you want to delete this category?', [
            {
                text: 'Yes',
                primary: true,
                onPress: async () => {
                    try {
                        const { error: deleteError } = await supabase
                            .from("category")
                            .delete()
                            .eq("id", id);

                        if (deleteError) {
                            throw new Error(deleteError.message);
                        }

                        // Get updated total count
                        const { count, error: countError } = await supabase
                            .from("category")
                            .select("*", { count: "exact", head: true });

                        if (countError) throw countError;
                        setTotalRecords(count || 0);

                        // Adjust pagination if needed
                        if ((currentPage - 1) * ITEMS_PER_PAGE >= count) {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }

                        // Fetch updated category list
                        const { data, error } = await supabase
                            .from("category")
                            .select("*")
                            .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
                            .order('id', { ascending: false });

                        if (error) throw error;

                        setCategories(data);

                        Alert.show('Success', 'Category deleted successfully.', [
                            {
                                text: 'OK',
                                primary: true,
                                onPress: () => {
                                    console.log('Category deleted and user clicked OK.');
                                },
                            },
                        ]);

                        // Optional: full refetch if needed
                        fetchCategories(currentPage, false);

                    } catch (err) {
                        Alert.show('Error', `Failed to delete the category: ${err.message}`);
                    }
                },
            },
            {
                text: 'No',
                primary: false,
            },
        ]);
    };

    const handleDateSearch = async () => {
        setDateSearchApplied(true);
        setIsSearchActive(true);
        setCurrentPage(1);
        setShowDateModal(false);
        fetchCategories();
    };

    const debouncedSearch = useMemo(() =>
        debounce((searchValue) => {
            setSearchText(searchValue);
            setIsSearchActive(true);
            setCurrentPage(1);
        }, 500),
        []
    );

    const clearSearch = async () => {
        setSearchText("");
        setFromDate("");
        setToDate("");
        setDateSearchApplied(false);
        setCurrentPage(1);
        setLoadingMore(false);
    };

    return (
        <div className="overflow-x-hidden py-0 p-4 relative">
            {/* Search & divs Section */}
            <div className="py-3 px-6 mt-[-10px] flex justify-between items-center">
                {/* Search Bar */}
                <div className="p-0 w-full">
                    {/* Search Bar Section */}
                    <div className="mx-auto -mt-2">
                        <DynamicBranding showLogo={false} showTitle={true} title="Category Management System" />

                        {/* Search Bar with Clear Button */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            {/* Left-aligned search group */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {/* Search Input - Wider */}
                                <div className="relative flex-grow" style={{ minWidth: '470px' }}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiOutlineSearch className="text-gray-400" />
                                    </div>
                                    <CustomInput
                                        type="text"
                                        value={searchText}
                                        onChange={(e) => {
                                            setSearchText(e.target.value);
                                            debouncedSearch(e.target.value);
                                        }}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white/10 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Search categories..."
                                    />
                                </div>

                                {/* Clear Search Button - only visible when there's something to clear */}
                                {(searchText || dateSearchApplied) && (
                                    <button
                                        onClick={clearSearch}
                                        className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 whitespace-nowrap transition-colors"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                        Clear Search
                                    </button>
                                )}
                            </div>

                            {/* Right-aligned action buttons */}
                            <div className="flex gap-2">
                                {["Search By Date", "Add Category"].map((text, i) => {
                                    const getIcon = (label) => {
                                        switch (label) {
                                            case "Search By Date": return <FaClock className="w-4 h-4" />;
                                            case "Add Category": return <FaPlus className="w-3 h-3" />;
                                            default: return null;
                                        }
                                    };
                                    const isAddCategory = text === "Add Category";
                                    const isSearchByDate = text === "Search By Date";

                                    // Skip rendering the "Add Category" button if user is an end-user
                                    if (isAddCategory && isEndUser) {
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            className={`px-4 py-2 text-sm ${isAddCategory ? "bg-[#3a86ff] hover:bg-[#2f6fcb]" :
                                                isSearchByDate && dateSearchApplied ? "bg-white/20 hover:bg-white/20" : "bg-white/10 hover:bg-white/20"
                                                } transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer`}
                                            onClick={() => {
                                                if (text === "Add Category") setShowUploadCategoryModal(true);
                                                else if (text === "Search By Date") setShowDateModal(true);
                                            }}
                                        >
                                            {getIcon(text)}
                                            {text}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Filters Section - Fixed and Scrollable */}
            {(searchText || dateSearchApplied) && (
                <div className="sticky top-0 z-10 max-w-[calc(100%-3rem)] ml-6 border rounded-full bg-white/10 py-2 px-8 mb-3">
                    <div className="flex items-center w-full max-w-[calc(100vw-8rem)] mx-auto">
                        <span className="text-gray-200 font-medium whitespace-nowrap mr-2 -ml-2">Applied Filters:</span>
                        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 no-scrollbar">
                            {/* Search text filter */}
                            {searchText && (
                                <div className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                                    <span className="text-white whitespace-nowrap">Search: "{searchText}"</span>
                                    <button
                                        onClick={() => setSearchText("")}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* Date filter */}
                            {dateSearchApplied && (
                                <div className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                                    <span className="text-white text-sm whitespace-nowrap">
                                        Date: {fromDate} to {toDate}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setFromDate("");
                                            setToDate("");
                                            setDateSearchApplied(false);
                                        }}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <hr className="border-gray-500 mb-6 mt-[10px] -mx-12" />

            {/* Main Content */}
            <div className="flex">
                {/* Table */}
                <main className="flex-1 px-6 overflow-x-auto">
                    <div className="overflow-x-auto">
                        <DraggableTable
                            columns={columns}
                            data={filteredCategories.length > 0 ? filteredCategories : categories}
                            loading={loading}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            showActions={!isEndUser} // Hide actions for end users
                            hasMoreRecords={categories.length < totalRecords}
                            onLoadMore={loadMoreData}
                            loadingMore={loadingMore}
                            loadingRecord={false}
                            alignRecord={true}
                        />
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-0 px-4 py-2 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <span className="text-[#6c757d] text-sm font-sm flex items-center gap-1">
                                Showing
                                <span className="text-sm text-[#6c757d]">{currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE + 1}</span> -
                                <span className="text-sm text-[#6c757d]">{Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)}</span>
                                of
                                <span className="text-sm text-[#6c757d]">{totalRecords}</span>
                            </span>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add/Edit Category Modal */}
            {(showUploadCategoryModal || showEditCategoryModal) && (
                <CustomCrudForm
                    isEditMode={showEditCategoryModal}
                    entityData={showEditCategoryModal ? currentEditingCategory : {}}
                    onClose={() => {
                        setShowUploadCategoryModal(false);
                        setShowEditCategoryModal(false);
                    }}
                    onSubmit={showEditCategoryModal ? handleEditCategorySubmit : handleUploadCategorySubmit}
                    displayFields={categoryCrudDetails}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setCategories}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchCategories}
                    tableName="category"
                    createRecord="Add Category"
                    updateRecord="Edit Category"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                  
                />
            )}

            {/* Search By Date Modal */}
            {showDateModal && (
                <SearchByDateModal
                    toDate={toDate}
                    fromDate={fromDate}
                    setToDate={setToDate}
                    setFromDate={setFromDate}
                    setShowDateModal={setShowDateModal}
                    handleDateSearch={handleDateSearch}
                />
            )}
        </div>
    );
};

export default CategoryManagement;