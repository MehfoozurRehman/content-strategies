"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaClock, FaLink, FaPlus, FaTimes, FaUpload, FaFolder, FaFileAlt } from "react-icons/fa";
import CustomCrudForm from "../customComponents/CustomCrud";
import Alert from "../customComponents/Alert";
import SearchByDateModal from "../customComponents/SearchByDateModal";
import CustomInput from "../customComponents/CustomInput";
import { debounce, extractFieldsFromTemplate } from "@/lib/utils";
import DynamicBranding from "../customComponents/DynamicLabelAndLogo";


// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 20;

const ManageLibrary = () => {
    // State for active tab
    const [activeTab, setActiveTab] = useState('departments');

    // Common states
    const [searchText, setSearchText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isEndUser, setIsEndUser] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);

    // Department states
    const [departments, setDepartments] = useState([]);
    const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
    const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
    const [currentEditingDepartment, setCurrentEditingDepartment] = useState(null);

    // Template states
    const [templates, setTemplates] = useState([]);
    const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [currentEditingTemplate, setCurrentEditingTemplate] = useState(null);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    // Document states
    const [documents, setDocuments] = useState([]);
    const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
    const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
    const [currentEditingDocument, setCurrentEditingDocument] = useState(null);
    const [templateOptions, setTemplateOptions] = useState([]);

    const totalPages = useMemo(() => Math.ceil(totalRecords / ITEMS_PER_PAGE), [totalRecords]);

    // Column configurations for each tab
    const columnsConfig = {
        departments: [
            { label: "Department Name", id: "dept_name" },
            { label: "Description", id: "dept_desc" },
            { label: "Actions", id: "action" },
        ],
        templates: [
            { label: "Template Name", id: "prompt_title" },
            { label: "Department Name", id: "dept_name" },
            { label: "Description", id: "prompt_description" },
            { label: "Actions", id: "action" },
        ],
        documents: [
            { label: "Prompt Title", id: "doc_title" },
            { label: "Prompt Name", id: "prompt_title" },
            { label: "Description", id: "doc_details" },
            { label: "Propmpt Template", id: "dynamic_fields_description" },
            { label: "Actions", id: "action" },
        ]
    };

    // CRUD form configurations for each tab
    const crudConfig = {
        departments: [
            { label: "Department Name", key: "dept_name", placeholder: "Enter department name", type: "text", required: true },
            { label: "Description", key: "dept_desc", placeholder: "Enter department description", type: "textarea", required: false },
        ],
        templates: [
            { label: "Template Name", key: "prompt_title", placeholder: "Enter template name", type: "text", required: true },
            {
                label: "Department Name",
                key: "department_id",
                placeholder: "Select department",
                type: "select",
                options: departmentOptions,
                required: true
            },
            { label: "Description", key: "prompt_description", placeholder: "Enter template description", type: "textarea", required: false },

        ],
        documents: [
            { label: "Prompt Title", key: "doc_title", placeholder: "Enter prompt title", type: "text", required: true },
            {
                label: "Template Name",
                key: "template_id",
                placeholder: "Select template",
                type: "select",
                options: templateOptions,
                required: true
            },
            { label: "Prompt Details", key: "doc_details", placeholder: "Enter prompt details", type: "json", required: true },
            {
                label: "Prompt Template",
                key: "dynamic_fields_description",
                placeholder: "Enter your template with {placeholders}",
                type: "textarea",
                rows: 10,
                onChange: (e, formData, setFormData) => {
                    // Extract fields when template changes
                    const fields = extractFieldsFromTemplate(e.target.value);
                    setFormData({
                        ...formData,
                        dynamic_fields_description: e.target.value,
                        dynamic_fields: fields
                    });
                }
            },
            {
                label: "Dynamic Fields (auto-generated)",
                key: "dynamic_fields",
                type: "readonly",
                value: (formData) => {
                    // First ensure dynamic_fields exists and is an array
                    const fields = formData.dynamic_fields;

                    if (!fields) return ""; // Return empty string if undefined/null

                    // Convert to array if it's a string (like from JSON)
                    const fieldsArray = Array.isArray(fields) ? fields :
                        typeof fields === 'string' ? JSON.parse(fields) :
                            [];

                    // Now safely join the array
                    return fieldsArray.join(", ");
                }
            }
        ]
    };

    useEffect(() => {
        const storedRole = localStorage.getItem("system_roles");
        const companyId = localStorage.getItem("company_id");
        setIsEndUser(storedRole === "end-user");
        setCurrentCompanyId(companyId ? parseInt(companyId) : null);
        fetchInitialData();
    }, []);

    // Fetch department options for template select
    const fetchDepartmentOptions = async () => {
        const { data, error } = await supabase
            .from('department')
            .select('id, dept_name')
            .order('dept_name', { ascending: true });

        if (error) {
            console.log('Error fetching departments:', error);
            return [];
        }

        return data.map(dept => ({
            value: dept.id,
            label: dept.dept_name
        }));
    };

    // Fetch template options for document select
    const fetchTemplateOptions = async () => {
        const { data, error } = await supabase
            .from('template')
            .select('id, prompt_title, department (id, dept_name)')
            .order('prompt_title', { ascending: true });

        if (error) {
            console.log('Error fetching templates:', error);
            return [];
        }

        return data.map(temp => ({
            value: temp.id,
            label: `${temp.prompt_title} (${temp.department.dept_name})`
        }));
    };

    const fetchInitialData = async () => {
        const deptOptions = await fetchDepartmentOptions();
        setDepartmentOptions(deptOptions);

        const tempOptions = await fetchTemplateOptions();
        setTemplateOptions(tempOptions);
    };
    console.log("deppppppppp", departmentOptions);
    console.log("temppppppp", templateOptions);
    // Fetch data based on active tab
    const fetchData = useCallback(async (page = 1, isLoadMore = false) => {
        if (!currentCompanyId) return;

        const loadingState = isLoadMore ? setLoadingMore : setLoading;
        loadingState(true);

        try {
            const rpcFunctions = {
                departments: 'combined_search_department',
                templates: 'combined_search_template',
                documents: 'combined_search_library_documents'
            };

            const rpcFunction = rpcFunctions[activeTab];
            if (!rpcFunction) return;

            const { data, error } = await supabase
                .rpc(rpcFunction, {
                    search_term: searchText || '',
                    current_company_id: currentCompanyId,
                    page_num: page,
                    page_size: ITEMS_PER_PAGE,
                });

            if (error) throw error;

            if (!data || data.length === 0) {
                if (!isLoadMore) {
                    const setters = {
                        departments: setDepartments,
                        templates: setTemplates,
                        documents: setDocuments
                    };
                    setters[activeTab]([]);
                    setTotalRecords(0);
                }
                return;
            }

            // Get total count from the first record (all records have the same total_count)
            const totalCount = data[0]?.total_count || 0;

            const stateUpdaters = {
                departments: setDepartments,
                templates: setTemplates,
                documents: setDocuments
            };

            if (isLoadMore) {
                stateUpdaters[activeTab](prev => [...prev, ...data]);
            } else {
                stateUpdaters[activeTab](data);
            }

            setTotalRecords(totalCount);
            setCurrentPage(page);

        } catch (err) {
            console.log("Fetch error:", {
                message: err.message,
                details: err.details,
            });
            // Alert.show('Error', `Failed to fetch data: ${err.message}`);
        } finally {
            loadingState(false);
            if (!isLoadMore) setIsSearchActive(false);
        }
    }, [activeTab, currentCompanyId, searchText]);
    useEffect(() => {

        setCurrentPage(1);
        fetchData(1, false);
    }, [searchText, activeTab, currentCompanyId]);

    const loadMoreData = useCallback(async () => {
        if (loadingMore) return;

        const hasMoreRecords = {
            departments: departments.length < totalRecords,
            templates: templates.length < totalRecords,
            documents: documents.length < totalRecords
        };

        if (hasMoreRecords[activeTab]) {
            await fetchData(currentPage + 1, true);
        }
    }, [activeTab, currentPage, departments, templates, documents, totalRecords, loadingMore, fetchData]);

    const handleAddSubmit = async () => {
        if (activeTab === 'departments') {
            setShowAddDepartmentModal(false);
        } else if (activeTab === 'templates') {
            setShowAddTemplateModal(false);
        } else if (activeTab === 'documents') {
            setShowAddDocumentModal(false);
        }
        fetchData(currentPage, false);

        // Refresh options if needed
        if (activeTab === 'templates' || activeTab === 'documents') {
            fetchInitialData();
        }
    };

    const handleEditSubmit = async () => {
        if (activeTab === 'departments') {
            setShowEditDepartmentModal(false);
        } else if (activeTab === 'templates') {
            setShowEditTemplateModal(false);
        } else if (activeTab === 'documents') {
            setShowEditDocumentModal(false);
        }
        fetchData(currentPage, false);

        // Refresh options if needed
        if (activeTab === 'templates' || activeTab === 'documents') {
            fetchInitialData();
        }
    };

    const handleEditClick = (item) => {
        if (activeTab === 'departments') {
            setCurrentEditingDepartment(item);
            setShowEditDepartmentModal(true);
        } else if (activeTab === 'templates') {
            setCurrentEditingTemplate(item);
            setShowEditTemplateModal(true);
        } else if (activeTab === 'documents') {
            if (item.dynamic_fields_description && !item.dynamic_fields) {
                item.dynamic_fields = extractFieldsFromTemplate(item.dynamic_fields_description);
            }
            setCurrentEditingDocument(item);
            setShowEditDocumentModal(true);
        }
    };

    const handleDeleteClick = async (id) => {
        Alert.show('Delete Confirmation', 'Are you sure you want to delete this item?', [
            {
                text: 'Yes',
                primary: true,
                onPress: async () => {
                    try {
                        let tableName, rpcName;

                        switch (activeTab) {
                            case 'departments':
                                tableName = 'department';
                                rpcName = 'combined_search_department';
                                break;
                            case 'templates':
                                tableName = 'template';
                                rpcName = 'combined_search_template';
                                break;
                            case 'documents':
                                tableName = 'library_modal_documents';
                                rpcName = 'combined_search_library_documents';
                                break;
                            default:
                                throw new Error('Invalid tab selected');
                        }

                        const { error: deleteError } = await supabase
                            .from(tableName)
                            .delete()
                            .eq('id', id);

                        if (deleteError) {
                            throw new Error(deleteError.message);
                        }

                        // Refetch total count using RPC
                        const { data: countData, error: countError } = await supabase
                            .rpc(rpcName, {
                                search_term: '',
                                current_company_id: currentCompanyId,
                                page_num: 1,
                                page_size: 1
                            });

                        if (countError) throw countError;

                        const updatedTotalCount = countData?.[0]?.total_count || 0;
                        setTotalRecords(updatedTotalCount);

                        // Adjust current page if needed
                        if ((currentPage - 1) * ITEMS_PER_PAGE >= updatedTotalCount) {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }

                        // Refresh data
                        fetchData(currentPage, false);

                        Alert.show('Success', 'Record deleted successfully.', [
                            { text: 'OK', primary: true }
                        ]);

                        // Refresh dropdowns or related data
                        if (activeTab === 'departments' || activeTab === 'templates') {
                            fetchInitialData();
                        }

                    } catch (err) {
                        Alert.show('Error', `Failed to delete the item: ${err.message}`);
                    }
                },
            },
            {
                text: 'No',
                primary: false,
            },
        ]);
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
        setCurrentPage(1);
        setLoadingMore(false);
    };

    const getCurrentData = () => {
        switch (activeTab) {
            case 'departments':
                return departments;
            case 'templates':
                return templates;
            case 'documents':
                return documents;
            default:
                return [];
        }
    };

    const getAddButtonText = () => {
        switch (activeTab) {
            case 'departments':
                return "Add Department";
            case 'templates':
                return "Add Template";
            case 'documents':
                return "Add Prompt";
            default:
                return "Add";
        }
    };

    const getAddButtonIcon = () => {
        switch (activeTab) {
            case 'departments':
                return <FaFolder className="w-3 h-3" />;
            case 'templates':
                return <FaFileAlt className="w-3 h-3" />;
            case 'documents':
                return <FaUpload className="w-3 h-3" />;
            default:
                return <FaPlus className="w-3 h-3" />;
        }
    };

    return (
        <div className="overflow-x-hidden py-0 p-4 relative">
            {/* Search & divs Section */}
            <div className="py-3 px-6 mt-[-10px] flex justify-between items-center">
                {/* Search Bar */}
                <div className="p-0 w-full">
                    {/* Search Bar Section */}
                    <div className="mx-auto -mt-2">
                        <DynamicBranding showLogo={false} showTitle={true} title="Library Management System" />

                        {/* Tabs */}
                        <div className="flex border-b border-gray-700 mb-4">
                            {['departments', 'templates', 'documents'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'documents' ? 'Prompts' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>


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
                                        placeholder={`Search ${activeTab === 'documents' ? 'Prompts' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}...`}
                                    />
                                </div>


                                {/* Clear Search Button - only visible when there's something to clear */}
                                {(searchText) && (
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
                                {[getAddButtonText()].map((text, i) => {
                                    const getIcon = (label) => {
                                        if (label === getAddButtonText()) return getAddButtonIcon();
                                        return null;
                                    };
                                    const isAddButton = text === getAddButtonText();


                                    // Skip rendering the add button if user is an end-user
                                    if (isAddButton && isEndUser) {
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            className={`px-4 py-2 text-sm ${isAddButton ? "bg-[#3a86ff] hover:bg-[#2f6fcb]" : "bg-white/10 hover:bg-white/20"} 
                                            transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer`}
                                            onClick={() => {
                                                if (isAddButton) {
                                                    if (activeTab === 'departments') setShowAddDepartmentModal(true);
                                                    else if (activeTab === 'templates') setShowAddTemplateModal(true);
                                                    else if (activeTab === 'documents') setShowAddDocumentModal(true);
                                                }
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
            {(searchText) && (
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
                            key={activeTab}
                            columns={columnsConfig[activeTab]}
                            data={getCurrentData()}
                            loading={loading}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            showActions={!isEndUser} // Hide actions for end users
                            hasMoreRecords={
                                (activeTab === 'departments' && departments.length < totalRecords) ||
                                (activeTab === 'templates' && templates.length < totalRecords) ||
                                (activeTab === 'documents' && documents.length < totalRecords)
                            }
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

            {/* Add/Edit Modals */}
            {/* Department Modal */}
            {showAddDepartmentModal && (
                <CustomCrudForm
                    isEditMode={false}
                    entityData={{ company_id: currentCompanyId }}
                    onClose={() => setShowAddDepartmentModal(false)}
                    onSubmit={handleAddSubmit}
                    displayFields={crudConfig.departments}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setDepartments}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchData}
                    tableName="department"
                    createRecord="Add Department"
                    updateRecord="Edit Department"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                />
            )}

            {showEditDepartmentModal && (
                <CustomCrudForm
                    isEditMode={true}
                    entityData={currentEditingDepartment}
                    onClose={() => setShowEditDepartmentModal(false)}
                    onSubmit={handleEditSubmit}
                    displayFields={crudConfig.departments}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setDepartments}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchData}
                    tableName="department"
                    createRecord="Add Department"
                    updateRecord="Edit Department"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                />
            )}

            {/* Template Modal */}
            {showAddTemplateModal && (
                <CustomCrudForm
                    isEditMode={false}
                    entityData={{ company_id: currentCompanyId }}
                    onClose={() => setShowAddTemplateModal(false)}
                    onSubmit={handleAddSubmit}
                    displayFields={crudConfig.templates}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setTemplates}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchData}
                    tableName="prompt_library"
                    createRecord="Add Template"
                    updateRecord="Edit Template"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                />
            )}

            {showEditTemplateModal && (
                <CustomCrudForm
                    isEditMode={true}
                    entityData={currentEditingTemplate}
                    onClose={() => setShowEditTemplateModal(false)}
                    onSubmit={handleEditSubmit}
                    displayFields={crudConfig.templates}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setTemplates}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchData}
                    tableName="prompt_library"
                    createRecord="Add Template"
                    updateRecord="Edit Template"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                />
            )}

            {/* Document Modal */}
            {showAddDocumentModal && (
                <CustomCrudForm
                    isEditMode={false}
                    entityData={{ company_id: currentCompanyId }}
                    onClose={() => setShowAddDocumentModal(false)}
                    onSubmit={handleAddSubmit}
                    displayFields={crudConfig.documents}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setDocuments}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchData}
                    tableName="library_modal_documents"
                    createRecord="Add Prompt"
                    updateRecord="Edit Prompt"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                />
            )}

            {showEditDocumentModal && (
                <CustomCrudForm
                    isEditMode={true}
                    entityData={currentEditingDocument}
                    onClose={() => setShowEditDocumentModal(false)}
                    onSubmit={handleEditSubmit}
                    displayFields={crudConfig.documents}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    setUsers={setDocuments}
                    setTotalRecords={setTotalRecords}
                    setCurrentPage={setCurrentPage}
                    fetchUsers={fetchData}
                    tableName="library_modal_documents"
                    createRecord="Add Prompt"
                    updateRecord="Edit Prompt"
                    formatedValueDashboard={false}
                    formatedValueFiles={false}
                    isFilesData={false}
                />
            )}
        </div>
    );
};

export default ManageLibrary;