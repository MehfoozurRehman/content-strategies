import { useState, useEffect } from 'react';
import { ShowCustomToast } from './CustomToastify';
import { appColors } from '@/lib/theme';
import { createClient } from '@supabase/supabase-js';
import { createSearchContextandSource } from '@/lib/services/chatServices';
import { ArrowLeft, ArrowRight } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ITEMS_PER_PAGE = 1000000000;

const PromptLibraryModal = ({ showLibraryDropdown, setShowLibraryDropdown, onSourceSelect, onLibraryDocsSelect, selectedLibraryDocs, currentSteps, goToPreviousStep, goToNextStep, searchQueries, setSearchQueries, onClearSearchQuery, searchQuery, setSearchQuery, theme, colors, setIsSearchFromLibrary }) => {

    console.log("searchQueryyyyyyyyyyy", searchQueries);
    // State for data from Supabase
    const [departmentTypes, setDepartmentTypes] = useState([]);
    const [templateLibraries, setTemplateLibraries] = useState({});
    const [libraryDocuments, setLibraryDocuments] = useState([]);
    const [documentDescriptions, setDocumentDescriptions] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(false);

    // State for Library Modals
    const [departmentTypeOpen, setDepartmentTypeOpen] = useState(true);
    const [templateOpen, setTemplateOpen] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedLibraryDocuments, setSelectedLibraryDocuments] = useState([]);
    const [showInfo, setShowInfo] = useState(true);
    const [showDocumentDescription, setShowDocumentDescription] = useState(null);

    // New state for dynamic fields
    const [dynamicFields, setDynamicFields] = useState([]);
    const [dynamicFieldValues, setDynamicFieldValues] = useState({});
    const [dynamicDescription, setDynamicDescription] = useState('');
    const [processedDescription, setProcessedDescription] = useState('');
    // New state for multi-step flow
    const [currentStep, setCurrentStep] = useState(1);
    const [searchMethod, setSearchMethod] = useState('ai');
    // const [searchQuery, setSearchQuery] = useState('');
    const [searchQueryStep1, setSearchQueryStep1] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(true);
    const [hasSearchedAISearch, setHasSearchedAISearch] = useState(false);
    const [hasSearchedManualSearch, setHasSearchedManualSearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsAI, setSearchResultsAI] = useState([]);
    const [searchQueryManual, setSearchQueryManual] = useState('');
    const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(true);
    const [contentTypeOpen, setContentTypeOpen] = useState(true);
    const [challengesOpen, setChallengesOpen] = useState(true);
    const [selectedContentTypes, setSelectedContentTypes] = useState([]);
    const [selectedChallenges, setSelectedChallenges] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectedLibraryStep1Documents, setSelectedLibraryStep1Documents] = useState([]);
    const [contentSource, setContentSource] = useState('select');
    const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        "Video Type": [],
        "Classifications": [],
        "category": [],
        "content_categories": [],
        "market_categories": []
    });

    // Sample data for filters
    const contentTypes = [
        { id: 'type1', name: 'Articles', count: 12 },
        { id: 'type2', name: 'Case Studies', count: 5 },
        { id: 'type3', name: 'Whitepapers', count: 3 }
    ];

    const challenges = [
        { id: 'challenge1', name: 'Customer Support' },
        { id: 'challenge2', name: 'Sales Enablement' },
        { id: 'challenge3', name: 'Product Adoption' }
    ];
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

    // Check if search query exists when modal opens
    useEffect(() => {
        if (searchQueries.trim() !== '') {
            setShowReplaceConfirmation(true);
        } else {
            setShowReplaceConfirmation(false);
        }
    }, [showLibraryDropdown, searchQueries, setSearchQueries]);

    const handleReplace = () => {
        // Clear the search query using the callback from parent
        if (onClearSearchQuery) {
            onClearSearchQuery();
        }
        setShowReplaceConfirmation(false);
    };

    const handleCancelReplace = () => {
        setShowReplaceConfirmation(false);
    };

    // Fetch data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch departments
                const { data: departments, error: deptError } = await supabase
                    .from('department')
                    .select('id, dept_name')
                    .order('dept_name', { ascending: true });

                if (deptError) throw deptError;

                setDepartmentTypes(departments.map(dept => ({
                    id: dept.id,
                    name: dept.dept_name
                })));

                // Fetch templates and group by department
                const { data: templates, error: templateError } = await supabase
                    .from('prompt_library')
                    .select('id, prompt_title, department_id');

                if (templateError) throw templateError;

                const groupedTemplates = {};
                templates.forEach(template => {
                    const deptId = template.department_id;
                    if (!groupedTemplates[deptId]) {
                        groupedTemplates[deptId] = [];
                    }
                    groupedTemplates[deptId].push({
                        id: template.id,
                        name: template.prompt_title
                    });
                });
                setTemplateLibraries(groupedTemplates);

                // Fetch documents with descriptions and dynamic fields
                const { data: documents, error: docError } = await supabase
                    .from('library_modal_documents')
                    .select('id, doc_title, doc_details, template_id, dynamic_fields, dynamic_fields_description');

                if (docError) throw docError;

                setLibraryDocuments(documents.map(doc => ({
                    id: doc.id,
                    title: doc.doc_title,
                    template_id: doc.template_id,
                    dynamic_fields: doc.dynamic_fields,
                    dynamic_fields_description: doc.dynamic_fields_description
                })));

                // Create descriptions mapping
                const descMap = {};
                documents.forEach(doc => {
                    descMap[doc.id] = doc.doc_details;
                });
                setDocumentDescriptions(descMap);

            } catch (error) {
                console.log('Error fetching data:', error);
                ShowCustomToast('Failed to load library data', 'error', 2000);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (showLibraryDropdown) {
            fetchData();
        }
    }, [showLibraryDropdown]);

    // Fetch dynamic fields when document is selected
    useEffect(() => {
        if (selectedLibraryStep1Documents.length > 0) {
            const docId = selectedLibraryStep1Documents[0];
            const selectedDoc = libraryDocuments.find(doc => doc.id === docId);

            if (selectedDoc) {
                try {
                    // Parse the string array directly
                    const fieldStrings = selectedDoc.dynamic_fields
                        ? JSON.parse(selectedDoc.dynamic_fields)
                        : [];

                    // Convert to simple field objects
                    const fields = fieldStrings.map(fieldString => ({
                        name: fieldString.toLowerCase().replace(/[^\w]/g, '_'), // Convert to valid field name
                        label: fieldString // Use original string as label
                    }));

                    setDynamicFields(fields);

                    // Initialize empty values
                    const initialValues = {};
                    fields.forEach(field => {
                        initialValues[field.name] = '';
                    });
                    setDynamicFieldValues(initialValues);

                    setDynamicDescription(selectedDoc.dynamic_fields_description || '');
                } catch (error) {
                    console.log('Error parsing dynamic fields:', error);
                    setDynamicFields([]);
                    setDynamicFieldValues({});
                    setDynamicDescription('');
                }
            }
        }
    }, [selectedLibraryStep1Documents, libraryDocuments]);
    console.log("dynamicFields", dynamicFields);

    // In your useEffect that processes the description
    useEffect(() => {
        if (dynamicDescription && dynamicFieldValues) {
            let processed = dynamicDescription;

            // First remove all \n characters
            processed = processed.replace(/\\n/g, '');

            // Then replace placeholders
            Object.keys(dynamicFieldValues).forEach(key => {
                const placeholder = `{${key}}`;
                processed = processed.replace(new RegExp(placeholder, 'g'), dynamicFieldValues[key]);
            });

            setProcessedDescription(processed);
        }
    }, [dynamicDescription, dynamicFieldValues]);

    const handleDynamicFieldChange = (fieldName, value) => {
        setDynamicFieldValues(prev => {
            const updatedValues = {
                ...prev,
                [fieldName]: value
            };

            if (dynamicDescription) {
                let processed = dynamicDescription.replace(/\\n/g, '');
                Object.keys(updatedValues).forEach(key => {
                    const placeholder = `{${key}}`;
                    processed = processed.replace(new RegExp(placeholder, 'g'), updatedValues[key]);
                });
                setProcessedDescription(processed);
            }

            return updatedValues;
        });
    };

    // Filter documents based on selected template
    // const getFilteredDocuments = () => {
    //     if (!selectedTemplate) return [];
    //     return libraryDocuments.filter(doc => doc.template_id === selectedTemplate);
    // };
    const handleDocumentClick = (doc) => {
        if (!doc?.id) {
            console.log('Invalid document ID:', doc);
            return;
        }

        // Ensure we have both id and title
        const docId = doc.id;
        const docTitle = doc.title || 'Untitled Document';

        // Update local selected documents state
        setSelectedDocuments(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );

        // Notify parent component
        if (onSourceSelect) {
            onSourceSelect(docId, docTitle);
        }
    };
    const handleLibraryDocumentClick = (doc) => {
        if (!doc?.id) {
            console.log('Invalid document ID:', doc);
            return;
        }

        // Ensure we have both id and title
        const docId = doc.id;
        const docTitle = doc.title || 'Untitled Document';

        // Update local selected documents state - store only the clicked doc
        setSelectedLibraryStep1Documents([docId]);

        // Notify parent componentto send id and title for displaying title  above the input and idon backend
        if (onLibraryDocsSelect) {
            onLibraryDocsSelect(docId, docTitle);
        }
    };

    console.log("onLibrrr", selectedLibraryDocs);
    const handleDocumentSelect = (docId) => {
        setSelectedLibraryDocuments(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    // Handler functions
    const handleDepartmentSelect = (deptId) => {
        setSelectedDepartment(deptId);
        setSelectedTemplate(''); // Reset template when department changes
    };

    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
        setSelectedLibraryDocuments([]); // Reset selected documents when template changes
    };



    const handleNextStep = () => {
        if (currentStep === 1) {
            // Validate if a document is selected
            if (selectedLibraryStep1Documents.length === 0) {
                ShowCustomToast('Please select a document', 'error', 2000);
                return;
            }
        } else if (currentStep === 2) {
            // Validate all dynamic fields are filled
            const emptyFields = dynamicFields.filter(field => !dynamicFieldValues[field.name]);
            if (emptyFields.length > 0) {
                ShowCustomToast(`Please fill in all fields: ${emptyFields.map(f => f.label).join(', ')}`, 'error', 2000);
                return;
            }
        }

        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmitAISearch = async () => {
        if (!selectedLibraryStep1Documents || isLoading) return;

        try {
            setIsLoading(true);

            const payload = {
                user_id: localStorage.getItem('current_user_id'),
                query: selectedLibraryStep1Documents
            };

            const response = await createSearchContextandSource(payload);

            // Handle the response format
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

            // Fallback to sample results for demo purposes
            setSearchResultsAI([
                { id: 'ai1', title: 'Sample Result 1', type: 'voc' },
                { id: 'ai2', title: 'Sample Result 2', type: 'doc' }
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

                if (response?.error) throw response?.error;

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


    const handleContentTypeChange = (typeId) => {
        setSelectedContentTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        );
    };

    const handleChallengeChange = (challengeId) => {
        setSelectedChallenges(prev =>
            prev.includes(challengeId)
                ? prev.filter(id => id !== challengeId)
                : [...prev, challengeId]
        );
    };

    const getResultsTitle = () => {
        if (selectedContentTypes.length > 0 || selectedChallenges.length > 0) {
            return 'Filtered Documents';
        }
        return 'All Documents';
    };

    const toggleDocumentDescription = (docId) => {
        setShowDocumentDescription(showDocumentDescription === docId ? null : docId);
    };

    useEffect(() => {
        // Filter documents based on selected filters
        const filtered = libraryDocuments.filter(doc => {
            // In a real app, you would have more complex filtering logic
            return true;
        });
        // setFilteredDocuments(filtered);
    }, [selectedContentTypes, selectedChallenges, libraryDocuments]);

    const clearAllSelections = () => {
        // Reset department and template selections
        setSelectedDepartment('');
        setSelectedTemplate('');
        setSelectedLibraryDocuments([]);

        // Reset search and document selections
        setSearchQuery('');
        setSearchQueryManual('');
        setSelectedDocuments([]);
        setSelectedLibraryStep1Documents([]);
        setSearchResults([]);
        setSearchResultsAI([]);
        setHasSearchedAISearch(false);
        setHasSearchedManualSearch(false);

        // Reset filters
        setSelectedContentTypes([]);
        setSelectedChallenges([]);
        setDynamicFields([]);
        setDynamicFieldValues({});
        setDynamicDescription('');
        setProcessedDescription('');
        // Reset step
        setCurrentStep(1);

        // Close the modal
        setShowLibraryDropdown(false);
        setSelectedFilters({
            "Video Type": [],
            "Classifications": [],
            "category": [],
            "market_categories": [],
            "content_categories": []
        });
    };
    const steps = [1, 2, 3];

    const handleUseTemplate = () => {
        const doc = libraryDocuments.find(d => d.id === selectedLibraryStep1Documents[0]);

        if (!doc || !doc.dynamic_fields_description) {
            ShowCustomToast('Template content not found', 'error');
            return;
        }

        let processedContent = doc.dynamic_fields_description.replace(/\\n/g, '');

        dynamicFields.forEach(field => {
            const patterns = [
                `{${field.label}}`,
                `{${field.name}}`
            ];

            patterns.forEach(pattern => {
                processedContent = processedContent.replace(
                    new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    dynamicFieldValues[field.name] || ''
                );
            });
        });

        onLibraryDocsSelect(
            selectedLibraryStep1Documents[0],
            doc.title || 'Untitled Document',
            processedContent
            
        );

        // clearAllSelections();
        setShowLibraryDropdown(false);
        setIsSearchFromLibrary(true);
    };
    // Filter documents based on selected template and search query
    const getFilteredDocuments = () => {
        let filtered = libraryDocuments;

        // If no filters are applied, show all documents
        if (!selectedDepartment && !selectedTemplate && !searchQueryStep1.trim()) {
            return filtered;
        }

        // Filter by department and template if selected
        if (selectedTemplate) {
            filtered = filtered.filter(doc => doc.template_id === selectedTemplate);
        } else if (selectedDepartment) {
            // If only department is selected, show all templates from that department
            const departmentTemplates = templateLibraries[selectedDepartment] || [];
            const templateIds = departmentTemplates.map(t => t.id);
            filtered = filtered.filter(doc => templateIds.includes(doc.template_id));
        }

        // Filter by search query if provided
        if (searchQueryStep1.trim()) {
            const query = searchQueryStep1.toLowerCase().trim();
            filtered = filtered.filter(doc =>
                doc.title.toLowerCase().includes(query) ||
                (documentDescriptions[doc.id] && documentDescriptions[doc.id].toLowerCase().includes(query))
            );
        }

        return filtered;
    };
    console.log("showReplaceConfirmation", showReplaceConfirmation);
    return (
        <div className="relative ml-[5%] mb-4 w-[220px] no-scrollbar">
            {showLibraryDropdown && (
                <>
                    {/* Confirmation Modal */}
                    {/* {showReplaceConfirmation && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-[9999]">
                            <div className="border border-gray-300 rounded-lg p-6 w-96 shadow-xl" style={{ backgroundColor: appColors.primaryColor }}>
                                <h3 className="text-lg font-semibold mb-4 text-white">Replace Prompt?</h3>
                                <p className="text-sm mb-6 text-gray-400">
                                    Would you like to replace your current prompt with one from the library?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm text-gray-800 transition-colors"
                                        onClick={handleCancelReplace}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white transition-colors"
                                        onClick={handleReplace}
                                    >
                                        Replace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )} */}

                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50 no-scrollbar">
                        {/* Main Library Modal */}
                        <div className="border w-[800px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl text-white px-6 py-5 relative font-sans no-scrollbar" style={{ backgroundColor: colors.primaryColor, color: colors.text }}>
                            {/* Step Indicator */}
                            <div className="flex justify-center -mt-2 items-center text-white">
                                {steps.map((step, idx) => (
                                    <div key={step} className="flex flex-col items-center relative">
                                        {/* Step Circle + Connector */}
                                        <div className="flex items-center">
                                            {/* Left connector (except for first step) */}
                                            {idx !== 0 && (
                                                <div className="w-8 h-[2px] bg-blue-500"></div>
                                            )}

                                            {/* Circle */}
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold ${step < currentStep
                                                    ? 'bg-blue-500 border-white'
                                                    : step === currentStep
                                                        ? 'bg-blue-600 border-white'
                                                        : 'bg-blue-500 border-white opacity-50'
                                                    }`}
                                            >
                                                {step}
                                            </div>

                                            {/* Right connector (except for last step) */}
                                            {idx !== steps.length - 1 && (
                                                <div className="w-6 h-[2px] bg-blue-500"></div>
                                            )}
                                        </div>

                                        {/* Step label */}
                                        <div className="mt-1 text-xs text-[10px] font-medium" style={{ color: colors.text }}>
                                            Step {step}
                                        </div>

                                    </div>

                                ))}

                            </div>
                            <div className='flex justify-end'>
                                <button
                                    onClick={() => {
                                        setShowLibraryDropdown(false);
                                        setIsLoading(false);
                                        // setSearchQuery('');
                                        clearAllSelections();
                                    }}
                                    className=" -mt-14  hover:text-gray-300 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-600 my-0 mt-3 -mx-6"></div>

                            {/* Title */}
                            <h2 className="text-xl font-semibold text-center mb-0  -mx-6 py-2">
                                {currentStep === 1 ? 'Prompt Library' : currentStep === 2 ? 'Prompt Library' : 'Prompt Library'}
                            </h2>

                            <div className="border-t my-0 border-gray-600 -mx-6"></div>


                            {/* Selected Template Display */}
                            <div className="w-full px-4 mt-2 mb-2 -ml-4">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <label className="text-sm font-medium leading-relaxed p-2 py-1 rounded-md flex-shrink-0 min-w-[200px] max-w-full break-words">
                                        <span className="font-semibold text-[15px]">Selected Template: </span>
                                        <span className='text-[12px] break-words'>
                                            {selectedLibraryStep1Documents.length > 0
                                                ? libraryDocuments.find(d => d.id === selectedLibraryStep1Documents[0])?.title
                                                : selectedTemplate
                                                    ? templateLibraries[selectedDepartment]?.find(t => t.id === selectedTemplate)?.name
                                                    : 'All Templates'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Step 1 Content - Template Selection */}
                            {currentStep === 1 && (
                                <>

                                    <div className="flex justify-center">

                                        <div className="w-full">
                                            <div className="flex-1 min-w-[300px]">
                                                <input
                                                    type="text"
                                                    placeholder="Search documents..."
                                                    value={searchQueryStep1}
                                                    onChange={(e) => setSearchQueryStep1(e.target.value)}
                                                    className="w-full pt-2 pb-2 h-[38px] p-3 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                />
                                            </div>
                                            <div className="flex gap-4 mt-4">
                                                {/* Left Filters */}
                                                <div className="w-1/3 space-y-3 border rounded-md p-2">


                                                    {/* Department Filter */}
                                                    <div
                                                        className="rounded-md overflow-hidden"
                                                        style={{
                                                            border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                        }}
                                                    >
                                                        <button
                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                            onClick={() => setDepartmentTypeOpen(!departmentTypeOpen)}
                                                            style={{
                                                                border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                            }}>
                                                            <span>Department</span>
                                                            <span>{departmentTypeOpen ? '▼' : '◀'}</span>
                                                        </button>
                                                        {departmentTypeOpen && (
                                                            <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20">
                                                                {isLoadingData ? (
                                                                    <div className="flex justify-center items-center h-20">
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2"></div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <label className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                name="department"
                                                                                className="mr-2 h-3 w-3 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                checked={!selectedDepartment}
                                                                                onChange={() => {
                                                                                    setSelectedDepartment('');
                                                                                    setSelectedTemplate('');
                                                                                }}
                                                                            />
                                                                            All Departments
                                                                        </label>
                                                                        {departmentTypes.map((dept) => (
                                                                            <label key={dept.id} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    name="department"
                                                                                    className="mr-2 h-3 w-3 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedDepartment === dept.id}
                                                                                    onChange={() => handleDepartmentSelect(dept.id)}
                                                                                />
                                                                                {dept.name}
                                                                            </label>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Template Filter */}
                                                    <div
                                                        className="rounded-md overflow-hidden"
                                                        style={{
                                                            border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                        }}
                                                    >
                                                        <button
                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                            onClick={() => setTemplateOpen(!templateOpen)}
                                                            style={{
                                                                border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                            }}>
                                                            <span>Templates</span>
                                                            <span>{templateOpen ? '▼' : '◀'}</span>
                                                        </button>
                                                        {templateOpen && (
                                                            <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20">
                                                                {isLoadingData ? (
                                                                    <div className="flex justify-center items-center h-20">
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2"></div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <label className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                name="template"
                                                                                className="mr-2 h-3 w-3 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                checked={!selectedTemplate}
                                                                                onChange={() => setSelectedTemplate('')}
                                                                            />
                                                                            All Templates
                                                                        </label>
                                                                        {/* Show templates based on selected department or all templates if no department selected */}
                                                                        {(selectedDepartment ? templateLibraries[selectedDepartment] || [] :
                                                                            // If no department selected, show all templates from all departments
                                                                            Object.values(templateLibraries).flat()
                                                                        ).map((template) => (
                                                                            <label key={template.id} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    name="template"
                                                                                    className="mr-2 h-3 w-3 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedTemplate === template.id}
                                                                                    onChange={() => handleTemplateSelect(template.id)}
                                                                                />
                                                                                {template.name}
                                                                            </label>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Results */}
                                                <div className="w-2/3 rounded-md border border overflow-hidden p-2">
                                                    {/* Search Input for Documents */}


                                                    <div className="border border-white/20 rounded-md">
                                                        <div className="p-2 border-b border-white/20" style={{
                                                            borderBottom: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                        }}>
                                                            <div className="text-blue-300 font-medium text-xs">
                                                                Prompts ({getFilteredDocuments().length})
                                                            </div>
                                                        </div>
                                                        <div className="h-[270px] max-h-[calc(80vh-100px)] overflow-y-auto">
                                                            {isLoadingData ? (
                                                                <div className="flex justify-center items-center h-full">
                                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 "></div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {getFilteredDocuments().length > 0 ? (
                                                                        getFilteredDocuments().map((doc) => (
                                                                            <div key={doc.id} className="relative">
                                                                                <div className="flex items-center  p-2 mx-2 my-1 bg-[#3b3b5b] border hover:bg-white/10 border-white/20 rounded-md cursor-pointer"
                                                                                    style={{
                                                                                        backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                                                        color: theme === 'light' ? '#000000' : '#ffffff',
                                                                                        borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)',
                                                                                        outline: 'none'
                                                                                    }}
                                                                                    onClick={() => handleLibraryDocumentClick(doc)}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                        checked={selectedLibraryStep1Documents.includes(doc.id)}

                                                                                        onChange={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleLibraryDocumentClick(doc);
                                                                                        }}
                                                                                    />
                                                                                    <div className="flex items-center justify-between flex-1 min-w-0">
                                                                                        <span className="text-xs truncate">{doc.title}</span>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                toggleDocumentDescription(doc.id);
                                                                                            }}
                                                                                            className="ml-2 text-xs text-white/50 hover:text-white"
                                                                                        >
                                                                                            {/* {showDocumentDescription === doc.id ? '▼' : '◀'} */}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                {showDocumentDescription === doc.id && documentDescriptions[doc.id] && (
                                                                                    <div className="absolute z-10 top-full left-2 right-2 mt-1 p-2 bg-[#3b3b5b] border border-white/20 rounded-md shadow-lg">
                                                                                        <p className="text-xs text-white/80 break-words">{documentDescriptions[doc.id]}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-center text-gray-400 text-xs p-4">No documents found</div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2 Content - Selected Template Review */}

                            {currentStep === 2 && (
                                <div className="p-4">
                                    <div
                                        className="p-6 rounded-lg border"
                                        style={{
                                            borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        {dynamicFields.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {dynamicFields.map((field, index) => {
                                                    const isDateField =
                                                        field.label.toLowerCase().includes("date") ||
                                                        field.name.toLowerCase().includes("date");

                                                    return (
                                                        <div key={`field_${index}`}>
                                                            <label
                                                                className="block text-sm mb-1"
                                                                style={{
                                                                    color: theme === 'light' ? '#374151' : '#d1d5db'
                                                                }}
                                                            >
                                                                {field.label}
                                                            </label>

                                                            {isDateField ? (
                                                                <input
                                                                    type="date"
                                                                    value={dynamicFieldValues[field.name] || ""}
                                                                    onChange={(e) =>
                                                                        handleDynamicFieldChange(field.name, e.target.value)
                                                                    }
                                                                    className="w-full border rounded-md p-2 text-sm cursor-pointer"
                                                                    style={{
                                                                        backgroundColor: theme === 'light' ? '#ffffff' : '#2b2b4b',
                                                                        borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)',
                                                                        color: theme === 'light' ? '#000000' : '#ffffff'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={dynamicFieldValues[field.name] || ""}
                                                                    onChange={(e) =>
                                                                        handleDynamicFieldChange(field.name, e.target.value)
                                                                    }
                                                                    className="w-full border rounded-md p-2 text-sm"
                                                                    style={{
                                                                        backgroundColor: theme === 'light' ? '#ffffff' : '#2b2b4b',
                                                                        borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)',
                                                                        color: theme === 'light' ? '#000000' : '#ffffff'
                                                                    }}
                                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div
                                                className="text-center py-4"
                                                style={{
                                                    color: theme === 'light' ? '#9ca3af' : '#9ca3af'
                                                }}
                                            >
                                                No fields to display for this template
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3 Content - Source Document */}
                            {currentStep === 3 && (
                                <>
                                    {/* Source Document and Toggle */}
                                    <div className="mr-4 ml-4">
                                        <div className="relative mb-4 min-h-[10px]">
                                            {/* Toggle Button - Top Right */}
                                            <div className="absolute top-[10px] right-0 flex items-center space-x-2 z-10">
                                                <span className="text-xs text-gray-400">{showInfo ? "Hide" : "Show"}</span>
                                                <button
                                                    onClick={() => setShowInfo(!showInfo)}
                                                    className="focus:outline-none"
                                                    aria-label={showInfo ? "Hide options" : "Show options"}
                                                >
                                                    <div
                                                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${showInfo ? 'bg-blue-600' : 'bg-gray-500'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showInfo ? 'translate-x-4' : 'translate-x-0'
                                                                }`}
                                                        ></div>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Content */}
                                            {showInfo && (
                                                <div className="pt-2 -mt-2">
                                                    <label className="text-sm font-medium leading-relaxed relative">
                                                        <span className="font-semibold">Source Document:</span>{" "}
                                                        <span className="text-[12px]">
                                                            Please select a search method for desired document:
                                                        </span>
                                                        <span className="text-blue-400 text-[12px] cursor-pointer ml-2 relative group">
                                                            Learn more about Search Type
                                                            {/* Tooltip */}
                                                            <div className="absolute left-1/3 top-8 transform -translate-x-1/4 w-[290px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <div className="bg-[#3b3b5b] text-white text-[11px] p-3 rounded-lg shadow-lg">
                                                                    <p className="mb-1 mt-0">
                                                                        <strong>AI Search:</strong> Output will come from Agents
                                                                    </p>
                                                                    <p>
                                                                        <strong>Manual Search:</strong> Output will come from database
                                                                    </p>
                                                                </div>
                                                                <div className="absolute -top-[5px] left-6 w-5 h-5 transform rotate-45 bg-[#3b3b5b] z-0" />
                                                            </div>
                                                        </span>
                                                    </label>

                                                    <div className="mt-3 flex items-center gap-6">
                                                        <label className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={searchMethod === 'ai'}
                                                                onChange={() => setSearchMethod('ai')}
                                                            />
                                                            AI Search
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={searchMethod === 'manual'}
                                                                onChange={() => setSearchMethod('manual')}
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
                                                    {/* <h3 className="text-lg text-center font-semibold mb-2">Search and select a Resource</h3> */}

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
                                                    {hasSearchedAISearch && (
                                                        <div>
                                                            <div
                                                                className="flex items-center mb-2 mt-4 ml-4 cursor-pointer"
                                                                onClick={() => setIsSearchResultsOpen(!isSearchResultsOpen)}
                                                            >
                                                                <span className="text-blue-700 text-sm">{isSearchResultsOpen ? '▼' : '▶'}</span>
                                                                <h3 className="font-medium ml-2 text-sm text-blue-400">Source Documents</h3>
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
                                                                        <div
                                                                            className="p-4 rounded-md text-center"
                                                                            style={{
                                                                                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                                                                            }}
                                                                        >
                                                                            <svg
                                                                                className="w-8 h-8 mx-auto mb-2"
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
                                                                                />
                                                                            </svg>
                                                                            <p
                                                                                className="text-sm"
                                                                                style={{
                                                                                    color: theme === 'light' ? '#6b7280' : '#9ca3af'
                                                                                }}
                                                                            >
                                                                                No source documents found
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        // Show documents when available
                                                                        <div className="max-h-[170px] overflow-y-auto grid grid-cols-1 gap-1.5">
                                                                            {searchResultsAI.map((doc) => (
                                                                                <div
                                                                                    key={`search-result-${doc.id}-${doc.type}`}
                                                                                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors"
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
                                                                                    onClick={() => handleDocumentClick(doc)}
                                                                                >
                                                                                    {/* Checkbox */}
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={selectedDocuments.includes(doc.id)}
                                                                                        readOnly
                                                                                        className="cursor-pointer"
                                                                                        style={{
                                                                                            accentColor: theme === 'light' ? '#3b82f6' : '#3b82f6'
                                                                                        }}
                                                                                    />

                                                                                    <div className="flex-1">
                                                                                        <div
                                                                                            className="text-xs"
                                                                                            style={{
                                                                                                color: theme === 'light' ? '#374151' : 'rgba(255, 255, 255, 0.9)'
                                                                                            }}
                                                                                        >
                                                                                            {doc.title}
                                                                                        </div>
                                                                                        {doc.type && (
                                                                                            <div
                                                                                                className="text-[10px] mt-1"
                                                                                                style={{
                                                                                                    color: theme === 'light' ? '#6b7280' : 'rgba(255, 255, 255, 0.4)'
                                                                                                }}
                                                                                            >
                                                                                                Type: {doc.type.toUpperCase()}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
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
                                                                    }}// Added appearance-none and pr-8
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
                                                                        if (e.target.value === '' && Object.values(selectedFilters).every(arr => arr.length === 0)) {
                                                                            setSearchResults([]);
                                                                            setHasSearchedManualSearch(false);
                                                                        }
                                                                    }}
                                                                    className="w-full pt-3 pb-3 h-[40px] p-3 pr-[80px] rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearchSubmit()}
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
                                                    <div className="flex gap-4 -mt-2">
                                                        {/* Left Filters - 1/3 width */}
                                                        <div className="w-1/3 space-y-3 border rounded-md p-2 h-[270px] overflow-y-auto no-scrollbar">
                                                            {/* Dynamic Filters based on contentSource */}
                                                            {contentSource === 'voc' ? (
                                                                <>
                                                                    {/* Video Type Filter */}
                                                                    <div className="border rounded-md overflow-hidden no-scrollbar"
                                                                        style={{
                                                                            border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                        }}>
                                                                        <button
                                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                            onClick={() => setContentTypeOpen(!contentTypeOpen)}
                                                                            style={{
                                                                                border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                            }}>
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
                                                                    <div className="border rounded-md overflow-hidden"
                                                                        style={{
                                                                            border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                        }}>
                                                                        <button
                                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                                            onClick={() => setChallengesOpen(!challengesOpen)}
                                                                            style={{
                                                                                border: `1px solid ${theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)'}`
                                                                            }}>
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
                                                                        }}>
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
                                                                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                                            </svg>
                                                                        </div>
                                                                    ) : searchResults.length > 0 ? (
                                                                        searchResults.map((doc) => (
                                                                            <div
                                                                                key={doc.id}
                                                                                className="flex items-center p-2 mx-2 my-1 bg-[#3b3b5b] border hover:bg-white/10 border-white/20 rounded-md cursor-pointer"
                                                                                onClick={() => handleDocumentClick(doc)}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                    checked={selectedDocuments.includes(doc.id)}
                                                                                    onChange={() => handleDocumentSelect(doc.id)}
                                                                                />
                                                                                <span className="text-xs">{doc.title}</span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-center text-gray-400 text-xs p-4 h-full -mt-1 flex items-center justify-center">
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
                                </>
                            )}

                    

                            {/* Footer */}
                            <div className="flex justify-end gap-4 mt-6">
                                {/* <button
                                    className="px-4 py-1 bg-white/10 text-[13px] hover:bg-white/20 rounded-lg transition-colors"
                                    onClick={() => setShowLibraryDropdown(false)}
                                >
                                    Cancel
                                </button> */}

                                {currentStep > 1 && (
                                    <button
                                        className="px-4 py-1 bg-gray-500 text-[13px] hover:bg-gray-600 rounded-lg transition-colors"
                                        onClick={handlePreviousStep}
                                    >
                                        Previous
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-[13px] text-white px-4 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                            handleNextStep();
                                            handleSubmitAISearch();
                                        }}

                                    >
                                        Next
                                    </button>

                                ) : (
                                    <button
                                        className={`bg-blue-600 hover:bg-blue-700 text-[13px] text-white px-4 py-1 rounded-md 
                                    `}
                                        // disabled={selectedDocuments.length === 0}
                                        onClick={handleUseTemplate}
                                    >
                                        {selectedDocuments.length > 0
                                            ? `Use Template (${selectedDocuments.length})`
                                            : "Use Template"}
                                    </button>
                                )}
                                {/* Next Button with Tooltip */}
                                <div className="relative group">
                                    <button
                                        onClick={goToNextStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
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
                                        <ArrowRight className="w-4 h-4 text-white"
                                            style={{
                                                color: theme === 'light' ? '#000000' : '#ffffff'
                                            }}
                                        />
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                        style={{
                                            backgroundColor: theme === 'light' ? '#374151' : '#000000',
                                            color: theme === 'light' ? '#ffffff' : '#ffffff'
                                        }}>
                                        Add Context
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

export default PromptLibraryModal;