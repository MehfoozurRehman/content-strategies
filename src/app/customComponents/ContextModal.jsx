import { createSearchContext, createSearchContextandSource } from '@/lib/services/chatServices';
import { appColors } from '@/lib/theme';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 1000000000;

const ContextModal = ({ showContextModal, setShowContextModal, onDocSelect, currentStep, selectedDocTitles, goToPreviousStep, goToNextStep, searchQueries, setSearchQueries, onClearSearchQuery, searchQuery, setSearchQuery, colors, theme }) => {
    // State for Context Modals
    const [contentTypeOpen, setContentTypeOpen] = useState(true);
    const [challengesOpen, setChallengesOpen] = useState(true);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [searchMethod, setSearchMethod] = useState('ai'); // 'ai' or 'manual'
    const [hasSearchedAISearch, setHasSearchedAISearch] = useState(false);
    const [hasSearchedManualSearch, setHasSearchedManualSearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsAI, setSearchResultsAI] = useState([]);
    const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(true);
    const [searchQueryManual, setSearchQueryManual] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const isSubmitEnabled = searchQuery.trim();
    const [contentSource, setContentSource] = useState('select'); // 'voc' or 'vob'

    const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);

    const [selectedFilters, setSelectedFilters] = useState({
        "Video Type": [],
        "Classifications": [],
        "category": [],
        "content_categories": [],
        "market_categories": []
    });
    const fetchCategoryLabels = async () => {
        try {
            const { data, error } = await supabase.rpc('get_category_labels', {
                current_company_id: localStorage.getItem('company_id'),
            });

            if (error) throw error;

            console.log('Raw category data:', data); // Debug log

            if (!Array.isArray(data)) {
                console.warn("Unexpected data format:", data);
                return [];
            }

            // Transform the data into the format expected by your filter options
            const categories = data.map(item => {
                // Handle both object and string formats
                if (typeof item === 'object' && item !== null) {
                    return {
                        value: item.value || item.label || item,
                        label: item.label || item.value || item
                    };
                }
                return {
                    value: item,
                    label: item
                };
            });

            // Remove duplicates
            const uniqueCategories = Array.from(new Map(categories.map(item => [item.value, item])).values());

            return uniqueCategories;
        } catch (error) {
            console.log("Fetch error:", error);
            return [];
        }
    };
    // Filter options for VoC and VoB and VoM
    const [filterOptions, setFilterOptions] = useState({
        voc: {
            "Video Type": [
                { value: "Summary Video", label: "Summary Video" },
                { value: "Full Episode", label: "Full Episode" },
                { value: "Highlights Video", label: "Highlights Video" },
                { value: "Case Study", label: "Case Study" },
                { value: "ICP Advice", label: "ICP Advice" },
                { value: "Post-Podcast Video", label: "Post-Podcast Video" },
                { value: "Guest Introduction", label: "Guest Introduction" }
            ],
            "Classifications": [
                { value: "Mentioned", label: "Mentioned" },
                { value: "Client", label: "Client" },
                { value: "Employee", label: "Employee" },
                { value: "Public", label: "Public" },
                { value: "Private", label: "Private" }
            ]
        },
        vob: {
            "category": []
        },
        vom: {
            "market_categories": [
                { value: "Industry", label: "Industry" },
                { value: "Competitive", label: "Competitive" },
                { value: "Persona", label: "Persona" },
                { value: "Individual", label: "Individual" }
            ],
            "content_categories": [
                { value: "Academic Publications and White Papers", label: "Academic Publications and White Papers" },
                { value: "Articles", label: "Articles" },
                { value: "Case Studies and Success Stories", label: "Case Studies and Success Stories" },
                { value: "Competitor Marketing Materials", label: "Competitor Marketing Materials" },
                { value: "Conference Presentations and Industry Events", label: "Conference Presentations and Industry Events" },
                { value: "CRM and Sales Data", label: "CRM and Sales Data" },
                { value: "Customer and Market Survey Feedback", label: "Customer and Market Survey Feedback" },
                { value: "Digital and Social Media", label: "Digital and Social Media" },
                { value: "eBooks", label: "eBooks" },
                { value: "Financial Reports and Analyst Research", label: "Financial Reports and Analyst Research" },
                { value: "Industry Research Content", label: "Industry Research Content" },
                { value: "Job Postings and Organizational Intelligence", label: "Job Postings and Organizational Intelligence" },
                { value: "News and Current Events", label: "News and Current Events" },
                { value: "Partnership and Ecosystem Intelligence", label: "Partnership and Ecosystem Intelligence" },
                { value: "Patent Filings and Intellectual Property", label: "Patent Filings and Intellectual Property" },
                { value: "Press Releases and Company Announcements", label: "Press Releases and Company Announcements" },
                { value: "Product Reviews and Customer Feedback", label: "Product Reviews and Customer Feedback" },
                { value: "Regulatory Filings and Government Data", label: "Regulatory Filings and Government Data" },
                { value: "Reports", label: "Reports" },
                { value: "Social Media and Digital Presence", label: "Social Media and Digital Presence" },
                { value: "Social Media Posts", label: "Social Media Posts" },
                { value: "Transcripts", label: "Transcripts" },
                { value: "Video and Multimedia", label: "Video and Multimedia" }
            ]
        }
    });

    useEffect(() => {
        const loadCategoryOptions = async () => {
            const categories = await fetchCategoryLabels();
            setFilterOptions(prev => ({
                ...prev,
                vob: {
                    ...prev.vob,
                    "category": categories
                }
            }));
        };

        loadCategoryOptions();
    }, []);

    const handleDocumentSelect = (docId) => {
        setSelectedDocuments(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const handleDocumentClick = (doc) => {
        if (!doc?.id) {
            console.log('Invalid document ID:', doc);
            return;
        }

        const docId = doc.id;
        const docTitle = doc.title || 'Untitled Document';

        setSelectedDocuments(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );

        if (onDocSelect) {
            onDocSelect(docId, docTitle);
        }
    };

    const handleSubmitAISearch = async () => {
        if (!searchQuery || isLoading) return;

        try {
            setIsLoading(true);
            const payload = {
                user_id: localStorage.getItem('current_user_id'),
                query: searchQuery
            };

            const response = await createSearchContextandSource(payload);

            if (response.status === 200 && Array.isArray(response.data)) {
                setSearchResultsAI(response.data.map(item => ({
                    id: item.id,
                    title: item.title,
                    type: item.type
                })));
                setHasSearchedAISearch(true);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.log('Search Error:', error);
            setSearchResultsAI([
                { id: 'ai1', title: 'Sample Result 1: ' + searchQuery, type: 'voc' },
                { id: 'ai2', title: 'Sample Result 2: ' + searchQuery, type: 'doc' }
            ]);
            setHasSearchedAISearch(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterSelect = (filterType, value) => {
        setSelectedFilters(prev => {
            const newFilters = { ...prev };
            if (newFilters[filterType].includes(value)) {
                newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
            } else {
                newFilters[filterType] = [...newFilters[filterType], value];
            }
            return newFilters;
        });


    };

    const handleManualSearchSubmit = async () => {
        // Clear results if no search query and no filters are selected
        if (!searchQueryManual && Object.values(selectedFilters).every(arr => arr.length === 0)) {
            setSearchResults([]);
            setHasSearchedManualSearch(false);
            return;
        }

        if (isLoading) return;

        try {
            setIsLoading(true);
            let response;
            const currentUserId = localStorage.getItem('current_user_id');
            const currentCompanyId = parseInt(localStorage.getItem('company_id') || 0);

            if (contentSource === 'voc') {
                response = await supabase.rpc('simplified_voc_search', {
                    search_term: searchQueryManual.trim() || null,
                    video_types_json: selectedFilters["Video Type"]?.length ? selectedFilters["Video Type"] : null,
                    classifications_json: selectedFilters["Classifications"]?.length ? selectedFilters["Classifications"] : null,
                    current_user_id: currentUserId,
                    current_company_id: currentCompanyId,
                    page_num: 1,
                    page_size: ITEMS_PER_PAGE
                });

                if (response.error) throw response.error;

                setSearchResults(response.data.map(item => ({
                    id: item.id || crypto.randomUUID(),
                    title: item["Episode Title"] || "Untitled Episode",
                    type: 'voc'
                })));
            } else if (contentSource === 'vob') {
                response = await supabase.rpc('simplified_vob_search', {
                    search_term: searchQueryManual.trim() || null,
                    categories_json: selectedFilters["category"]?.length ? selectedFilters["category"] : null,
                    current_user_id: currentUserId,
                    current_company_id: currentCompanyId,
                    page_num: 1,
                    page_size: ITEMS_PER_PAGE
                });

                if (response.error) throw response.error;
                console.log('ressssss', response);
                setSearchResults(response.data.map((item, index) => ({
                    id: item.id || `result-${index}-${Date.now()}`,
                    title: item.file_name || "Untitled File",
                    type: 'vob'
                })));
            } else {
                response = await supabase.rpc('simplified_vom_search', {
                    search_term: searchQueryManual.trim() || null,
                    market_categories_json: selectedFilters["market_categories"]?.length ? selectedFilters["market_categories"] : null,
                    content_categories_json: selectedFilters["content_categories"]?.length ? selectedFilters["content_categories"] : null,
                    current_user_id: currentUserId,
                    current_company_id: currentCompanyId,
                    page_num: 1,
                    page_size: ITEMS_PER_PAGE
                });

                if (response.error) throw response.error;

                setSearchResults(response.data.map((item, index) => ({
                    id: item.id || `result-${index}-${Date.now()}`,
                    title: item.file_name || "Untitled File",
                    type: 'vom'
                })));
            }

            setHasSearchedManualSearch(true);
        } catch (error) {
            console.log('Search Error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (showContextModal && searchQueries.trim() === '') {
            setShowContextModal(false);
            setShowReplaceConfirmation(true);
        } else {
            handleSubmitAISearch();
        }
    }, [searchQueries, searchQuery, showContextModal]);


    // const handleReplace = () => {
    //     // Clear the search query using the callback from parent
    //     if (onClearSearchQuery) {
    //         onClearSearchQuery();
    //     }
    //     setShowReplaceConfirmation(false);
    // };

    const handleCancelReplace = () => {
        setShowReplaceConfirmation(false);
    };
    // Trigger search when filters change (for manual search)
    useEffect(() => {
        setTimeout(() => {
            if (searchMethod === 'manual') {
                // Check if any filters are selected or if there's a search query
                const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);
                const hasSearchQuery = searchQueryManual.trim() !== '';

                if (!hasActiveFilters && !hasSearchQuery) {
                    // Clear results if no filters and no search query
                    setSearchResults([]);
                    setHasSearchedManualSearch(false);
                } else {
                    // Perform search if there are active filters or search query
                    handleManualSearchSubmit();
                }
            }
        }, 0);
    }, [selectedFilters, contentSource, searchQueryManual, searchMethod]);

    const clearSearchState = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSearchResultsAI([]);
        setSelectedDocuments([]);
        setHasSearchedAISearch(false);
        setHasSearchedManualSearch(false);
        setSelectedFilters({
            "Video Type": [],
            "Classifications": [],
            "category": [],
            "market_categories": [],
            "content_categories": []
        });


    };
    const [selectAll, setSelectAll] = useState(false);



    // Update the handleIndividualSelection function
    const handleIndividualSelection = (docId, docTitle) => {
        const wasSelected = selectedDocuments.includes(docId);

        setSelectedDocuments(prev =>
            wasSelected
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );

        // Call onDocSelect to update parent component
        if (onDocSelect) {
            onDocSelect(docId, docTitle || 'Untitled Document');
        }

        // Update selectAll state if needed
        if (selectAll && wasSelected) {
            // If we're deselecting one item while select all is active, turn off select all
            setSelectAll(false);
        } else if (!selectAll && selectedDocuments.length + 1 === searchResultsAI.length) {
            // If we're about to select the last item, enable selectAll
            setSelectAll(true);
        }
    };

    // Update the useEffect for select all to handle the sync better
    useEffect(() => {
        if (selectAll && searchResultsAI.length > 0) {
            const allDocIds = searchResultsAI.map(doc => doc.id);

            // Only update if not already all selected
            if (!arraysEqual(selectedDocuments, allDocIds)) {
                setSelectedDocuments(allDocIds);

                // Add all docs to parent that aren't already selected
                searchResultsAI.forEach(doc => {
                    if (onDocSelect && !selectedDocuments.includes(doc.id)) {
                        onDocSelect(doc.id, doc.title || "Untitled Document");
                    }
                });
            }
        } else if (!selectAll && selectedDocuments.length === searchResultsAI.length && searchResultsAI.length > 0) {
            // If all are selected but selectAll is false, clear selection
            setSelectedDocuments([]);

            // Remove all search results from parent
            searchResultsAI.forEach(doc => {
                if (onDocSelect) {
                    onDocSelect(doc.id, doc.title || "Untitled Document");
                }
            });
        }
    }, [selectAll, searchResultsAI]);

    // Add this helper function to compare arrays
    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    // Update the sync useEffect
    useEffect(() => {
        // Get the document IDs from parent's selectedDocTitles
        const parentSelectedIds = selectedDocTitles.map(doc => doc.id);

        // Update local state to match parent
        setSelectedDocuments(parentSelectedIds);

        // Also update selectAll state based on whether all search results are selected
        if (searchResultsAI.length > 0) {
            const allSearchResultIds = searchResultsAI.map(doc => doc.id);
            const allSelected = allSearchResultIds.every(id => parentSelectedIds.includes(id));
            setSelectAll(allSelected);
        }
    }, [selectedDocTitles, searchResultsAI]);

    return (
        <div className="relative ml-[5%] mb-4 w-[220px] no-scrollbar">
            {/* Confirmation Modal */}
            {showReplaceConfirmation && (
                <div className="fixed inset-0 flex items-center  justify-center bg-gray-800 bg-opacity-70 z-[9999]">
                    <div className="relative border border-gray-300 w-[400px] rounded-lg p-6 w-96 shadow-xl" style={{ backgroundColor: colors.primaryColor, color: colors.text }}>
                        {/* <h3 className="text-lg font-semibold mb-4 text-white">Replace Prompt?</h3> */}
                        {/* ✅ Heading */}
                        <h3 className="text-lg font-semibold mb-2 -mt-4" >
                            Action Required
                        </h3>

                        {/* ✅ Cross icon (top-right) */}
                        <button
                            className="absolute top-2 right-3 text-gray-300 hover:text-white"
                            onClick={handleCancelReplace}
                            style={{ color: colors.text }}
                        >
                            ✕
                        </button>
                        <hr className="border-t border-gray-300 mb-2 mt-[10px] -mx-6" />
                        <p className="text-sm mt-4 mb-0  text-gray-400">
                            Please select or write a prompt before adding context
                        </p>
                        <div className="flex justify-end gap-3">
                            {/* <button
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm text-gray-800 transition-colors"
                                onClick={handleCancelReplace}
                            >
                                Cancel
                            </button> */}
                            {/* <button
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white transition-colors"
                                        onClick={handleReplace}
                                    >
                                        Replace
                                    </button> */}
                        </div>
                    </div>
                </div>
            )}
            {showContextModal && (
                <>
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="border w-[800px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl text-white px-6 py-5 relative font-sans" style={{ backgroundColor: colors.primaryColor, color: colors.text }}>

                            {/* Step Indicator */}
                            <div className="flex flex-col items-center mb-2 -mt-2">
                                {/* <div className="flex items-center justify-center space-x-4">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2 ${searchMethod === 'ai' ? 'bg-blue-500 text-white border-blue-300' : 'bg-blue-500 text-white border-blue-300'}`}
                                        >
                                            1
                                        </div>
                                    </div>
                                </div> */}
                                <div className="flex justify-center w-40 text-xs font-semibold text-white">
                                    <span className="text-center text-[10px]"></span>
                                    <div>

                                    </div>

                                </div>


                            </div>
                            <div className='flex justify-end p-2'>
                                <button
                                    onClick={() => {
                                        setShowContextModal(false);
                                        setIsLoading(false);
                                    }}
                                    className=" -mt-6  hover:text-gray-300 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-600 my-0 mt-0 -mx-6"></div>

                            {/* Title */}
                            <h2 className="text-xl font-semibold text-center mb-0 -mx-6 py-2">
                                Select your context documents
                            </h2>

                            <div className="border-t my-0 border-gray-600 -mx-6"></div>

                            {/* Source Document and Toggle */}
                            <div className="mr-4 mt-1 ml-4">
                                <div className="relative mb-4 min-h-[10px]">
                                    <div className="absolute top-[10px] right-0 flex items-center space-x-2 z-10">
                                        <span className="text-xs text-gray-400">{showInfo ? "Hide" : "Show"}</span>
                                        <button
                                            onClick={() => setShowInfo(!showInfo)}
                                            className="focus:outline-none"
                                            aria-label={showInfo ? "Hide options" : "Show options"}
                                        >
                                            <div
                                                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${showInfo ? 'bg-blue-600' : 'bg-gray-500'}`}
                                            >
                                                <div
                                                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showInfo ? 'translate-x-4' : 'translate-x-0'}`}
                                                ></div>
                                            </div>
                                        </button>
                                    </div>

                                    {showInfo && (
                                        <div className="pt-2">
                                            <label className="text-sm font-medium leading-relaxed relative">
                                                <span className="font-semibold">Source Document:</span>{" "}
                                                <span className="text-[12px]">
                                                    Search for and select context documents.
                                                </span>
                                                <span className="text-blue-400 text-[12px] cursor-pointer ml-20 relative group">
                                                    Learn more about Search Type
                                                    <div className="absolute left-1/3 top-6 transform -translate-x-1/4 w-[290px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <div className="text-white text-[11px] p-3 rounded-lg shadow-lg"
                                                            style={{
                                                                backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                                color: theme === 'light' ? '#000000' : '#ffffff',
                                                                border: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                                            }}>
                                                            <p className="mb-1 mt-0">
                                                                <strong>AI Search:</strong> Output will come from Agents
                                                            </p>
                                                            <p>
                                                                <strong>Manual Search:</strong> Output will come from database
                                                            </p>
                                                        </div>
                                                        <div className="absolute -top-[5px] left-6 w-3 h-3 transform rotate-45 bg-[#3b3b5b] z-0"

                                                            style={{
                                                                backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                                borderLeft: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                                borderTop: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                                            }}

                                                        />
                                                    </div>
                                                </span>
                                            </label>

                                            <div className="mt-3 flex items-center gap-6">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="searchMethod"
                                                        checked={searchMethod === 'ai'}
                                                        onChange={() => {
                                                            setSearchMethod('ai');
                                                            // clearSearchState();
                                                        }}
                                                        className="h-4 w-4"
                                                    />
                                                    AI Search
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="searchMethod"
                                                        checked={searchMethod === 'manual'}
                                                        onChange={() => {
                                                            setSearchMethod('manual');
                                                            // clearSearchState();
                                                        }}
                                                        className="h-4 w-4"
                                                    />
                                                    Manual Search
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-full mr-4 ml-4">
                                    {/* STEP 1 - AI Search */}
                                    {searchMethod === 'ai' && (
                                        <div className="mt-6">
                                            {/* <h3 className="text-lg text-center font-semibold mb-2">Search and select a Context</h3> */}

                                            {/* INPUT FIELD */}
                                            {/* <div className="flex items-center gap-2">
                                                <div className="relative w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="Ask anything"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pt-3 pb-3 h-[45px] p-4 pr-36 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        style={{ backgroundColor: appColors.primaryColor }}
                                                        onKeyDown={(e) => e.key === 'Enter' && isSubmitEnabled && handleSubmitAISearch()}
                                                    />
                                                    <div className="relative group">
                                                        {!searchQuery && (
                                                            <div className="absolute -top-0 -right-14 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                Please input text
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={handleSubmitAISearch}
                                                            disabled={isLoading || !isSubmitEnabled || !searchQuery}
                                                            className="absolute right-2 -top-[40.5px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
                                                        >
                                                            {isLoading ? (
                                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div> */}

                                            {/* Documents */}
                                            {/* {hasSearchedAISearch && ( */}
                                            <div className='-mt-2'>
                                                <div
                                                    className="flex items-center mb-2 mt-4 ml-4 cursor-pointer"
                                                    onClick={() => setIsSearchResultsOpen(!isSearchResultsOpen)}
                                                >
                                                    <span className="text-blue-700 text-sm">{isSearchResultsOpen ? '▼' : '▶'}</span>
                                                    <h3 className="font-medium ml-2  text-sm text-blue-400">Context Documents</h3>
                                                    <span className="ml-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                                        {searchResultsAI.length} docs
                                                    </span>
                                                    {isLoading && (
                                                        <span className="ml-2">
                                                            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>

                                                {isSearchResultsOpen && (
                                                    <div className="ml-4 mr-4">
                                                        {searchResultsAI.length === 0 ? (
                                                            // Show message when no documents found
                                                            <div className="p-4 bg-white/5 rounded-md text-center"
                                                                style={{
                                                                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                                                                }}>
                                                                <svg
                                                                    className="w-8 h-8 mx-auto text-gray-400 mb-2"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    style={{
                                                                        color: theme === 'light' ? '#9ca3af' : '#9ca3af'
                                                                    }}
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={1.5}
                                                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        style={{
                                                                            color: theme === 'light' ? '#6b7280' : '#9ca3af'
                                                                        }}
                                                                    />
                                                                </svg>

                                                                <p className="text-sm text-gray-400">No context documents found</p>
                                                            </div>
                                                        ) : (
                                                            // Show documents when available with Select All option
                                                            <div>
                                                                {/* Select All checkbox */}
                                                                <div className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer mb-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectAll}
                                                                        onChange={() => setSelectAll(!selectAll)}
                                                                        className="accent-blue-500 cursor-pointer"
                                                                        style={{
                                                                            color: theme === 'light' ? '#374151' : 'rgba(255, 255, 255, 0.9)'
                                                                        }}
                                                                    />
                                                                    <div className="text-xs font-medium">Select All</div>
                                                                </div>

                                                                {/* Documents list */}
                                                                <div className="max-h-[170px] overflow-y-auto grid grid-cols-1 gap-1.5">
                                                                    {searchResultsAI.map((doc) => (
                                                                        <div
                                                                            key={`search-result-${doc.id}-${doc.type}`}
                                                                            className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer"
                                                                            onClick={() => handleIndividualSelection(doc.id, doc.title)}
                                                                            style={{
                                                                                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.backgroundColor = theme === 'light'
                                                                                    ? 'rgba(0, 0, 0, 0.1)'
                                                                                    : 'rgba(255, 255, 255, 0.1)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.backgroundColor = theme === 'light'
                                                                                    ? 'rgba(0, 0, 0, 0.05)'
                                                                                    : 'rgba(255, 255, 255, 0.05)';
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedDocuments.includes(doc.id)}
                                                                                readOnly
                                                                                className="accent-blue-500 cursor-pointer"
                                                                                style={{
                                                                                    accentColor: theme === 'light' ? '#3b82f6' : '#3b82f6'
                                                                                }}
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="text-xs text-white/90"
                                                                                    style={{
                                                                                        color: theme === 'light' ? '#374151' : 'rgba(255, 255, 255, 0.9)'
                                                                                    }}>
                                                                                    {doc.title}
                                                                                </div>
                                                                                {doc.type && (
                                                                                    <div className="text-[10px] text-gray-400 mt-1"
                                                                                        style={{
                                                                                            color: theme === 'light' ? '#6b7280' : 'rgba(255, 255, 255, 0.4)'
                                                                                        }}>
                                                                                        Type: {doc.type.toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {/* )} */}
                                        </div>
                                    )}

                                    {/* STEP 2 - MANUAL SEARCH */}
                                    {searchMethod === 'manual' && (
                                        <div className="mt-4">
                                            {/* Top Row - Source and Search */}
                                            <div className="flex gap-4 mb-6 -mt-2">
                                                {/* Content Source Selector - Left */}
                                                <div className="w-1/3">
                                                    {/* <label className="block text-sm font-medium -mb-3 -mt-2">Content Source</label> */}
                                                    <div className="relative">
                                                        <select
                                                            value={contentSource}
                                                            onChange={(e) => {
                                                                setContentSource(e.target.value);
                                                                setSelectedFilters({
                                                                    "Video Type": [],
                                                                    "Classifications": [],
                                                                    "category": [],
                                                                    "content_categories": [],
                                                                    "market_categories": []
                                                                });
                                                            }}
                                                            className="w-full p-2 mt-2 rounded bg-white/10 border border-white/20 text-sm appearance-none pr-8"
                                                            style={{
                                                                border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                            }} // Added appearance-none and pr-8
                                                        >
                                                            <option value="select" disabled hidden>
                                                                Select Content source
                                                            </option>
                                                            <option value="voc">Voice of Customer (VoC)</option>
                                                            <option value="vob">Voice of Business (VoB)</option>
                                                            <option value="vom">Voice of Market (VoM)</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 mt-2">
                                                            <svg
                                                                className="fill-current h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* Search Input - Right */}
                                                <div className="w-2/3 mt-1">
                                                    <div className="relative pt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Search..."
                                                            value={searchQueryManual}

                                                            onChange={(e) => {
                                                                setSearchQueryManual(e.target.value);
                                                                if (searchQueryManual === '' && Object.values(selectedFilters).every(arr => arr.length === 0)) {
                                                                    setSearchResults([]);
                                                                    setHasSearchedManualSearch(false);
                                                                }

                                                            }}
                                                            style={{
                                                                backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                                color: theme === 'light' ? '#000000' : '#ffffff',
                                                                borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)',
                                                                outline: 'none'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = theme === 'light' ? '#3b82f6' : '#60a5fa';
                                                                e.target.style.boxShadow = theme === 'light'
                                                                    ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                                    : '0 0 0 3px rgba(96, 165, 250, 0.2)';
                                                            }}
                                                            className="w-full pt-3 pb-3 h-[40px] p-3 pr-[80px] rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            // style={{ backgroundColor: appColors.primaryColor }}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleManualSearchSubmit()}
                                                        // onKeyDown={ handleManualSearchSubmit()}
                                                        />
                                                        <div className="relative group">
                                                            {!searchQueryManual && Object.values(selectedFilters).every(arr => arr.length === 0) && (
                                                                <div className="absolute -top-0 -right-14 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                    Please input text or select filters
                                                                </div>
                                                            )}
                                                            {/* <button
                                                            onClick={handleManualSearchSubmit}
                                                            disabled={isLoading || (!searchQuery && Object.values(selectedFilters).every(arr => arr.length === 0))}
                                                            className="absolute right-2 -top-[36.5px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                className="w-4 h-4"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </button> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Row - Filters and Results */}
                                            <div className="flex gap-4">
                                                {/* Left Filters - 1/3 width */}
                                                <div className="w-1/3 space-y-3 border rounded-md p-2 h-[270px] overflow-y-auto no-scrollbar">
                                                    {/* Dynamic Filters based on contentSource */}
                                                    {contentSource === 'voc' ? (
                                                        <>
                                                            {/* Video Type Filter */}
                                                            <div className="border border-white/20 rounded-md overflow-hidden no-scrollbar"
                                                                style={{
                                                                    border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                }}>
                                                                <button
                                                                    className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                    onClick={() => setContentTypeOpen(!contentTypeOpen)}
                                                                    style={{
                                                                        border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                    }}
                                                                >
                                                                    <span>Filter By Content Type</span>
                                                                    <span>{contentTypeOpen ? '▼' : '▶'}</span>
                                                                </button>
                                                                {contentTypeOpen && (
                                                                    <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20 no-scrollbar">
                                                                        {filterOptions.voc["Video Type"].map((type) => (
                                                                            <label key={type.value} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedFilters["Video Type"].includes(type.value)}
                                                                                    onChange={() => handleFilterSelect("Video Type", type.value)}
                                                                                />
                                                                                <span className="flex-1">{type.label}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Classifications Filter */}
                                                            <div className="border border-white/20 rounded-md overflow-hidden"
                                                                style={{
                                                                    border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                }}>
                                                                <button
                                                                    className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                    onClick={() => setChallengesOpen(!challengesOpen)}
                                                                    style={{
                                                                        border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                    }}
                                                                >
                                                                    <span>Filter By Classifications</span>
                                                                    <span>{challengesOpen ? '▼' : '▶'}</span>
                                                                </button>
                                                                {challengesOpen && (
                                                                    <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20 no-scrollbar">
                                                                        {filterOptions.voc["Classifications"].map((classification) => (
                                                                            <label key={classification.value} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedFilters["Classifications"].includes(classification.value)}
                                                                                    onChange={() => handleFilterSelect("Classifications", classification.value)}
                                                                                />
                                                                                {classification.label}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : contentSource === 'vob' ? (
                                                        /* VoB Filters */
                                                        <div className="border border-white/20 rounded-md overflow-hidden"
                                                            style={{
                                                                border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                            }}>
                                                            <button
                                                                className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                onClick={() => setContentTypeOpen(!contentTypeOpen)}
                                                                style={{
                                                                    border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                }}
                                                            >
                                                                <span>Filter By Category</span>
                                                                <span>{contentTypeOpen ? '▼' : '▶'}</span>
                                                            </button>
                                                            {contentTypeOpen && (
                                                                <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20 no-scrollbar">
                                                                    {filterOptions.vob["category"].map((category, index) => (
                                                                        <label
                                                                            key={`category-${category.value}-${index}`}
                                                                            className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                checked={selectedFilters["category"].includes(category.value)}
                                                                                onChange={() => handleFilterSelect("category", category.value)}
                                                                            />
                                                                            <span className="flex-1">{category.label}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : contentSource === 'vom' ? (

                                                        <>
                                                            {/* Market Categories Filter */}
                                                            <div className="border border-white/20 rounded-md overflow-hidden"
                                                                style={{
                                                                    border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                }}>
                                                                <button
                                                                    className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                    onClick={() => setContentTypeOpen(!contentTypeOpen)}
                                                                    style={{
                                                                        border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                    }}>
                                                                    <span>Filter By Market Categories</span>
                                                                    <span>{contentTypeOpen ? '▼' : '▶'}</span>
                                                                </button>
                                                                {contentTypeOpen && (
                                                                    <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20 no-scrollbar">
                                                                        {filterOptions.vom["market_categories"].map((market_categories, index) => (
                                                                            <label
                                                                                key={`market_categories-${market_categories.value}-${index}`}
                                                                                className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer"
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedFilters["market_categories"].includes(market_categories.value)}
                                                                                    onChange={() => handleFilterSelect("market_categories", market_categories.value)}
                                                                                />
                                                                                <span className="flex-1">{market_categories.label}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Content Categories Filter */}
                                                            <div className="border rounded-md overflow-hidden"
                                                                style={{
                                                                    border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                }}
                                                            >
                                                                <button
                                                                    className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                    onClick={() => setContentTypeOpen(!contentTypeOpen)}
                                                                    style={{
                                                                        border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                    }}>
                                                                    <span>Filter By Content Categories</span>
                                                                    <span>{contentTypeOpen ? '▼' : '▶'}</span>
                                                                </button>
                                                                {contentTypeOpen && (
                                                                    <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20 no-scrollbar">
                                                                        {filterOptions.vom["content_categories"].map((content_categories, index) => (
                                                                            <label
                                                                                key={`content_categories-${content_categories.value}-${index}`}
                                                                                className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer"
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedFilters["content_categories"].includes(content_categories.value)}
                                                                                    onChange={() => handleFilterSelect("content_categories", content_categories.value)}
                                                                                />
                                                                                <span className="flex-1">{content_categories.label}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : <p className='text-sm text-gray-500'>Please Select Source Content</p>}
                                                </div>

                                                {/* Right Results - 2/3 width */}
                                                <div className="w-2/3 rounded-md border overflow-hidden h-[270px]">
                                                    <div className="border border-white/20 rounded-md h-full">
                                                        <div className="p-2 border-b border-white/20"
                                                            style={{
                                                                borderBottom: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                            }}>
                                                            <div className="text-blue-300 font-medium text-xs">
                                                                {contentSource === 'voc' ? 'Full Episodes' : 'Files'} ({searchResults.length} results)
                                                            </div>
                                                        </div>
                                                        <div className="h-[234px] overflow-y-auto">
                                                            {isLoading ? (
                                                                <div className="flex items-center justify-center -mt-2 h-full">
                                                                    <svg
                                                                        className="animate-spin h-8 w-8"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        style={{
                                                                            color: theme === 'light' ? '#3b82f6' : '#3b82f6'
                                                                        }}
                                                                    >
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                                    </svg>
                                                                </div>
                                                            ) : searchResults.length > 0 ? (
                                                                searchResults.map((doc) => (
                                                                    <div
                                                                        key={doc.id}
                                                                        className="flex items-center p-2 mx-2 my-1 border rounded-md cursor-pointer transition-colors"
                                                                        style={{
                                                                            backgroundColor: theme === 'light' ? '#f9fafb' : '#3b3b5b',
                                                                            borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = theme === 'light'
                                                                                ? 'rgba(0, 0, 0, 0.05)'
                                                                                : 'rgba(255, 255, 255, 0.1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = theme === 'light'
                                                                                ? '#f9fafb'
                                                                                : '#3b3b5b';
                                                                        }}
                                                                        onClick={() => handleDocumentClick(doc)}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2 h-3 w-3 rounded focus:ring-2"
                                                                            style={{
                                                                                borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)',
                                                                                accentColor: theme === 'light' ? '#3b82f6' : '#3b82f6'
                                                                            }}
                                                                            checked={selectedDocuments.includes(doc.id)}
                                                                            onChange={() => handleDocumentSelect(doc.id)}
                                                                        />
                                                                        <span
                                                                            className="text-xs"
                                                                            style={{
                                                                                color: theme === 'light' ? '#374151' : '#ffffff'
                                                                            }}
                                                                        >
                                                                            {doc.title}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div
                                                                    className="text-center text-xs p-4 h-full -mt-1 flex items-center justify-center"
                                                                    style={{
                                                                        color: theme === 'light' ? '#9ca3af' : '#9ca3af'
                                                                    }}
                                                                >
                                                                    {hasSearchedManualSearch ? 'No results found' : 'Perform a search or apply filters to see results'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="flex justify-end gap-4 mt-6">
                                {/* Previous Button with Tooltip */}
                                <div className="relative group">
                                    <button
                                        onClick={goToPreviousStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-white" />
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Add Library
                                    </div>
                                </div>
                                {/* <button
                                    className="px-4 py-1 bg-white/10 text-[13px] hover:bg-white/20 rounded-lg transition-colors"
                                    onClick={() => {
                                        clearSearchState();
                                        setShowContextModal(false);
                                    }}
                                >
                                    Cancel
                                </button> */}
                                <button
                                    className={`bg-blue-600 hover:bg-blue-700 text-[13px] text-white px-4 py-1 rounded-md 
                                ${selectedDocuments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={selectedDocuments.length === 0}
                                    onClick={() => {
                                        // clearSearchState();
                                        setShowContextModal(false);
                                    }}
                                >
                                    {selectedDocuments.length > 0
                                        ? `Use Template (${selectedDocuments.length})`
                                        : "Use Template"}
                                </button>
                                {/* Next Button with Tooltip */}
                                <div className="relative group">
                                    <button
                                        onClick={goToNextStep}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{
                                            backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = theme === 'light'
                                                ? 'rgba(0, 0, 0, 0.2)'
                                                : 'rgba(255, 255, 255, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = theme === 'light'
                                                ? 'rgba(0, 0, 0, 0.1)'
                                                : 'rgba(255, 255, 255, 0.1)';
                                        }}
                                    >
                                        <ArrowRight
                                            className="w-4 h-4"
                                            style={{
                                                color: theme === 'light' ? '#000000' : '#ffffff'
                                            }}
                                        />
                                    </button>
                                    {/* Tooltip */}
                                    <div
                                        className="absolute -top-9 -left-1/2 -translate-x-1/2 text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                        style={{
                                            backgroundColor: theme === 'light' ? '#374151' : '#000000',
                                            color: theme === 'light' ? '#ffffff' : '#ffffff'
                                        }}
                                    >
                                        Apply Add-Ons
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default ContextModal;