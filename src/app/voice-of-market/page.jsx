"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaClock, FaLink, FaTimes, FaUpload } from "react-icons/fa";
import CustomCrudForm from "../customComponents/CustomCrud";
import Alert from "../customComponents/Alert";
import SearchByDateModal from "../customComponents/SearchByDateModal";
import CustomInput from "../customComponents/CustomInput";
import { debounce } from "@/lib/utils";
import MultiSelectDropdown from "../customComponents/FiltersMultiSelect";
import DynamicBranding from "../customComponents/DynamicLabelAndLogo";
import { fetchCategoryLabels } from "@/lib/services/categoryServices";
import { ShowCustomToast } from "../customComponents/CustomToastify";
import { fetchUserCompanySlug } from "@/lib/services/companySlugServices";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 20;

const VoiceOfMarket = () => {
    const [files, setFiles] = useState([]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateSearchApplied, setDateSearchApplied] = useState(false);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [showEditFileModal, setShowEditFileModal] = useState(false);
    const [currentEditingFile, setCurrentEditingFile] = useState(null);
    const [showUploadFileModal, setShowUploadFileModal] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const FILE_TYPE_ICONS = {
        Document: "📄",
        Spreadsheet: "📊",
        Presentation: "📑",
        PDF: "📕",
        Image: "🖼️",
        Video: "🎬",
        Audio: "🎵",
        Archive: "📦",
        Code: "💻",
        Executable: "⚙️",
        ISO: "💿",
        Other: "📁"
    };
    const columns = [
        // { label: "Avatar", id: "thumbnail" },
        {
            label: "Details",
            id: "file_type_icon",
            // Custom renderer for the icon column
            render: (row) => {
                const fileType = row.file_type;
                // Handle both array and single value cases
                const fileTypes = Array.isArray(fileType) ? fileType : [fileType];

                return (
                    <div className="flex items-center justify-center">
                        {fileTypes.map((type, index) => (
                            <span key={index} className="text-xl">
                                {FILE_TYPE_ICONS[type] || FILE_TYPE_ICONS.Other}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        { label: "File Name", id: "file_name" },
        { label: "Format", id: "file_type" },
        { label: "Category", id: "category" },
        // { label: "Market Categories", id: "market_categories" },
        // { label: "Content Categories", id: "content_categories" },
        { label: "Description", id: "description" },
        { label: "Likes", id: "Likes" },
        { label: "Comments", id: "Comments" },
        // { label: "File", id: "file" },

        // { label: "Tag", id: "tags" },
        // { label: "Actions", id: "action" }
    ];

    const arrayFields = ["category", "file_type", "tags", "market_categories", "content_categories"];
    const [filterOptions, setFilterOptions] = useState({
        file_type: [
            { value: "Document", label: "Document", count: 0 },
            { value: "Spreadsheet", label: "Spreadsheet", count: 0 },
            { value: "Presentation", label: "Presentation", count: 0 },
            { value: "Image", label: "Image", count: 0 },
            { value: "Video", label: "Video", count: 0 },
            { value: "Audio", label: "Audio", count: 0 },
            { value: "PDF", label: "PDF", count: 0 },
            { value: "Archive", label: "Archive", count: 0 },
            { value: "Other", label: "Other", count: 0 }
        ],
        category: [],
        market_categories: [
            { value: "Industry", label: "Industry", count: 0 },
            { value: "Competitive", label: "Competitive", count: 0 },
            { value: "Persona", label: "Persona", count: 0 },
            { value: "Individual", label: "Individual", count: 0 }
        ],
        content_categories: [
            { value: "Academic Publications and White Papers", label: "Academic Publications and White Papers", count: 0 },
            { value: "Articles", label: "Articles", count: 0 },
            { value: "Case Studies and Success Stories", label: "Case Studies and Success Stories", count: 0 },
            { value: "Competitor Marketing Materials", label: "Competitor Marketing Materials", count: 0 },
            { value: "Conference Presentations and Industry Events", label: "Conference Presentations and Industry Events", count: 0 },
            { value: "CRM and Sales Data", label: "CRM and Sales Data", count: 0 },
            { value: "Customer and Market Survey Feedback", label: "Customer and Market Survey Feedback", count: 0 },
            { value: "Digital and Social Media", label: "Digital and Social Media", count: 0 },
            { value: "eBooks", label: "eBooks", count: 0 },
            { value: "Financial Reports and Analyst Research", label: "Financial Reports and Analyst Research", count: 0 },
            { value: "Industry Research Content", label: "Industry Research Content", count: 0 },
            { value: "Job Postings and Organizational Intelligence", label: "Job Postings and Organizational Intelligence", count: 0 },
            { value: "News and Current Events", label: "News and Current Events", count: 0 },
            { value: "Partnership and Ecosystem Intelligence", label: "Partnership and Ecosystem Intelligence", count: 0 },
            { value: "Patent Filings and Intellectual Property", label: "Patent Filings and Intellectual Property", count: 0 },
            { value: "Press Releases and Company Announcements", label: "Press Releases and Company Announcements", count: 0 },
            { value: "Product Reviews and Customer Feedback", label: "Product Reviews and Customer Feedback", count: 0 },
            { value: "Regulatory Filings and Government Data", label: "Regulatory Filings and Government Data", count: 0 },
            { value: "Reports", label: "Reports", count: 0 },
            { value: "Social Media and Digital Presence", label: "Social Media and Digital Presence", count: 0 },
            { value: "Social Media Posts", label: "Social Media Posts", count: 0 },
            { value: "Transcripts", label: "Transcripts", count: 0 },
            { value: "Video and Multimedia", label: "Video and Multimedia", count: 0 }
        ]
    });
    const fileCrudDetails = [
        // { label: "Thumbnail", key: "thumbnail", placeholder: "Upload thumbnail (optional)", type: "image" },
        { label: "File Name", key: "file_name", placeholder: "Enter file name", type: "text", required: true },
        { label: "File", key: "file", placeholder: "Select file to upload", type: "file", required: true },
        { label: "File Link", key: "file_link", placeholder: "Enter file link to upload", type: "file", required: true },
        { label: "Format", key: "file_type", placeholder: "Select file type", type: "select", required: true },
        { label: "Category", key: "category", placeholder: "Select category", type: "select", required: true, options: filterOptions.category },
        { label: "Market Categories", key: "market_categories", placeholder: "Select market categories", type: "select", required: true },
        { label: "Content Categories", key: "content_categories", placeholder: "Select content_categories", type: "select", required: true },
        { label: "Date Recorded", key: "uploaded_at", placeholder: "Select date", type: "date", required: true },
        { label: "Description", key: "description", placeholder: "Enter file description", type: "textarea", required: true },
        { label: "Tags", key: "tags", placeholder: "Enter tags (comma separated)", type: "text" }
    ];


    const [selectedFilters, setSelectedFilters] = useState({
        "file_type": [],
        "category": [],
        "market_categories": [],
        "content_categories": []
    });


    const [filterOptionsWithCounts, setFilterOptionsWithCounts] = useState(filterOptions);

    const [filterCounts, setFilterCounts] = useState({});
    const [isEndUser, setIsEndUser] = useState(false);

    const totalPages = useMemo(() => Math.ceil(totalRecords / ITEMS_PER_PAGE), [totalRecords]);

    useEffect(() => {
        const storedRole = localStorage.getItem("system_roles");
        setIsEndUser(storedRole === "end-user");
    }, []);

    useEffect(() => {
        const loadCategoryOptions = async () => {
            const categories = await fetchCategoryLabels();
            setFilterOptions(prev => ({
                ...prev,
                category: categories
            }));
        };

        loadCategoryOptions();
    }, []);

    const fetchFiles = useCallback(async (page = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const fromDateISO = fromDate ? new Date(fromDate).toISOString() : null;
            const toDateISO = toDate ? new Date(toDate).toISOString() : null;

            const { data, error } = await supabase.rpc('combined_search_voice_of_market', {
                search_term: searchText.trim() || null,
                file_types_json: selectedFilters["file_type"]?.length ? selectedFilters["file_type"] : null,
                categories_json: selectedFilters["category"]?.length ? selectedFilters["category"] : null,
                market_categories_json: selectedFilters["market_categories"]?.length ? selectedFilters["market_categories"] : null,
                content_categories_json: selectedFilters["content_categories"]?.length ? selectedFilters["content_categories"] : null,
                from_date: fromDateISO,
                to_date: toDateISO,
                current_user_id: localStorage.getItem('current_user_id'),
                current_company_id: localStorage.getItem('company_id'),
                page_num: page,
                page_size: ITEMS_PER_PAGE
            });

            if (error) throw error;

            // Helper: formats JSONB arrays or stringified arrays for display
            const formatArrayField = (fieldValue) => {
                if (!fieldValue) return '';
                try {
                    const items = typeof fieldValue === 'string'
                        ? JSON.parse(fieldValue)
                        : fieldValue;

                    if (Array.isArray(items)) {
                        return items.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                return item.label || item.value || '';
                            }
                            return item;
                        }).filter(Boolean).join(', ');
                    }
                    return '';
                } catch (e) {
                    console.log('Error formatting field:', e);
                    return '';
                }
            };

            const formattedData = data.map(item => {
                const formattedItem = { ...item };

                // Format known JSONB fields for display
                formattedItem.file_type_display = formatArrayField(formattedItem.file_type);
                formattedItem.market_categories = formatArrayField(formattedItem.market_categories);
                formattedItem.content_categories = formatArrayField(formattedItem.content_categories);
                formattedItem.category_display = formatArrayField(formattedItem.category);
                formattedItem.tags_display = formatArrayField(formattedItem.tags);

                return formattedItem;
            });

            if (isLoadMore) {
                setFiles(prev => [...prev, ...formattedData]);
                setFilteredFiles(prev => [...prev, ...formattedData]);
            } else {
                setFiles(formattedData || []);
                setFilteredFiles(formattedData || []);
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
    }, [selectedFilters, isSearchActive, fromDate, toDate, searchText]);


    useEffect(() => {
        setCurrentPage(1);
        fetchFiles(1, false);
    }, [selectedFilters, searchText, fromDate, toDate]);

    const loadMoreData = async () => {
        if (!loadingMore && files.length < totalRecords) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            await fetchFiles(nextPage, true);
        }
    };

    const fetchAllFilterCounts = useCallback(async () => {
        try {
            const { data, error } = await supabase.rpc('get_filter_counts_voice_of_market', {
                current_user_id: localStorage.getItem('current_user_id'),
                input_company_id: localStorage.getItem('company_id'),
            });

            if (error) {
                console.log("Error fetching filter counts:", error);
                return;
            }

            // Initialize counts object
            const counts = {
                "file_type": {},
                "category": {},
                "content_categories": {},
                "market_categories": {}
            };

            // Process the counts data
            data.forEach(({ category, value, count }) => {
                if (counts[category]) {
                    counts[category][value] = { count };
                }
            });

            setFilterCounts(counts);

            // Update the filter options with counts
            const updatedOptions = { ...filterOptions };
            for (const filterType in updatedOptions) {
                updatedOptions[filterType] = updatedOptions[filterType].map(option => {
                    const countData = counts[filterType]?.[option.value] || { count: 0 };
                    return {
                        ...option,
                        count: countData.count
                    };
                });
            }

            setFilterOptionsWithCounts(updatedOptions);
        } catch (err) {
            console.log("Error calculating filter counts:", err);
        }
    }, [filterOptions]);

    useEffect(() => {
        fetchAllFilterCounts();
    }, [fetchAllFilterCounts, files]);

    const handleFilterSelect = (filterType, values) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: values
        }));
        setIsSearchActive(true);
        setCurrentPage(1);
    };

    const handleUploadFileSubmit = () => {
        setShowUploadFileModal(false);
        fetchFiles(1, false);
    };

    const handleEditFileSubmit = () => {
        setShowEditFileModal(false);
        fetchFiles(currentPage, false);
    };

    const handleEditClick = (file) => {
        setCurrentEditingFile(file);
        setShowEditFileModal(true);
    };

    const handleDeleteClick = async (id) => {
        Alert.show('Delete Confirmation', 'Are you sure you want to delete this file?', [
            {
                text: 'Yes',
                primary: true,
                onPress: async () => {
                    try {
                        const { error: deleteError } = await supabase
                            .from("voice_of_market")
                            .delete()
                            .eq("id", id);

                        if (deleteError) {
                            throw new Error(deleteError.message);
                        }

                        // Get updated total count
                        const { count, error: countError } = await supabase
                            .from("voice_of_market")
                            .select("*", { count: "exact", head: true });

                        if (countError) throw countError;
                        setTotalRecords(count || 0);

                        // Adjust pagination if needed
                        if ((currentPage - 1) * ITEMS_PER_PAGE >= count) {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }

                        // Fetch updated file list
                        const { data, error } = await supabase
                            .from("voice_of_market")
                            .select("*")
                            .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
                            .order('id', { ascending: false });

                        if (error) throw error;

                        setFiles(data); // or setUsers if that's what you use

                        Alert.show('Success', 'File deleted successfully.', [
                            {
                                text: 'OK',
                                primary: true,
                                onPress: () => {
                                    console.log('File deleted and user clicked OK.');
                                },
                            },
                        ]);

                        // Optional: full refetch if needed
                        fetchFiles(currentPage, false);

                    } catch (err) {
                        Alert.show('Error', `Failed to delete the file: ${err.message}`);
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
        fetchFiles();
    };

    const debouncedSearch = useMemo(() =>
        debounce((searchValue) => {
            setSearchText(searchValue);
            setIsSearchActive(true);
            setCurrentPage(1);
        }, 500),
        []
    );

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

    const clearSearch = async () => {
        setSearchText("");
        setSelectedFilters({
            "file_type": [],
            "category": [],
            "market_categories": [],
            "content_categories": []
        });
        setFromDate("");
        setToDate("");
        setDateSearchApplied(false);
        setCurrentPage(1);
        setOpenDropdown(false);
        setLoadingMore(false);
    };


    console.log("FilteredFiles", filteredFiles);
    console.log("files", files);
    return (
        <div className="overflow-x-hidden py-0 p-4 relative">
            {/* Search & divs Section */}
            <div className="py-3 px-6 mt-[-10px] flex justify-between items-center">
                {/* Search Bar */}
                <div className="p-0 w-full">
                    {/* Search Bar Section */}
                    <div className="mx-auto -mt-2">
                        <DynamicBranding showLogo={false} showTitle={true} title="File Management System" />

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
                                        placeholder="Search files by name or description..."
                                    />
                                </div>

                                {/* Clear Search Button - only visible when there's something to clear */}
                                {(searchText || dateSearchApplied || Object.values(selectedFilters).some(arr => arr.length > 0)) && (
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
                                {["Search By Date", 'Share Signup Url', "Upload File"].map((text, i) => {
                                    const getIcon = (label) => {
                                        switch (label) {
                                            case "Search By Date": return <FaClock className="w-4 h-4" />;
                                            case "Share Signup Url": return <FaLink className="w-3 h-3" />;
                                            case "Upload File": return <FaUpload className="w-3 h-3" />;
                                            default: return null;
                                        }
                                    };
                                    const isUploadFile = text === "Upload File";
                                    const isSearchByDate = text === "Search By Date";

                                    // Skip rendering the "Upload File" button if user is an end-user
                                    if (isUploadFile && isEndUser) {
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            className={`px-4 py-2 text-sm ${isUploadFile ? "bg-[#3a86ff] hover:bg-[#2f6fcb]" :
                                                isSearchByDate && dateSearchApplied ? "bg-white/20 hover:bg-white/20" : "bg-white/10 hover:bg-white/20"
                                                } transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer`}
                                            onClick={() => {
                                                if (text === "Upload File") setShowUploadFileModal(true);
                                                else if (text === "Search By Date") setShowDateModal(true);
                                                else if (text === "Share Signup Url") handleShareSignupLink();
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
            {(searchText || dateSearchApplied || Object.values(selectedFilters).some(arr => arr.length > 0)) && (
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

                            {/* Dynamic filters */}
                            {Object.entries(selectedFilters).map(([filterType, values]) => {
                                return values.length > 0 && (
                                    <div key={filterType} className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                                        <span className="text-white text-sm whitespace-nowrap capitalize">
                                            {filterType}: {values.join(", ")}
                                        </span>
                                        <button
                                            onClick={() => handleFilterSelect(filterType, [])}
                                            className="text-gray-300 hover:text-white"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            <hr className="border-gray-500 mb-6 mt-[10px] -mx-12" />

            {/* Filter Section */}
            <div className="flex">
                <aside className="flex flex-col gap-2 w-full md:w-64 px-6">
                    {Object.keys(filterOptionsWithCounts).map((field) => {
                        const displayField = field === 'file_type'
                            ? 'File Type'
                            : field === 'category'
                                ? 'Category'
                                : field === 'content_categories' ?
                                    'Content Categories' :
                                    field === 'market_categories' ?
                                        'Market Categories' : field;
                        return (
                            <MultiSelectDropdown
                                key={field}
                                field={field}
                                label={`Filter By ${displayField}`}
                                options={filterOptionsWithCounts[field]}
                                selectedValues={selectedFilters[field] || []}
                                onSelect={(values) => {
                                    handleFilterSelect(field, values);
                                }}
                                isOpen={openDropdown === field}
                                onToggle={() =>
                                    setOpenDropdown(openDropdown === field ? null : field)
                                }
                                exclusiveSelections={selectedFilters}
                            />
                        );
                    })}
                    <div className="mt-6 flex items-center gap-3 py-4 fixed bottom-0">
                        <img
                            src="/ai-navigator-logo.png"
                            alt="Logo"
                            className="w-30 h-6 object-contain"
                        />
                    </div>
                </aside>

                <div className="hidden md:block h-auto overflow-y-hidden w-px bg-gray-600 mx-4 ml-6 -mt-6"></div>

                {/* Table */}
                <main className="flex-1 px-6 overflow-x-auto">
                    <div className="overflow-x-auto">
                        <DraggableTable
                            columns={columns}
                            data={filteredFiles.length > 0 ? filteredFiles : files}
                            arrayFields={arrayFields}
                            loading={loading}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            showActions={!isEndUser} // Hide actions for end users
                            hasMoreRecords={files.length < totalRecords}
                            onLoadMore={loadMoreData}
                            loadingMore={loadingMore}
                            alignRecord={false}
                            loadingRecord={true}
                            likesTableName={'user_likes_voice_of_market'}
                            commentsTableName={'record_comments_voice_of_market'}
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

            {/* Upload File Modal */}
            {(showUploadFileModal || showEditFileModal) && (
                <CustomCrudForm
                    isEditMode={showEditFileModal}
                    entityData={showEditFileModal ? currentEditingFile : {}}
                    onClose={() => {
                        setShowUploadFileModal(false);
                        setShowEditFileModal(false);
                    }}
                    onSubmit={showEditFileModal ? handleEditFileSubmit : handleUploadFileSubmit}
                    displayFields={fileCrudDetails.map(field => {
                        // Update category options dynamically
                        if (field.key === "category") {
                            return {
                                ...field,
                                options: filterOptions.category
                            };
                        }
                        return field;
                    })}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setFiles}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchFiles}
                    tableName="voice_of_market"
                    createRecord="Upload File"
                    updateRecord="Edit File"
                    formatedValueDashboard={false}
                    formatedValueFiles={true}
                    isFilesData={true}
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

export default VoiceOfMarket;
