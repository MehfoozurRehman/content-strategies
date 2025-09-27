'use client';
import { listConversations, fetchConversation, sendChats, optimizePrompt } from '@/lib/services/chatServices';
import { appColors } from '@/lib/theme';
import React, { useEffect, useState, useRef } from 'react';
import { ShowCustomToast } from '../customComponents/CustomToastify';
import PromptLibraryModal from '../customComponents/PromptLibraryModal';
import ContextModal from '../customComponents/ContextModal';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeFileName } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Share2 } from 'lucide-react';


const GuidelineModal = ({ step, onNext, onSkip, onClose, totalSteps, colors }) => {
    const guidelines = [
        {
            title: "Enhance Your Search with Library",
            description: "Access pre-built prompts and templates to get started quickly with common tasks.",
            button: "Open Library",
            skip: "Skip"
        },
        {
            title: "Optimize Your Prompt for Better Results",
            description: "Get suggestions to improve your prompt and professionalize your query with one click.",
            button: "Optimize Prompt",
            skip: "Skip"
        },
        {
            title: "Add Context for Better Responses",
            description: "Include relevant documents to help the AI understand your business better.",
            button: "Add Context",
            skip: "Skip"
        },
        {
            title: "Refine Results with Add-Ons",
            description: "Customize the AI's output with specific parameters to get exactly what you need.",
            button: "Apply Add-ons",
            skip: "Finish"
        }
    ];

    const currentGuideline = guidelines[step];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="rounded-lg p-5 w-full max-w-sm mx-4 shadow-lg" style={{ backgroundColor: colors.primaryColor, color: colors.text }}>

                {/* Header */}
                <div className="flex justify-between items-center mb-2 -mt-3">
                    <h2 className="text-lg font-semibold">Getting Started</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                        &times;
                    </button>
                </div>

                <hr className="border-b border-gray-300 -mx-5 mb-3" />

                {/* Content */}
                <div className="mb-5">
                    <h3 className="text-base font-medium mb-1">{currentGuideline.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{currentGuideline.description}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                    {/* Steps */}
                    <div className="flex space-x-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                        <button
                            onClick={onSkip}
                            className="px-3 py-1 rounded-md text-sm text-gray-600 hover:text-gray-400 border border-gray-300"
                        >
                            {currentGuideline.skip}
                        </button>
                        <button
                            onClick={onNext}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                            {currentGuideline.button}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};
// Add this state near the other state declarations

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const Assistant = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [selectedSource, setSelectedSource] = useState([]);
    const [selectedDocTitles, setSelectedDocTitles] = useState([]);
    const [selectedLibraryDocs, setSelectedLibraryDocs] = useState([]);
    const [selectedLibraryDocTitles, setSelectedLibraryDocTitles] = useState([]);
    const [selectedSourceTitles, setSelectedSourceTitles] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedPromptTitle, setSelectedPromptTitle] = useState('');
    const [optimizedQuery, setOptimizedQuery] = useState('');
    const [selectedAddOn, setSelectedAddOn] = useState(null);
    const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
    const [showAddonsDropdown, setShowAddonsDropdown] = useState(false);
    const [isPromptMode, setIsPromptMode] = useState(true);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showOptimizationModal, setShowOptimizationModal] = useState(false);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [hoveredTab, setHoveredTab] = useState(null);
    const leaveTimer = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [currentMessages, setCurrentMessages] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const [originalPrompt, setOriginalPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('GPT-5');
    const [showModelsDropdown, setShowModelsDropdown] = useState(false);
    const [showLegacy, setShowLegacy] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [theme, setTheme] = useState('light'); // 'dark' or 'light'
    const [openConvMenu, setOpenConvMenu] = useState(null);
    const [initializedFromLink, setInitializedFromLink] = useState(false);
    const [isSearchFromLibrary, setIsSearchFromLibrary] = useState(false);

    const SettingsModal = ({ show, onClose, theme, setTheme }) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50" >
                <div className="rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg" style={{ backgroundColor: colors.primaryColor }}>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold -mt-4" style={{ color: colors.text }}>Assistant Settings</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-lg -mt-4"
                            style={{ color: colors.text }}
                        >
                            &times;
                        </button>
                    </div>

                    <hr className="border-b border-gray-300 -mx-6 mb-4" />

                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2" style={{ color: colors.text }}>Theme</h3>
                        <div className="flex gap-4">
                            <div
                                className={`flex-1 p-3 rounded-lg cursor-pointer border-2 ${theme === 'dark' ? 'border-blue-500' : 'border-gray-300'}`}
                                onClick={() => {
                                    setTheme('dark');
                                    onClose(); // ✅ close modal when selecting light
                                }}
                                style={{ backgroundColor: '#1f1f3d' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white">Dark</span>
                                    {theme === 'dark' && (
                                        <svg className="w-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-3 h-6 rounded-sm" style={{ backgroundColor: '#2b2b4b' }}></div>
                                    <div className="w-3 h-6 rounded-sm" style={{ backgroundColor: '#3b3b5b' }}></div>
                                    <div className="w-3 h-6 rounded-sm" style={{ backgroundColor: '#4a4a6a' }}></div>
                                </div>
                            </div>

                            <div
                                className={`flex-1 p-3 rounded-lg cursor-pointer border-2 ${theme === 'light' ? 'border-blue-500' : 'border-gray-300'}`}
                                onClick={() => {
                                    setTheme('light');
                                    onClose(); // ✅ close modal when selecting light
                                }}
                                style={{ backgroundColor: '#f8f9fa' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-800">Light</span>
                                    {theme === 'light' && (
                                        <svg className="w-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-3 h-6 rounded-sm bg-gray-100"></div>
                                    <div className="w-3 h-6 rounded-sm bg-gray-200"></div>
                                    <div className="w-3 h-6 rounded-sm bg-gray-300"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                        >
                            Done
                        </button>
                    </div> */}
                </div>
            </div>
        );
    };

    // Close conversation menu on outside click (but keep it open when clicking inside menu/button)
    useEffect(() => {
        const handleDocClick = (e) => {
            const target = e.target;
            if (target && typeof target.closest === 'function') {
                if (target.closest('.conv-menu-area')) {
                    return; // click inside menu/button; do not close
                }
            }
            setOpenConvMenu(null);
        };
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);

    const getConversationShareLink = (conversationId) => {
        if (typeof window === 'undefined') return '';
        const origin = window.location.origin || '';
        return `${origin}/assistant?conversation=${encodeURIComponent(conversationId)}`;
    };

    const handleShareConversation = async (conversationId) => {
        try {
            const link = getConversationShareLink(conversationId);
            await navigator.clipboard.writeText(link);
            ShowCustomToast('Chat Copied!', 'success');
        } catch (e) {
            ShowCustomToast('Failed to copy link', 'error');
        } finally {
            setOpenConvMenu(null);
        }
    };
    useEffect(() => {
        // Load theme from localStorage on mount
        const savedTheme = localStorage.getItem('assistantTheme') || 'light';
        setTheme(savedTheme);
    }, []);

    // Update theme when it changes
    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('assistantTheme', theme);
    }, [theme]);



    // ChatGPT-style color scheme for Assistant page only
    const getThemeColors = () => {
        if (theme === 'light') {
            return {
                background: '#ffffff',
                text: "#000000", // Changed from #1f2937 to black for better readability
                messageBackground: '#f9fafb',
                userMessageBackground: '#3b82f6',
                userMessageText: '#ffffff',
                border: '#e5e7eb',
                inputBackground: '#ffffff',
                inputBorder: '#d1d5db',
                sidebarBackground: '#f3f4f6',
                activeBackground: '#e5e7eb',
                primaryColor: '#ffffff',
                textColor: '#000000' // Changed from #1f2937 to black
            };
        } else {
            return {
                background: '#1a1b41',
                text: '#ffffff',
                messageBackground: '#2f2f2f',
                userMessageBackground: '#3b82f6',
                userMessageText: '#ffffff',
                border: '#404040',
                inputBackground: '#2f2f2f',
                inputBorder: '#404040',
                sidebarBackground: '#2a2d45',
                primaryColor: '#1a1b41',
                textColor: '#ffffff',
                toolTipColors: ''
            };
        }
    };

    const colors = getThemeColors();
    // const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);

    const ModelSelector = () => {
        const [showLegacy, setShowLegacy] = useState(false);
        const dropdownRef = useRef(null);
        useEffect(() => {
            function handleClickOutside(event) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    // close the menu when clicking outside
                    setShowModelsDropdown(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
        const models = [
            { id: "gpt-5", name: "GPT-5", description: "Flagship model" },
            { id: "gpt-5-thinking", name: "GPT-5 Thinking", description: "Get more thorough answers" },
            { id: "gpt-5-pro", name: "GPT-5 Pro", description: "Research-grade intelligence" },
        ];

        const legacyModels = [
            { id: "gpt-4o", name: "GPT-4o", description: "Great for most tasks" },
            { id: "gpt-4-5", name: "GPT-4.5 (RESEARCH PREVIEW)", description: "Good for writing and exploring ideas" },
            { id: "o3", name: "o3", description: "Uses advanced reasoning" },
            { id: "o3-pro", name: "o3-pro", description: "Legacy reasoning expert" },
            { id: "o4-mini", name: "o4-mini", description: "Fastest at advanced reasoning" },
            { id: "gpt-4-1", name: "GPT-4.1", description: "Great for quick coding and analysis" },
        ];

        return (
            <div
                className="absolute left-0 top-full mt-2 z-50 w-64 border rounded-lg shadow-lg"
                ref={dropdownRef}
                style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#2a2d45',
                    borderColor: theme === 'light' ? '#e5e7eb' : '#404040'
                }}
            >
                <div className="p-2">
                    <h3
                        className="text-sm font-semibold mb-2 px-2"
                        style={{
                            color: theme === 'light' ? '#000000' : '#ffffff'
                        }}
                    >
                        ChatGPT
                    </h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {models.map((model) => (
                            <div
                                key={model.id}
                                className="p-2 rounded cursor-pointer transition-colors"
                                style={{
                                    backgroundColor: selectedModel === model.name
                                        ? theme === 'light' ? '#3b82f6' : '#2563eb' // blue for selected
                                        : 'transparent',
                                    color: selectedModel === model.name
                                        ? '#ffffff' // white text for selected
                                        : (theme === 'light' ? '#000000' : '#ffffff')
                                }}
                                onClick={() => {
                                    setSelectedModel(model.name);
                                    setShowModelsDropdown(false);
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedModel !== model.name) {
                                        e.currentTarget.style.backgroundColor = theme === 'light'
                                            ? 'rgba(0, 0, 0, 0.05)'
                                            : 'rgba(255, 255, 255, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedModel !== model.name) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    } else {
                                        e.currentTarget.style.backgroundColor = theme === 'light'
                                            ? '#3b82f6'
                                            : '#2563eb';
                                    }
                                }}
                            >
                                <div className="text-sm font-medium">
                                    {model.name}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{
                                        color: selectedModel === model.name
                                            ? 'rgba(255, 255, 255, 0.8)' // lighter white for description when selected
                                            : (theme === 'light' ? '#6b7280' : '#d1d5db')
                                    }}
                                >
                                    {model.description}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legacy toggle */}
                    <div
                        className="mt-2 pt-2"
                        style={{
                            borderColor: theme === 'light' ? '#e5e7eb' : '#404040'
                        }}
                    >
                        <button
                            className="w-full flex justify-between items-center px-2 text-xs transition-colors"
                            style={{
                                color: theme === 'light' ? '#6b7280' : '#9ca3af',
                            }}
                            onClick={() => setShowLegacy(!showLegacy)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = theme === 'light' ? '#6b7280' : '#9ca3af';
                            }}
                        >
                            Legacy models
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-3 w-3 transition-transform ${showLegacy ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showLegacy && (
                            <div className="space-y-1 max-h-60 overflow-y-auto mt-2">
                                {legacyModels.map((model) => (
                                    <div
                                        key={model.id}
                                        className="p-2 rounded cursor-pointer transition-colors"
                                        style={{
                                            backgroundColor: selectedModel === model.name
                                                ? theme === 'light' ? '#3b82f6' : '#2563eb' // blue for selected
                                                : 'transparent',
                                            color: selectedModel === model.name
                                                ? '#ffffff' // white text for selected
                                                : (theme === 'light' ? '#000000' : '#ffffff')
                                        }}
                                        onClick={() => {
                                            setSelectedModel(model.name);
                                            setShowModelsDropdown(false);
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedModel !== model.name) {
                                                e.currentTarget.style.backgroundColor = theme === 'light'
                                                    ? 'rgba(0, 0, 0, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.1)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedModel !== model.name) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            } else {
                                                e.currentTarget.style.backgroundColor = theme === 'light'
                                                    ? '#3b82f6'
                                                    : '#2563eb';
                                            }
                                        }}
                                    >
                                        <div className="text-sm font-medium">
                                            {model.name}
                                        </div>
                                        <div
                                            className="text-xs"
                                            style={{
                                                color: selectedModel === model.name
                                                    ? 'rgba(255, 255, 255, 0.8)' // lighter white for description when selected
                                                    : (theme === 'light' ? '#6b7280' : '#d1d5db')
                                            }}
                                        >
                                            {model.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const [addOns, setAddOns] = useState({
        industry: {},
        audienceTitles: {},
        audience: [],
        tone: [],
        objective: '',
        advice: {
            do: [],
            dont: []
        }
    });

    const [selectedUploadedDocuments, setSelectedUploadedDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingIndexes, setUploadingIndexes] = useState([]);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showGuideline, setShowGuideline] = useState(false);
    const [currentGuidelineStep, setCurrentGuidelineStep] = useState(0);
    const [pendingSubmit, setPendingSubmit] = useState(false); // Add this state
    const totalGuidelineSteps = 4;

    const [currentStep, setCurrentStep] = useState(0);
    const steps = ['library', 'context', 'addons'];

    const [newResponseArrived, setNewResponseArrived] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    useEffect(() => {
        if (chatContainerRef.current) {
            const container = chatContainerRef.current;

            // Scroll to bottom when new messages are added
            container.scrollTop = container.scrollHeight;

            // Check if we need to show scroll buttons
            const checkScrollPosition = () => {
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                setShowScrollToTop(container.scrollTop > 300);
                setShowScrollToBottom(!isNearBottom && container.scrollHeight > container.clientHeight);
            };

            checkScrollPosition();
            container.addEventListener('scroll', checkScrollPosition);

            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
            };
        }
    }, [currentMessages]);

    useEffect(() => {
        if (apiResponse && currentMessages.length > 0) {
            // Find the latest assistant message
            const lastMessage = currentMessages[currentMessages.length - 1];
            if (lastMessage.role === 'assistant') {
                setNewResponseArrived(true);

                // Scroll to the top of the new response
                setTimeout(() => {
                    const assistantMessages = document.querySelectorAll('.message-content');
                    if (assistantMessages.length > 0) {
                        const latestMessage = assistantMessages[assistantMessages.length - 1];
                        latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        }
    }, [apiResponse, currentMessages]);

    const scrollToTopOfResponse = () => {
        if (chatContainerRef.current) {
            const assistantMessages = document.querySelectorAll('.message-content');
            if (assistantMessages.length > 0) {
                const latestMessage = assistantMessages[assistantMessages.length - 1];
                latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setNewResponseArrived(false);
            }
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // useEffect(() => {
    //     if (showAddonsModal && searchQuery.trim() !== '') {
    //         setShowReplaceConfirmation(true);
    //     } else {
    //         setShowReplaceConfirmation(false);
    //     }
    // }, [showAddonsModal]);
    useEffect(() => {
        localStorage.removeItem('originalPrompt');
    }, []);

    useEffect(() => {
        const savedOriginalPrompt = localStorage.getItem('originalPrompt');
        if (savedOriginalPrompt) {
            setOriginalPrompt(savedOriginalPrompt);
        }
    }, []);
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setIsLoading(true);
                const userId = localStorage.getItem('current_user_id');
                const { conversations } = await listConversations(userId);

                // Filter out any invalid conversations
                const validConversations = conversations.filter(conv =>
                    conv.conversation_id && typeof conv.conversation_id === 'string'
                );

                setConversations(validConversations);


            } catch (error) {
                console.log('Failed to load conversations:', error);
                ShowCustomToast('Failed to load conversations', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // Deep-link: if URL contains ?conversation=ID, load that conversation on first load
    useEffect(() => {
        if (initializedFromLink) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const convId = params.get('conversation');
        if (convId) {
            handleConversationSelect(convId);
            setInitializedFromLink(true);
        }
    }, [initializedFromLink, conversations]);

    const optimizeQuery = async () => {
        if (showOptimizationModal && searchQuery.trim()) {
            try {
                setIsLoading(true);
                setOptimizedQuery(""); // Clear previous optimization
                const optimized = await optimizePrompt(searchQuery);

                if (!optimized.error) {
                    let raw = optimized.prompt || optimized.message;

                    // Remove wrapping quotes if present
                    if (raw.startsWith('"') && raw.endsWith('"')) {
                        raw = raw.slice(1, -1);
                    }

                    // Clean the response
                    const cleanedResponse = raw
                        .replace(/^,+|,+$/g, '')
                        .replace(/,+\s*,+/g, ', ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    setOptimizedQuery(cleanedResponse);
                } else {
                    ShowCustomToast('Failed to optimize prompt', 'error');
                }
            } catch (error) {
                console.log('Optimization error:', error);
                ShowCustomToast('Error optimizing prompt', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };



    const handleConversationSelect = async (conversationId) => {
        try {
            setIsLoading(true);
            setHasSearched(true);
            setSelectedConversation(conversationId);

            const response = await fetchConversation(conversationId);
            const messages = response.data || [];

            // Format messages for display
            const formattedMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                id: msg.id || Date.now().toString()
            }));

            setCurrentMessages(formattedMessages);
        } catch (error) {
            console.log('Failed to load conversation:', error);
            ShowCustomToast('Failed to load conversation', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Update the tabs array to include the file icon
    const tabs = [
        {
            id: 'uplode',
            label: (
                // File + plus icon (default state)
                <div className="flex items-center space-x-1">
                    {/* File icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5H4z" />
                    </svg>
                    {/* Plus icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )
        },

        { id: 'library', label: `Library` },
        { id: 'business', label: 'Optimization' },
        { id: 'context', label: 'Context' },
        { id: 'addons', label: '+ Add-Ons' },
    ];

    // Tab hover messages
    const tabMessages = {
        context: [
            "Add relevant documents to improve response quality",
            "Context helps the AI understand your business better",
            "Select documents that match your prompt topic"
        ],
        library: [
            "Choose from pre-built prompts for common tasks",
            "Templates help you get started quickly",
            "Save time with our curated prompt library"
        ],
        business: [
            "Optimize your prompt for better results",
            "Get suggestions to improve your prompt",
            "Professionalize your prompt with one click"
        ],
        addons: [
            "Add specific parameters to refine your results",
            "Customize the AI's output with add-ons",
            "Fine-tune the response with additional context"
        ],
        uplode: [
            "Upload new documents to expand your knowledge base",
            "Add fresh content for the AI to reference",
            "Keep your context up-to-date with new files"
        ]
    };

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            // Close current modal
            if (steps[currentStep] === 'library') {
                setShowLibraryDropdown(false);
            } else if (steps[currentStep] === 'context') {
                setShowContextModal(false);
            }

            // Open next modal and set active tab
            const nextStep = currentStep + 1;
            const nextTab = steps[nextStep];

            setCurrentStep(nextStep);
            setActiveTab(nextTab);

            if (nextTab === 'context') {
                setShowContextModal(true);
            } else if (nextTab === 'addons') {
                setShowAddonsModal(true);
            }
        }
    };
    const goToPreviousStep = () => {
        if (currentStep > 0) {
            // Close current modal
            if (steps[currentStep] === 'context') {
                setShowContextModal(false);
            } else if (steps[currentStep] === 'addons') {
                setShowAddonsModal(false);
            }

            // Open previous modal and set active tab
            const prevStep = currentStep - 1;
            const prevTab = steps[prevStep];

            setCurrentStep(prevStep);
            setActiveTab(prevTab);

            if (prevTab === 'library') {
                setShowLibraryDropdown(true);
            } else if (prevTab === 'context') {
                setShowContextModal(true);
            }
        }
    };

    const handleTabClick = async (tabId) => {
        setActiveTab(tabId);

        // Update current step based on the tab clicked
        const stepIndex = steps.indexOf(tabId);
        if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
        }

        if (tabId === 'context') {
            setShowContextModal(true);
            setHasSearched(true);
            setShowOptimizationModal(false);
            setShowAddonsModal(false);
            setShowLibraryDropdown(false);
        } else if (tabId === 'business') {
            setShowOptimizationModal(true);
            setHasSearched(true);
            setShowContextModal(false);
            setShowAddonsModal(false);
            setShowLibraryDropdown(false);
        } else if (tabId === 'addons') {
            setShowAddonsModal(true);
            setHasSearched(true);
            setShowContextModal(false);
            setShowOptimizationModal(false);
            setShowLibraryDropdown(false);
        } else if (tabId === 'library') {
            setShowLibraryDropdown(!showLibraryDropdown);
            setHasSearched(true);
            setShowContextModal(false);
            setShowOptimizationModal(false);
            setShowAddonsModal(false);
        } else if (tabId === 'uplode') {
            setHasSearched(true);
            fileInputRef.current.click();
            setShowContextModal(false);
            setShowOptimizationModal(false);
            setShowAddonsModal(false);
            setShowLibraryDropdown(false);
        }
    };
    const handleMouseEnter = (tabId) => {
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
        }
        setHoveredTab(tabId);
    };

    const handleMouseLeave = () => {
        leaveTimer.current = setTimeout(() => {
            setHoveredTab(null);
        }, 300); // 300ms delay before hiding
    };


    // For context documents modal
    const handleDocSelect = (docId, docTitle) => {
        setSelectedDocs(prev => {
            const newSelection = prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId];

            return newSelection.filter(id => id && id.trim() !== '');
        });

        setSelectedDocTitles(prev => {
            const cleaned = prev.filter(doc => doc.id && doc.id.trim() !== '');
            return cleaned.some(doc => doc.id === docId)
                ? cleaned.filter(doc => doc.id !== docId)
                : [...cleaned, {
                    id: docId,
                    title: docTitle || 'Untitled Document'
                }];
        });
    };
    // For AI in 3rd steps  in library modal
    const handleSourceSelect = (docId, docTitle) => {
        setSelectedSource(prev => {
            const newSelection = prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId];

            return newSelection.filter(id => id && id.trim() !== '');
        });

        setSelectedSourceTitles(prev => {
            const cleaned = prev.filter(doc => doc.id && doc.id.trim() !== '');
            return cleaned.some(doc => doc.id === docId)
                ? cleaned.filter(doc => doc.id !== docId)
                : [...cleaned, {
                    id: docId,
                    title: docTitle || 'Untitled Document'
                }];
        });
    };
    // For selcting prompts (doc) on slecting Template in step 1 in Library modal
    const handleLibraryDocsSelect = (docId, docTitle, processedContent) => {
        setSelectedLibraryDocs([docId]);
        setSelectedLibraryDocTitles([{
            id: docId,
            title: docTitle,
            processedDescription: processedContent
        }]);
        setSearchQuery(docTitle);


    };
    console.log("selectedLibraryDocTitles", selectedLibraryDocTitles);

    const handleRemoveLibraryDoc = (docId) => {
        setSelectedLibraryDocs((prev) => prev.filter((id) => id !== docId));
        setSelectedLibraryDocTitles((prev) => prev.filter((doc) => doc.id !== docId));
    };

    // Upload handler


    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const userId = localStorage.getItem("current_user_id");
        const uploadedDocumentIds = [];

        const filesArr = Array.from(files);

        // Temp show in preview (with loading)
        const newFileStates = filesArr.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file,
            isUploading: true,
        }));

        setSelectedFiles((prev) => [...prev, ...newFileStates]);

        try {
            for (let i = 0; i < filesArr.length; i++) {
                const file = filesArr[i];
                const safeFileName = sanitizeFileName(file.name);
                const filePath = `${userId}/${Date.now()}-${safeFileName}`;

                // Upload to Supabase
                const { error: uploadError } = await supabase.storage
                    .from("uploaded-documents")
                    .upload(filePath, file, { upsert: true });

                if (uploadError) {
                    ShowCustomToast(`Failed to upload "${file.name}"`, "error");
                    continue;
                }

                const { data: dbData, error: dbError } = await supabase
                    .from("lib_uploaded_doc")
                    .insert([
                        {
                            user_id: userId,
                            uploded_doc_url: filePath,
                            document_name: file.name,
                        },
                    ])
                    .select("id");

                if (dbError) {
                    ShowCustomToast(`Failed to save record for "${file.name}"`, "error");
                    continue;
                }

                const dbId = dbData?.[0]?.id;

                // Update the uploaded file state
                setSelectedFiles((prev) =>
                    prev.map((f) =>
                        f.name === file.name && f.isUploading
                            ? {
                                ...f,
                                filePath,
                                dbId,
                                isUploading: false,
                            }
                            : f
                    )
                );

                uploadedDocumentIds.push(dbId);
            }

            setSelectedUploadedDocuments((prev) => [...prev, ...uploadedDocumentIds]);

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
                setIsExpanded(false)
            }
        } catch (error) {
            console.log("Upload error:", error);
            ShowCustomToast("Unexpected error while uploading", "error");
        }
    };


    // Remove handler
    const handleRemoveFile = async (index) => {
        const fileToRemove = selectedFiles[index];
        if (!fileToRemove) return;

        try {
            // 1. Delete from storage
            if (fileToRemove.filePath) {
                const { error: storageError } = await supabase.storage
                    .from("uploaded-documents")
                    .remove([fileToRemove.filePath]);

                if (storageError) {
                    console.error("Storage delete error:", storageError);
                }
            }

            // 2. Delete from DB
            if (fileToRemove.dbId) {
                const { error: dbError } = await supabase
                    .from("lib_uploaded_doc")
                    .delete()
                    .eq("id", fileToRemove.dbId);

                if (dbError) {
                    console.error("DB delete error:", dbError);
                }
            }

            // 3. Update UI state
            const newFiles = [...selectedFiles];
            newFiles.splice(index, 1);
            setSelectedFiles(newFiles);

            setSelectedUploadedDocuments((prev) =>
                prev.filter((id) => id !== fileToRemove.dbId)
            );

            // Reset the file input after removal
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setIsExpanded(false)
            // ShowCustomToast(`File(s) removed successfully.`, "success");
        } catch (error) {
            console.error("Remove file error:", error);
            ShowCustomToast("Error while removing file.", "error");
        }
    };
    console.log("selectedFilesAfter", selectedFiles);
    const handleAddOnChange = (type, value, isChecked, category = null) => {
        setAddOns(prev => {
            if (type === 'objective') {
                return { ...prev, objective: value };
            }

            if (type === 'do' || type === 'dont') {
                const newAdvice = { ...prev.advice };
                if (isChecked) {
                    newAdvice[type] = [...newAdvice[type], value];
                } else {
                    newAdvice[type] = newAdvice[type].filter(item => item !== value);
                }
                return { ...prev, advice: newAdvice };
            }

            // For industry and audienceTitles (nested structure)
            if (type === 'industry' || type === 'audienceTitles') {
                const newCategory = { ...prev[type] };

                if (category) {
                    if (isChecked) {
                        newCategory[category] = [...(newCategory[category] || []), value];
                    } else {
                        newCategory[category] = (newCategory[category] || []).filter(item => item !== value);
                        // Remove empty categories
                        if (newCategory[category].length === 0) {
                            delete newCategory[category];
                        }
                    }
                } else {
                    // Handle category toggling
                    if (isChecked) {
                        newCategory[value] = newCategory[value] || [];
                    } else {
                        delete newCategory[value];
                    }
                }

                return { ...prev, [type]: newCategory };
            }

            // For audience, tone (flat arrays)
            const newArray = isChecked
                ? [...prev[type], value]
                : prev[type].filter(item => item !== value);
            return { ...prev, [type]: newArray };
        });
    };

    const handleCustomAddOn = (type, value) => {
        if (!value.trim()) return;

        setAddOns(prev => {
            if (type === 'objective') {
                return { ...prev, objective: value };
            }

            if (type === 'do' || type === 'dont') {
                const newAdvice = { ...prev.advice };
                newAdvice[type] = [...newAdvice[type], value];
                return { ...prev, advice: newAdvice };
            }

            // For industry, audience, tone
            if (!prev[type].includes(value)) {
                return { ...prev, [type]: [...prev[type], value] };
            }
            return prev;
        });
    };
    const handleSubmit = async () => {
        try {
            setNewResponseArrived(false);
            // Check if this is the first search and show guidelines if needed
            const hasSeenGuidelines = localStorage.getItem('hasSeenAssistantGuidelines');

            if (!hasSeenGuidelines) {
                // Show guideline modal and set pending submit flag
                setShowGuideline(true);
                setPendingSubmit(true); // Mark that we have a pending submit
                localStorage.setItem('hasSeenAssistantGuidelines', 'true');
                return; // Exit early without submitting
            }

            // If guidelines were already seen, proceed with normal submit
            await executeSubmit();


        } catch (error) {
            ShowCustomToast('Something went wrong, Please try again', 'info', 2000);
            console.log('Error sending chat:', error);
        }
    };


    const executeSubmit = async () => {
        try {
            setIsLoading(true);
            setHasSearched(true);

            // Check if this is the first search and show guidelines if needed
            const hasSeenGuidelines = localStorage.getItem('hasSeenAssistantGuidelines');
            if (!hasSeenGuidelines) {
                setShowGuideline(true);
                localStorage.setItem('hasSeenAssistantGuidelines', 'true');
            }
            const userId = localStorage.getItem('current_user_id');
            const isNewConversation = !selectedConversation;
            const conversationId = selectedConversation || `conv-${Date.now()}`;


            let advice = {};
            if (addOns?.advice?.do?.length > 0) {
                advice.do = addOns.advice.do;
            }
            if (addOns?.advice?.dont?.length > 0) {
                advice.dont = addOns.advice.dont;
            }
            if (Object.keys(advice).length === 0) {
                advice = undefined;
            }
            // Prepare add_ons object for API
            const add_ons = {
                ...addOns,
                // Format industry as object with categories
                industry: Object.keys(addOns.industry).length > 0 ? addOns.industry : undefined,
                // Format audienceTitles as object with categories
                audienceTitles: Object.keys(addOns.audienceTitles).length > 0 ? addOns.audienceTitles : undefined,
                audience: addOns.audience.length > 0 ? addOns.audience : undefined,
                tone: addOns.tone.length > 0 ? addOns.tone : undefined,
                objective: addOns.objective || undefined,
                advice: addOns.advice.do.length > 0 || addOns.advice.dont.length > 0 ? addOns.advice : undefined
            };

            // Remove undefined values
            Object.keys(add_ons).forEach(key => {
                if (add_ons[key] === undefined) {
                    delete add_ons[key];
                }
            });
            if (add_ons.advice && Object.keys(add_ons.advice).length === 0) {
                delete add_ons.advice;
            }
            const formattedLibraryDocumentIds = selectedLibraryDocs.map(id => id.toString());
            const response = await sendChats({
                user_id: userId,
                context_document_ids: selectedDocs,
                prompt: searchQuery,
                source_document_ids: selectedSource,
                uploaded_document_ids: selectedUploadedDocuments,
                add_ons: add_ons,
                prompt_id: selectedLibraryDocTitles[0]?.processedDescription || '',
                conversation_id: conversationId
            });

            setApiResponse(response);
            const { conversations: updatedConversations } = await listConversations(userId);
            const validConversations = updatedConversations.filter(conv =>
                conv.conversation_id && typeof conv.conversation_id === 'string'
            );

            // Sort conversations by date (newest first)
            const sortedConversations = [...validConversations].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );

            setConversations(sortedConversations);

            // If this was a new conversation, select the newest one
            if (isNewConversation && sortedConversations.length > 0) {
                setSelectedConversation(sortedConversations[0].conversation_id);

                // Also load the new conversation's messages
                const response = await fetchConversation(sortedConversations[0].conversation_id);
                const messages = response.data || [];
                setCurrentMessages(messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    id: msg.id || Date.now().toString()
                })));
            }

            // Update chat history
            const newMessages = [
                ...currentMessages,
                { role: 'user', content: searchQuery, id: `user-${Date.now()}` },
                { role: 'assistant', content: response?.message || response?.response || response?.data?.response, id: `assistant-${Date.now()}` }
            ];

            setCurrentMessages(newMessages);
            setSearchQuery('');
            setIsSearchFromLibrary(false);
            setSelectedDocs([]);
            setSelectedDocTitles([]);
            setSelectedLibraryDocTitles([]);
            setSelectedLibraryDocs([]);
            setSelectedSource([]);
            setSelectedSourceTitles([]);
            setSelectedFiles([]);
            setSelectedUploadedDocuments([]);
            setAddOns({
                industry: [],
                audience: [],
                tone: [],
                objective: '',
                advice: {
                    do: [],
                    dont: []
                }
            });

            // Refresh conversations list
            const { conversations } = await listConversations(userId);
            setConversations(conversations.filter(conv => conv.conversation_id && typeof conv.conversation_id === 'string'));

        } catch (error) {
            ShowCustomToast('Something went wrong, Please try again', 'info', 2000);
            console.log('Error sending chat:', error);
        } finally {
            setIsLoading(false);

        }
    };

    const handleGuidelineAction = () => {
        switch (currentGuidelineStep) {
            case 0: // Library step
                setShowLibraryDropdown(true);
                setActiveTab('library');
                setShowGuideline(false);
                break;
            case 1: // Optimization step

                setShowOptimizationModal(true);
                setActiveTab('business');
                setShowGuideline(false);
                break;
            case 2: // Context step
                setShowContextModal(true);
                setActiveTab('context');
                setShowGuideline(false);
                break;
            case 3: // Add-ons step
                setShowAddonsModal(true);
                setActiveTab('addons');
                setShowGuideline(false);
                break;
            default:
                break;
        }

        // Move to next step or close
        if (currentGuidelineStep < totalGuidelineSteps - 1) {
            setCurrentGuidelineStep(prev => prev + 1);
        } else {
            setShowGuideline(false);
        }

        // Don't automatically execute submit - let user manually submit again
        setPendingSubmit(false);
    };

    const handleGuidelineSkip = () => {
        if (currentGuidelineStep < totalGuidelineSteps - 1) {
            setCurrentGuidelineStep(prev => prev + 1);
        } else {
            setShowGuideline(false);
        }

        // Don't automatically execute submit - let user manually submit again
        setPendingSubmit(false);
    };

    const handleGuidelineClose = () => {
        setShowGuideline(false);

        // Don't automatically execute submit - let user manually submit again
        setPendingSubmit(false);
    };
    const getAddOnsCount = () => {
        // Industry count (sum of all items in all categories)
        const industryCount = addOns.industry
            ? Object.values(addOns.industry).reduce(
                (total, items) => total + (items?.length || 0),
                0
            )
            : 0;
        // Audience titles count (sum of all items in all categories)
        let audienceTitlesCount = 0;
        if (addOns.audienceTitles && typeof addOns.audienceTitles === 'object') {
            audienceTitlesCount = Object.values(addOns.audienceTitles)
                .filter(Array.isArray)
                .reduce((total, items) => total + items.length, 0);
        }

        const audience = addOns.audience.length;
        const tone = addOns.tone.length;
        const objective = addOns.objective ? 1 : 0;
        const dos = addOns.advice.do.length;
        const donts = addOns.advice.dont.length;

        const total = industryCount + audienceTitlesCount + audience + tone + objective + dos + donts;

        return {
            industry: industryCount,
            audienceTitles: audienceTitlesCount,
            audience,
            tone,
            objective,
            dos,
            donts,
            total
        };
    };
    // Add this component to display add-on counts
    const AddOnsIndicator = () => {
        const counts = getAddOnsCount();
        const hasAddOns = Object.values(counts).some(count => count > 0);

        if (!hasAddOns) return null;

        return (
            <div className="w-full max-w-[890px]">
                <div className="relative">
                    <div className="overflow-x-auto whitespace-nowrap no-scrollbar pb-2 -mb-2">
                        <div className="inline-flex gap-2 min-w-min">
                            {/* Audience Industry */}
                            {counts.industry > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Audience-Industry: +{counts.industry}
                                </span>
                            )}

                            {/* Audience Titles */}
                            {counts.audienceTitles > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Audience-Titles: +{counts.audienceTitles}
                                </span>
                            )}

                            {/* Audience Department */}
                            {counts.audience > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Audience-Departments: +{counts.audience}
                                </span>
                            )}

                            {/* Tone */}
                            {counts.tone > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Tone: +{counts.tone}
                                </span>
                            )}

                            {/* Objective */}
                            {counts.objective > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Objective: +{counts.objective}
                                </span>
                            )}

                            {/* Dos */}
                            {counts.dos > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Dos: +{counts.dos}
                                </span>
                            )}

                            {/* Donts */}
                            {counts.donts > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Don'ts: +{counts.donts}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleClearSearchQuery = () => {
        setSelectedDocs([]);
        setSelectedDocTitles([]);

    };

    // const handleReplace = () => {
    //     // Clear the search query using the callback from parent
    //     if (handleClearSearchQuery) {
    //         handleClearSearchQuery();
    //     }
    //     setShowReplaceConfirmation(false);
    // };

    // const handleCancelReplace = () => {
    //     setShowReplaceConfirmation(false);
    // };
    // Check if submit should be enabled
    const isSubmitEnabled = searchQuery.trim() || selectedDocs.length > 0 || selectedPromptId;

    const formatPlainTextWithStyling = (text) => {
        const lines = text.split("\n");
        const elements = [];
        let currentListItems = [];
        let inEmphasizedSection = false;
        let inTable = false;
        let tableRows = [];
        let tableHeaders = [];

        const flushList = () => {
            if (currentListItems.length > 0) {
                elements.push(
                    <ul
                        key={`list-${elements.length}`}
                        className="list-disc pl-6 mb-4 space-y-2"
                        style={{ color: colors.text }}
                    >
                        {currentListItems.map((item, i) => (
                            <li key={i} className="text-base leading-relaxed" style={{ color: colors.text }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                );
                currentListItems = [];
            }
        };

        const renderInlineFormatting = (line) => {
            // Bold (**text**)
            line = line.replace(
                /\*\*(.*?)\*\*/g,
                `<strong class="font-semibold" style="color: ${colors.text}">$1</strong>`
            );

            // Italic (_text_)
            line = line.replace(
                /_(.*?)_/g,
                `<em class="italic" style="color: ${colors.text}">$1</em>`
            );

            return line;
        };

        const renderTable = () => {
            if (tableRows.length > 0) {
                elements.push(
                    <div
                        key={`table-${elements.length}`}
                        className="mb-6 overflow-x-auto rounded-lg border"
                        style={{ borderColor: colors.border }}
                    >
                        <table className="min-w-full border-collapse text-base">
                            <thead>
                                <tr style={{ backgroundColor: colors.messageBackground }}>
                                    {tableHeaders.map((header, idx) => (
                                        <th
                                            key={idx}
                                            className="border px-4 py-3 text-left font-semibold"
                                            style={{ borderColor: colors.border, color: colors.text }}
                                            dangerouslySetInnerHTML={{
                                                __html: renderInlineFormatting(header),
                                            }}
                                        />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        style={{
                                            backgroundColor: rowIndex % 2 === 0
                                                ? colors.background
                                                : colors.messageBackground
                                        }}
                                    >
                                        {row.map((cell, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="border px-4 py-3"
                                                style={{ borderColor: colors.border, color: colors.text }}
                                                dangerouslySetInnerHTML={{
                                                    __html: renderInlineFormatting(cell),
                                                }}
                                            />
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            tableHeaders = [];
            tableRows = [];
            inTable = false;
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Table header separator
            if (trimmedLine.match(/^\|(\s*\-+\s*\|)+$/)) {
                if (tableHeaders.length > 0 && !inTable) {
                    inTable = true;
                }
                return;
            }

            // Table rows
            if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
                if (!inTable && tableHeaders.length === 0) {
                    tableHeaders = trimmedLine
                        .split("|")
                        .filter((cell) => cell.trim() !== "")
                        .map((cell) => cell.trim());
                } else if (inTable) {
                    const rowData = trimmedLine
                        .split("|")
                        .filter((cell) => cell.trim() !== "")
                        .map((cell) => cell.trim());

                    if (rowData.length > 0 && !rowData.every((cell) => cell.match(/^\-+$/))) {
                        tableRows.push(rowData);
                    }
                }
                return;
            }

            if (inTable && !trimmedLine.startsWith("|")) {
                renderTable();
            }

            if (!trimmedLine) {
                flushList();
                elements.push(<br key={`br-${index}`} />);
                return;
            }

            // Headings
            if (/^#\s+/.test(trimmedLine)) {
                flushList();
                elements.push(
                    <h1
                        key={`h1-${index}`}
                        className="text-3xl font-extrabold tracking-tight mb-4 mt-8 leading-snug"
                        style={{ color: colors.text }}
                    >
                        {trimmedLine.replace(/^#\s+/, "")}
                    </h1>
                );
                inEmphasizedSection = true;
                return;
            }

            if (/^##\s+/.test(trimmedLine)) {
                flushList();
                elements.push(
                    <h2
                        key={`h2-${index}`}
                        className="text-2xl font-bold mb-3 mt-6 leading-snug"
                        style={{ color: colors.text }}
                    >
                        {trimmedLine.replace(/^##\s+/, "")}
                    </h2>
                );
                return;
            }

            if (/^###\s+/.test(trimmedLine)) {
                flushList();
                elements.push(
                    <h3
                        key={`h3-${index}`}
                        className="text-xl font-semibold mb-2 mt-4 leading-snug"
                        style={{ color: colors.text }}
                    >
                        {trimmedLine.replace(/^###\s+/, "")}
                    </h3>
                );
                return;
            }

            // Options like A) B) etc.
            if (/^[A-Z]\)\s/.test(trimmedLine)) {
                flushList();
                elements.push(
                    <div key={`option-${index}`} className="flex items-start mb-3">
                        <span
                            className="font-bold mr-2 flex-shrink-0 text-lg"
                            style={{ color: colors.text }}
                        >
                            {trimmedLine.substring(0, 2)}
                        </span>
                        <span
                            className="text-base leading-relaxed"
                            style={{ color: colors.text }}
                        >
                            {trimmedLine.substring(3)}
                        </span>
                    </div>
                );
                return;
            }

            // Lists
            if (/^[•\-*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)) {
                currentListItems.push(
                    trimmedLine.replace(/^[•\-*]\s/, "").replace(/^\d+\.\s/, "")
                );
                return;
            }

            // Inline formatting
            if (/\*\*(.*?)\*\*/.test(trimmedLine) || /_(.*?)_/.test(trimmedLine)) {
                flushList();
                elements.push(
                    <p
                        key={`fmt-${index}`}
                        className="mb-4 text-base leading-relaxed"
                        style={{ color: colors.text }}
                        dangerouslySetInnerHTML={{
                            __html: renderInlineFormatting(trimmedLine),
                        }}
                    />
                );
                return;
            }

            // Emphasized section after main heading
            if (inEmphasizedSection) {
                flushList();
                elements.push(
                    <p
                        key={`p-${index}`}
                        className="mb-4 text-base leading-relaxed font-medium"
                        style={{ color: colors.text }}
                    >
                        {trimmedLine}
                    </p>
                );
                return;
            }

            // Default paragraph
            flushList();
            elements.push(
                <p
                    key={`p-${index}`}
                    className="mb-4 text-base leading-relaxed"
                    style={{ color: colors.text }}
                >
                    {trimmedLine}
                </p>
            );
        });

        if (inTable) {
            renderTable();
        }

        flushList();

        return elements;
    };

    return (
        <div className="w-full flex" style={{ backgroundColor: colors.background, minHeight: '93%' }}>
            {/* Conversations sidebar */}
            <div className="w-64 border-r relative flex flex-col" style={{ height: "85vh", backgroundColor: colors.sidebarBackground, borderColor: colors.border }}>
                {/* Fixed header section */}
                <div className="flex-shrink-0">
                    {/* New Chat button */}
                    <div
                        onClick={() => {
                            setSelectedConversation(null);
                            setCurrentMessages([]);
                            setSearchQuery("");
                            setSelectedDocs([]);
                            setSelectedDocTitles([]);
                            setSelectedLibraryDocTitles([]);
                            setSelectedLibraryDocs([]);
                            setSelectedSource([]);
                            setSelectedSourceTitles([]);
                            setSelectedFiles([]);
                            setSelectedUploadedDocuments([]);
                            setAddOns({
                                industry: [],
                                audienceTitles: [],
                                audience: [],
                                tone: [],
                                objective: "",
                                advice: { do: [], dont: [] },
                            });
                        }}
                        className="p-3 mx-4 mt-3 mb-2 flex items-center gap-3 text-md rounded-md transition-colors cursor-pointer"
                        style={{
                            color: colors.text,
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        {/* Pencil/Edit icon */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon -ml-[3px]"
                            aria-hidden="true"
                            style={{ color: colors.text }}
                        >
                            <path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"></path>
                        </svg>
                        New Chat
                    </div>

                    {/* Chats header */}
                    <div className="px-4">
                        <h2 className="text-xl font-semibold mb-2 ml-2" style={{ color: colors.text }}>Chats</h2>
                        <hr style={{ borderColor: colors.border }} />
                    </div>
                </div>

                {/* Scrollable conversation list only */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2">
                    {isLoading && conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.text }}></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.conversation_id}
                                    className="p-3 rounded-lg transition-colors group"
                                    style={{
                                        color: colors.text,
                                        backgroundColor: selectedConversation === conv.conversation_id
                                            ? theme === 'light'
                                                ? colors.activeBackground
                                                : '#2563eb'
                                            : 'transparent',
                                        border: selectedConversation === conv.conversation_id && theme === 'light'
                                            ? `1px solid ${colors.border}`
                                            : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedConversation !== conv.conversation_id) {
                                            e.currentTarget.style.backgroundColor = theme === 'light'
                                                ? 'rgba(0, 0, 0, 0.1)'
                                                : 'rgba(255, 255, 255, 0.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedConversation !== conv.conversation_id) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        } else {
                                            e.currentTarget.style.backgroundColor = theme === 'light'
                                                ? colors.activeBackground
                                                : '#2563eb';
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => handleConversationSelect(conv.conversation_id)}
                                        >
                                            <p className="text-sm truncate">
                                                {conv.title || `Conversation ${conv.conversation_id.slice(-4)}`}
                                            </p>
                                        </div>

                                        {/* Three dots menu */}
                                        <div className="relative conv-menu-area" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="p-1 rounded hover:bg-white/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenConvMenu(prev => prev === conv.conversation_id ? null : conv.conversation_id);
                                                }}
                                                aria-label="More options"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{ color: colors.text }}>
                                                    <path d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 20.25a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                </svg>
                                            </button>
                                            {openConvMenu === conv.conversation_id && (
                                                <div className="absolute right-0 mt-2  rounded-md shadow-lg z-50" style={{ backgroundColor: colors.sidebarBackground, border: `1px solid ${colors.border}` }}>
                                                    <button
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                                                        onClick={() => handleShareConversation(conv.conversation_id)}
                                                    >
                                                        <Share2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed left-64 top-20 z-50" style={{ width: 'calc(100% - 256px)' }}>
                <div className="ml-4 relative inline-block">
                    <button
                        className="p-2 text-white rounded-md text-sm flex items-center justify-between hover:bg-white/10 "
                        onClick={() => setShowModelsDropdown(!showModelsDropdown)}
                        style={{ minWidth: '120px', color: colors.text }}
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            <span className="truncate">{selectedModel}</span>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform ${showModelsDropdown ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showModelsDropdown && (
                        <div className="absolute top-full left-0 mb-2 z-50"    >
                            <ModelSelector />
                        </div>
                    )}
                </div>
            </div>


            {/* Main chat area */}
            <div className="flex-1 flex flex-col relative" >
                {/* Top-right Share button */}
                <div className="fixed top-[75px] right-4 z-50">
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10"
                        style={{ color: colors.text }}
                        onClick={() => {
                            if (selectedConversation) {
                                handleShareConversation(selectedConversation);
                            } else {
                                ShowCustomToast('Open a chat to share', 'info');
                            }
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                    </button>
                </div>
                {/* {newResponseArrived && (
                    <button
                        onClick={scrollToTopOfResponse}
                        className="fixed  mt-1 right-12 bottom-28 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg z-10 transition-all duration-300"
                        style={{ animation: 'bounce 2s infinite' }}
                    >
                        <ArrowUp className="w-5 h-5" />
                        <span className="sr-only">Scroll to new response</span>
                    </button>
                )} */}
                {/* Scroll to bottom button (appears when user scrolls up) */}
                {/* {showScrollToBottom && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-50 mb-28">
                        <button
                            onClick={scrollToBottom}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                        >
                            <ArrowDown className="w-4 h-4" />
                            <span className="sr-only">Scroll to bottom</span>
                        </button>
                    </div>
                )} */}

                <div className={`w-full flex-1 flex flex-col ${((currentMessages && currentMessages.length > 0) || showContextModal || showAddonsModal || showLibraryDropdown || showOptimizationModal) ? 'justify-end' : 'justify-center'} items-center`}>
                    {/* Chat history container with scroll */}
                    <div
                        ref={chatContainerRef}
                        className="w-full max-w-4xl mb-4 mt-4 overflow-y-auto no-scrollbar items-center"
                        style={{
                            maxHeight:
                                isExpanded ||
                                    selectedFiles.length > 0 ||
                                    getAddOnsCount().total > 0 ||
                                    (selectedPromptTitle && selectedPromptTitle.length > 30)
                                    ? "48vh"
                                    : "68vh",
                        }}
                    >
                        {/* Always show existing messages */}
                        {currentMessages.length > 0 && (
                            currentMessages.map((msg, index) => (
                                <div key={`${msg.id}-${index}`} className="w-full space-y-4 mb-6">
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2 max-w-3xl break-words ${msg.role === 'user'
                                                ? theme === 'light'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'bg-gray-700 text-white'
                                                : ''
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="message-content">{formatPlainTextWithStyling(msg.content)}</div>
                                            ) : (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ))
                        )}

                        {/* Show loading indicator at the bottom while loading */}
                        {isLoading && (
                            <div className="flex justify-center my-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white" style={{ borderColor: colors.text }}></div>
                            </div>
                        )}

                        {/* Show empty state if no messages */}
                        {!isLoading && currentMessages.length === 0 && (
                            <div className="h-full flex items-center justify-center mb-4">
                                <h1 className="text-2xl font-bold" style={{ color: colors.textColor }}>
                                    {conversations.length === 0 ? 'How can I help you today?' : 'Choose a chat or begin a new one!'}
                                </h1>
                            </div>
                        )}
                    </div>

                    {/* Scroll to bottom button - positioned above the response text area */}
                    {showScrollToBottom && (
                        <div className=" bottom-48 -mt-12 left-1/2 transform -translate-x-1/2 z-10">
                            <button
                                onClick={scrollToBottom}
                                className="bg-gray-500 hover:bg-gray-500 mb-2 text-white p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                            >
                                <ArrowDown className="w-4 h-4" />
                                <span className="sr-only">Scroll to bottom</span>
                            </button>
                        </div>
                    )}
                    {/* Input area - fixed at bottom */}
                    <div className="flex flex-col w-full max-w-4xl" style={{ height: "auto" }}>
                        {/* Add-ons indicators */}
                        {(selectedDocTitles.length > 0 || selectedSourceTitles.length > 0 ||
                            selectedLibraryDocTitles.length > 0 || selectedFiles.length > 0 ||
                            selectedPromptTitle || getAddOnsCount().total > 0) && (
                                <div className="w-full max-w-[890px] mb-2">
                                    <div className="relative">
                                        {/* Scrollable area for all tags and AddOns */}
                                        <div className="pb-2 -mb-2">
                                            <div className="flex gap-2 min-w-min">
                                                {/* Prompt Title */}
                                                {selectedPromptTitle && (
                                                    <span
                                                        className="inline-flex items-center text-xs px-2 py-1 rounded-full w-100"
                                                        style={{
                                                            backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                            color: theme === 'light' ? '#1e40af' : '#93c5fd'
                                                        }}
                                                    >
                                                        {selectedPromptTitle}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPromptId(null);
                                                                setSelectedPromptTitle('');
                                                                setSearchQuery('');
                                                            }}
                                                            style={{
                                                                color: theme === 'light' ? '#1e40af' : '#93c5fd'
                                                            }}
                                                            className="ml-1 hover:opacity-70 transition-opacity"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}

                                                {/* Document Titles - Grouped summary */}
                                                {selectedDocTitles.length > 0 && (
                                                    <span
                                                        className="inline-flex items-center text-xs px-2 !py-0 rounded-full whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                            color: theme === 'light' ? '#1e40af' : '#93c5fd'
                                                        }}
                                                    >
                                                        Context ({selectedDocTitles.length} Document{selectedDocTitles.length !== 1 ? 's' : ''})
                                                        <button
                                                            onClick={() => {
                                                                // Remove all documents at once
                                                                selectedDocTitles.forEach(doc => {
                                                                    handleDocSelect(doc.id, doc.title);
                                                                });
                                                            }}
                                                            style={{
                                                                color: theme === 'light' ? '#1e40af' : '#93c5fd'
                                                            }}
                                                            className="ml-4 hover:opacity-70 transition-opacity"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}

                                                {/* Source Titles Group by */}
                                                {selectedSourceTitles.length > 0 && (
                                                    <span
                                                        className="inline-flex items-center text-xs px-2 !py-0 rounded-full whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                            color: theme === 'light' ? '#1e40af' : '#93c5fd'
                                                        }}
                                                    >
                                                        Library ({selectedSourceTitles.length} Document{selectedSourceTitles.length !== 1 ? 's' : ''})
                                                        <button
                                                            onClick={() => {
                                                                // Remove all library docs at once
                                                                selectedSourceTitles.forEach(source => {
                                                                    handleSourceSelect(source.id, source.title);
                                                                });
                                                            }}
                                                            style={{
                                                                color: theme === 'light' ? '#1e40af' : '#93c5fd'
                                                            }}
                                                            className="ml-4 hover:opacity-70 transition-opacity"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}
                                                {/* Document Titles */}
                                                {/* {selectedDocTitles.map(doc => (
                                                    <span
                                                        key={doc.id}
                                                        className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                                    >
                                                        {doc.title}
                                                        <button
                                                            onClick={() => handleDocSelect(doc.id, doc.title)}
                                                            className="ml-1 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}



                                                {/* Source Titles */}
                                                {/* {selectedSourceTitles.map(source => (
                                                    <span
                                                        key={source.id}
                                                        className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                                    >
                                                        {source.title}
                                                        <button
                                                            onClick={() => handleSourceSelect(source.id, source.title)}
                                                            className="ml-1 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}

                                                {/* Library Document Titles */}
                                                {/* {selectedLibraryDocTitles.map(source => (
                                                    <span
                                                        key={source.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                    >
                                                        {source.title}
                                                        <button
                                                              onClick={() => handleRemoveLibraryDoc(source.id)}
                                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}


                                                {/* Files */}
                                                {/* {selectedFiles.map((file, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                                    >
                                                        {file.name}
                                                        <button
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="ml-1 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}

                                                {/* AddOns indicators - inline with tags */}
                                                <AddOnsIndicator />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className={`relative w-full`}>

                            <div
                                className={`w-full pt-3 pb-3 p-4 pr-36 border border-gray-300 text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ${isExpanded || selectedFiles.length > 0 ? 'rounded-xl' : 'rounded-full'}`}
                                style={{
                                    maxHeight: "none", // Remove fixed maxHeight
                                }}
                            // onClick={() => document.querySelector('textarea').focus()}
                            >
                                {/* File tags inside the textarea */}
                                <div className="flex gap-3 overflow-x-auto mb-0 whitespace-nowrap pb-2 no-scrollbar">
                                    {selectedFiles.map((file, index) => {
                                        const extension = file.file.name.split(".").pop().toLowerCase();
                                        const fileSize = (file.file.size / 1024).toFixed(1) + " KB";

                                        const getFileIcon = (ext) => {
                                            switch (ext) {
                                                case "js": return "🟨 <>";       // JavaScript
                                                case "css": return "🎨 { }";     // CSS
                                                case "html": return "🌐 <>";     // HTML
                                                case "json": return "🟦 {}";     // JSON
                                                case "pdf": return "📕";         // PDF
                                                case "doc":
                                                case "docx": return "📄";        // Word
                                                case "xls":
                                                case "xlsx": return "📊";        // Excel
                                                case "zip": return "🟪";         // Zip
                                                default: return "📁";            // Generic file
                                            }
                                        };

                                        return (
                                            <div
                                                key={index}
                                                className="inline-flex mb-1 items-center gap-3 bg-neutral-800   text-white px-4 py-2 rounded-xl shadow-md relative min-w-[220px] max-w-xs"
                                            >
                                                {/* File Icon */}
                                                <div className="text-xl">
                                                    {getFileIcon(extension)}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-medium truncate ">{file.file.name}</span>
                                                    <span className="text-xs text-gray-300">
                                                        {extension.toUpperCase()} • {fileSize}
                                                    </span>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="ml-0 -mr-2 -mt-4 text-xs bg-white/20 hover:bg-white/30 rounded-full w-5 h-5 flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                                {/* Loader Overlay */}
                                                {file.isUploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.text }}></div>
                                                    </div>
                                                )}

                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Textarea for input */}
                                <textarea
                                    placeholder={selectedFiles.length > 0 ? "Add a message or ask about your files..." : "Ask anything"}
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setIsSearchFromLibrary(false); }}
                                    className="w-full  -mt-[10px] bg-transparent outline-none resize-none overflow-y-auto no-scrollbar"
                                    style={{
                                        minHeight: selectedFiles.length > 0 ? '30px' : '20px',
                                        maxHeight: '100px',
                                        height: 'auto',
                                        color: theme === 'light' ? '#000000' : colors.text
                                    }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        const newHeight = Math.min(e.target.scrollHeight, 200);
                                        e.target.style.height = newHeight + 'px';

                                        const hasContent = newHeight > 30 || selectedFiles.length > 0;
                                        setIsExpanded(hasContent);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && isSubmitEnabled) {
                                            e.preventDefault();

                                            // Store the current textarea reference
                                            const textarea = e.currentTarget;

                                            handleSubmit();

                                            // Clear text value and reset height after a small delay
                                            setTimeout(() => {
                                                // setSearchQuery("");
                                                textarea.style.height = 'auto';
                                                setIsExpanded(false);
                                            }, 100);
                                        }
                                    }}
                                    ref={(el) => {
                                        if (el) {
                                            // ✅ On re-render, keep expanded if text is already long
                                            if (!searchQuery) {
                                                el.style.height = "auto";
                                                setIsExpanded(false);
                                            } else {
                                                el.style.height = "auto";
                                                const newHeight = Math.min(el.scrollHeight, 200);
                                                el.style.height = newHeight + "px";
                                                setIsExpanded(newHeight > 30 || selectedFiles.length > 0);
                                            }
                                        }
                                    }}
                                    rows={1}

                                />
                            </div>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                                accept="*"
                                ref={fileInputRef}
                            />
                            {/* Toggle Switch + Info Icon Row */}
                            <div className="flex items-center gap-2 absolute right-14 -mt-[40px]">
                                {/* Info Icon beside toggle */}
                                <div
                                    className="relative group cursor-pointer flex flex-col items-center"
                                    onClick={() => setShowGuideline(true)}
                                    onMouseEnter={() => setHoveredTab('guide')}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Info icon */}

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 hover:text-white transition-colors"
                                        style={{ color: colors.text }}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full  -translate-x-1/2 mb-3 ml-[50px] z-10 hidden group-hover:block">
                                        <div className="relative bg-[#3b3b5b] text-white text-sm p-3 rounded-lg shadow-lg w-64" style={{
                                            backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                            color: theme === 'light' ? '#000000' : '#ffffff',
                                            border: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                        }}
                                        >
                                            <p className="mb-0">
                                                Let the AI Navigator walk you through a best practice prompt experience.
                                            </p>
                                            <div className="absolute -bottom-2 right-4 w-4 h-4 transform rotate-45 "
                                                style={{
                                                    backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                    borderRight: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                    borderBottom: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                                }}></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Toggle Switch Tooltip - Updated */}
                                <div className="relative group cursor-pointer"
                                    onClick={() => setIsPromptMode((prev) => !prev)}
                                >
                                    <div
                                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${isPromptMode ? 'bg-blue-600' : 'bg-gray-500'}`}
                                    >
                                        <div
                                            className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isPromptMode ? 'translate-x-4' : 'translate-x-0'}`}
                                        ></div>
                                    </div>

                                    {/* Updated Tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-9 mt-0.5 w-48 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                        <div className="text-white text-sm p-3 rounded-lg shadow-lg w-[120px]" style={{
                                            backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                            color: theme === 'light' ? '#000000' : '#ffffff',
                                            border: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                        }}>
                                            <p className="mb-0">Randomness</p>
                                        </div>
                                        {/* Tooltip arrow */}
                                        <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-5 h-5 transform rotate-45 z-0"
                                            style={{
                                                backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                borderLeft: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                borderTop: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                            }}></div>
                                    </div>
                                </div>


                            </div>

                            <div className="relative group">
                                {/* Updated Tooltip */}
                                {!searchQuery && (
                                    <div className="absolute -right-10 top-1 w-48 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ">
                                        <div className="text-white text-sm p-3 rounded-lg shadow-lg w-[150px]"
                                            style={{
                                                backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                color: theme === 'light' ? '#000000' : '#ffffff',
                                                border: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                            }}>
                                            <p className="mb-0">Please input text</p>
                                        </div>
                                        {/* Tooltip arrow */}
                                        <div className="absolute -top-[10px] right-14 w-5 h-5 transform rotate-45  z-0"
                                            style={{
                                                backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                borderLeft: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                borderTop: theme === 'light' ? '1px solid #e5e7eb' : 'none'
                                            }}></div>
                                    </div>
                                )}
                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !isSubmitEnabled || !searchQuery}
                                    className="absolute right-3 -top-[47px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Tabs with hover tooltips */}
                    <div className="flex mt-4 flex-wrap justify-center gap-2 -mb-4">
                        {tabs
                            .filter(tab => {
                                // Hide Context, Optimization, Add-Ons when Library modal is open
                                if (isSearchFromLibrary && (tab.id === 'context' || tab.id === 'business' || tab.id === 'addons')) {
                                    return false;
                                }
                                // Hide Library tab only when user typed text manually (not from Library)
                                if (tab.id === 'library' && searchQuery.trim() !== '' && !isSearchFromLibrary) {
                                    return false;
                                }
                                return true;
                            })
                            .map((tab) => (
                                <div
                                    key={tab.id}
                                    className="relative"
                                    onMouseEnter={() => handleMouseEnter(tab.id)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Tab button */}
                                    <button
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center 
            ${activeTab === tab.id
                                                ? theme === 'light'
                                                    ? 'text-gray-800'
                                                    : 'bg-blue-600 text-white'
                                                : 'text-white hover:bg-white/10'
                                            }`}
                                        style={{
                                            color:
                                                activeTab === tab.id && theme === 'light'
                                                    ? colors.text
                                                    : colors.text,
                                            borderColor: colors.border,
                                            backgroundColor:
                                                activeTab === tab.id && theme === 'light'
                                                    ? colors.activeBackground
                                                    : activeTab === tab.id && theme === 'dark'
                                                        ? '' // leave empty so Tailwind's bg-blue-600 applies
                                                        : 'transparent',
                                        }}
                                    >
                                        {tab.label}
                                    </button>

                                    {/* Tooltip/modal */}
                                    {hoveredTab === tab.id && tabMessages[tab.id] && (
                                        <div className="absolute left-1/3 bottom-12 transform translate-x-1/10 mt-0.5 w-64 z-10">
                                            {/* Tooltip box */}
                                            <div
                                                className="text-sm p-3 rounded-lg shadow-lg"
                                                style={{
                                                    backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                    color: theme === 'light' ? '#000000' : '#ffffff',
                                                    border: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                }}
                                            >
                                                <p className="mb-2">
                                                    {
                                                        tabMessages[tab.id][
                                                        Math.floor(Math.random() * tabMessages[tab.id].length)
                                                        ]
                                                    }
                                                </p>
                                                <a
                                                    href="#"
                                                    className="text-xs font-medium flex items-center justify-end transition-colors"
                                                    style={{
                                                        color: theme === 'light' ? '#2563eb' : '#60a5fa',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color =
                                                            theme === 'light' ? '#1d4ed8' : '#93c5fd';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color =
                                                            theme === 'light' ? '#2563eb' : '#60a5fa';
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleTabClick(tab.id);
                                                    }}
                                                >
                                                    Learn More →
                                                </a>
                                            </div>
                                            {/* Tooltip arrow */}
                                            <div
                                                className="absolute -bottom-[9px] left-6 w-5 h-5 transform rotate-45 z-0"
                                                style={{
                                                    backgroundColor: theme === 'light' ? '#ffffff' : '#3b3b5b',
                                                    borderRight: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                    borderBottom: theme === 'light' ? '1px solid #e5e7eb' : 'none',
                                                }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>


                </div>

                {/* Context Modal */}
                <ContextModal
                    showContextModal={showContextModal}
                    setShowContextModal={setShowContextModal}
                    onDocSelect={handleDocSelect}
                    selectedDocTitles={selectedDocTitles}
                    currentStep={currentStep}
                    goToPreviousStep={goToPreviousStep}
                    goToNextStep={goToNextStep}
                    searchQueries={searchQuery}
                    setSearchQueries={setSearchQuery}
                    onClearSearchQuery={handleClearSearchQuery}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    colors={colors}
                    theme={theme}

                />

                {/* Library Modal */}
                <PromptLibraryModal
                    showLibraryDropdown={showLibraryDropdown}
                    setShowLibraryDropdown={setShowLibraryDropdown}
                    onSourceSelect={handleSourceSelect}
                    onLibraryDocsSelect={handleLibraryDocsSelect}
                    selectedLibraryDocs={selectedLibraryDocs}
                    currentSteps={currentStep}
                    goToPreviousStep={goToPreviousStep}
                    goToNextStep={goToNextStep}
                    searchQueries={searchQuery}
                    setSearchQueries={setSearchQuery}
                    onClearSearchQuery={handleClearSearchQuery}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    colors={colors}
                    theme={theme}
                    setIsSearchFromLibrary={setIsSearchFromLibrary}
                    
                    
                />

                {/* Optimization Modal */}
                {showOptimizationModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="border rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: colors.primaryColor, color: colors.text }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold -mt-4">Prompt Optimization</h2>
                                <button
                                    onClick={() => {
                                        setShowOptimizationModal(false);
                                        setIsLoading(false);
                                    }}
                                    className="text-white -mt-4 hover:text-gray-300 text-2xl"
                                    style={{ color: colors.text }}
                                >
                                    &times;
                                </button>
                            </div>
                            <hr className='-mx-6 -mt-2' />

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1 mt-4">
                                    <h3 className="text-sm font-medium -mb-2">Original Prompt:</h3>
                                    <button
                                        onClick={() => optimizeQuery(searchQuery)}
                                        disabled={!searchQuery.trim() || isLoading}
                                        className={`px-3 py-1 mb-2 text-xs rounded-md transition-colors flex items-center ${!searchQuery.trim() || isLoading
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-3 w-3 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Optimizing...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Optimize Prompt
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={originalPrompt ? originalPrompt : searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (originalPrompt) {
                                            // agar originalPrompt show ho raha hai, to user edit kare to usi ko update karo
                                            setOriginalPrompt(value);
                                            localStorage.setItem("originalPrompt", value);
                                        } else {
                                            // warna searchQuery update hoti rahe
                                            setSearchQuery(value);
                                            setIsSearchFromLibrary(false);

                                            // sirf pehli dafa hi originalPrompt set karo
                                            if (value.trim()) {
                                                setOriginalPrompt(value);
                                                localStorage.setItem("originalPrompt", value);
                                            }
                                        }
                                    }}
                                    className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[100px]"
                                    placeholder="Enter or edit your prompt here..."
                                    style={{ border: theme === 'light' ? '1px solid #e5e7eb' : 'none' }}
                                />


                            </div>

                            <div className="mb-4 -mt-4">
                                <h3 className="text-sm font-medium mb-1">Optimized Prompt:</h3>
                                {isLoading ? (
                                    <div className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Optimizing your prompt...
                                    </div>
                                ) : (
                                    <textarea
                                        value={optimizedQuery}
                                        onChange={(e) => setOptimizedQuery(e.target.value)}
                                        className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px]"
                                        placeholder="Optimized prompt will appear here..."
                                        style={{ border: theme === 'light' ? '1px solid #e5e7eb' : 'none' }}
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                {/* Previous Button with Tooltip */}
                                {/* <div className="relative group"> */}
                                {/* <button
                                        onClick={goToPreviousStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-white" />
                                    </button> */}
                                {/* Tooltip */}
                                {/* <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Add Library
                                    </div> */}
                                {/* </div> */}
                                {/* <button
                                    className="px-4 py-1 text-[13px] bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                                    onClick={() => {
                                        setOptimizedQuery(searchQuery);
                                        setShowOptimizationModal(false);
                                    }}
                                >
                                    Cancel
                                </button> */}
                                <button
                                    className={`px-4 py-1 text-[13px] rounded-md transition-colors ${!isLoading && optimizedQuery
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                        }`}
                                    disabled={isLoading || !optimizedQuery}
                                    onClick={() => {
                                        // Sirf agar originalPrompt empty hai to set karo
                                        if (!originalPrompt) {
                                            localStorage.setItem("originalPrompt", searchQuery);
                                            setOriginalPrompt(searchQuery);
                                        }

                                        setSearchQuery(optimizedQuery); // optimized prompt ko current search bana do
                                        setShowOptimizationModal(false);
                                    }}

                                >
                                    Recommend Optimized Prompt
                                </button>

                                {/* Next Button with Tooltip */}
                                {/* <div className="relative group"> */}
                                {/* <button
                                        onClick={goToNextStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </button> */}
                                {/* Tooltip */}
                                {/* <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Add Context
                                    </div> */}
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {/* {showReplaceConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-[9999]">
                        <div className="border border-gray-300 rounded-lg p-6 w-96 shadow-xl" style={{ backgroundColor: appColors.primaryColor }}>
                            <h3 className="text-lg font-semibold mb-4 text-white">Replace Prompt?</h3>
                            <p className="text-sm mb-6 text-gray-400">
                                Would you like to replace your current prompt with one from the Add-Ons?
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
                {/* Add-Ons Modal */}
                {showAddonsModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="bg-[#2b2b4b] border rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto no-scrollbar" style={{ backgroundColor: colors.primaryColor, color: colors.text }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold -mt-2">Optional Add-Ons</h2>
                                <button
                                    onClick={() => {
                                        // setShowReplaceConfirmation(false);
                                        setShowAddonsModal(false);

                                    }}
                                    className="text-white -mt-3 hover:text-gray-300 text-2xl"
                                    style={{ color: colors.text }}
                                >
                                    &times;
                                </button>
                            </div>
                            <hr className='-mx-6 -mt-2' />
                            <div className="space-y-6 mt-4">
                                {/* Audience Industries - Nested Structure */}
                                <div className='border border-gray-600 p-2 rounded'>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Industries:</label>
                                    <div className="space-y-3 max-h-64 overflow-y-auto p-2 rounded-md">
                                        {/* Professional Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('professional-services')}
                                                    onChange={(e) => handleAddOnChange('industry', 'professional-services', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Professional Services</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('professional-services') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Consulting', 'Legal Services', 'Accounting', 'Staffing & Recruiting', 'Business Consulting, HR & Admin Services'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/,/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['professional-services']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'professional-services')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Manufacturing */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('manufacturing')}
                                                    onChange={(e) => handleAddOnChange('industry', 'manufacturing', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Manufacturing</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('manufacturing') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Industrial Automation', 'Automotive & Aerospace', 'Chemicals & Plastics', 'Electrical/Electronic Manufacturing', 'Machinery'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['manufacturing']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'manufacturing')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Technology, Information & Media */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('technology-information-media')}
                                                    onChange={(e) => handleAddOnChange('industry', 'technology-information-media', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Technology, Information & Media</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('technology-information-media') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['SaaS / Computer Software', 'IT Services & IT Consulting', 'Internet, Cloud, AI, Cybersecurity', 'Telecommunications', 'Publishing, Broadcast, Digital Media'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['technology-information-media']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'technology-information-media')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Government Administration */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('government-administration')}
                                                    onChange={(e) => handleAddOnChange('industry', 'government-administration', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Government Administration</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('government-administration') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Federal & Local Government', 'Public Policy / NGOs', 'International Affairs & Development'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['government-administration']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'government-administration')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Financial Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('financial-services')}
                                                    onChange={(e) => handleAddOnChange('industry', 'financial-services', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Financial Services</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('financial-services') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Banking', 'Insurance', 'Investment Management / Private Equity / Venture Capital', 'FinTech'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['financial-services']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'financial-services')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Accommodation & Food Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('accommodation-food-services')}
                                                    onChange={(e) => handleAddOnChange('industry', 'accommodation-food-services', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Accommodation & Food Services</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('accommodation-food-services') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Hotels & Hospitality', 'Restaurants / Food & Beverage', 'Travel Services'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['accommodation-food-services']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'accommodation-food-services')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Hospitals & Health Care */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('hospitals-health-care')}
                                                    onChange={(e) => handleAddOnChange('industry', 'hospitals-health-care', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Hospitals & Health Care</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('hospitals-health-care') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Hospitals', 'Pharmaceuticals', 'Biotechnology', 'Medical Devices', 'Mental Health & Wellness'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['hospitals-health-care']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'hospitals-health-care')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Education */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('education')}
                                                    onChange={(e) => handleAddOnChange('industry', 'education', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Education</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('education') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Higher Education', 'E-Learning & Training', 'Research Institutions'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['education']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'education')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Entertainment & Media */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('entertainment-media')}
                                                    onChange={(e) => handleAddOnChange('industry', 'entertainment-media', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Entertainment & Media</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('entertainment-media') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Film, Television, Music', 'Sports & Events', 'Gaming & Interactive Media'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/,/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['entertainment-media']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'entertainment-media')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Retail & Consumer Goods */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('retail-consumer-goods')}
                                                    onChange={(e) => handleAddOnChange('industry', 'retail-consumer-goods', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Retail & Consumer Goods</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('retail-consumer-goods') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['General Retail', 'Apparel & Fashion', 'Consumer Products & Personal Care', 'Luxury Goods'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['retail-consumer-goods']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'retail-consumer-goods')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Administrative & Support Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('administrative-support-services')}
                                                    onChange={(e) => handleAddOnChange('industry', 'administrative-support-services', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Administrative & Support Services</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('administrative-support-services') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Facilities Services', 'Outsourcing & BPO', 'HR Support'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['administrative-support-services']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'administrative-support-services')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Construction */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('construction')}
                                                    onChange={(e) => handleAddOnChange('industry', 'construction', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Construction</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('construction') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Civil Engineering', 'Architecture & Planning', 'Residential & Commercial Construction'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['construction']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'construction')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Transportation, Logistics & Supply Chain */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('transportation-logistics-supply-chain')}
                                                    onChange={(e) => handleAddOnChange('industry', 'transportation-logistics-supply-chain', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Transportation, Logistics & Supply Chain</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('transportation-logistics-supply-chain') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Airlines & Aviation', 'Shipping & Ports', 'Trucking & Freight', 'Warehousing & Distribution'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['transportation-logistics-supply-chain']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'transportation-logistics-supply-chain')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Consumer Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('consumer-services')}
                                                    onChange={(e) => handleAddOnChange('industry', 'consumer-services', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Consumer Services</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('consumer-services') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Personal Services', 'Customer Service Operations', 'Repair & Maintenance'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['consumer-services']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'consumer-services')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Real Estate & Equipment Rental Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('real-estate-equipment-rental-services')}
                                                    onChange={(e) => handleAddOnChange('industry', 'real-estate-equipment-rental-services', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Real Estate & Equipment Rental Services</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('real-estate-equipment-rental-services') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Real Estate Development', 'Commercial & Residential Property Management', 'Leasing & Rental Services'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['real-estate-equipment-rental-services']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'real-estate-equipment-rental-services')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Oil, Gas, and Mining */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('oil-gas-mining')}
                                                    onChange={(e) => handleAddOnChange('industry', 'oil-gas-mining', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Oil, Gas, and Mining</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('oil-gas-mining') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Oil & Gas', 'Mining & Metals', 'Renewables (often cross-listed here or under "Utilities")'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\(|\)|"/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['oil-gas-mining']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'oil-gas-mining')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Wholesale & Trade */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('wholesale-trade')}
                                                    onChange={(e) => handleAddOnChange('industry', 'wholesale-trade', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Wholesale & Trade</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('wholesale-trade') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Wholesale Distribution', 'Import/Export'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['wholesale-trade']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'wholesale-trade')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Agriculture, Farming & Forestry */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('agriculture-farming-forestry')}
                                                    onChange={(e) => handleAddOnChange('industry', 'agriculture-farming-forestry', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Agriculture, Farming & Forestry</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('agriculture-farming-forestry') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Farming & Ranching', 'Agribusiness', 'Forestry & Fisheries'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['agriculture-farming-forestry']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'agriculture-farming-forestry')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Utilities */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('utilities')}
                                                    onChange={(e) => handleAddOnChange('industry', 'utilities', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Utilities</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('utilities') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Power Generation & Distribution', 'Water & Waste Management', 'Renewable Energy'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['utilities']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'utilities')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Holding Companies / Conglomerates */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.industry?.hasOwnProperty('holding-companies-conglomerates')}
                                                    onChange={(e) => handleAddOnChange('industry', 'holding-companies-conglomerates', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Holding Companies / Conglomerates</span>
                                            </label>
                                            {addOns.industry?.hasOwnProperty('holding-companies-conglomerates') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Parent Orgs & Investment Holdings'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry['holding-companies-conglomerates']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('industry', itemKey, e.target.checked, 'holding-companies-conglomerates')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience industry..."
                                        className="w-full px-4 py-2 border rounded-md mt-3 transition-colors"
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
                                        onBlur={(e) => {
                                            e.target.style.borderColor = theme === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.2)';
                                            e.target.style.boxShadow = 'none';
                                            handleCustomAddOn('industry', e.target.value);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('industry', e.target.value)}
                                    />
                                </div>

                                {/* Audience Department */}
                                <div className='border border-gray-600 p-2 rounded'>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Departments:</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-3">
                                        {[
                                            'Marketing', 'Sales', 'Customer Success', 'Product', 'Operations',
                                            'Finance', 'Human Resources (HR)', 'Revenue Operations (RevOps)',
                                            'Partner / Channel', 'Executive Leadership', 'Information Technology (IT)',
                                            'Legal', 'Research & Development (R&D)', 'Procurement / Supply Chain', 'C-Suite'
                                        ].map((aud) => (
                                            <label key={aud} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audience.includes(aud.toLowerCase().replace(/ /g, '-'))}
                                                    onChange={(e) => handleAddOnChange('audience', aud.toLowerCase().replace(/ /g, '-'), e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span>{aud}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience departments..."
                                        className="w-full px-4 py-2 border border-white/20 text-white rounded-md"
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
                                        onBlur={(e) => handleCustomAddOn('audience', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('audience', e.target.value)}
                                    />
                                </div>

                                {/* Audience Titles - Nested Structure */}
                                <div className='border border-gray-600 p-2 rounded'>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Titles:</label>
                                    <div className="space-y-3 max-h-64 overflow-y-auto p-2 rounded-md">
                                        {/* Executive */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('executive')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'executive', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Executive</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('executive') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Chief Executive Officer', 'Chief Revenue Officer', 'Chief Sales Officer', 'Chief Marketing Officer', 'Chief Product Officer', 'Chief Financial Officer', 'Chief Customer Officer'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['executive']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'executive')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Marketing */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('marketing')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'marketing', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Marketing</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('marketing') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Marketing Manager', 'Senior Marketing Manager', 'Head of Marketing', 'Director of Marketing', 'VP of Marketing', 'Chief Marketing Officer (CMO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['marketing']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'marketing')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sales */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('sales')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'sales', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Sales</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('sales') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Sales Manager', 'Regional Sales Manager', 'Director of Sales', 'VP of Sales', 'Head of Sales / Sales Leader', 'Chief Revenue Officer (CRO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['sales']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'sales')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Customer Success */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('customer-success')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'customer-success', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Customer Success</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('customer-success') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Customer Success Manager (CSM)', 'Senior Customer Success Manager', 'Head of Customer Success', 'Director of Customer Success', 'VP of Customer Success', 'Chief Customer Officer (CCO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['customer-success']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'customer-success')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Customer Experience (CX) */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('customer-experience')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'customer-experience', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Customer Experience (CX)</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('customer-experience') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Customer Experience Manager', 'CX Program Manager', 'Director of Customer Experience', 'VP of Customer Experience', 'Head of Customer Experience', 'Chief Experience Officer (CXO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['customer-experience']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'customer-experience')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Technology / IT */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('technology-it')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'technology-it', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Technology / IT</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('technology-it') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['IT Manager / Infrastructure Manager', 'Engineering Manager', 'Director of IT / Director of Engineering', 'VP of IT / VP of Engineering', 'Head of Technology', 'Chief Technology Officer (CTO)', 'Chief Information Officer (CIO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['technology-it']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'technology-it')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Finance */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('finance')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'finance', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Finance</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('finance') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Finance Manager', 'Senior Finance Manager', 'Controller', 'Director of Finance', 'VP of Finance', 'Head of Finance', 'Chief Financial Officer (CFO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['finance']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'finance')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Product */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('product')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'product', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Product</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('product') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Product Manager', 'Senior Product Manager', 'Group Product Manager', 'Director of Product Management', 'VP of Product', 'Head of Product', 'Chief Product Officer (CPO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['product']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'product')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Human Resources (HR / People Ops) */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('human-resources')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'human-resources', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Human Resources (HR / People Ops)</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('human-resources') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['HR Manager', 'Talent Acquisition Manager', 'People Operations Manager', 'Director of HR / Director of People', 'VP of HR / VP of People', 'Head of People / Head of HR', 'Chief Human Resources Officer (CHRO)', 'Chief People Officer (CPO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['human-resources']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'human-resources')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Legal */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('legal')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'legal', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Legal</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('legal') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Legal Counsel (Manager-level equivalent)', 'Legal Manager / Senior Legal Manager', 'Director of Legal', 'VP of Legal', 'General Counsel', 'Chief Legal Officer (CLO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['legal']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'legal')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Procurement / Supply Chain */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('procurement-supply-chain')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'procurement-supply-chain', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Procurement / Supply Chain</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('procurement-supply-chain') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Procurement Manager', 'Strategic Sourcing Manager', 'Supply Chain Manager', 'Director of Procurement', 'Director of Supply Chain', 'VP of Procurement / VP of Supply Chain', 'Head of Procurement', 'Chief Procurement Officer (CPO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['procurement-supply-chain']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'procurement-supply-chain')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Operations */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audienceTitles?.hasOwnProperty('operations')}
                                                    onChange={(e) => handleAddOnChange('audienceTitles', 'operations', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Operations</span>
                                            </label>
                                            {addOns.audienceTitles?.hasOwnProperty('operations') && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Operations Manager', 'Business Operations Manager', 'Director of Operations', 'VP of Operations', 'Head of Operations', 'Chief Operating Officer (COO)'].map((item) => {
                                                        const itemKey = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles['operations']?.includes(itemKey) || false}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', itemKey, e.target.checked, 'operations')}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience title..."
                                        className="w-full px-4 py-2 text-white bg-[#3b3b5b] border border-white/20 rounded-md mt-3"
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
                                        onBlur={(e) => handleCustomAddOn('audienceTitles', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('audienceTitles', e.target.value)}
                                    />
                                </div>

                                {/* Audience Tones */}
                                <div className='border border-gray-600 p-2 rounded'>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Tones:</label>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {['Executive-Ready', 'Professional & Polished', 'Conversational & Relatable', 'Insightful & Analytical', 'Challenger / Contrarian', 'Persuasive & Compelling', 'Visionary / Futuristic', 'Trusted Advisor', 'Storytelling / Narrative', 'Succinct & Direct', 'Optimistic & Inspiring', 'Consultative', 'Data-Backed / Research-Driven', 'Peer-to-Peer', 'Urgent & Action-Oriented'].map((tone) => (
                                            <label key={tone} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.tone.includes(tone.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-'))}
                                                    onChange={(e) => handleAddOnChange('tone', tone.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-'), e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span>{tone}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Objective */}
                                <div className='border border-gray-600 p-2 rounded'>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Objective:</label>
                                    <input
                                        type="text"
                                        value={addOns.objective}
                                        onChange={(e) => handleAddOnChange('objective', e.target.value)}
                                        placeholder="Enter your objective..."
                                        className="w-full px-4 py-2 bg-[#3b3b5b] border border-white/20 text-white rounded-md"
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

                                {/* Dos & Don'ts */}
                                <div className='border border-gray-600 p-2 rounded'>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Dos & Don'ts:</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-2">Dos</h4>
                                            <textarea
                                                placeholder="Enter dos..."
                                                value={addOns.advice.do.join('\n')}
                                                onChange={(e) => {
                                                    const dos = e.target.value.split('\n').filter(item => item.trim());
                                                    setAddOns(prev => ({
                                                        ...prev,
                                                        advice: {
                                                            ...prev.advice,
                                                            do: dos
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 bg-[#3b3b5b] text-white border border-white/20 rounded-md h-32"
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
                                        <div>
                                            <h4 className="font-semibold mb-2">Don'ts</h4>
                                            <textarea
                                                placeholder="Enter don'ts..."
                                                value={addOns.advice.dont.join('\n')}
                                                onChange={(e) => {
                                                    const donts = e.target.value.split('\n').filter(item => item.trim());
                                                    setAddOns(prev => ({
                                                        ...prev,
                                                        advice: {
                                                            ...prev.advice,
                                                            dont: donts
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 bg-[#3b3b5b] text-white border border-white/20 rounded-md h-32"
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
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                {/* <button
                                    onClick={() => {
                                        // setShowReplaceConfirmation(false);
                                        setShowAddonsModal(false);

                                    }}
                                    className=" text-[13px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button> */}
                                <button
                                    onClick={() => {
                                        setShowAddonsModal(false);
                                    }}
                                    className="text-[13px] text-white px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    Apply Add-Ons
                                </button>
                                <div className="relative group">
                                    <button
                                        onClick={goToPreviousStep}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{
                                            backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                            color: theme === 'light' ? '#000000' : '#ffffff'
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
                                        <ArrowLeft className="w-4 h-4" />
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
                                        Add Context
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                )}

                {/* Guideline Modal */}
                {showGuideline && (
                    <GuidelineModal
                        step={currentGuidelineStep}
                        onNext={handleGuidelineAction}
                        onSkip={handleGuidelineSkip}
                        onClose={handleGuidelineClose}
                        totalSteps={totalGuidelineSteps}
                        colors={colors}
                        theme={theme}
                    />
                )}
            </div>

            {/* Bottom Left Footer */}
            <div className="fixed bottom-0 left-0 flex items-center gap-3 py-4 px-6">
                <img
                    src={theme === 'light' ? "/ai-navigator-dark-logo.png" : "/ai-navigator-logo.png"}
                    alt="Logo"
                    className="w-30 h-6 object-contain"
                />
                <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 transition-colors"
                    style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.text;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme === 'light' ? '#6b7280' : '#9ca3af';
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {/* Settings Modal */}
            <SettingsModal
                show={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                theme={theme}
                setTheme={setTheme}
            />
        </div >
    );
};

export default Assistant;