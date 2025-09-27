import { FaTimes, FaCopy, FaExpand, FaCompress, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { appColors } from "@/lib/theme";
import { useState } from "react";

const Modal = ({ data, onClose }) => {
    const [expandedFields, setExpandedFields] = useState({});
    const [copiedField, setCopiedField] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({
        guestDetails: true,
        transcript: true,
        matchingCategories: true
    });

    // Array fields that should be displayed as tags
    const arrayFields = [
        "Video Type",
        "Mentions"
    ];

    // Special fields that need custom rendering
    const specialFields = ["Themes", "Validations", "Objections", "Challenges", 'Sales Insights', 'Case_Study_Other_Video', 'Video Type'];
    const reportSections = [
        {
            title: "Challenge Report",
            fields: [
                "Challenge Report_Unedited Video Link",
                "Challenge Report_Unedited Transcript Link",
                "Challenge Report_Summary"
            ]
        },
        {
            title: "Podcast Report",
            fields: [
                "Podcast Report_Unedited Video Link",
                "Podcast Report_Unedited Transcript Link",
                "Podcast Report_Summary"
            ]
        },
        {
            title: "Post-Podcast Report",
            fields: [
                "Post-Podcast Report_Unedited Video Link",
                "Post-Podcast Report_Unedited Transcript Link",
                "Post-Podcast Report_Summary"
            ]
        }
    ];
    const caseStudySections = [
        {
            title: "Full Case Study",
            fields: [
                "Full Case Study_Interactive Link",
                "Full Case Study_Copy and Paste Text",
                "Full Case Study_Link To Document"
            ]
        },
        {
            title: "Problem Section",
            fields: [
                "Problem Section_Video Link",
                "Problem Section_Copy and Paste Text",
                "Problem Section_Link To Document"
            ]
        },
        {
            title: "Solution Section",
            fields: [
                "Solution Section_Video Link",
                "Solution Section_Copy and Paste Text",
                "Solution Section_Link To Document"
            ]
        },
        {
            title: "Results Section",
            fields: [
                "Results Section_Video Link",
                "Results Section_Copy and Paste Text",
                "Results Section_Link To Document"
            ]
        },
        {
            title: "Case Study Video Short",
            fields: [
                "Case Study Video Short_Video Link",
                "Case Study Video Short_Copy and Paste Text",
                "Case Study Video Short_Link To Document"
            ]
        },
        {
            title: "Case Study Other Video",
            fields: ["Case_Study_Other_Video"]
        }
        // {
        //   title: "Case Study Other Video",
        //   fields: [
        //     "Case Study Other Video_Video Title",
        //     "Case Study Other Video_Video Link",
        //     "Case Study Other Video_Copy and Paste Text",
        //     "Case Study Other Video_Link To Document"
        //   ]
        // }
    ];

    // Define sections
    const sections = [
        // {
        //     id: "guestDetails",
        //     title: "Guest Details",
        //     fields: [
        //         "Guest",
        //         "Guest Title",
        //         "Guest Company",
        //         "Guest Industry"
        //     ]
        // },
        {
            id: "transcript",
            title: "Transcript",
            fields: [
                "Episode_Number",
                "Date Recorded",
                "Discussion Guide",
                "Video Length",
                "Video Description",
                "Text comments for the rating (OPTIONAL input from the user)",
                "Quote",
                "Mentions",
                "Public_vs_Private",
                "Client",
                "Employee"
            ]
        },
        {
            id: "matchingCategories",
            title: "Matching Categories",
            fields: [
                "Themes",
                "Challenges",
                "Objections",
                "Validations",
                "Sales Insights"
            ]
        }
    ];

    // Define the exact order of fields we want to display
    const fieldOrder = [
        "Avatar",
        ...sections.flatMap(section => section.fields),
        // "Likes",
        // "Comments",
        "Video Title",
        "Video Type",
        "Mentioned_Quotes",
        // "Case_Study",
        "Case_Study_Transcript",
        "Transcript",
        "Article_Transcript",
        "Article - Extended Media",
        "Videos",
        "Videos Link",
        "Episode Title",
        "LinkedIn Video - Extended Media",
        "YouTube Short - Extended Media",
        "Quote Card - Extended Media",
        // "Post_Podcast_Insights",
        "Podbook Link",
        "YouTube_Short_Transcript",
        "LinkedIn_Video_Transcript"
    ];

    const getDisplayName = (key) => {
        const nameMap = {
            "Text comments for the rating (OPTIONAL input from the user)": "Top Three Takeaways",
            "Episode_Number": "Episode #",
            "Episode Title": "Full Episode Title",
            "Article - Extended Media": "Article",
            "Quote Card - Extended Media": "Quote Card",
            "Quote": "Key Quote",
            "Guest": "Guest Name",
            "Article_Transcript": "Article Text",
            "Public_vs_Private": "Public vs. Private",
            "Challenge Report_Unedited Video Link": "Challenge Video",
            "Challenge Report_Unedited Transcript Link": "Challenge Transcript",
            "Challenge Report_Summary": "Challenge Report",
            "Podcast Report_Unedited Video Link": "Podcast Video (Unedited)",
            "Podcast Report_Unedited Transcript Link": "Podcast Transcript",
            "Podcast Report_Summary": "Podcast Summary",
            "Post-Podcast Report_Unedited Video Link": "Post-Podcast Video",
            "Post-Podcast Report_Unedited Transcript Link": "Post-Podcast Transcript",
            "Post-Podcast Report_Summary": "Post-Podcast Report",
            "Video Type": "Content Type",
            "Case_Study_Other_Video": 'Case Study Other Video',
            // "Case_Study": "Case Study",
            "Case_Study_Transcript": "Case Study Transcript",
            "LinkedIn Video - Extended Media": "LinkedIn Video",
            "YouTube Short - Extended Media": "YouTube Short",
            "Mentioned_Quotes": "Mentioned Quotes",
            "Videos Link": "Video Link",
            "YouTube_Short_Transcript": "YouTube Short Transcript",
            "LinkedIn_Video_Transcript": "LinkedIn Video Transcript",
            "Podbook Link": "Podbook Link",

            // New Case Study Fields (renamed)
            "Full Case Study_Interactive Link": "Interactive Link",
            "Full Case Study_Copy and Paste Text": "Copy and Paste Text",
            "Full Case Study_Link To Document": "Link To Document",

            "Problem Section_Video Link": "Video Link",
            "Problem Section_Copy and Paste Text": "Copy and Paste Text",
            "Problem Section_Link To Document": "Link To Document",

            "Solution Section_Video Link": "Video Link",
            "Solution Section_Copy and Paste Text": "Copy and Paste Text",
            "Solution Section_Link To Document": "Link To Document",

            "Results Section_Video Link": "Video Link",
            "Results Section_Copy and Paste Text": "Copy and Paste Text",
            "Results Section_Link To Document": "Link To Document",

            "Case Study Video Short_Video Link": "Video Link",
            "Case Study Video Short_Copy and Paste Text": "Copy and Paste Text",
            "Case Study Video Short_Link To Document": "Link To Document",
            "Video Type": "Content Type",


        };

        return nameMap[key] || key;
    };

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const toggleExpand = (fieldName) => {
        setExpandedFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const copyToClipboard = (text, fieldName) => {
        if (typeof text === 'object') {
            text = JSON.stringify(text);
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

    const renderSpecialField = (key, value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return <div className="text-gray-400 text-sm">No data available</div>;
        }
        if (key === 'Case_Study_Other_Video') {
            return renderCaseStudyOtherVideo(value);
        }

        const entries = Array.isArray(value) ? value : [value];

        return (
            <div className="space-y-3">
                {entries.map((entry, index) => {
                    // Determine the type of entry (theme, validation, etc.)
                    const type = Object.keys(entry).find(k =>
                        ['theme', 'validation', 'objection', 'challenges', 'insight', 'videoType'].includes(k)
                    );

                    return (
                        <div
                            key={index}
                            className="border rounded-lg p-3"
                            style={{ backgroundColor: appColors.primaryColor }}
                        >
                            <div className="grid grid-cols-1 gap-2">
                                {type === 'videoType' ? (
                                    <div className="space-y-3">
                                        {/* Handle both string and object formats */}
                                        {typeof entry === 'string' ? (
                                            <p>
                                                <span className="font-semibold">Content Type: </span>
                                                <span className='text-gray-600'>{entry}</span>
                                            </p>
                                        ) : (
                                            <>
                                                {/* Content Type */}
                                                <p>
                                                    <span className="font-semibold">Content Type: </span>
                                                    <span className='text-gray-600'>{entry.videoType || entry.video_type || 'N/A'}</span>
                                                </p>

                                                {/* Show individual fields if they exist */}
                                                {entry.video_title && (
                                                    <p>
                                                        <span className="font-semibold">Video Title: </span>
                                                        <span className='text-gray-600'>{entry.video_title}</span>
                                                    </p>
                                                )}

                                                {entry.video_length && (
                                                    <p>
                                                        <span className="font-semibold">Video Length: </span>
                                                        <span className='text-gray-600'>{entry.video_length}</span>
                                                    </p>
                                                )}

                                                {(entry.video_link || entry.link) && (
                                                    <p>
                                                        <span className="font-semibold">Video Link: </span>
                                                        <span className='text-blue-500 hover:underline'>
                                                            <a
                                                                href={entry.video_link || entry.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {entry.video_link || entry.link}
                                                            </a>
                                                        </span>
                                                    </p>
                                                )}

                                                {entry.video_desc && (
                                                    <p>
                                                        <span className="font-semibold">Description: </span>
                                                        <span className='text-gray-600'>{entry.video_desc}</span>
                                                    </p>
                                                )}

                                                {/* Show nested videos if they exist */}
                                                {entry.videos?.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="font-semibold mb-2">Included Videos:</p>
                                                        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                                            {entry.videos.map((video, index) => (
                                                                <div key={index} className="space-y-1">
                                                                    {video.video_title && (
                                                                        <p>
                                                                            <span className="font-medium">Title: </span>
                                                                            <span className='text-gray-600'>{video.video_title}</span>
                                                                        </p>
                                                                    )}
                                                                    {video.video_length && (
                                                                        <p>
                                                                            <span className="font-medium">Length: </span>
                                                                            <span className='text-gray-600'>{video.video_length}</span>
                                                                        </p>
                                                                    )}
                                                                    {video.video_link && (
                                                                        <p>
                                                                            <span className="font-medium">Link: </span>
                                                                            <span className='text-blue-500 hover:underline'>
                                                                                <a href={video.video_link} target="_blank" rel="noopener noreferrer">
                                                                                    {video.video_link}
                                                                                </a>
                                                                            </span>
                                                                        </p>
                                                                    )}
                                                                    {video.video_desc && (
                                                                        <p>
                                                                            <span className="font-medium">Description: </span>
                                                                            <span className='text-gray-600'>{video.video_desc}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <p>
                                            <span className="font-semibold">{type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Item'}: </span>
                                            <span className='text-gray-400 text-sm'>
                                                {entry[type] || `No ${type} selected`}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Match Rating (1-10): </span>
                                            <span className='text-gray-400 text-sm'>{entry.ranking || "N/A"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Rating Justification: </span>
                                            <span className='text-gray-400 text-sm'>{entry.justification || "No justification available"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Perception to Address: </span>
                                            <span className='text-gray-400 text-sm'>{entry.perceptionToAddress || "Not specified"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Why It Matters: </span>
                                            <span className='text-gray-400 text-sm'>{entry.whyItMatters || "Not specified"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Deeper Insight: </span>
                                            <span className='text-gray-400 text-sm'>{entry.deeperInsight || "Not specified"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Supporting Quotes: </span>
                                            <span className='text-gray-400 text-sm'>{entry.supportingQuotes || "None provided"}</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

            </div>
        );
    };

    const renderFieldValue = (key, value) => {
        // Handle special fields (Themes, Validations, etc.)
        // Handle Case Study Other Video fields
        if (key.startsWith("Case Study Other Video_")) {
            return renderCaseStudyOtherVideo(value);
        }
        if (specialFields.includes(key)) {
            return renderSpecialField(key, value);
        }
        // Handle Mentioned Quotes specifically
        if (key === "Mentioned_Quotes") {
            // Clean and normalize the quotes data
            let quotesArray = [];

            if (Array.isArray(value)) {
                quotesArray = value.map(q => String(q).replace(/^"+|"+$/g, '').trim());
            } else if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    quotesArray = Array.isArray(parsed)
                        ? parsed.map(q => String(q).replace(/^"+|"+$/g, '').trim())
                        : [String(value).replace(/^"+|"+$/g, '').trim()];
                } catch {
                    quotesArray = [String(value).replace(/^"+|"+$/g, '').trim()];
                }
            } else if (value) {
                quotesArray = [String(value).replace(/^"+|"+$/g, '').trim()];
            }

            // Filter out empty quotes
            quotesArray = quotesArray.filter(q => q && q !== '""' && q !== "''");

            const isExpanded = expandedFields[key];
            const visibleQuotes = isExpanded ? quotesArray : quotesArray.slice(0, 3);
            const hasMoreQuotes = quotesArray.length > 3 && !isExpanded;

            return (
                <div className="space-y-1">
                    {visibleQuotes.length > 0 ? (
                        visibleQuotes.map((quote, index) => (
                            <div
                                key={index}
                                className="inline-block bg-[#E5E7EB] dark:bg-gray-700 text-black px-2 py-1 rounded-md text-sm mr-2 mb-2"
                            >
                                {quote}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm">No quotes available</span>
                    )}
                    {hasMoreQuotes && (
                        <button
                            onClick={() => toggleExpand(key)}
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                            {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                            {isExpanded ? 'Show less' : `Show ${quotesArray.length - 3} more`}
                        </button>
                    )}
                </div>
            );
        }
        // Handle array fields
        if (arrayFields.includes(key) && Array.isArray(value)) {
            const isExpanded = expandedFields[key];
            const visibleTags = isExpanded ? value : value.slice(0, 3);
            const hasMoreTags = value.length > 3 && !isExpanded;

            return (
                <div className="flex flex-wrap gap-2">
                    {visibleTags.length > 0 ? (
                        visibleTags
                            .filter((item) => item && item !== "nan" && item !== "[]")
                            .map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm"
                                >
                                    {tag}
                                </span>
                            ))
                    ) : (
                        <span className="text-gray-400 text-sm">No data available</span>
                    )}
                    {hasMoreTags && (
                        <button
                            onClick={() => toggleExpand(key)}
                            className="text-blue-500 text-sm flex items-center"
                        >
                            +{value.length - 3} more
                        </button>
                    )}
                </div>
            );
        }

        // Handle null/undefined/empty values
        if (value === null || value === undefined || value === "") {
            return <div className="text-gray-400 text-sm">No data available</div>;
        }

        // Handle long text fields
        const isExpanded = expandedFields[key];
        const displayValue = value;
        const isLongText = typeof displayValue === 'string' && displayValue.length > 100;

        if (isLongText && !isExpanded) {
            return (
                <div className="truncate">
                    {displayValue.substring(0, 100)}...
                </div>
            );
        }

        return <div className="break-words">{displayValue}</div>;
    };

    const renderSection = (section) => {
        return (
            <div key={section.id} className="mb-4">
                <div
                    className="flex justify-between border items-center cursor-pointer p-2 rounded-md hover:bg-white/10 mt-8"
                    onClick={() => toggleSection(section.id)}
                >
                    <h3 className="text-md font-bold">{section.title}</h3>
                    {collapsedSections[section.id] ? <FaChevronDown /> : <FaChevronUp />}
                </div>

                {!collapsedSections[section.id] && (
                    <div className="mt-2 space-y-4 pl-4 border rounded p-2">
                        {section.fields.map(field => {
                            const label = getDisplayName(field);
                            const value = data[field];
                            const isLongText = typeof value === 'string' && value.length > 100;
                            const isExpanded = expandedFields[field];
                            const isSpecialField = specialFields.includes(field);
                            const isArrayField = arrayFields.includes(field) && Array.isArray(value);

                            return (
                                <div key={field} className="w-full">
                                    {/* Field Label */}
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-md font-semibold text-gray-600" style={{ color: appColors.textColor }}>
                                            {label}
                                        </label>
                                        {copiedField === label && (
                                            <span className="text-xs text-green-500">Copied!</span>
                                        )}
                                    </div>

                                    {/* Field Content with Actions */}
                                    <div className="flex items-stretch gap-2 w-full">
                                        <div
                                            className={`flex-1 border border-gray-300 p-3 rounded-md overflow-hidden
                                                ${isArrayField ? 'h-auto m-0 p-0 mb-2' : 'hover:bg-white/5 cursor-pointer'}
                                                ${isExpanded ? '' : isSpecialField ? '' : 'max-h-24 overflow-y-auto'}`}
                                            onClick={!isArrayField && !isSpecialField ? () => toggleExpand(field) : undefined}
                                        >
                                            {renderFieldValue(field, value)}
                                        </div>

                                        <div className="flex flex-col justify-between">
                                            {(isLongText || isArrayField) && (
                                                <div
                                                    onClick={() => toggleExpand(field)}
                                                    className="w-auto h-[0px] flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-white/10 mt-4 transition-colors cursor-pointer"
                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                >
                                                    {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => copyToClipboard(value, label)}
                                                className="w-auto h-10 flex items-center justify-center text-gray-500 rounded-md hover:text-gray-700 mt-2 transition-colors"
                                                disabled={!value}
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };
    const renderCaseStudyOtherVideo = (value) => {
        if (!value) {
            return <div className="text-gray-400 text-sm">No data available</div>;
        }

        // Handle case where value is an array (like other special fields)
        if (Array.isArray(value)) {
            return (
                <div className="space-y-3">
                    {value.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="grid grid-cols-1 gap-2">
                                <p>
                                    <span className="font-semibold">Video Title: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {item.video_title || "No title available"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Video Link: </span>
                                    <span className='text-gray-400 text-sm'>
                                        <span className='text-gray-400 text-sm'>
                                            {item.video_link || "No video link available"}
                                        </span>
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Copy and Paste Text: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {item.copy_and_paste_text || "No text available"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Link To Document: </span>
                                    <span className='text-gray-400 text-sm'>
                                        <span className='text-gray-400 text-sm'>
                                            {item.link_to_document || "No link to document available"}
                                        </span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Handle case where value is a single object
        return (
            <div className="border rounded-lg p-3 h-[100px]" style={{ backgroundColor: appColors.primaryColor }}>
                <div className="grid grid-cols-1 gap-2">
                    <p>
                        <span className="font-semibold">Video Title: </span>
                        <span className='text-gray-400 text-sm'>
                            {value.video_title || "No title available"}
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold">Video Link: </span>
                        <span className='text-gray-400 text-sm'>
                            {value.video_link ? (
                                <a href={value.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                    {value.video_link}
                                </a>
                            ) : "No link available"}
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold">Copy and Paste Text: </span>
                        <span className='text-gray-400 text-sm'>
                            {value.copy_and_paste_text || "No text available"}
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold">Link To Document: </span>
                        <span className='text-gray-400 text-sm'>
                            {value.link_to_document ? (
                                <a href={value.link_to_document} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                    {value.link_to_document}
                                </a>
                            ) : "No document link available"}
                        </span>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-[40%] max-w-[800px] max-h-[90vh] overflow-y-auto shadow-lg"
                style={{ backgroundColor: appColors.primaryColor }}>

                {/* Header */}
                <div className="sticky top-0 py-2 flex justify-between items-center border rounded p-2 z-10" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                    <h2 className="text-lg font-bold">Content Details</h2>
                    <button onClick={onClose} className="text-red-500">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* User Avatar */}
                {/* <div className="flex justify-center my-6 -mb-1">
                    <img
                        src={data.Avatar || "/default-avatar.png"}
                        alt="User Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
                    />
                </div> */}

                {/* Main Content */}
                <div className="space-y-5 px-2">
                    {/* Render collapsible sections */}
                    {sections.map(renderSection)}

                    {/* Render remaining fields not in sections */}
                    {fieldOrder
                        .filter(key =>
                            !sections.some(section => section.fields.includes(key)) &&
                            key !== "Avatar"
                        )
                        .map((key) => {
                            const label = getDisplayName(key);
                            const value = data[key];
                            const isArrayField = arrayFields.includes(key) && Array.isArray(value);
                            const isSpecialField = specialFields.includes(key);
                            const isLongText = !isArrayField && !isSpecialField && typeof value === 'string' && value.length > 100;
                            const isExpanded = expandedFields[key];

                            return (
                                <div key={key} className="w-full">
                                    {/* Field Label */}
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-md font-bold text-gray-600" style={{ color: appColors.textColor }}>
                                            {label}
                                        </label>
                                        {copiedField === label && (
                                            <span className="text-xs text-green-500">Copied!</span>
                                        )}
                                    </div>

                                    {/* Field Content with Actions */}
                                    <div className="flex items-stretch gap-2 w-full">
                                        <div
                                            className={`flex-1 border border-gray-300 p-3 rounded-md overflow-hidden
                                                ${isArrayField ? 'h-auto m-0 p-0 mb-2' : 'hover:bg-white/5 cursor-pointer'}
                                                ${isExpanded ? '' : isSpecialField ? '' : 'max-h-24 overflow-y-auto'}`}
                                            onClick={!isArrayField && !isSpecialField ? () => toggleExpand(key) : undefined}
                                        >
                                            {renderFieldValue(key, value)}
                                        </div>

                                        <div className="flex flex-col justify-between">
                                            {(isLongText || isArrayField) && (
                                                <div
                                                    onClick={() => toggleExpand(key)}
                                                    className="w-auto h-[0px] flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-white/10 mt-4 transition-colors cursor-pointer"
                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                >
                                                    {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => copyToClipboard(value, label)}
                                                className="w-auto h-10 flex items-center justify-center text-gray-500 rounded-md hover:text-gray-700 mt-2 transition-colors"
                                                disabled={!value}
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    {/* Render report sections */}
                    {reportSections.map((section) => {
                        return (
                            <div key={section.title}>
                                <label className="text-md font-bold">{section.title}</label>
                                <div className="border rounded-lg p-4">
                                    <div className="space-y-4">
                                        {section.fields.map((field) => {
                                            const label = getDisplayName(field);
                                            const value = data[field];
                                            const isLongText = typeof value === 'string' && value.length > 100;
                                            const isExpanded = expandedFields[field];

                                            return (
                                                <div key={field} className="w-full">
                                                    {/* Field Label */}
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-semibold text-gray-600" style={{ color: appColors.textColor }}>
                                                            {label}
                                                        </label>
                                                        {copiedField === label && (
                                                            <span className="text-xs text-green-500">Copied!</span>
                                                        )}
                                                    </div>

                                                    {/* Field Content with Actions */}
                                                    <div className="flex items-stretch gap-2 w-full">
                                                        <div
                                                            className={`flex-1 border border-gray-300 p-3 rounded-md overflow-hidden
                                                            ${isLongText ? 'hover:bg-white/5 cursor-pointer' : ''}
                                                            ${isExpanded ? '' : 'max-h-24 overflow-y-auto'}`}
                                                            onClick={isLongText ? () => toggleExpand(field) : undefined}
                                                        >
                                                            {renderFieldValue(field, value)}
                                                        </div>

                                                        <div className="flex flex-col justify-between">
                                                            {isLongText && (
                                                                <div
                                                                    onClick={() => toggleExpand(field)}
                                                                    className="w-auto h-[0px] flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-white/10 mt-4 transition-colors cursor-pointer"
                                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                                >
                                                                    {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => copyToClipboard(value, label)}
                                                                className="w-auto h-10 flex items-center justify-center text-gray-500 rounded-md hover:text-gray-700 mt-2 transition-colors"
                                                                disabled={!value}
                                                            >
                                                                <FaCopy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Render case study sections */}
                    {caseStudySections.map((section) => {
                        return (
                            <div key={section.title}>
                                <label className="text-md font-bold">{section.title}</label>
                                <div className="border rounded-lg p-4">
                                    <div className="space-y-4">
                                        {section.fields.map((field) => {
                                            const label = getDisplayName(field);
                                            const value = data[field];
                                            const isLongText = typeof value === 'string' && value.length > 100;
                                            const isExpanded = expandedFields[field];

                                            return (
                                                <div key={field} className="w-full">
                                                    {/* Field Label */}
                                                    <div className="flex justify-between items-center mb-2">
                                                        {field !== "Case_Study_Other_Video" && (
                                                            <div className="flex justify-between items-center -mb-1">
                                                                <label className="text-sm font-semibold text-gray-600" style={{ color: appColors.textColor }}>
                                                                    {label}
                                                                </label>
                                                                {copiedField === label && (
                                                                    <span className="text-xs text-green-500">Copied!</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {copiedField === label && (
                                                            <span className="text-xs text-green-500">Copied!</span>
                                                        )}
                                                    </div>

                                                    {/* Field Content with Actions */}
                                                    <div className="flex items-stretch gap-2 w-full">
                                                        <div
                                                            className={`flex-1 p-3 rounded-md overflow-hidden max-h-full
                                                            ${field !== "Case_Study_Other_Video" ? 'border border-gray-300' : ''}
                                                            ${isLongText ? 'hover:bg-white/5 cursor-pointer' : ''}
                                                            ${isExpanded ? '' : 'max-h-24 overflow-y-auto'}`}
                                                            onClick={isLongText ? () => toggleExpand(field) : undefined}
                                                        >
                                                            {renderFieldValue(field, value)}
                                                        </div>

                                                        <div className="flex flex-col justify-between">
                                                            {isLongText && (
                                                                <div
                                                                    onClick={() => toggleExpand(field)}
                                                                    className="w-auto h-[0px] flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-white/10 mt-4 transition-colors cursor-pointer"
                                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                                >
                                                                    {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => copyToClipboard(value, label)}
                                                                className="w-auto h-10 flex items-center justify-center text-gray-500 rounded-md hover:text-gray-700 mt-2 transition-colors"
                                                                disabled={!value}
                                                            >
                                                                <FaCopy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Modal;