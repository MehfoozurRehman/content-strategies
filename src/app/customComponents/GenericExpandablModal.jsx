import { FaTimes, FaCopy, FaChevronDown, FaChevronUp, FaEye, FaDownload, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";
import { appColors } from "@/lib/theme";
import { useState, useEffect } from "react";

const GenericModal = ({ data, onClose, appliedFilters }) => {
    const [copiedField, setCopiedField] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({});
    const [expandedFields, setExpandedFields] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [filteredSections, setFilteredSections] = useState({});
    const [isGuestSectionCollapsed, setIsGuestSectionCollapsed] = useState(true);
    const [copied, setCopied] = useState({ index: null, field: null });
    const ALWAYS_SHOW_FIELDS = ['Prep_Call'];
    const handleCopy = (text, index, field) => {
        navigator.clipboard.writeText(text);
        setCopied({ index, field });

        setTimeout(() => {
            setCopied({ index: null, field: null });
        }, 2000);
    };
    const HIDDEN_FIELDS = [
        'id',
        'Video Title',
        'Emails',
        'Guest Role',
        'Video Description',
        'Transcript',
        'Text comments for the rating (OPTIONAL input from the user)',
        'Episode Title',
        'Guest Company',
        'Quote',
        'Video Length',
        'Mentions',
        'Mentioned_Quotes',
        'Client',
        'Employee',
        'Guest Title',
        'Public_vs_Private',
        'Podbook Link',
        'Article - Extended Media',
        'YouTube Short - Extended Media',
        'YouTube Link',
        'Videos',
        'Videos Link',
        'Challenge Report_Unedited Video Link',
        'Challenge Report_Unedited Transcript Link',
        'Challenge Report_Summary',
        'Podcast Report_Unedited Video Link',
        'Podcast Report_Unedited Transcript Link',
        'Podcast Report_Summary',
        'Post-Podcast Report_Unedited Video Link',
        'Post-Podcast Report_Unedited Transcript Link',
        'Post-Podcast Report_Summary',
        'LinkedIn Video - Extended Media',
        'Post_Podcast_Insights',
        'Article_Transcript',
        'LinkedIn_Video_Transcript',
        'Case_Study',
        'Case_Study_Transcript',
        'YouTube_Short_Transcript',
        'Quote Card - Extended Media',
        'Private Link - Post-Podcast 1',
        'Private Link - Post-Podcast 2',
        'Discussion Guide',
        'Guest Industry',
        'report_link',
        'Full Case Study_Interactive Link',
        'Full Case Study_Copy and Paste Text',
        'Full Case Study_Link To Document',
        'Problem Section_Video Link',
        'Problem Section_Copy and Paste Text',
        'Problem Section_Link To Document',
        'Solution Section_Video Link',
        'Solution Section_Copy and Paste Text',
        'Solution Section_Link To Document',
        'Results Section_Video Link',
        'Results Section_Copy and Paste Text',
        'Results Section_Link To Document',
        'Case Study Video Short_Video Link',
        'Case Study Video Short_Copy and Paste Text',
        'Case Study Video Short_Link To Document',
        'Case Study Other Video_Video Title',
        'Case Study Other Video_Video Link',
        'Case Study Other Video_Copy and Paste Text',
        'Case Study Other Video_Link To Document',
        'Tags',
        'Video_ID',
        'ranking',
        'Ranking Justification',
        'Date Recorded',
        'Episode_Number',
        'total_count',
        'mentioned_count',
        'private_count',
        'public_count',
        'client_count',
        'employee_count',
        'FULL_EPISODE_OTHER_CASE_STUDY',
        'FULL_EPISODE_ICP_ADVICE',
        'FULL_EPISODE_CHALLENGE_QUESTIONS'
    ];





    const FULL_EPISODE_FIELD_GROUPS = {
        DETAILS_FULL_EPISODES: ['DETAILS_FULL_EPISODES'],
        FULL_EPISODE_VIDEO: ['FULL_EPISODE_VIDEO'],
        FULL_EPISODE_HIGHLIGHT_VIDEO: ['FULL_EPISODE_HIGHLIGHT_VIDEO'],
        FULL_EPISODE_QA_VIDEOS: ['FULL_EPISODE_QA_VIDEOS'],
        FULL_EPISODE_INTRODUCTION_VIDEO: ['FULL_EPISODE_INTRODUCTION_VIDEO'],
        FULL_EPISODE_PODBOOK: ['FULL_EPISODE_PODBOOK'],
        FULL_EPISODE_EXTENDED_CONTENT: ['FULL_EPISODE_EXTENDED_CONTENT'],
    };


    const REPORTS_FIELD_GROUPS = {
        ICP_Advice_Report: ['ICP_Advice_Report'],
        SQL_Analysis_Report: ['SQL_Analysis_Report'],
        Challenge_Questions: ['Challenge_Questions']
    };
    const MULTI_CHALLENGE_GROUP = {
        FULL_EPISODE_FULL_CASE_STUDY: ['FULL_EPISODE_FULL_CASE_STUDY'],
        FULL_EPISODE_ONE_PAGE_CASE_STUDY: ['FULL_EPISODE_ONE_PAGE_CASE_STUDY'],
        eBook: ['eBook'],
        'Multi-Guest_Challenge_Report_Text': ['Multi-Guest_Challenge_Report_Text']
    };


    // ---------- Helpers ----------
    const safeParseJSON = (input) => {
        if (input === null || input === undefined) return input;
        if (typeof input !== "string") return input;
        const trimmed = input.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            try {
                return JSON.parse(trimmed);
            } catch (e) {
                // not valid JSON -> return original string
                return input;
            }
        }
        return input;
    };

    // Normalize object keys for flexible lookup
    const getFieldValueFromObj = (obj, candidateKeys = []) => {
        if (!obj || typeof obj !== "object") return undefined;
        const normMap = {};
        Object.keys(obj).forEach(k => {
            const nk = k.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
            normMap[nk] = k;
        });
        for (const cand of candidateKeys) {
            const nc = cand.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
            if (normMap[nc]) return obj[normMap[nc]];
        }
        // fallback: try common keys
        const fallbacks = ["name", "guest", "guestname", "fullName", "fullname"];
        for (const f of fallbacks) {
            const nf = f.toLowerCase().replace(/\s+/g, "");
            if (normMap[nf]) return obj[normMap[nf]];
        }
        return undefined;
    };

    const titleCase = (str) => {
        return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };


    // ---------- Sections detection (with JSON parsing) ----------
    // Update the detectSections function to handle Full Episode filtering properly
    const detectSections = () => {
        const sections = {};
        const videoTypeFilters = appliedFilters?.["Video Type"] || [];

        if (!data || typeof data !== "object") return sections;

        // Initialize Full Episodes wrapper
        const fullEpisodeSections = {};
        const reportSections = {};
        const multiChallengeSections = {};

        Object.keys(data).forEach(key => {
            if (HIDDEN_FIELDS.includes(key) || key === "Guest" || key === "Avatar") return;

            // 🔹 Detect if key belongs to FULL_EPISODE groups
            let foundInGroup = false;
            let matchedGroupKey = null;

            // First, check if this key belongs to any Full Episode group
            for (const [groupKey, fields] of Object.entries(FULL_EPISODE_FIELD_GROUPS)) {
                if (fields.includes(key)) {
                    foundInGroup = true;
                    matchedGroupKey = groupKey;

                    // If filters are active and this group doesn't match any filter, skip it
                    if (videoTypeFilters.length > 0) {
                        const normalizedGroupKey = groupKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const hasMatch = videoTypeFilters.some(filter => {
                            const normalizedFilter = filter.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return normalizedGroupKey.includes(normalizedFilter) || normalizedFilter.includes(normalizedGroupKey);
                        });

                        // If no match found and filters are active, skip this group
                        if (!hasMatch) {
                            foundInGroup = false;
                            matchedGroupKey = null;
                            return; // Skip this key entirely
                        }
                    }

                    const specialTitles = {
                        "QA VIDEOS": "QA Videos",
                        "ICP ADVICE": "ICP Advice",
                        "DETAILS_FULL_EPISODES": "Details"
                    };

                    let groupTitle = titleCase(
                        groupKey.replace(/^FULL_EPISODE_/, '').replace(/_/g, ' ')
                    );
                    if (groupKey === "DETAILS_FULL_EPISODES") {
                        groupTitle = "Details";
                    }
                    if (specialTitles[groupTitle.toUpperCase()]) {
                        groupTitle = specialTitles[groupTitle.toUpperCase()];
                    }

                    if (!fullEpisodeSections[groupKey]) {
                        fullEpisodeSections[groupKey] = { title: groupTitle, data: [], collapsed: true };
                    }

                    const parsed = safeParseJSON(data[key]);

                    if (Array.isArray(parsed)) {
                        if (parsed.length > 0) {
                            fullEpisodeSections[groupKey].data.push(...parsed);
                        } else {
                            fullEpisodeSections[groupKey].data.push({ message: "No data found" });
                        }
                    } else if (parsed) {
                        fullEpisodeSections[groupKey].data.push(parsed);
                    } else {
                        fullEpisodeSections[groupKey].data.push({ message: "No data found" });
                    }

                    break;
                }
            }
            let foundInReportGroup = false;
            let matchedReportGroupKey = null;
            for (const [groupKey, fields] of Object.entries(REPORTS_FIELD_GROUPS)) {
                if (fields.includes(key)) {
                    foundInReportGroup = true;
                    matchedReportGroupKey = groupKey;

                    // Handle filtering if needed
                    if (videoTypeFilters.length > 0) {
                        const normalizedGroupKey = groupKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const hasMatch = videoTypeFilters.some(filter => {
                            const normalizedFilter = filter.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return normalizedGroupKey.includes(normalizedFilter) || normalizedFilter.includes(normalizedGroupKey);
                        });

                        if (!hasMatch) {
                            foundInReportGroup = false;
                            matchedReportGroupKey = null;
                            return;
                        }
                    }

                    const reportTitles = {
                        "ICP_Advice_Report": "ICP Advice Report",
                        "SQL_Analysis_Report": "SQL Analysis Report",
                        "Challenge_Questions": "Challenge Questions"
                    };

                    if (!reportSections[groupKey]) {
                        reportSections[groupKey] = {
                            title: reportTitles[groupKey] || titleCase(groupKey.replace(/_/g, ' ')),
                            data: [],
                            collapsed: true
                        };
                    }

                    const parsed = safeParseJSON(data[key]);

                    if (Array.isArray(parsed)) {
                        if (parsed.length > 0) {
                            reportSections[groupKey].data.push(...parsed);
                        } else {
                            reportSections[groupKey].data.push({ message: "No data found" });
                        }
                    } else if (parsed) {
                        reportSections[groupKey].data.push(parsed);
                    } else {
                        reportSections[groupKey].data.push({ message: "No data found" });
                    }

                    break;
                }

            }

            let foundInMultiChallengeGroup = false;
            let matchedMultiChallengeGroupKey = null;

            // MULTI_CHALLENGE_GROUP detection
            for (const [groupKey, fields] of Object.entries(MULTI_CHALLENGE_GROUP)) {
                if (fields.includes(key)) {
                    foundInMultiChallengeGroup = true;
                    matchedMultiChallengeGroupKey = groupKey;

                    // Handle filtering if needed
                    if (videoTypeFilters.length > 0) {
                        const normalizedGroupKey = groupKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const hasMatch = videoTypeFilters.some(filter => {
                            const normalizedFilter = filter.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return normalizedGroupKey.includes(normalizedFilter) || normalizedFilter.includes(normalizedGroupKey);
                        });

                        if (!hasMatch) {
                            foundInMultiChallengeGroup = false;
                            matchedMultiChallengeGroupKey = null;
                            return;
                        }
                    }

                    const multiChallengeTitles = {
                        "FULL_EPISODE_FULL_CASE_STUDY": "Full Case Study",
                        "FULL_EPISODE_ONE_PAGE_CASE_STUDY": "One Page Case Study",
                        "eBook": "eBook",
                        "Multi-Guest_Challenge_Report_Text": "Multi Guest Challenge Report"
                    };

                    if (!multiChallengeSections[groupKey]) {
                        multiChallengeSections[groupKey] = {
                            title: multiChallengeTitles[groupKey] || titleCase(groupKey.replace(/_/g, ' ')),
                            data: [],
                            collapsed: true
                        };
                    }

                    const parsed = safeParseJSON(data[key]);

                    if (Array.isArray(parsed)) {
                        if (parsed.length > 0) {
                            multiChallengeSections[groupKey].data.push(...parsed);
                        } else {
                            multiChallengeSections[groupKey].data.push({ message: "No data found" });
                        }
                    } else if (parsed) {
                        multiChallengeSections[groupKey].data.push(parsed);
                    } else {
                        multiChallengeSections[groupKey].data.push({ message: "No data found" });
                    }

                    break;
                }
            }
            if (foundInMultiChallengeGroup) return;
            // If we found this key in a Report group, skip further processing
            if (foundInReportGroup) return;
            // If we found this key in a Full Episode group, skip further processing
            if (foundInGroup) return;

            // ✅ Always show fields (except we conditionally handle Additional_Guest_Projects below)
            if (ALWAYS_SHOW_FIELDS.includes(key)) {
                const parsed = safeParseJSON(data[key]);
                sections[key] = {
                    title: titleCase(key),
                    data: Array.isArray(parsed) ? parsed : [{ [key]: parsed }]
                };
                return;
            }

            // Special-case: Only show Additional_Guest_Projects when data exists
            if (key === 'Additional_Guest_Projects') {
                const parsed = safeParseJSON(data[key]);
                let items = [];
                if (Array.isArray(parsed)) {
                    items = parsed.filter(it => {
                        if (it === null || it === undefined || it === '') return false;
                        if (typeof it === 'object') return Object.keys(it).length > 0 && hasValidData(it);
                        if (typeof it === 'string') return it.trim().length > 0;
                        return true;
                    });
                } else if (parsed && typeof parsed === 'object') {
                    items = hasValidData(parsed) ? [parsed] : [];
                } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
                    items = [{ [key]: parsed }];
                }

                if (items.length > 0) {
                    sections[key] = {
                        title: titleCase(key),
                        data: items
                    };
                }
                return; // whether added or not, we handled this key
            }

            // Skip normalized fields
            if (['Themes', 'Validations', 'Objections', 'Challenges', 'Sales Insights', 'Case_Study_Other_Video', 'Video Type'].includes(key)) {
                return;
            }

            // Handle filters - if video type filters are active, only show matching sections
            if (videoTypeFilters.length > 0) {
                const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                const hasMatch = videoTypeFilters.some(filter => {
                    const normalizedFilter = filter.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return normalizedKey.includes(normalizedFilter) || normalizedFilter.includes(normalizedKey);
                });

                if (!hasMatch) return;
            }

            // Generic fallback - only create sections for non-Full Episode data
            const parsedValue = safeParseJSON(data[key]);
            if (Array.isArray(parsedValue) && parsedValue.length > 0 && typeof parsedValue[0] === "object") {
                sections[key] = { title: titleCase(key), data: parsedValue };
            } else if (typeof parsedValue === "object" && parsedValue !== null) {
                sections[key] = { title: titleCase(key), data: [parsedValue] };
            } else {
                sections[key] = {
                    title: titleCase(key),
                    data: parsedValue === null || parsedValue === '' ? [] : [{ [key]: parsedValue }]
                };
            }
        });

        // 🔹 Finally, wrap ALL Full Episodes under one main section
        // But only if there are any Full Episode sections to show
        if (Object.keys(fullEpisodeSections).length > 0) {
            sections["FULL_EPISODES_SECTION"] = {
                title: "Full Episode Details",
                children: fullEpisodeSections
            };
        }
        if (Object.keys(reportSections).length > 0) {
            sections["REPORTS_SECTION"] = {
                title: "Reports",
                children: reportSections
            };
        }
        // Add this after the REPORTS_SECTION in the detectSections function
        if (Object.keys(multiChallengeSections).length > 0) {
            sections["MULTI_CHALLENGE_GROUP_SECTION"] = {
                title: "Special Projects",
                children: multiChallengeSections
            };
        }
        console.log("Final sections structure:", sections);
        return sections;
    };
    // initialize filtered sections and collapsed state
   useEffect(() => {
        const sections = detectSections();
        console.log("Detected sections:", sections); // Debug log
        setFilteredSections(sections);

        // initialize collapsed state for each section (default:true collapsed)
        const init = {};
        Object.keys(sections).forEach(k => {
            console.log("Section key:", k); // Debug log
            init[k] = true;

            // If this is the Full Episodes section with children, also initialize
            //  child sections gfggg
            if (k === "FULL_EPISODES_SECTION" && sections[k].children) {
                Object.keys(sections[k].children).forEach(childKey => {
                    init[childKey] = true; // Initialize child sections as collapsed by default
                });
            }
            // If this is the Reports section with children
            if (k === "REPORTS_SECTION" && sections[k].children) {
                Object.keys(sections[k].children).forEach(childKey => {
                    init[childKey] = true;
                });
            }
            if (k === "MULTI_CHALLENGE_GROUP_SECTION" && sections[k].children) {
                Object.keys(sections[k].children).forEach(childKey => {
                    init[childKey] = true;
                });
            }
        });
        setCollapsedSections(prev => ({ ...init, ...prev }));
    }, [data, appliedFilters]);

    const handlePreview = async (url) => {
        if (!url) return;

        // Special case: LinkedIn
        if (url.includes("linkedin.com")) {
            window.open(url, "_blank", "noopener,noreferrer");
            return;
        }

        try {
            const response = await fetch(url, { method: "HEAD" });

            if (response.ok) {
                // ✅ Valid document → preview it
                setPreviewUrl(url);
                setErrorMessage(null);
            } else {
                // ❌ Server responded but not OK
                setErrorMessage("Unable to open document: The link is not accessible");
                setPreviewUrl(null);
            }
        } catch (error) {
            // ❌ Request failed completely
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
            setPreviewUrl(null);
        }
    };



    const toggleSection = (sectionId) => {
        // Ensure only one dropdown is open at a time
        setIsGuestSectionCollapsed(true);
        setCollapsedSections(prev => {
            const next = { ...prev };

            // Collapse everything first
            Object.keys(next).forEach(k => {
                next[k] = true;
            });

            const multiChallengeChildren = filteredSections?.MULTI_CHALLENGE_GROUP_SECTION?.children || {};
            const reportsChildren = filteredSections?.REPORTS_SECTION?.children || {};
            const fullEpisodesChildren = filteredSections?.FULL_EPISODES_SECTION?.children || {};

            if (multiChallengeChildren[sectionId]) {
                next["MULTI_CHALLENGE_GROUP_SECTION"] = false;
                next[sectionId] = !prev[sectionId];
                // Close other children
                Object.keys(multiChallengeChildren).forEach(childKey => {
                    if (childKey !== sectionId) next[childKey] = true;
                });
            } else if (reportsChildren[sectionId]) {
                next["REPORTS_SECTION"] = false;
                next[sectionId] = !prev[sectionId];
                // Close other children
                Object.keys(reportsChildren).forEach(childKey => {
                    if (childKey !== sectionId) next[childKey] = true;
                });
            } else if (fullEpisodesChildren[sectionId]) {
                next["FULL_EPISODES_SECTION"] = false;
                next[sectionId] = !prev[sectionId];
                // Close other children
                Object.keys(fullEpisodesChildren).forEach(childKey => {
                    if (childKey !== sectionId) next[childKey] = true;
                });
            } else {
                // Top-level section toggle
                next[sectionId] = !prev[sectionId];
            }



            return next;
        });
    };

    const toggleExpandField = (fieldId) => {
        setExpandedFields(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    const copyToClipboard = (text, fieldName) => {
        if (typeof text === 'object') {
            text = JSON.stringify(text, null, 2);
        }
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedField(fieldName);
                setTimeout(() => setCopiedField(null), 1500);
            })
            .catch(err => {
                console.log('Failed to copy text: ', err);
            });
    };

    const shouldShowPreviewIcon = (key) => {
        const previewFields = [
            'transcript', 'details', 'text', 'email', 'report',
            'comments', 'hashtags', 'guide', 'video details',
            'insights', 'vision', 'challenge report', 'ebooks', 'cold', 'guest', 'warm', 'short and long-tail seo keywords', 'full episode quote card',
            'highlight video file', 'qav1 quote card', 'introduction video file', 'podbook interactive link', 'podbook presentation', 'icp advice post-podcast video file',
            'sql analysis post-podcast video file', 'challenge questions prep call video file', 'custom requests', 'provocative statements','ebook interactive link'
        ];
        return previewFields.some(field => key.toLowerCase().includes(field));
    };

    const hasValidData = (item) => {
        return Object.values(item).some(value => {
            if (value === null || value === undefined || value === '') return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;

            // Check if it's a string with only whitespace
            if (typeof value === 'string' && value.trim().length === 0) return false;

            return true;
        });
    };
    const renderFieldValue = (value, fieldId, fieldKey) => {
        // Return null for empty values to hide the field completely
        if (value === null || value === undefined || value === '') {
            return null;
        }

        // If the value is a JSON-string, parse and pretty print
        const parsed = (typeof value === 'string') ? safeParseJSON(value) : value;

        // Return null for empty objects
        if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
            return null;
        }

        // Handle object values
        if (typeof parsed === 'object') {
            return (
                <pre className="text-sm bg-gray-700 p-2 rounded overflow-x-auto text-gray-300">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            );
        }

        // Handle URL values
        if (typeof parsed === 'string' && parsed.startsWith('http')) {
            return (
                <a
                    href={parsed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                >
                    {parsed.length > 90 ? `${parsed.substring(0, 90)}...` : parsed}
                </a>
            );
        }

        // Handle text values with expand/collapse
        const isExpanded = expandedFields[fieldId];
        const displayText = isExpanded ? parsed : (parsed.length > 100 ? `${parsed.substring(0, 100)}...` : parsed);

        return (
            <div className="text-gray-300 whitespace-pre-wrap break-all text-sm">
                {displayText}
                {parsed.length > 100 && (
                    <button
                        onClick={() => toggleExpandField(fieldId)}
                        className="text-blue-400 hover:text-blue-300 ml-1 text-xs"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        );

    };

    const renderSection = (sectionId, sectionData) => {
        console.log("Rendering section:", sectionId, "with data:", sectionData); // Debug log

        // In the renderSection function, add this case after the REPORTS_SECTION handling
        // If this is the Multi Challenge Group section with children
        if (sectionId === "MULTI_CHALLENGE_GROUP_SECTION" && sectionData.children) {
            console.log("Found MULTI_CHALLENGE_GROUP_SECTION with children");
            const hasData = Object.values(sectionData.children).some(child =>
                Array.isArray(child.data) && child.data.some(item => hasValidData(item))
            );

            return (
                <div key={sectionId} className="mb-6">
                    <div
                        className={`flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 transition-all duration-200 ${collapsedSections[sectionId] ? 'bg-gray-800/50' : 'bg-gray-800/70 shadow-md'}`}
                        onClick={() => toggleSection(sectionId)}
                    >
                        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                            <span className="px-2 py-1 rounded-md text-sm">
                                {sectionData.title}
                            </span>
                        </h3>
                        {collapsedSections[sectionId] ? (
                            <FaChevronDown className="text-gray-400 transition-transform duration-200" />
                        ) : (
                            <FaChevronUp className="text-gray-400 transition-transform duration-200" />
                        )}
                    </div>

                    {!collapsedSections[sectionId] && (
                        <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                            {hasData ? (
                                Object.entries(sectionData.children).map(([childId, childData]) => {
                                    const childHasData = Array.isArray(childData.data) &&
                                        childData.data.some(item => hasValidData(item));

                                    if (!childHasData) return null;

                                    return (
                                        <div key={childId} className="mb-4">
                                            <div
                                                className={`flex justify-between items-center cursor-pointer p-3 rounded-lg border border-gray-600 transition-all duration-200 ${collapsedSections[childId] ? "bg-gray-800/50" : "bg-gray-800/70 shadow-md"}`}
                                                onClick={() => toggleSection(childId)}
                                            >
                                                <h3 className="text-sm font-semibold text-gray-200">
                                                    {childData.title}
                                                </h3>
                                                {collapsedSections[childId] ? (
                                                    <FaChevronRight className="text-gray-400" />
                                                ) : (
                                                    <FaChevronDown className="text-gray-400" />
                                                )}
                                            </div>

                                            {!collapsedSections[childId] && (
                                                <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                                                    {childData.data.map((item, idx) => {
                                                        if (!hasValidData(item)) return null;

                                                        return (
                                                            <div
                                                                key={`${childId}-${idx}`}
                                                                className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 shadow-md hover:shadow-lg transition-shadow duration-200"
                                                            >
                                                                {Object.entries(item).map(([key, value]) => {
                                                                    const fieldId = `${childId}-${key}-${idx}`;
                                                                    const showPreview = shouldShowPreviewIcon(key) && typeof value === 'string' && value.trim().length > 0;
                                                                    const fieldValue = renderFieldValue(value, fieldId, key);

                                                                    // Skip rendering if field value is empty (null)
                                                                    if (fieldValue === null) return null;

                                                                    return (
                                                                        <div key={key} className="mb-4 last:mb-0 group">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <label className="font-medium text-gray-300 flex items-center gap-2">
                                                                                    <span className="px-2 py-0.5 rounded text-sm bold">
                                                                                        {titleCase(key)}
                                                                                    </span>
                                                                                </label>
                                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    {copiedField === fieldId && (
                                                                                        <span className="text-xs text-green-400 animate-pulse">Copied!</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start gap-2">
                                                                                <div className="flex-1 border border-gray-600 p-3 rounded shadow-inner">
                                                                                    {renderFieldValue(value, fieldId, key)}
                                                                                </div>
                                                                                <div className="flex flex-col gap-2 mt-1">
                                                                                    <button
                                                                                        onClick={() => copyToClipboard(value, fieldId)}
                                                                                        className="p-1 text-yellow-300 hover:text-white bg-yellow-600/20 rounded hover:bg-yellow-600/40 transition-colors"
                                                                                        title="Copy"
                                                                                    >
                                                                                        <FaCopy size={14} />
                                                                                    </button>
                                                                                    {showPreview && (
                                                                                        <button
                                                                                            onClick={() => handlePreview(value)}
                                                                                            className="p-1 text-blue-300 hover:text-white bg-blue-600/20 rounded hover:bg-blue-600/40 transition-colors"
                                                                                            title="Preview"
                                                                                        >
                                                                                            <FaEye size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 text-gray-400 text-center shadow-inner">
                                    No data available
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        // If this is the Reports section with children
        if (sectionId === "REPORTS_SECTION" && sectionData.children) {
            console.log("Found REPORTS_SECTION with children");
            const hasData = Object.values(sectionData.children).some(child =>
                Array.isArray(child.data) && child.data.some(item => hasValidData(item))
            );

            return (
                <div key={sectionId} className="mb-6">
                    <div
                        className={`flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 transition-all duration-200 ${collapsedSections[sectionId] ? 'bg-gray-800/50' : 'bg-gray-800/70 shadow-md'}`}
                        onClick={() => toggleSection(sectionId)}
                    >
                        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                            <span className="px-2 py-1 rounded-md text-sm">
                                {sectionData.title}
                            </span>
                        </h3>
                        {collapsedSections[sectionId] ? (
                            <FaChevronDown className="text-gray-400 transition-transform duration-200" />
                        ) : (
                            <FaChevronUp className="text-gray-400 transition-transform duration-200" />
                        )}
                    </div>

                    {!collapsedSections[sectionId] && (
                        <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                            {hasData ? (
                                Object.entries(sectionData.children).map(([childId, childData]) => {
                                    const childHasData = Array.isArray(childData.data) &&
                                        childData.data.some(item => hasValidData(item));

                                    if (!childHasData) return null;

                                    return (
                                        <div key={childId} className="mb-4">
                                            <div
                                                className={`flex justify-between items-center cursor-pointer p-3 rounded-lg border border-gray-600 transition-all duration-200 ${collapsedSections[childId] ? "bg-gray-800/50" : "bg-gray-800/70 shadow-md"}`}
                                                onClick={() => toggleSection(childId)}
                                            >
                                                <h3 className="text-sm font-semibold text-gray-200">
                                                    {childData.title}
                                                </h3>
                                                {collapsedSections[childId] ? (
                                                    <FaChevronRight className="text-gray-400" />
                                                ) : (
                                                    <FaChevronDown className="text-gray-400" />
                                                )}
                                            </div>

                                            {!collapsedSections[childId] && (
                                                <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                                                    {childData.data.map((item, idx) => {
                                                        if (!hasValidData(item)) return null;

                                                        return (
                                                            <div
                                                                key={`${childId}-${idx}`}
                                                                className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 shadow-md hover:shadow-lg transition-shadow duration-200"
                                                            >
                                                                {Object.entries(item).map(([key, value]) => {
                                                                    const fieldId = `${childId}-${key}-${idx}`;
                                                                    const showPreview = shouldShowPreviewIcon(key) && typeof value === 'string' && value.trim().length > 0;
                                                                    const fieldValue = renderFieldValue(value, fieldId, key);

                                                                    // Skip rendering if field value is empty (null)
                                                                    if (fieldValue === null) return null;

                                                                    return (
                                                                        <div key={key} className="mb-4 last:mb-0 group">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <label className="font-medium text-gray-300 flex items-center gap-2">
                                                                                    <span className="px-2 py-0.5 rounded text-sm bold">
                                                                                        {titleCase(key)}
                                                                                    </span>
                                                                                </label>
                                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    {copiedField === fieldId && (
                                                                                        <span className="text-xs text-green-400 animate-pulse">Copied!</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start gap-2">
                                                                                <div className="flex-1 border border-gray-600 p-3 rounded shadow-inner">
                                                                                    {renderFieldValue(value, fieldId, key)}
                                                                                </div>
                                                                                <div className="flex flex-col gap-2 mt-1">
                                                                                    <button
                                                                                        onClick={() => copyToClipboard(value, fieldId)}
                                                                                        className="p-1 text-yellow-300 hover:text-white bg-yellow-600/20 rounded hover:bg-yellow-600/40 transition-colors"
                                                                                        title="Copy"
                                                                                    >
                                                                                        <FaCopy size={14} />
                                                                                    </button>
                                                                                    {showPreview && (
                                                                                        <button
                                                                                            onClick={() => handlePreview(value)}
                                                                                            className="p-1 text-blue-300 hover:text-white bg-blue-600/20 rounded hover:bg-blue-600/40 transition-colors"
                                                                                            title="Preview"
                                                                                        >
                                                                                            <FaEye size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 text-gray-400 text-center shadow-inner">
                                    No data available
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        // If this is the Details Full Episodes section with children
        if (sectionId === "FULL_EPISODES_SECTION" && sectionData.children) {
            console.log("Found DETAILS_FULL_EPISODES with children"); // Debug log
            const hasData = Object.values(sectionData.children).some(child =>
                Array.isArray(child.data) && child.data.some(item => hasValidData(item))
            );

            return (
                <div key={sectionId} className="mb-6">
                    <div
                        className={`flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 transition-all duration-200 ${collapsedSections[sectionId] ? 'bg-gray-800/50' : 'bg-gray-800/70 shadow-md'}`}
                        onClick={() => toggleSection(sectionId)}
                    >
                        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                            <span className="px-2 py-1 rounded-md text-sm">
                                {sectionData.title}
                            </span>
                        </h3>
                        {collapsedSections[sectionId] ? (
                            <FaChevronDown className="text-gray-400 transition-transform duration-200" />
                        ) : (
                            <FaChevronUp className="text-gray-400 transition-transform duration-200" />
                        )}
                    </div>

                    {!collapsedSections[sectionId] && (
                        <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                            {hasData ? (
                                Object.entries(sectionData.children).map(([childId, childData]) => {
                                    const childHasData = Array.isArray(childData.data) &&
                                        childData.data.some(item => hasValidData(item));

                                    if (!childHasData) return null;

                                    return (
                                        <div key={childId} className="mb-4">
                                            <div
                                                className={`flex justify-between items-center cursor-pointer p-3 rounded-lg border border-gray-600 transition-all duration-200 ${collapsedSections[childId] ? "bg-gray-800/50" : "bg-gray-800/70 shadow-md"}`}
                                                onClick={() => toggleSection(childId)}
                                            >
                                                <h3 className="text-sm font-semibold text-gray-200">
                                                    {childData.title}
                                                </h3>
                                                {collapsedSections[childId] ? (
                                                    <FaChevronRight className="text-gray-400" />
                                                ) : (
                                                    <FaChevronDown className="text-gray-400" />
                                                )}
                                            </div>

                                            {!collapsedSections[childId] && (
                                                <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                                                    {childData.data.map((item, idx) => {
                                                        if (!hasValidData(item)) return null;

                                                        return (
                                                            <div
                                                                key={`${childId}-${idx}`}
                                                                className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 shadow-md hover:shadow-lg transition-shadow duration-200"
                                                            >
                                                                {Object.entries(item).map(([key, value]) => {
                                                                    const fieldId = `${childId}-${key}-${idx}`;
                                                                    const showPreview = shouldShowPreviewIcon(key) && typeof value === 'string' && value.trim().length > 0;
                                                                    const fieldValue = renderFieldValue(value, fieldId, key);

                                                                    // Skip rendering if field value is empty (null)
                                                                    if (fieldValue === null) return null;
                                                                    // For QA Videos, adjust QAV label number per item index
                                                                    const displayLabel = (() => {
                                                                        if (childId === 'FULL_EPISODE_QA_VIDEOS') {
                                                                            const replaced = key.replace(/QAV\d+/i, `QAV${idx + 1}`);
                                                                            const match = replaced.match(/(QAV\d+)(.*)/i);
                                                                            if (match) {
                                                                                const prefix = match[1].toUpperCase();
                                                                                const rest = titleCase(match[2].trim());
                                                                                return `${prefix}${rest ? ' ' + rest : ''}`;
                                                                            }
                                                                            return replaced.toUpperCase();
                                                                        }
                                                                        return titleCase(key);
                                                                    })();
                                                                    return (
                                                                        <div key={key} className="mb-4 last:mb-0 group">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <label className="font-medium text-gray-300 flex items-center gap-2">
                                                                                    <span className="px-2 py-0.5 rounded text-sm bold">
                                                                                        {displayLabel}
                                                                                    </span>
                                                                                </label>
                                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    {copiedField === fieldId && (
                                                                                        <span className="text-xs text-green-400 animate-pulse">Copied!</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start gap-2">
                                                                                <div className="flex-1 border border-gray-600 p-3 rounded shadow-inner">
                                                                                    {renderFieldValue(value, fieldId, key)}
                                                                                </div>
                                                                                <div className="flex flex-col gap-2 mt-1">
                                                                                    <button
                                                                                        onClick={() => copyToClipboard(value, fieldId)}
                                                                                        className="p-1 text-yellow-300 hover:text-white bg-yellow-600/20 rounded hover:bg-yellow-600/40 transition-colors"
                                                                                        title="Copy"
                                                                                    >
                                                                                        <FaCopy size={14} />
                                                                                    </button>
                                                                                    {showPreview && (
                                                                                        <button
                                                                                            onClick={() => handlePreview(value)}
                                                                                            className="p-1 text-blue-300 hover:text-white bg-blue-600/20 rounded hover:bg-blue-600/40 transition-colors"
                                                                                            title="Preview"
                                                                                        >
                                                                                            <FaEye size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 text-gray-400 text-center shadow-inner">
                                    No data available
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        // Regular section
        const hasData = Array.isArray(sectionData.data)
            ? sectionData.data.some(item => hasValidData(item))
            : false;

        return (
            <div key={sectionId} className="mb-6">
                <div
                    className={`flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 transition-all duration-200 ${collapsedSections[sectionId] ? 'bg-gray-800/50' : 'bg-gray-800/70 shadow-md'}`}
                    onClick={() => toggleSection(sectionId)}
                >
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md text-sm">
                            {sectionData.title}
                        </span>
                    </h3>
                    {collapsedSections[sectionId] ? (
                        <FaChevronDown className="text-gray-400 transition-transform duration-200" />
                    ) : (
                        <FaChevronUp className="text-gray-400 transition-transform duration-200" />
                    )}
                </div>

                {!collapsedSections[sectionId] && (
                    <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                        {hasData ? (
                            sectionData.data.map((item, idx) => {
                                if (!hasValidData(item)) return null;

                                return (
                                    <div
                                        key={`${sectionId}-${idx}`}
                                        className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 shadow-md hover:shadow-lg transition-shadow duration-200"
                                    >
                                        {Object.entries(item).map(([key, value]) => {
                                            if (sectionId.toLowerCase().includes('emails') && key.toLowerCase() === 'category') {
                                                return null;
                                            }
                                            const fieldId = `${sectionId}-${key}-${idx}`;
                                            const showPreview = shouldShowPreviewIcon(key) && typeof value === 'string' && value.trim().length > 0;
                                            const fieldValue = renderFieldValue(value, fieldId, key);

                                            // Skip rendering if field value is empty (null)
                                            if (fieldValue === null) return null;
                                            return (
                                                <div key={key} className="mb-4 last:mb-0 group">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="font-medium text-gray-300 flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-sm bold">
                                                                {titleCase(key)}
                                                            </span>
                                                        </label>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {copiedField === fieldId && (
                                                                <span className="text-xs text-green-400 animate-pulse">Copied!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1 border border-gray-600 p-3 rounded shadow-inner">
                                                            {renderFieldValue(value, fieldId, key)}
                                                        </div>
                                                        <div className="flex flex-col gap-2 mt-1">
                                                            <button
                                                                onClick={() => copyToClipboard(value, fieldId)}
                                                                className="p-1 text-yellow-300 hover:text-white bg-yellow-600/20 rounded hover:bg-yellow-600/40 transition-colors"
                                                                title="Copy"
                                                            >
                                                                <FaCopy size={14} />
                                                            </button>
                                                            {showPreview && (
                                                                <button
                                                                    onClick={() => handlePreview(value)}
                                                                    className="p-1 text-blue-300 hover:text-white bg-blue-600/20 rounded hover:bg-blue-600/40 transition-colors"
                                                                    title="Preview"
                                                                >
                                                                    <FaEye size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 text-gray-400 text-center shadow-inner">
                                No data available
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // ---------- Build guest cards safely (parse JSON strings if needed) ----------
    const rawGuests = safeParseJSON(data?.Guest);
    const guestsArray = Array.isArray(rawGuests) ? rawGuests : (rawGuests ? [rawGuests] : []);

    const rawAvatars = safeParseJSON(data?.Avatar);
    const avatarsArray = Array.isArray(rawAvatars) ? rawAvatars : (rawAvatars ? [rawAvatars] : []);

    const guestCards = guestsArray.map((gRaw, i) => {
        const g = (typeof gRaw === 'string') ? safeParseJSON(gRaw) : gRaw;
        // possible keys: Guest, Guest Name, name, etc.
        const name = getFieldValueFromObj(g, ['Guest', 'Guest Name', 'Name', 'name']) || g?.guest || g?.Guest || '';
        const title = getFieldValueFromObj(g, ['Guest Title', 'Title', 'GuestTitle', 'guesttitle']) || g?.['Guest Title'] || g?.title || '';
        const industryVertical = getFieldValueFromObj(g, ['Industry Vertical']) || g?.['Industry Vertical'] || g?.industryVertical || '';
        const company = getFieldValueFromObj(g, ['Guest Company', 'Company', 'guestcompany']) || g?.['Guest Company'] || g?.company || '';
        const persona = getFieldValueFromObj(g, ['Persona', 'Personas', 'persona']) || g?.Persona || '';
        const dossier = getFieldValueFromObj(g, ['Dossier', 'dossier']) || g?.Dossier || '';
        const linkdin = getFieldValueFromObj(g, ['LinkedIn Profile']) || g?.["LinkedIn Profile"] || '';
        const tracker = getFieldValueFromObj(g, ['Tracker']) || g?.["Tracker"] || '';
        const industry = getFieldValueFromObj(g, ['Guest Industry', 'Industry', 'guestindustry']) || g?.['Guest Industry'] || g?.industry || '';
        // avatar from avatars array — avatar item may be a URL string or an object with url property
        let image = null;
        const av = avatarsArray[i];
        if (typeof av === 'string') image = av;
        else if (av && typeof av === 'object') image = av.url || av.path || av[0] || null;

        return {
            id: i,
            raw: g,
            name,
            title,
            company,
            persona,
            image,
            dossier,
            linkdin,
            tracker,
            industry,
            industryVertical
        };
    });
    const personaColors = {
        "Client": "bg-blue-100 text-blue-800",
        "Prospect": "bg-purple-100 text-purple-800",
        "Partner": "bg-green-100 text-green-800",
        "Thought Leader": "bg-yellow-100 text-yellow-800",
        "VIP": "bg-red-100 text-red-800",
        "In-Pipeline": "bg-indigo-100 text-indigo-800",
        "Employee": "bg-gray-100 text-gray-800"
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold text-white">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = previewUrl;
                                        link.target = "_blank";
                                        link.rel = "noopener noreferrer";
                                        link.download = "";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                    title="Download"
                                >
                                    <FaDownload size={20} />
                                </button>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                                onError={(e) => {
                                    e.target.style.display = "none"; // hide broken iframe
                                    const fallback = document.getElementById("fallback-btn");
                                    if (fallback) fallback.style.display = "flex";
                                }}
                            />

                            {/* Fallback UI */}
                            <div
                                id="fallback-btn"
                                style={{ display: "none" }}
                                className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                            >
                                <p className="text-gray-700 mb-4">
                                    This document cannot be previewed here.
                                </p>
                                <button
                                    onClick={() =>
                                        window.open(previewUrl, "_blank", "noopener,noreferrer")
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Open in New Tab
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Error Message Modal */}
            {errorMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-[#1a1b41] rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Error</h2>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <p className="text-red-400 mb-4">{errorMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                <div
                    className="p-2 px-6 rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg bg-[#1a1b41]"
                >
                    {/* Header */}
                    <div
                        className="sticky top-0 py-3 px-4 flex justify-between items-center z-10 mb-2"
                        style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
                    >
                        <h2 className="text-xl font-bold">
                            CONTENT DETAILS
                            {guestCards.length > 0 && (
                                <span className="text-sm text-gray-300 ml-3 font-medium">
                                    (Guest Name{guestCards.length > 1 ? "s" : ""}: {" Not Available "}
                                    {guestCards.map((g) => g.name).join(", ")})
                                </span>
                            )}
                        </h2>

                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <hr className="border-b border-gray-600 -mx-6 mb-4" />

                    {/* Filter Info */}
                    {appliedFilters?.["Video Type"]?.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                            <p className="text-blue-300 text-sm">
                                Showing content for: <strong>
                                    {appliedFilters["Video Type"]
                                        .map(filter => {
                                            return filter
                                                .replace(/_/g, ' ')
                                                .replace(/\w\S*/g, (txt) => {
                                                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                                });
                                        })
                                        .join(", \u00A0\u00A0")
                                    }
                                </strong>
                            </p>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="space-y-4 mb-4">
                        {/* Guest Cards - Collapsible Section */}
                        {guestCards.length > 0 && (
                            <div className="mb-6">
                                <div
                                    className={`flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 transition-all duration-200 ${isGuestSectionCollapsed ? 'bg-gray-800/50' : 'bg-gray-800/70 shadow-md'}`}
                                    onClick={() => {
                                        // Only one dropdown open at a time
                                        setCollapsedSections(prev => {
                                            const next = { ...prev };
                                            Object.keys(next).forEach(k => { next[k] = true; });
                                            return next;
                                        });
                                        setIsGuestSectionCollapsed(prev => !prev);
                                    }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                                        <span className="px-2 py-1 rounded-md text-sm">
                                            Guests
                                        </span>
                                    </h3>
                                    {isGuestSectionCollapsed ? (
                                        <FaChevronDown className="text-gray-400 transition-transform duration-200" />
                                    ) : (
                                        <FaChevronUp className="text-gray-400 transition-transform duration-200" />
                                    )}
                                </div>

                                {!isGuestSectionCollapsed && (
                                    <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-2">
                                            {guestCards.map((g, index) => (
                                                <div
                                                    key={g.id}
                                                    className="border border-gray-600 bg-gray-800/60 rounded-lg p-4 flex flex-col w-full min-w-0"
                                                >
                                                    {/* Profile Image */}
                                                    <div className="flex justify-center mb-4">
                                                        {g.image ? (
                                                            <img
                                                                src={g.image}
                                                                alt={g.name}
                                                                className="w-24 h-24 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-24 h-24 rounded-full bg-gray-500" />
                                                        )}
                                                    </div>

                                                    {/* Guest Details */}
                                                    <div className="text-left text-sm space-y-1 w-full min-w-0">
                                                        {/* Persona */}
                                                        {g.persona && (Array.isArray(g.persona) ? g.persona.length > 0 : true) && (
                                                            <div className="flex items-start gap-2 mb-1">
                                                                <span className="font-semibold text-gray-200">Persona:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {(Array.isArray(g.persona) ? g.persona : [g.persona]).map(
                                                                        (persona, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${personaColors[persona] || "bg-gray-100 text-gray-800"}`}
                                                                            >
                                                                                {persona}
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Guest Name */}
                                                        {g.name && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">Guest Name:</span>
                                                                <span className="text-[13px] text-gray-400">{g.name}</span>

                                                                {/* Buttons + Copied */}
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleCopy(g.name, index, "name")}
                                                                        className="text-yellow-300 hover:text-white p-1"
                                                                        title="Copy"
                                                                    >
                                                                        <FaCopy size={16} />
                                                                    </button>
                                                                    {copied.index === index && copied.field === "name" && (
                                                                        <span className="text-green-400 text-xs">Copied!</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}


                                                        {/* Guest Title */}
                                                        {g.title && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">Guest Title:</span>{" "}
                                                                <span className="text-[13px] text-gray-400">{g.title}</span>
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <button
                                                                        onClick={() => handleCopy(g.title, index, "title")}
                                                                        className="text-yellow-300 hover:text-white p-1"
                                                                        title="Copy"
                                                                    >
                                                                        <FaCopy size={16} />
                                                                    </button>
                                                                    {copied.index === index && copied.field === "title" && (
                                                                        <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Guest Company */}
                                                        {g.company && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">Guest Company:</span>{" "}
                                                                <span className="text-[13px] text-gray-400">{g.company}</span>
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <button
                                                                        onClick={() => handleCopy(g.company, index, "company")}
                                                                        className="text-yellow-300 hover:text-white p-1"
                                                                        title="Copy"
                                                                    >
                                                                        <FaCopy size={16} />
                                                                    </button>
                                                                    {copied.index === index && copied.field === "company" && (
                                                                        <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* LinkedIn Profile */}
                                                        {g.linkdin && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">
                                                                    Guest’s LinkedIn Profile:
                                                                </span>{" "}
                                                                {/* <span className="text-[13px] text-gray-400">{g.linkdin}</span> */}
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <button
                                                                        onClick={() => handlePreview(g.linkdin)}
                                                                        className="text-blue-300 hover:text-white p-1"
                                                                        title="View"
                                                                    >
                                                                        <FaEye size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Guest Industry */}
                                                        {g.industry && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">Guest Industry:</span>{" "}
                                                                <span className="text-[13px] text-gray-400">{g.industry}</span>
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <button
                                                                        onClick={() => handleCopy(g.industry, index, "industry")}
                                                                        className="text-yellow-300 hover:text-white p-1"
                                                                        title="Copy"
                                                                    >
                                                                        <FaCopy size={16} />
                                                                    </button>
                                                                    {copied.index === index && copied.field === "industry" && (
                                                                        <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Industry Vertical */}
                                                        {g.industryVertical && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">
                                                                    Industry Vertical:
                                                                </span>{" "}
                                                                <span className="text-[13px] text-gray-400">
                                                                    {g.industryVertical}
                                                                </span>
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleCopy(g.industryVertical, index, "industryVertical")
                                                                        }
                                                                        className="text-yellow-300 hover:text-white p-1"
                                                                        title="Copy"
                                                                    >
                                                                        <FaCopy size={16} />
                                                                    </button>
                                                                    {copied.index === index &&
                                                                        copied.field === "industryVertical" && (
                                                                            <span className="text-green-400 text-xs ml-1">
                                                                                Copied!
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Tracker */}
                                                        {g.tracker && (
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <span className="font-semibold text-gray-200">
                                                                    Guest Tracker:
                                                                </span>{" "}
                                                                <div className="flex items-center gap-2 ml-1">

                                                                    {/* Always open in new tab */}
                                                                    <button
                                                                        onClick={() =>
                                                                            window.open(g.tracker, "_blank", "noopener,noreferrer")
                                                                        }
                                                                        className="text-blue-300 hover:text-white p-1"
                                                                        title="View"
                                                                    >
                                                                        <FaEye size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Guest Dossier */}
                                                        {g.dossier && (
                                                            <div className="mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-gray-200">Guest Dossier:</span>
                                                                    <div className="flex items-center gap-1 ml-1">
                                                                        <button
                                                                            onClick={() => handlePreview(g.dossier)}
                                                                            className="text-blue-300 hover:text-white p-1"
                                                                            title="View"
                                                                        >
                                                                            <FaEye size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCopy(g.dossier, index)}
                                                                            className="text-yellow-300 hover:text-white p-1"
                                                                            title="Copy Link"
                                                                        >
                                                                            <FaCopy size={16} />
                                                                        </button>
                                                                        {copied.index === index && copied.field === "dossier" && (
                                                                            <span className="text-green-400 text-xs ml-1">
                                                                                Copied!
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
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

                        {/* Sections */}
                        <div className="space-y-4">
                            {(() => {
                                // Prioritize order: Prep Calls -> Full Episodes -> Additional Guest Projects -> others
                                const prioritized = ["Prep_Call", "FULL_EPISODES_SECTION", "Additional_Guest_Projects"];
                                const entries = Object.entries(filteredSections || {});
                                const seen = new Set();

                                const ordered = [];
                                prioritized.forEach(key => {
                                    const found = entries.find(([k]) => k === key);
                                    if (found) {
                                        ordered.push(found);
                                        seen.add(key);
                                    }
                                });
                                // Append the rest
                                entries.forEach(([k, v]) => {
                                    if (!seen.has(k)) ordered.push([k, v]);
                                });

                                return ordered.map(([sectionId, sectionData]) => renderSection(sectionId, sectionData));
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GenericModal;
