import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createClient } from "@supabase/supabase-js";
import CustomSelect from "./CustomSelect";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { appColors } from "@/lib/theme";
import Alert from "./Alert";
import { ShowCustomToast } from "./CustomToastify";
import { FileInput, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Tooltip } from "./CustomTooltip";

const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


const MULTISELECT_FIELDS = [
    "Video Type",
    // "Tags",
    "Validations",
    "Objections",
    "Challenges",
    "Sales Insights",
    "Themes",
];

const SINGLESELECT_FIELDS = [
    "Mentions",
    "Client",
    "Employee",
    "Post_Podcast_Insights",
    "Public_vs_Private",
    // "Guest Role",
    "Videos",
    "file_type",
    "content_categories",
    "market_categories",
    "category",
    "template_id",
    "department_id"

];

const OPTIONS = {

    "Video Type": [
        { value: "Summary Video", label: "Summary Video" },
        { value: "Full Episode", label: "Full Episode" },
        { value: "Highlights Video", label: "Highlights Video" },
        { value: "Case Study", label: "Case Study" },
        { value: "ICP Advice", label: "ICP Advice" },
        { value: "Post-Podcast Video", label: "Post-Podcast Video" },
        { value: "Guest Introduction", label: "Guest Introduction" },
        { value: "Post Podcast Insights", label: "Post Podcast Insights" },
        { value: "Challenge Questions", label: "Challenge Questions" },
        { value: "Challenge Video", label: "Challenge Video" },
    ],
    // "Tags": [
    //     { value: "Agent Empowerment", label: "Agent Empowerment" },
    //     { value: "Agent Satisfaction", label: "Agent Satisfaction" },
    //     { value: "Customer Loyalty", label: "Customer Loyalty" },
    //     { value: "Data & Analytics", label: "Data & Analytics" },
    //     { value: "AI", label: "AI" },
    // ],
    "Mentions": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    "Client": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    "Employee": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    "Post_Podcast_Insights": [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ],
    // "Guest Role": [
    //     { value: "Client", label: "Client" },
    //     { value: "Employee", label: "Employee" },
    //     { value: "Prospect", label: "Prospect" },
    //     { value: "Partner", label: "Partner" },
    //     { value: "Thought Leader", label: "Thought Leader" },
    //     { value: "Expert", label: "Expert" },
    //     { value: "VIP", label: "VIP" },
    //     { value: "Company Executive", label: "Company Executive" },
    //     { value: "Other", label: "Other" },
    // ],
    // "Videos": [
    //     { value: "Highlights Video", label: "Highlights Video" },
    //     { value: "Full Episode", label: "Full Episode" },
    //     { value: "Summary Video", label: "Summary Video" },
    //     { value: "YouTube Short", label: "YouTube Short" },
    //     { value: "LinkedIn", label: "LinkedIn" },
    // ],
    "Public_vs_Private": [
        { value: "Public", label: "Public" },
        { value: "Private", label: "Private" },
    ],
    "Themes": [
        { value: "Positioning Contact Centers as Strategic Growth Drivers (Contact Center Industry)", label: "Positioning Contact Centers as Strategic Growth Drivers (Contact Center Industry)" },
        { value: "Transforming Contact Centers into Experience-Driven Hubs (Contact Center Industry)", label: "Transforming Contact Centers into Experience-Driven Hubs (Contact Center Industry)" },
        { value: "Harnessing AI to Elevate Customer Experience (Contact Center Industry)", label: "Harnessing AI to Elevate Customer Experience (Contact Center Industry)" },
        { value: "Retaining Talent to Reduce Turnover and Improve CX (Contact Center Industry)", label: "Retaining Talent to Reduce Turnover and Improve CX (Contact Center Industry)" },
        { value: "Building Culture and Brand Alignment Inside the Contact Center (Contact Center Industry)", label: "Building Culture and Brand Alignment Inside the Contact Center (Contact Center Industry)" },
        { value: "Treating BPOs as Strategic Growth Partners, Not Just Vendors  (BPO Partnership)", label: "Treating BPOs as Strategic Growth Partners, Not Just Vendors  (BPO Partnership)" },
        { value: "Reimagining Outsourcing for Customer-Centric Service (BPO Partnership)", label: "Reimagining Outsourcing for Customer-Centric Service (BPO Partnership)" },
        { value: "Embedding AI into BPO Operations for Smarter Support (BPO Partnership)", label: "Embedding AI into BPO Operations for Smarter Support (BPO Partnership)" },
        { value: "Aligning Outsourcing KPIs with Revenue and Innovation (BPO Partnership)", label: "Aligning Outsourcing KPIs with Revenue and Innovation (BPO Partnership)" },
        { value: "Joint Talent Management to Elevate BPO Service Quality (BPO Partnership)", label: "Joint Talent Management to Elevate BPO Service Quality (BPO Partnership)" },
        { value: "Redefining Contact Centers as Value Creation Engines (Podcast Guests)", label: "Redefining Contact Centers as Value Creation Engines (Podcast Guests)" },
        { value: "Shifting from Reactive to Proactive Customer Engagement (Podcast Guests)", label: "Shifting from Reactive to Proactive Customer Engagement (Podcast Guests)" },
        { value: "Customer Experience as the New Competitive Advantage (Podcast Guests)", label: "Customer Experience as the New Competitive Advantage (Podcast Guests)" },
        { value: "Linking Agent Experience Directly to Customer Loyalty (Podcast Guests)", label: "Linking Agent Experience Directly to Customer Loyalty (Podcast Guests)" },
        { value: "Using AI to Empower Agents, Not Replace Them (Podcast Guests)", label: "Using AI to Empower Agents, Not Replace Them (Podcast Guests)" },
    ],
    "Objections": [
        { value: "Cost vs. Value Perception", label: "Cost vs. Value Perception" },
        { value: "Brand Representation and Quality Control", label: "Brand Representation and Quality Control" },
        { value: "Fear of Losing Operational Control", label: "Fear of Losing Operational Control" },
        { value: "Integration and Ramp-Up Complexity", label: "Integration and Ramp-Up Complexity" },
        { value: "Lack of Industry-Specific Expertise", label: "Lack of Industry-Specific Expertise" },
        { value: "Technology Gaps and Legacy Limitations", label: "Technology Gaps and Legacy Limitations" },
        { value: "Transparency and Performance Accountabilitys", label: "Transparency and Performance Accountabilitys" },
        { value: "Previous Negative Outsourcing Experience", label: "Previous Negative Outsourcing Experience" },
        { value: "Internal Resistance to Change", label: "Internal Resistance to Change" },
    ],
    "Validations": [
        { value: "Transform Cost Centers into Strategic Experience Centers", label: "Transform Cost Centers into Strategic Experience Centers" },
        { value: "Every Interaction is a Revenue Opportunity", label: "Every Interaction is a Revenue Opportunity" },
        { value: "Operationalizing Revenue From Every Interaction", label: "Operationalizing Revenue From Every Interaction" },
        { value: "Customized AI Strategy Empowering Actionable Insights Through Tailored Technology", label: "Customized AI Strategy Empowering Actionable Insights Through Tailored Technology" },
        { value: "Seamless Integration as an Extension of Your Team", label: "Seamless Integration as an Extension of Your Team" },
        { value: "Proven Tangible Results and Measurable Success", label: "Proven Tangible Results and Measurable Success" },
        { value: "Empowering Executives to Become Strategic Business Partners", label: "Role as Consultant/Partner" },
    ],
    "Challenges": [
        { value: "Misalignment Between Short-Term Targets and Long-Term Value", label: "Misalignment Between Short-Term Targets and Long-Term Value" },
        { value: "Underutilization of Voice-of-Customer Data", label: "Underutilization of Voice-of-Customer Data" },
        { value: "Lack of Empowerment and Budget Control for CX and Support Leaders", label: "Lack of Empowerment and Budget Control for CX and Support Leaders" },
        { value: "Inability to Deeply Understand and Adapt to the ICP", label: "Inability to Deeply Understand and Adapt to the ICP" },
        { value: "Cultural Bias Toward Viewing Support as a Cost Center", label: "Cultural Bias Toward Viewing Support as a Cost Center" },
        { value: "Conflicting Executive Priorities", label: "Conflicting Executive Priorities" },
        { value: "Tagging, Taxonomy, and Feedback Classification Challenges", label: "Tagging, Taxonomy, and Feedback Classification Challenges" },
        { value: "Generational Workforce Gaps", label: "Generational Workforce Gaps" },
        { value: "Tool Overload and AI Misalignment", label: "Tool Overload and AI Misalignment" },
        { value: "Organizational Dysfunction and Scaling Expertise", label: "Organizational Dysfunction and Scaling Expertise" },
    ],
    "Sales Insights": [
        { value: "Evolving Expectations of Data Security", label: "Evolving Expectations of Data Security" },
        { value: "Understanding Buyer Priorities in Scaling Operations", label: "Understanding Buyer Priorities in Scaling Operations" },
        { value: "Proven Experience and Service Quality", label: "Proven Experience and Service Quality" },
        { value: "Customer Experience as a Competitive Advantage", label: "Customer Experience as a Competitive Advantage" },
        { value: "Skepticism About Long-Term Partnership Viability", label: "Skepticism About Long-Term Partnership Viability" },
        { value: "Flexibility in Service and Partnership Models", label: "Flexibility in Service and Partnership Models" },
        { value: "Pressure to Reduce Time-to-Resolution", label: "Pressure to Reduce Time-to-Resolution" },
        { value: "Measuring and Leveraging CX as a Differentiator", label: "Measuring and Leveraging CX as a Differentiator" },
        { value: "Desire for Seamless Integration with Internal Systems", label: "Desire for Seamless Integration with Internal Systems" },
        { value: "Challenges in Scaling Customer Support Operations", label: "Challenges in Scaling Customer Support Operations" },
        { value: "AI for Operational Efficiency and Growth", label: "AI for Operational Efficiency and Growth" },
        { value: "Cultural and Values Alignment for Seamless Collaboration", label: "Cultural and Values Alignment for Seamless Collaboration" },
        { value: "Transitioning from Traditional Contact Centers to Experience Centers", label: "Transitioning from Traditional Contact Centers to Experience Centers" },
        { value: "Customer Experience as a Strategic Differentiator", label: "Customer Experience as a Strategic Differentiator" },
        { value: "Advanced Technology for Streamlined Operations", label: "Advanced Technology for Streamlined Operations" },
        { value: "Ability to Integrate into the Company's Brand and Culture", label: "Ability to Integrate into the Company's Brand and Culture" },
        { value: "Cost Sensitivity in Contract Negotiations", label: "Cost Sensitivity in Contract Negotiations" },
        { value: "Resistance to Outsourcing Critical Customer Functions", label: "Resistance to Outsourcing Critical Customer Functions" },
    ],
    "file_type": [
        // 📝 Documents
        { value: "Document", label: "Document (DOC, DOCX, TXT, RTF)" },
        { value: "Spreadsheet", label: "Spreadsheet (XLS, XLSX, CSV)" },
        { value: "Presentation", label: "Presentation (PPT, PPTX)" },
        { value: "PDF", label: "PDF" },

        // 🖼️ Images
        { value: "Image", label: "Image (JPG, JPEG, PNG, GIF, WEBP, SVG)" },

        // 🎥 Media
        { value: "Video", label: "Video (MP4, WEBM, MOV, AVI, MKV)" },
        { value: "Audio", label: "Audio (MP3, WAV, OGG, AAC)" },

        // 📦 Compressed
        { value: "Archive", label: "Archive (ZIP, RAR, 7Z, TAR, GZ)" },

        // 🧬 Code & Source Files
        { value: "Code", label: "Code (JS, TS, HTML, CSS, PY, JAVA, JSON, XML)" },

        // 📁 System & Executables
        { value: "Executable", label: "Executable (EXE, DMG, APK, MSI)" },
        { value: "ISO", label: "Disk Image (ISO, IMG)" },

        // 🔄 Other or Unknown
        { value: "Other", label: "Other / Unknown" },
    ],
    "category": [
        { value: "Presentations", label: "Presentations" },
        { value: "Sales Calls", label: "Sales Calls" },
        { value: "Scripts", label: "Scripts" },
        { value: "Templates", label: "Templates" },
        { value: "Reports", label: "Reports" },
        { value: "Training", label: "Training" },
        { value: "Marketing", label: "Marketing" },
        { value: "Other", label: "Other" }
    ],
    "market_categories": [
        { value: "Industry", label: "Industry", count: 0 },
        { value: "Competitive", label: "Competitive", count: 0 },
        { value: "Persona", label: "Persona", count: 0 },
        { value: "Individual", label: "Individual", count: 0 }
    ],
    "content_categories": [
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
    ],
    "Persona": [
        { value: "Client", label: "Client" },
        { value: "Prospect", label: "Prospect" },
        { value: "Partner", label: "Partner" },
        { value: "Thought Leader", label: "Thought Leader" },
        { value: "VIP", label: "VIP" },
        { value: "In-Pipeline", label: "In-Pipeline" },
        { value: "Employee", label: "Employee" }
    ],

};


// GUEST_FIELDS Section (Page 1 on step 1)

const GUEST_FIELDS = [
    "Avatar",
    "Persona",
    "Industry Vertical",
    "Guest",
    "Guest Title",
    "Guest Company",
    "Guest Industry",
    "Tracker",
    "LinkedIn Profile",
    "Dossier"
];

// PREP_CALLS_FIELDS Section (Page 2 on step 2)
const PREP_CALLS_FIELDS = [
    "Unedited Prep Call Video",
    "Unedited Prep Call Transcript",
    "Discussion Guide"
];

// Additional_Guest_Projects Section (Page 3 on step 3)
const Additional_Guest_Projects = [
    "Podcast",
    "eBooks",
    "Articles",
    "Other"
];

// EMAIL_FIELDS Section (Page 4)
const EMAIL_FIELDS = [
    "Guest",
    "Cold",
    "Warm"
];

// EMAIL_FIELDS Section (Do not include in multistep form)
const EMAIL_CATEGORIES = {
    "Guest": "Delivery",
    "Cold": "Sales",
    "Warm": "Sales"
};

// Full Episode Section (Page 5 on step 4 )
const DETAILS_FULL_EPISODES = [
    "Episode ID",
    "Episode Number",
    "Episode Title",
    "Date Recorded",
    "Category",
    "Short Episode Description",
    "Long Episode Description",
    "Formate",
    "Short and Long-Tail SEO Keywords",
    "All Asset Folder"
];
const FULL_EPISODE_VIDEO = [
    "Full Episode Video Title",
    "Full Episode Video Length",
    "Full Episode Video Description",
    "Full Episode Video File",
    "Full Episode Audio File",
    "Full Episode YouTube URL",
    "Unedited Full Episode Transcript",
    "Edited Full Episode Transcript",
    "Provocative Statements",
    "Custom Requests"

];
const FULL_EPISODE_EXTENDED_CONTENT = [
    "Article URL",
    "Article Text",
    "Full Episode Quote Card"
];
const FULL_EPISODE_HIGHLIGHT_VIDEO = [
    "Highlight Video Title",
    "Highlight Video Length",
    "Highlight Video Description",
    "Highlight Video File",
    "Highlight YouTube URL",
    "Highlight Video Transcript",
    "Highlights Video LinkedIn Post Information (post text, comments & emails)"

];
const FULL_EPISODE_INTRODUCTION_VIDEO = [
    "Introduction Video Title",
    "Introduction Video Length",
    "Introduction Video Description",
    "Introduction Video File",
    "Introduction Video YouTube URL",
    "Introduction Video Transcript",
];
const FULL_EPISODE_QA_VIDEOS = [
    "QAV1 Video Title",
    "QAV1 Video Length",
    "QAV1 Video Description",
    "QAV1 Video Quote",
    "QAV1 Video Hashtags",
    "QAV1 Video LinkedIn Post Information (post text, comments & emails)",
    "QAV1 Video File",
    "QAV1 YouTube URL",
    "QAV1 Video Transcript",
    "QAV1 Article URL",
    "QAV1 Article Text",
    "QAV1 YouTube Short Video File",
    "QAV1 YouTube Short URL",
    "QAV1 YouTube Short Transcript",
    "QAV1 LinkedIn Short Video File",
    "QAV1 Quote Card"

]

const FULL_EPISODE_PODBOOK = [
    "Podbook Interactive Link",
    "Podbook Website URL",
    "Podbook Embed Code",
    "Podbook Presentation",
    "Podbook Loom Folder"
];



const FULL_EPISODE_FULL_CASE_STUDY = [
    "Full Case Study Interactive Link",
    "Full Case Study Website URL",
    "Full Case Study Embed Code",
    "Full Case Study Text",
    "Full Case Study LinkedIn Post Information (post text, comments & emails)",
    "Problem Section Video File",
    "Problem Section Video Length",
    "Problem Section Video Transcript",
    "Solutions Section Video File",
    "Solutions Section Video Length",
    "Solutions Section Video Transcript",
    "Results Section Video File",
    "Results Section Video Length",
    "Results Section Video Transcript"
];
const FULL_EPISODE_ONE_PAGE_CASE_STUDY = [
    "One Page Case Study Interactive Link",
    "One Page Case Study Website URL",
    "One Page Case Study Embed Code",

];

const eBook = [
    "eBook Interactive Link",
    "eBook Website URL",
    "eBook Embed Code",
    "eBook Text",
    "eBook LinkedIn Post Information (post text, comments & emails)",
];

const Guest_Challenge_Report_Text = [
    "Multi-Guest Challenge Report Interactive Link",
    "Multi-Guest Challenge Report Website URL",
    "Multi-Guest Challenge Report Embed Code",
    "Multi-Guest Challenge Report Text",
    "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)",
];



const FULL_EPISODE_OTHER_CASE_STUDY = [
    "Other Case Study Interactive Experience",
    "Case Study Text",
    "Sales Email",
    "Other Case Study Video",
    "Other Case Study Video Length",
    "Other Case Study Video Transcript"
];

const FULL_EPISODE_ICP_ADVICE = [
    "Post-Podcast Video",
    "Unedited Post-Podcast Video Length",
    "Unedited Post-Podcast Transcript",
    "Post-Podcast Insights Report",
    "Post-Podcast Vision Report"
];

const FULL_EPISODE_CHALLENGE_QUESTIONS = [
    "Unedited Challenge Question Video",
    "Unedited Challenge Question Video Length",
    "Unedited Challenge Question Transcript",
    "Challenge Report"
];

const ICP_Advice_Report = [
    "ICP Advice Post-Podcast Video File",
    "ICP Advice Post-Podcast Video Length",
    "ICP Advice Post-Podcast Video Transcript",
    "ICP Advice Report"
];

const SQL_Analysis_Report = [
    "SQL Analysis Post-Podcast Video File",
    "SQL Analysis Post-Podcast Video Length",
    "SQL Analysis Post-Podcast Video Transcript",
    "SQL Analysis Report"
];

const Challenge_Questions = [
    "Challenge Questions Prep Call Video File",
    "Challenge Questions Prep Call Video Length",
    "Challenge Questions Prep Call Video Transcript",
    "Challenge Questions Report"
];

const IcpAdviceReportEntry = ({ report, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit ICP Advice Report"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove ICP Advice Report"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(report).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const SqlAnalysisReportEntry = ({ report, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit SQL Analysis Report"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove SQL Analysis Report"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(report).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const ChallengeQuestionsEntry = ({ challenges, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Challenge Questions"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Challenge Questions"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(challenges).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

// eBook Entry Component
const EBookEntry = ({ eBook, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit eBook"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove eBook"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(eBook).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('Embed Code') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

// Guest Challenge Report Entry Component
const GuestChallengeReportEntry = ({ report, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Guest Challenge Report"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Guest Challenge Report"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(report).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('Embed Code') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

// Updated component to properly display data
const VideoTypeEntry = ({ videoType, videos, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 text-black" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-semibold mb-2">
                        Content Type: <span className="text-gray-500 text-[15px]">{videoType || "No type selected"}</span>
                    </p>

                    {videos && videos.length > 0 ? (
                        <div className="space-y-3" >
                            {videos.map((video, idx) => (
                                <div
                                    key={`video-${idx}-${video.video_title || 'untitled'}`}
                                    className="pl-4 border-l-2 border-gray-300 bg-gray-50 p-3 rounded"
                                    style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
                                >
                                    <p><span className="font-medium text-[15px]">Title:</span> <span className='text-gray-400 text-sm'>{video.video_title || "N/A"}</span></p>
                                    <p><span className="font-medium text-[15px]">Length:</span> <span className='text-gray-400 text-sm'>{video.video_length || "N/A"}</span></p>
                                    <p><span className="font-medium text-[15px]">Link:</span> <span className='text-gray-400 text-sm'>{video.video_link || "N/A"}</span></p>
                                    {video.video_desc && (
                                        <p><span className="font-medium text-[15px]">Description:</span> <span className='text-gray-400 text-sm'>{video.video_desc}</span></p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No videos added for this type.</p>
                    )}
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(index)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit Video Group"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove Video Group"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const ThemeEntry = ({ theme, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Theme:</span> <span className='text-gray-400 text-sm'>{theme || "No theme selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ObjectionEntry = ({ objection, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Objection:</span> <span className='text-gray-400 text-sm'>{objection || "No objection selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChallengesEntry = ({ challenge, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Challenge:</span> <span className='text-gray-400 text-sm'>{challenge || "No challenge selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SalesInsightsEntry = ({ insight, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Sales Insight:</span> <span className='text-gray-400 text-sm'>{insight || "No insight provided"}</span></p>
                    <p><span className="font-medium">Match Rating (1–10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CaseStudyVideoEntry = ({ video_title, video_link, copy_and_paste_text, link_to_document, onEdit, onRemove, index }) => {
    return (
        <div
            className="border rounded-lg p-3 mb-3"
            style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                    <p>
                        <span className="font-medium">Video Title:</span>{' '}
                        <span className="text-gray-400 text-sm">{video_title || 'No title provided'}</span>
                    </p>
                    <p>
                        <span className="font-medium">Video Link:</span>{' '}
                        <a
                            href={video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline text-sm"
                        >
                            {video_link || 'No link provided'}
                        </a>
                    </p>
                    <p>
                        <span className="font-medium">Copy & Paste Text:</span>{' '}
                        <span className="text-gray-400 text-sm">
                            {copy_and_paste_text || 'No text provided'}
                        </span>
                    </p>
                    <p>
                        <span className="font-medium">Link to Document:</span>{' '}
                        <a
                            href={link_to_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline text-sm"
                        >
                            {link_to_document || 'No document link'}
                        </a>
                    </p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
const ValidationEntry = ({ validation, ranking, justification, perception, whyItMatters, deeperInsight, supportingQuotes, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p><span className="font-medium">Validation:</span> <span className='text-gray-400 text-sm'>{validation || "No validation selected"}</span></p>
                    <p><span className="font-medium">Match Rating (1-10):</span> <span className='text-gray-400 text-sm'>{ranking || "N/A"}</span></p>
                    <p><span className="font-medium">Rating Justification:</span> <span className='text-gray-400 text-sm'>{justification || "No justification available"}</span></p>
                    <p><span className="font-medium">Perception to Address:</span> <span className='text-gray-400 text-sm'>{perception || "Not specified"}</span></p>
                    <p><span className="font-medium">Why It Matters:</span> <span className='text-gray-400 text-sm'>{whyItMatters || "Not specified"}</span></p>
                    <p><span className="font-medium">Deeper Insight:</span> <span className='text-gray-400 text-sm'>{deeperInsight || "Not specified"}</span></p>
                    <p><span className="font-medium">Supporting Quotes:</span> <span className='text-gray-400 text-sm'>{supportingQuotes || "Not specified"}</span></p>
                </div>
                <div className="flex space-x-1">
                    <div onClick={() => onEdit(index)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                    </div>
                    <div onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
const GuestEntry = ({ guest, onEdit, onRemove, index }) => {
    // Define color classes for different personas
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
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            {/* Edit and Delete buttons - fixed in top-right corner */}
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Guest"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Guest"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="flex items-start gap-4 pr-8"> {/* Added pr-8 to prevent overlap with buttons */}
                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {guest.Avatar ? (
                        <img
                            src={guest.Avatar}
                            alt="Guest Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-white text-xs">No Image</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {/* Scrollable Persona container */}
                    <div className="flex items-start gap-2 mb-1">
                        <span className="font-medium text-[15px] whitespace-nowrap">Persona:</span>
                        <div className="flex-1 overflow-x-auto pb-1"> {/* Added overflow for scrolling */}
                            <div className="flex flex-wrap gap-1">
                                {guest["Persona"] ? (
                                    Array.isArray(guest["Persona"]) ? (
                                        guest["Persona"].map(persona => (
                                            <span
                                                key={persona}
                                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${personaColors[persona] || 'bg-gray-100 text-gray-800'}`}
                                            >
                                                {persona}
                                            </span>
                                        ))
                                    ) : (
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${personaColors[guest["Persona"]] || 'bg-gray-100 text-gray-800'}`}>
                                            {guest["Persona"]}
                                        </span>
                                    )
                                ) : (
                                    <span className="text-gray-400 text-sm">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rest of the guest info */}
                    <p className="truncate"><span className="font-medium text-[15px]">Industry Vertical:</span> <span className='text-gray-400 text-sm'>{guest["Industry Vertical"] || "N/A"}</span></p>
                    <p className="truncate"><span className="font-medium text-[15px]">Name:</span> <span className='text-gray-400 text-sm'>{guest["Guest"] || "N/A"}</span></p>
                    <p className="truncate"><span className="font-medium text-[15px]">Title:</span> <span className='text-gray-400 text-sm'>{guest["Guest Title"] || "N/A"}</span></p>
                    <p className="truncate"><span className="font-medium text-[15px]">Company:</span> <span className='text-gray-400 text-sm'>{guest["Guest Company"] || "N/A"}</span></p>
                    <p className="truncate"><span className="font-medium text-[15px]">Industry:</span> <span className='text-gray-400 text-sm'>{guest["Guest Industry"] || "N/A"}</span></p>
                    <p className="truncate">
                        <span className="font-medium text-[15px]">Tracker:</span>
                        {guest["Tracker"] ? (
                            <a href={guest["Tracker"]} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm ml-1 truncate inline-block max-w-[180px]">
                                {guest["Tracker"].length > 30 ? `${guest["Tracker"].substring(0, 30)}...` : guest["Tracker"]}
                            </a>
                        ) : (
                            <span className='text-gray-400 text-sm'>N/A</span>
                        )}
                    </p>
                    <p className="truncate">
                        <span className="font-medium text-[15px]">LinkedIn:</span>
                        {guest["LinkedIn Profile"] ? (
                            <a href={guest["LinkedIn Profile"]} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm ml-1 truncate inline-block max-w-[180px]">
                                {guest["LinkedIn Profile"].length > 30 ? `${guest["LinkedIn Profile"].substring(0, 30)}...` : guest["LinkedIn Profile"]}
                            </a>
                        ) : (
                            <span className='text-gray-400 text-sm'>N/A</span>
                        )}
                    </p>
                    <p className="truncate">
                        <span className="font-medium text-[15px]">Dossier:</span>
                        {guest["Dossier"] ? (
                            <a href={guest["Dossier"]} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm ml-1 truncate inline-block max-w-[180px]">
                                {guest["Dossier"].length > 30 ? `${guest["Dossier"].substring(0, 30)}...` : guest["Dossier"]}
                            </a>
                        ) : (
                            <span className='text-gray-400 text-sm'>N/A</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

const PrepCallEntry = ({ prepCall, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            {/* Edit and Delete buttons - fixed in top-right corner */}
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Prep Call"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Prep Call"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                <p className="truncate">
                    <span className="font-medium text-[15px]">Unedited Prep Call Video:</span>
                    {prepCall["Unedited Prep Call Video"] ? (
                        <a
                            href={prepCall["Unedited Prep Call Video"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {prepCall["Unedited Prep Call Video"].length > 30
                                ? `${prepCall["Unedited Prep Call Video"].substring(0, 30)}...`
                                : prepCall["Unedited Prep Call Video"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>

                <p className="truncate">
                    <span className="font-medium text-[15px]">Unedited Prep Call Transcript:</span>
                    {prepCall["Unedited Prep Call Transcript"] ? (
                        <a
                            href={prepCall["Unedited Prep Call Transcript"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {prepCall["Unedited Prep Call Transcript"].length > 30
                                ? `${prepCall["Unedited Prep Call Transcript"].substring(0, 30)}...`
                                : prepCall["Unedited Prep Call Transcript"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>

                <p className="truncate">
                    <span className="font-medium text-[15px]">Discussion Guide:</span>
                    {prepCall["Discussion Guide"] ? (
                        <a
                            href={prepCall["Discussion Guide"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {prepCall["Discussion Guide"].length > 30
                                ? `${prepCall["Discussion Guide"].substring(0, 30)}...`
                                : prepCall["Discussion Guide"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>
            </div>
        </div>
    );
};

const AdditionalProjectEntry = ({ project, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            {/* Edit and Delete buttons - fixed in top-right corner */}
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Project"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Project"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                <p className="truncate">
                    <span className="font-medium text-[15px]">Podcast:</span>
                    {project["Podcast"] ? (
                        <a
                            href={project["Podcast"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {project["Podcast"].length > 30
                                ? `${project["Podcast"].substring(0, 30)}...`
                                : project["Podcast"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>

                <p className="truncate">
                    <span className="font-medium text-[15px]">eBooks:</span>
                    {project["eBooks"] ? (
                        <a
                            href={project["eBooks"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {project["eBooks"].length > 30
                                ? `${project["eBooks"].substring(0, 30)}...`
                                : project["eBooks"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>

                <p className="truncate">
                    <span className="font-medium text-[15px]">Articles:</span>
                    {project["Articles"] ? (
                        <a
                            href={project["Articles"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {project["Articles"].length > 30
                                ? `${project["Articles"].substring(0, 30)}...`
                                : project["Articles"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>

                <p className="truncate">
                    <span className="font-medium text-[15px]">Other:</span>
                    {project["Other"] ? (
                        <a
                            href={project["Other"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm ml-1"
                        >
                            {project["Other"].length > 30
                                ? `${project["Other"].substring(0, 30)}...`
                                : project["Other"]}
                        </a>
                    ) : (
                        <span className='text-gray-400 text-sm'>N/A</span>
                    )}
                </p>
            </div>
        </div>
    );
};

const EmailEntry = ({ email, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            {/* Edit and Delete buttons - fixed in top-right corner */}
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Email"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Email"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {/* Display email fields */}
                {Object.entries(email).map(([key, value]) => (
                    key !== 'category' && value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            <a
                                href={`mailto:${value}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 text-sm ml-1"
                            >
                                {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                            </a>
                        </p>
                    )
                ))}

            </div>
        </div>
    );
};


// Entry components for all episode-related fields
const FullEpisodeDetailsEntry = ({ details, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Full Episode Details"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Full Episode Details"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(details).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('Folder') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeVideoEntry = ({ video, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Full Episode Video"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Full Episode Video"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(video).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeExtendedContentEntry = ({ content, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Extended Content"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Extended Content"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(content).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeHighlightVideoEntry = ({ video, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Highlight Video"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Highlight Video"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(video).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeIntroductionVideoEntry = ({ video, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Introduction Video"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Introduction Video"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(video).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};
const FullEpisodeQAVideosEntry = ({ qaVideos, onEdit, onRemove, index }) => {
    const displayKey = (key) => key.replace('QAV1', `QAV${index + 1}`);
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit QA Videos"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove QA Videos"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Entry label e.g., QAV1, QAV2 */}
            {/* <div className="mb-2 text-sm font-semibold">{`QAV${index + 1}`}</div> */}

            <div className="space-y-2 pr-8">
                {Object.entries(qaVideos).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{displayKey(key)}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodePodbookEntry = ({ podbook, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Podbook"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Podbook"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(podbook).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('Folder') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeFullCaseStudyEntry = ({ caseStudy, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Full Case Study"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Full Case Study"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(caseStudy).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeOnePageCaseStudyEntry = ({ caseStudy, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit One Page Case Study"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove One Page Case Study"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(caseStudy).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeOtherCaseStudyEntry = ({ caseStudy, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Other Case Study"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Other Case Study"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(caseStudy).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeICPAdviceEntry = ({ advice, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit ICP Advice"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove ICP Advice"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(advice).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};

const FullEpisodeChallengeQuestionsEntry = ({ challenge, onEdit, onRemove, index }) => {
    return (
        <div className="border rounded-lg p-3 mb-3 relative" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
            <div className="absolute top-3 right-3 flex space-x-1">
                <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Challenge Questions"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Challenge Questions"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 pr-8">
                {Object.entries(challenge).map(([key, value]) => (
                    value && (
                        <p className="truncate" key={key}>
                            <span className="font-medium text-[15px]">{key}:</span>
                            {key.includes('URL') || key.includes('Link') || key.includes('File') || key.includes('Video') ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm ml-1"
                                >
                                    {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                                </a>
                            ) : (
                                <span className='text-gray-400 text-sm ml-1'>{value}</span>
                            )}
                        </p>
                    )
                ))}
            </div>
        </div>
    );
};
const CustomCrudForm = ({ onClose, onSubmit, entityData, isEditMode = false, displayFields, currentPage, itemsPerPage, setUsers, setCurrentPage, setTotalRecords, fetchUsers, themesRank, prefilledData = null, tableName, createRecord, updateRecord, isDashboardForm, isFilesData }) => {
    const [loading, setLoading] = useState(false);

    // Video Type
    const [currentVideoType, setCurrentVideoType] = useState("");
    const [currentVideoTitle, setCurrentVideoTitle] = useState("");
    const [currentVideoLength, setCurrentVideoLength] = useState("");
    const [currentVideoLink, setCurrentVideoLink] = useState("");
    const [currentVideoDesc, setCurrentVideoDesc] = useState("");
    const [currentVideos, setCurrentVideos] = useState([]);
    const [videoTypeEntries, setVideoTypeEntries] = useState([]);
    const [videoTypeEditIndex, setVideoTypeEditIndex] = useState(null);
    const [editingVideoIndex, setEditingVideoIndex] = useState(null);


    // Themes

    const [currentTheme, setCurrentTheme] = useState("");
    const [currentRanking, setCurrentRanking] = useState("");
    const [currentJustification, setCurrentJustification] = useState("");
    const [currentPerception, setCurrentPerception] = useState("");
    const [currentWhyItMatters, setCurrentWhyItMatters] = useState("");
    const [currentDeeperInsight, setCurrentDeeperInsight] = useState("");
    const [currentSupportingQuotes, setCurrentSupportingQuotes] = useState("");
    const [themeEntries, setThemeEntries] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    // Objections
    const [currentObjection, setCurrentObjection] = useState("");
    const [currentObjectionRanking, setCurrentObjectionRanking] = useState("");
    const [currentObjectionJustification, setCurrentObjectionJustification] = useState("");
    const [currentObjectionPerception, setCurrentObjectionPerception] = useState("");
    const [currentObjectionWhyItMatters, setCurrentObjectionWhyItMatters] = useState("");
    const [currentObjectionDeeperInsight, setCurrentObjectionDeeperInsight] = useState("");
    const [currentObjectionSupportingQuotes, setCurrentObjectionSupportingQuotes] = useState("");
    const [objectionEntries, setObjectionEntries] = useState([]);
    const [objectionEditIndex, setObjectionEditIndex] = useState(null);

    //Validations
    const [currentValidation, setCurrentValidation] = useState("");
    const [currentValidationRanking, setCurrentValidationRanking] = useState("");
    const [currentValidationJustification, setCurrentValidationJustification] = useState("");
    const [currentValidationPerception, setCurrentValidationPerception] = useState("");
    const [currentValidationWhyItMatters, setCurrentValidationWhyItMatters] = useState("");
    const [currentValidationDeeperInsight, setCurrentValidationDeeperInsight] = useState("");
    const [currentValidationSupportingQuotes, setCurrentValidationSupportingQuotes] = useState("");
    const [validationEntries, setValidationEntries] = useState([]);
    const [validationEditIndex, setValidationEditIndex] = useState(null);

    //Challenges
    const [currentChallenges, setCurrentChallenges] = useState("");
    const [currentChallengesRanking, setCurrentChallengesRanking] = useState("");
    const [currentChallengesJustification, setCurrentChallengesJustification] = useState("");
    const [currentChallengesPerception, setCurrentChallengesPerception] = useState("");
    const [currentChallengesWhyItMatters, setCurrentChallengesWhyItMatters] = useState("");
    const [currentChallengesDeeperInsight, setCurrentChallengesDeeperInsight] = useState("");
    const [currentChallengesSupportingQuotes, setCurrentChallengesSupportingQuotes] = useState("");
    const [challengesEntries, setChallengesEntries] = useState([]);
    const [challengesEditIndex, setChallengesEditIndex] = useState(null);

    //Sales Insights
    const [currentSalesInsight, setCurrentSalesInsight] = useState("");
    const [currentSalesInsightRanking, setCurrentSalesInsightRanking] = useState("");
    const [currentSalesInsightJustification, setCurrentSalesInsightJustification] = useState("");
    const [currentSalesInsightPerception, setCurrentSalesInsightPerception] = useState("");
    const [currentSalesInsightWhyItMatters, setCurrentSalesInsightWhyItMatters] = useState("");
    const [currentSalesInsightDeeperInsight, setCurrentSalesInsightDeeperInsight] = useState("");
    const [currentSalesInsightSupportingQuotes, setCurrentSalesInsightSupportingQuotes] = useState("");
    const [salesInsightsEntries, setSalesInsightsEntries] = useState([]);
    const [salesInsightsEditIndex, setSalesInsightsEditIndex] = useState(null);

    // Case Study Other Video
    // const [currentVideoTitle, setCurrentVideoTitle] = useState("");
    // const [currentVideoLink, setCurrentVideoLink] = useState("");
    const [currentCopyAndPasteText, setCurrentCopyAndPasteText] = useState("");
    const [currentLinkToDocument, setCurrentLinkToDocument] = useState("");
    const [caseStudyVideoEntries, setCaseStudyVideoEntries] = useState([]);
    const [caseStudyVideoEditIndex, setCaseStudyVideoEditIndex] = useState(null);


    // Mentioned Quotes fileds
    const [currentMentionedQuote, setCurrentMentionedQuote] = useState("");
    const [mentionedQuotes, setMentionedQuotes] = useState([]);

    // Guest 
    const [guestEntries, setGuestEntries] = useState([]);
    const [currentGuest, setCurrentGuest] = useState({
        "Avatar": "",
        "Persona": "",
        "Industry Vertical": "",
        "Guest": "",
        "Guest Title": "",
        "Guest Company": "",
        "Guest Industry": "",
        "Tracker": "",
        "LinkedIn Profile": "",
        "Dossier": ""
    });
    const [guestEditIndex, setGuestEditIndex] = useState(null);

    // Prep Callas
    const [prepCallEntries, setPrepCallEntries] = useState([]);
    const [currentPrepCall, setCurrentPrepCall] = useState({
        "Unedited Prep Call Video": "",
        "Unedited Prep Call Transcript": "",
        "Discussion Guide": ""
    });
    const [prepCallEditIndex, setPrepCallEditIndex] = useState(null);

    // Additional Guest Projects
    const [additionalProjectEntries, setAdditionalProjectEntries] = useState([]);
    const [currentAdditionalProject, setCurrentAdditionalProject] = useState({
        "Podcast": "",
        "eBooks": "",
        "Articles": "",
        "Other": ""
    });
    const [additionalProjectEditIndex, setAdditionalProjectEditIndex] = useState(null);


    // Add to your existing state declarations
    const [emailEntries, setEmailEntries] = useState([]);
    const [currentEmail, setCurrentEmail] = useState({
        "Guest": "",
        "Cold": "",
        "Warm": ""
    });
    const [emailEditIndex, setEmailEditIndex] = useState(null);


    // Full Episode Details
    const [fullEpisodeDetailsEntries, setFullEpisodeDetailsEntries] = useState([]);
    const [currentFullEpisodeDetails, setCurrentFullEpisodeDetails] = useState({
        "Episode ID": "",
        "Episode Number": "",
        "Episode Title": "",
        "Date Recorded": "",
        "Category": "",
        "Short Episode Description": "",
        "Long Episode Description": "",
        "Formate": "",
        "Short and Long-Tail SEO Keywords": "",
        "All Asset Folder": ""
    });
    const [fullEpisodeDetailsEditIndex, setFullEpisodeDetailsEditIndex] = useState(null);

    // Full Episode Video
    const [fullEpisodeVideoEntries, setFullEpisodeVideoEntries] = useState([]);
    const [currentFullEpisodeVideo, setCurrentFullEpisodeVideo] = useState({
        "Full Episode Video Title": "",
        "Full Episode Video Length": "",
        "Full Episode Video Description": "",
        "Video File": "",
        "Full Episode Audio File": "",
        "Full Episode YouTube URL": "",
        "Unedited Full Episode Transcript": "",
        "Edited Full Episode Transcript": "",
        "Provocative Statements": "",
        "Custom Requests": "",
        // "Full Episode Details": "",
        // "Transcript": "",
        // "LinkedIn Post Text": "",
        // "LinkedIn Executive Comments": "",
        // "Emails Marketing": "",
        // "Emails Sales": ""
    });
    const [fullEpisodeVideoEditIndex, setFullEpisodeVideoEditIndex] = useState(null);

    // Full Episode Extended Content
    const [fullEpisodeExtendedContentEntries, setFullEpisodeExtendedContentEntries] = useState([]);
    const [currentFullEpisodeExtendedContent, setCurrentFullEpisodeExtendedContent] = useState({
        "Article URL": "",
        "Article Text": "",
        "YouTube Short Video File": "",
        "YouTube Short URL": "",
        "YouTube Short Transcript": "",
        "LinkedIn Video File": "",
        "LinkedIn Video Transcript": "",
        "LinkedIn Post Text": "",
        "LinkedIn Executive Comments": "",
        "Emails Marketing": "",
        "Emails Sales": "",
        "Full Episode Quote Card": ""
    });
    const [fullEpisodeExtendedContentEditIndex, setFullEpisodeExtendedContentEditIndex] = useState(null);

    // Full Episode Highlight Video
    const [fullEpisodeHighlightVideoEntries, setFullEpisodeHighlightVideoEntries] = useState([]);
    const [currentFullEpisodeHighlightVideo, setCurrentFullEpisodeHighlightVideo] = useState({
        "Highlight Video Title": "",
        "Highlight Video Length": "",
        "Highlight Video Description": "",
        "Highlight Video File": "",
        "Highlight YouTube URL": "",
        "Highlight Video Transcript": "",
        "Highlights Video LinkedIn Post Information (post text, comments & emails)": ""

    });
    const [fullEpisodeHighlightVideoEditIndex, setFullEpisodeHighlightVideoEditIndex] = useState(null);

    // Full Episode Introduction Video
    const [fullEpisodeIntroductionVideoEntries, setFullEpisodeIntroductionVideoEntries] = useState([]);
    const [currentFullEpisodeIntroductionVideo, setCurrentFullEpisodeIntroductionVideo] = useState({
        "Introduction Video Title": "",
        "Introduction Video Length": "",
        "Introduction Video Description": "",
        "Introduction Video File": "",
        "Introduction Video YouTube URL": "",
        "Introduction Video Transcript": "",
    });
    const [fullEpisodeIntroductionVideoEditIndex, setFullEpisodeIntroductionVideoEditIndex] = useState(null);

    // Full Episode QA Videos
    const [fullEpisodeQAVideosEntries, setFullEpisodeQAVideosEntries] = useState([]);
    const [currentFullEpisodeQAVideos, setCurrentFullEpisodeQAVideos] = useState({
        "QAV1 Video Title": "",
        "QAV1 Video Length": "",
        "QAV1 Video Description": "",
        "QAV1 Video Quote": "",
        "QAV1 Video Hashtags": "",
        "QAV1 Video LinkedIn Post Information (post text, comments & emails)": "",
        "QAV1 Video File": "",
        "QAV1 YouTube URL": "",
        "QAV1 Video Transcript": "",
        "QAV1 Article URL": "",
        "QAV1 Article Text": "",
        "QAV1 YouTube Short Video File": "",
        "QAV1 YouTube Short URL": "",
        "QAV1 YouTube Short Transcript": "",
        "QAV1 LinkedIn Short Video File": "",
        "QAV1 Quote Card": ""
    });
    const [fullEpisodeQAVideosEditIndex, setFullEpisodeQAVideosEditIndex] = useState(null);

    // Full Episode Podbook
    const [fullEpisodePodbookEntries, setFullEpisodePodbookEntries] = useState([]);
    const [currentFullEpisodePodbook, setCurrentFullEpisodePodbook] = useState({
        "Podbook Interactive Link": "",
        "Podbook Website URL": "",
        "Podbook Embed Code": "",
        "Podbook Presentation": "",
        "Podbook Loom Folder": ""
    });
    const [fullEpisodePodbookEditIndex, setFullEpisodePodbookEditIndex] = useState(null);

    // Full Episode Full Case Study
    const [fullEpisodeFullCaseStudyEntries, setFullEpisodeFullCaseStudyEntries] = useState([]);
    const [currentFullEpisodeFullCaseStudy, setCurrentFullEpisodeFullCaseStudy] = useState({
        "Full Case Study Interactive Link": "",
        "Full Case Study Website URL": "",
        "Full Case Study Embed Code": "",
        "Full Case Study Text": "",
        "Full Case Study LinkedIn Post Information (post text, comments & emails)": "",
        "Problem Section Video File": "",
        "Problem Section Video Length": "",
        "Problem Section Video Transcript": "",
        "Solutions Section Video File": "",
        "Solutions Section Video Length": "",
        "Solutions Section Video Transcript": "",
        "Results Section Video File": "",
        "Results Section Video Length": "",
        "Results Section Video Transcript": ""
    });

    const [fullEpisodeFullCaseStudyEditIndex, setFullEpisodeFullCaseStudyEditIndex] = useState(null);

    // Full Episode One Page Case Study
    const [fullEpisodeOnePageCaseStudyEntries, setFullEpisodeOnePageCaseStudyEntries] = useState([]);
    const [currentFullEpisodeOnePageCaseStudy, setCurrentFullEpisodeOnePageCaseStudy] = useState({
        "One Page Case Study Interactive Link": "",
        "One Page Case Study Website URL": "",
        "One Page Case Study Embed Code": ""
    });

    const [fullEpisodeOnePageCaseStudyEditIndex, setFullEpisodeOnePageCaseStudyEditIndex] = useState(null);

    // Full Episode Other Case Study
    const [fullEpisodeOtherCaseStudyEntries, setFullEpisodeOtherCaseStudyEntries] = useState([]);
    const [currentFullEpisodeOtherCaseStudy, setCurrentFullEpisodeOtherCaseStudy] = useState({
        "Other Case Study Interactive Experience": "",
        "Case Study Text": "",
        "Sales Email": "",
        "Other Case Study Video": "",
        "Other Case Study Video Length": "",
        "Other Case Study Video Transcript": ""
    });
    const [fullEpisodeOtherCaseStudyEditIndex, setFullEpisodeOtherCaseStudyEditIndex] = useState(null);

    // Full Episode ICP Advice
    const [fullEpisodeICPAdviceEntries, setFullEpisodeICPAdviceEntries] = useState([]);
    const [currentFullEpisodeICPAdvice, setCurrentFullEpisodeICPAdvice] = useState({
        "Post-Podcast Video": "",
        "Unedited Post-Podcast Video Length": "",
        "Unedited Post-Podcast Transcript": "",
        "Post-Podcast Insights Report": "",
        "Post-Podcast Vision Report": ""
    });
    const [fullEpisodeICPAdviceEditIndex, setFullEpisodeICPAdviceEditIndex] = useState(null);

    // Full Episode Challenge Questions
    const [fullEpisodeChallengeQuestionsEntries, setFullEpisodeChallengeQuestionsEntries] = useState([]);
    const [currentFullEpisodeChallengeQuestions, setCurrentFullEpisodeChallengeQuestions] = useState({
        "Unedited Challenge Question Video": "",
        "Unedited Challenge Question Video Length": "",
        "Unedited Challenge Question Transcript": "",
        "Challenge Report": ""
    });
    const [fullEpisodeChallengeQuestionsEditIndex, setFullEpisodeChallengeQuestionsEditIndex] = useState(null);

    // ICP Advice Report
    const [icpAdviceReportEntries, setIcpAdviceReportEntries] = useState([]);
    const [currentIcpAdviceReport, setCurrentIcpAdviceReport] = useState({
        "ICP Advice Post-Podcast Video File": "",
        "ICP Advice Post-Podcast Video Length": "",
        "ICP Advice Post-Podcast Video Transcript": "",
        "ICP Advice Report": "",
    });
    const [icpAdviceReportEditIndex, setIcpAdviceReportEditIndex] = useState(null);

    // SQL Analysis Report
    const [sqlAnalysisReportEntries, setSqlAnalysisReportEntries] = useState([]);
    const [currentSqlAnalysisReport, setCurrentSqlAnalysisReport] = useState({
        "SQL Analysis Post-Podcast Video File": "",
        "SQL Analysis Post-Podcast Video Length": "",
        "SQL Analysis Post-Podcast Video Transcript": "",
        "SQL Analysis Report": ""
    });
    const [sqlAnalysisReportEditIndex, setSqlAnalysisReportEditIndex] = useState(null);

    // Challenge Questions
    const [challengeQuestionsEntries, setChallengeQuestionsEntries] = useState([]);
    const [currentChallengeQuestions, setCurrentChallengeQuestions] = useState({
        "Challenge Questions Prep Call Video File": "",
        "Challenge Questions Prep Call Video Length": "",
        "Challenge Questions Prep Call Video Transcript": "",
        "Challenge Questions Report": ""
    });
    const [challengeQuestionsEditIndex, setChallengeQuestionsEditIndex] = useState(null);

    // Add these state variables with the other state declarations
    // eBook
    const [eBookEntries, setEBookEntries] = useState([]);
    const [currentEBook, setCurrentEBook] = useState({
        "eBook Interactive Link": "",
        "eBook Website URL": "",
        "eBook Embed Code": "",
        "eBook Text": "",
        "eBook LinkedIn Post Information (post text, comments & emails)": ""
    });
    const [eBookEditIndex, setEBookEditIndex] = useState(null);

    // Guest Challenge Report Text
    const [guestChallengeReportEntries, setGuestChallengeReportEntries] = useState([]);
    const [currentGuestChallengeReport, setCurrentGuestChallengeReport] = useState({
        "Multi-Guest Challenge Report Interactive Link": "",
        "Multi-Guest Challenge Report Website URL": "",
        "Multi-Guest Challenge Report Embed Code": "",
        "Multi-Guest Challenge Report Text": "",
        "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": ""
    });
    const [guestChallengeReportEditIndex, setGuestChallengeReportEditIndex] = useState(null);
    const [currentRowId, setCurrentRowId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const avatarInputRef = useRef(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const handleNextStep = async (nextStep) => {
        setIsSaving(true);

        try {
            let rowId = currentRowId;

            // If we don't have a row ID yet, create a new record
            if (!rowId) {
                const { data, error } = await supabase
                    .from(tableName)
                    .insert([{
                        company_id: localStorage.getItem('company_id'),

                    }])
                    .select('id')
                    .single();

                if (error) throw error;

                rowId = data.id;
                setCurrentRowId(rowId);
            }

            // Save current step data to the row
            await saveStepData(rowId);

            // Move to the next step
            setCurrentStep(nextStep);
        } catch (error) {
            console.error("Error saving step data:", error);
            ShowCustomToast("Error saving data: " + error.message, "error");
        } finally {
            setIsSaving(false);
        }
    };


    const saveStepData = async (rowId) => {
        let stepData = {};

        switch (currentStep) {
            case 1: // Guest step
                if (Object.values(currentGuest).some(val => val !== "")) {
                    const result = await handleAddGuest();
                    stepData.Guest = (result && result.entries) ? result.entries : guestEntries;
                } else if (guestEntries.length > 0) {
                    stepData.Guest = guestEntries;
                }
                break;

            case 2: // Prep Call step
                if (Object.values(currentPrepCall).some(val => val !== "")) {
                    const result = await handleAddPrepCall();
                    stepData.Prep_Call = (result && result.entries) ? result.entries : prepCallEntries;
                } else if (prepCallEntries.length > 0) {
                    stepData.Prep_Call = prepCallEntries;
                }
                break;

            case 3: // Full Episodes step
                // Save all full episode sections
                if (fullEpisodeDetailsEntries.length > 0) {
                    stepData.DETAILS_FULL_EPISODES = fullEpisodeDetailsEntries;
                }
                if (Object.values(currentFullEpisodeDetails).some(val => val !== "")) {
                    const newFullEpisodeDetailsEntries = [...fullEpisodeDetailsEntries, currentFullEpisodeDetails];
                    handleAddFullEpisodeDetails();
                    stepData.DETAILS_FULL_EPISODES = newFullEpisodeDetailsEntries;
                }

                if (fullEpisodeVideoEntries.length > 0) {
                    stepData.FULL_EPISODE_VIDEO = fullEpisodeVideoEntries;
                }
                if (Object.values(currentFullEpisodeVideo).some(val => val !== "")) {
                    const newFullEpisodeVideoEntries = [...fullEpisodeVideoEntries, currentFullEpisodeVideo];
                    handleAddFullEpisodeVideo();
                    stepData.FULL_EPISODE_VIDEO = newFullEpisodeVideoEntries;
                }

                if (fullEpisodeExtendedContentEntries.length > 0) {
                    stepData.FULL_EPISODE_EXTENDED_CONTENT = fullEpisodeExtendedContentEntries;
                }
                if (Object.values(currentFullEpisodeExtendedContent).some(val => val !== "")) {
                    const newFullEpisodeExtendedContentEntries = [...fullEpisodeExtendedContentEntries, currentFullEpisodeExtendedContent];
                    handleAddFullEpisodeExtendedContent();
                    stepData.FULL_EPISODE_EXTENDED_CONTENT = newFullEpisodeExtendedContentEntries;
                }

                if (fullEpisodeHighlightVideoEntries.length > 0) {
                    stepData.FULL_EPISODE_HIGHLIGHT_VIDEO = fullEpisodeHighlightVideoEntries;
                }
                if (Object.values(currentFullEpisodeHighlightVideo).some(val => val !== "")) {
                    const newFullEpisodeHighlightVideoEntries = [...fullEpisodeHighlightVideoEntries, currentFullEpisodeHighlightVideo];
                    handleAddFullEpisodeHighlightVideo();
                    stepData.FULL_EPISODE_HIGHLIGHT_VIDEO = newFullEpisodeHighlightVideoEntries;
                }

                if (fullEpisodeIntroductionVideoEntries.length > 0) {
                    stepData.FULL_EPISODE_INTRODUCTION_VIDEO = fullEpisodeIntroductionVideoEntries;
                }
                if (Object.values(currentFullEpisodeIntroductionVideo).some(val => val !== "")) {
                    const newFullEpisodeIntroductionVideoEntries = [...fullEpisodeIntroductionVideoEntries, currentFullEpisodeIntroductionVideo];
                    handleAddFullEpisodeIntroductionVideo();
                    stepData.FULL_EPISODE_INTRODUCTION_VIDEO = newFullEpisodeIntroductionVideoEntries;
                }

                if (fullEpisodeQAVideosEntries.length > 0) {
                    stepData.FULL_EPISODE_QA_VIDEOS = fullEpisodeQAVideosEntries;
                }
                if (Object.values(currentFullEpisodeQAVideos).some(val => val !== "")) {
                    const newFullEpisodeQAVideosEntries = [...fullEpisodeQAVideosEntries, currentFullEpisodeQAVideos];
                    handleAddFullEpisodeQAVideos();
                    stepData.FULL_EPISODE_QA_VIDEOS = newFullEpisodeQAVideosEntries;
                }

                if (fullEpisodePodbookEntries.length > 0) {
                    stepData.FULL_EPISODE_PODBOOK = fullEpisodePodbookEntries;
                }
                if (Object.values(currentFullEpisodePodbook).some(val => val !== "")) {
                    const newFullEpisodePodbookEntries = [...fullEpisodePodbookEntries, currentFullEpisodePodbook];
                    handleAddFullEpisodePodbook();
                    stepData.FULL_EPISODE_PODBOOK = newFullEpisodePodbookEntries;
                }

                if (fullEpisodeICPAdviceEntries.length > 0) {
                    stepData.FULL_EPISODE_ICP_ADVICE = fullEpisodeICPAdviceEntries;
                }
                if (Object.values(currentFullEpisodeICPAdvice).some(val => val !== "")) {
                    const newFullEpisodeICPAdviceEntries = [...fullEpisodeICPAdviceEntries, currentFullEpisodeICPAdvice];
                    handleAddFullEpisodeICPAdvice();
                    stepData.FULL_EPISODE_ICP_ADVICE = newFullEpisodeICPAdviceEntries;
                }

                if (fullEpisodeChallengeQuestionsEntries.length > 0) {
                    stepData.FULL_EPISODE_CHALLENGE_QUESTIONS = fullEpisodeChallengeQuestionsEntries;
                }
                if (Object.values(currentFullEpisodeChallengeQuestions).some(val => val !== "")) {
                    const newFullEpisodeChallengeQuestionsEntries = [...fullEpisodeChallengeQuestionsEntries, currentFullEpisodeChallengeQuestions];
                    handleAddFullEpisodeChallengeQuestions();
                    stepData.FULL_EPISODE_CHALLENGE_QUESTIONS = newFullEpisodeChallengeQuestionsEntries;
                }
                break;

            case 4: // Additional Projects step
                if (fullEpisodeFullCaseStudyEntries.length > 0) {
                    stepData.FULL_EPISODE_FULL_CASE_STUDY = fullEpisodeFullCaseStudyEntries;
                }
                if (Object.values(currentFullEpisodeFullCaseStudy).some(val => val !== "")) {
                    const newFullEpisodeFullCaseStudyEntries = [...fullEpisodeFullCaseStudyEntries, currentFullEpisodeFullCaseStudy];
                    handleAddFullEpisodeFullCaseStudy();
                    stepData.FULL_EPISODE_FULL_CASE_STUDY = newFullEpisodeFullCaseStudyEntries;
                }

                if (fullEpisodeOnePageCaseStudyEntries.length > 0) {
                    stepData.FULL_EPISODE_ONE_PAGE_CASE_STUDY = fullEpisodeOnePageCaseStudyEntries;
                }
                if (Object.values(currentFullEpisodeOnePageCaseStudy).some(val => val !== "")) {
                    const newFullEpisodeOnePageCaseStudyEntries = [...fullEpisodeOnePageCaseStudyEntries, currentFullEpisodeOnePageCaseStudy];
                    handleAddFullEpisodeOnePageCaseStudy();
                    stepData.FULL_EPISODE_ONE_PAGE_CASE_STUDY = newFullEpisodeOnePageCaseStudyEntries;
                }
                // Add eBook data
                if (eBookEntries.length > 0) {
                    stepData.eBook = eBookEntries;
                }
                if (Object.values(currentEBook).some(val => val !== "")) {
                    const newEBookEntries = [...eBookEntries, currentEBook];
                    handleAddEBook();
                    stepData.eBook = newEBookEntries;
                }

                // Add Guest Challenge Report data
                if (guestChallengeReportEntries.length > 0) {
                    stepData['Multi-Guest_Challenge_Report_Text'] = guestChallengeReportEntries;
                }
                if (Object.values(currentGuestChallengeReport).some(val => val !== "")) {
                    const newGuestChallengeReportEntries = [...guestChallengeReportEntries, currentGuestChallengeReport];
                    handleAddGuestChallengeReport();
                    stepData['Multi-Guest_Challenge_Report_Text'] = newGuestChallengeReportEntries;
                }
                break;

            // Step 5: Reports
            case 5:
                if (icpAdviceReportEntries.length > 0) {
                    stepData.ICP_Advice_Report = icpAdviceReportEntries;
                }
                if (Object.values(currentIcpAdviceReport).some(val => val !== "")) {
                    const newIcpAdviceReportEntries = [...icpAdviceReportEntries, currentIcpAdviceReport];
                    handleAddIcpAdviceReport();
                    stepData.ICP_Advice_Report = newIcpAdviceReportEntries;
                }

                if (sqlAnalysisReportEntries.length > 0) {
                    stepData.SQL_Analysis_Report = sqlAnalysisReportEntries;
                }
                if (Object.values(currentSqlAnalysisReport).some(val => val !== "")) {
                    const newSqlAnalysisReportEntries = [...sqlAnalysisReportEntries, currentSqlAnalysisReport];
                    handleAddSqlAnalysisReport();
                    stepData.SQL_Analysis_Report = newSqlAnalysisReportEntries;
                }

                if (challengeQuestionsEntries.length > 0) {
                    stepData.Challenge_Questions = challengeQuestionsEntries;
                }
                if (Object.values(currentChallengeQuestions).some(val => val !== "")) {
                    const newChallengeQuestionsEntries = [...challengeQuestionsEntries, currentChallengeQuestions];
                    handleAddChallengeQuestions();
                    stepData.Challenge_Questions = newChallengeQuestionsEntries;
                }
                break;



            default:
                break;
        }

        // Only update if we have data to save
        if (Object.keys(stepData).length > 0) {
            const { error } = await supabase
                .from(tableName)
                .update(stepData)
                .eq('id', rowId);

            if (error) throw error;
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Add these normalization functions with the other normalization functions
    function normalizeEBook(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeEBook(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "eBook Interactive Link": item["eBook Interactive Link"] || "",
                "eBook Website URL": item["eBook Website URL"] || "",
                "eBook Embed Code": item["eBook Embed Code"] || "",
                "eBook Text": item["eBook Text"] || "",
                "eBook LinkedIn Post Information (post text, comments & emails)": item["eBook LinkedIn Post Information (post text, comments & emails)"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "eBook Interactive Link": data["eBook Interactive Link"] || "",
                "eBook Website URL": data["eBook Website URL"] || "",
                "eBook Embed Code": data["eBook Embed Code"] || "",
                "eBook Text": data["eBook Text"] || "",
                "eBook LinkedIn Post Information (post text, comments & emails)": data["eBook LinkedIn Post Information (post text, comments & emails)"] || ""
            }];
        }
        return [];
    }

    function normalizeGuestChallengeReport(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeGuestChallengeReport(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Multi-Guest Challenge Report Interactive Link": item["Multi-Guest Challenge Report Interactive Link"] || "",
                "Multi-Guest Challenge Report Website URL": item["Multi-Guest Challenge Report Website URL"] || "",
                "Multi-Guest Challenge Report Embed Code": item["Multi-Guest Challenge Report Embed Code"] || "",
                "Multi-Guest Challenge Report Text": item["Multi-Guest Challenge Report Text"] || "",
                "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": item["Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Multi-Guest Challenge Report Interactive Link": data["Multi-Guest Challenge Report Interactive Link"] || "",
                "Multi-Guest Challenge Report Website URL": data["Multi-Guest Challenge Report Website URL"] || "",
                "Multi-Guest Challenge Report Embed Code": data["Multi-Guest Challenge Report Embed Code"] || "",
                "Multi-Guest Challenge Report Text": data["Multi-Guest Challenge Report Text"] || "",
                "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": data["Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)"] || ""
            }];
        }
        return [];
    }

    const normalizeVideoType = (data) => {
        if (!data) return [];

        // Handle string case (legacy format)
        if (typeof data === 'string') {
            try {
                // Try to parse as JSON
                const parsed = JSON.parse(data);
                return normalizeVideoType(parsed); // Recursively handle parsed data
            } catch {
                // If it's a simple string
                return [{
                    videoType: data,
                    videos: []
                }];
            }
        }

        // Handle array case
        if (Array.isArray(data)) {
            return data.map(item => {
                // Handle object format
                if (typeof item === 'object') {
                    return {
                        videoType: item.videoType || item.video_type || "",
                        videos: Array.isArray(item.videos)
                            ? item.videos.map(v => ({
                                video_title: v.video_title || "",
                                video_length: v.video_length || "",
                                video_link: v.video_link || "",
                                video_desc: v.video_desc || ""
                            }))
                            : []
                    };
                }
                // Handle string in array
                return {
                    videoType: item,
                    videos: []
                };
            });
        }

        // Handle single object case
        if (typeof data === 'object') {
            return [{
                videoType: data.videoType || data.video_type || "",
                videos: Array.isArray(data.videos)
                    ? data.videos.map(v => ({
                        video_title: v.video_title || "",
                        video_length: v.video_length || "",
                        video_link: v.video_link || "",
                        video_desc: v.video_desc || ""
                    }))
                    : []
            }];
        }

        return [];
    };

    function normalizeThemes(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    theme: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeValidations(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    validation: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeObjections(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    objection: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeChallenges(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    challenges: entry, ranking: "", justification: "", perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }
    function normalizeSalesInsights(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    insight: entry,
                    ranking: "",
                    justification: "",
                    perception: "",
                    whyItMatters: "",
                    deeperInsight: "",
                    supportingQuotes: ""
                };
            }
            return entry;
        });
    }

    function normalizeCaseStudyOtherVideo(data) {
        if (!Array.isArray(data)) return [];
        return data.map(entry => {
            if (typeof entry === "string") {
                return {
                    video_title: "",
                    video_link: "",
                    copy_and_paste_text: "",
                    link_to_document: ""
                };
            }
            return {
                video_title: entry.video_title || "",
                video_link: entry.video_link || "",
                copy_and_paste_text: entry.copy_and_paste_text || "",
                link_to_document: entry.link_to_document || ""
            };
        });
    }

    function normalizeGuestData(data, entityData) {
        if (!data) return [];

        // Handle empty string case
        if (typeof data === 'string' && data.trim() === '') return [];

        // Handle string format (could be JSON string or single guest name)
        if (typeof data === 'string') {
            try {
                // First try to parse as JSON
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed.map(guest => ({
                        "Avatar": guest.Avatar || "",
                        "Persona": guest["Persona"] || "",
                        "Industry Vertical": guest["Industry Vertical"] || "",
                        "Guest": guest.Guest || "",
                        "Guest Title": guest["Guest Title"] || "",
                        "Guest Company": guest["Guest Company"] || "",
                        "Guest Industry": guest["Guest Industry"] || "",
                        "Tracker": guest["Tracker"] || "",
                        "LinkedIn Profile": guest["LinkedIn Profile"] || "",
                        "Dossier": guest["Dossier"] || "",
                    }));
                }

                // If it's a single guest object
                return [{
                    "Avatar": parsed.Avatar || "",
                    "Persona": parsed["Persona"] || "",
                    "Industry Vertical": parsed["Industry Vertical"] || "",
                    "Guest": parsed.Guest || "",
                    "Guest Title": parsed["Guest Title"] || "",
                    "Guest Company": parsed["Guest Company"] || "",
                    "Guest Industry": parsed["Guest Industry"] || "",
                    "Tracker": parsed["Tracker"] || "",
                    "LinkedIn Profile": parsed["LinkedIn Profile"] || "",
                    "Dossier": parsed["Dossier"] || "",
                }];
            } catch (e) {
                // If parsing fails, treat as a single guest name
                return [{
                    "Avatar": "",
                    "Persona": entityData["Persona"] || "",
                    "Industry Vertical": entityData["Industry Vertical"] || "",
                    "Guest": data,
                    "Guest Title": entityData['Guest Title'],
                    "Guest Company": entityData['Guest Company'],
                    "Guest Industry": entityData['Guest Industry'],
                    "Tracker": entityData['Tracker'],
                    "LinkedIn Profile": entityData['LinkedIn Profile'],
                    "Dossier": entityData['Dossier'],
                }];
            }
        }
        console.log("guest datata", data);
        // Handle array format
        if (Array.isArray(data)) {
            return data.map(guest => ({
                "Avatar": guest.Avatar || "",
                "Persona": guest["Persona"] || "",
                "Industry Vertical": guest["Industry Vertical"] || "",
                "Guest": guest.Guest || "",
                "Guest Title": guest["Guest Title"] || "",
                "Guest Company": guest["Guest Company"] || "",
                "Guest Industry": guest["Guest Industry"] || "",
                "Tracker": guest["Tracker"] || "",
                "LinkedIn Profile": guest["LinkedIn Profile"] || "",
                "Dossier": guest["Dossier"] || "",
            }));
        }

        // Handle single guest object
        return [{
            "Avatar": data.Avatar || "",
            "Persona": data["Persona"] || "",
            "Industry Vertical": data["Industry Vertical"] || "",
            "Guest": data.Guest || "",
            "Guest Title": data["Guest Title"] || "",
            "Guest Company": data["Guest Company"] || "",
            "Guest Industry": data["Guest Industry"] || "",
            "Tracker": data["Tracker"] || "",
            "LinkedIn Profile": data["LinkedIn Profile"] || "",
            "Dossier": data["Dossier"] || "",

        }];

    }

    function normalizePrepCalls(data) {
        if (!data) return [];

        // Handle string case (could be JSON string)
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizePrepCalls(parsed); // Recursively handle parsed data
            } catch {
                return [];
            }
        }

        // Handle array case
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Unedited Prep Call Video": item["Unedited Prep Call Video"] || "",
                "Unedited Prep Call Transcript": item["Unedited Prep Call Transcript"] || "",
                "Discussion Guide": item["Discussion Guide"] || ""
            }));
        }

        // Handle single object case
        if (typeof data === 'object') {
            return [{
                "Unedited Prep Call Video": data["Unedited Prep Call Video"] || "",
                "Unedited Prep Call Transcript": data["Unedited Prep Call Transcript"] || "",
                "Discussion Guide": data["Discussion Guide"] || ""
            }];
        }

        return [];
    }

    function normalizeAdditionalProjects(data) {
        if (!data) return [];

        // Handle string case (could be JSON string)
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeAdditionalProjects(parsed); // Recursively handle parsed data
            } catch {
                return [];
            }
        }

        // Handle array case
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Podcast": item["Podcast"] || "",
                "eBooks": item["eBooks"] || "",
                "Articles": item["Articles"] || "",
                "Other": item["Other"] || ""
            }));
        }

        // Handle single object case
        if (typeof data === 'object') {
            return [{
                "Podcast": data["Podcast"] || "",
                "eBooks": data["eBooks"] || "",
                "Articles": data["Articles"] || "",
                "Other": data["Other"] || ""
            }];
        }

        return [];
    }

    function normalizeEmails(data) {
        if (!data) return [];

        // Handle string case (could be JSON string)
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeEmails(parsed); // Recursively handle parsed data
            } catch {
                return [];
            }
        }

        // Handle array case
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Guest": item["Guest"] || "",
                "Cold": item["Cold"] || "",
                "Warm": item["Warm"] || "",
                "category": item["category"] || ""
            }));
        }

        // Handle single object case
        if (typeof data === 'object') {
            return [{
                "Guest": data["Guest"] || "",
                "Cold": data["Cold"] || "",
                "Warm": data["Warm"] || "",
                "category": data["category"] || ""
            }];
        }

        return [];
    }

    // Normalization functions for all episode-related fields
    function normalizeFullEpisodeDetails(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeDetails(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Episode ID": item["Episode ID"] || "",
                "Episode Number": item["Episode Number"] || "",
                "Episode Title": item["Episode Title"] || "",
                "Date Recorded": item["Date Recorded"] || "",
                "Category": item["Category"] || "",
                "Short Episode Description": item["Short Episode Description"] || "",
                "Long Episode Description": item["Long Episode Description"] || "",
                "Formate": item["Formate"] || "",
                "Short and Long-Tail SEO Keywords": item["Short and Long-Tail SEO Keywords"] || "",
                "All Asset Folder": item["All Asset Folder"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Episode ID": data["Episode ID"] || "",
                "Episode Number": data["Episode Number"] || "",
                "Episode Title": data["Episode Title"] || "",
                "Date Recorded": data["Date Recorded"] || "",
                "Category": data["Category"] || "",
                "Short Episode Description": data["Short Episode Description"] || "",
                "Long Episode Description": data["Long Episode Description"] || "",
                "Formate": data["Formate"] || "",
                "Short and Long-Tail SEO Keywords": data["Short and Long-Tail SEO Keywords"] || "",
                "All Asset Folder": data["All Asset Folder"] || ""
            }];
        }
        return [];
    }

    function normalizeFullEpisodeVideo(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeVideo(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Full Episode Video Title": item["Full Episode Video Title"] || "",
                "Full Episode Video Length": item["Full Episode Video Length"] || "",
                "Full Episode Video Description": item["Full Episode Video Description"] || "",
                "Full Episode Audio File": item["Full Episode Audio File"] || "",
                "Full Episode YouTube URL": item["Full Episode YouTube URL"] || "",
                // "Full Episode Details": item["Full Episode Details"] || "",
                "Unedited Full Episode Transcript": item["Unedited Full Episode Transcript"] || "",
                "Provocative Statements": item["Provocative Statements"] || "",
                "Custom Requests": item["Custom Requests"] || "",
                // "LinkedIn Post Text": item["LinkedIn Post Text"] || "",
                // "LinkedIn Executive Comments": item["LinkedIn Executive Comments"] || "",
                // "Emails Marketing": item["Emails Marketing"] || "",
                // "Emails Sales": item["Emails Sales"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Full Episode Video Title": data["Full Episode Video Title"] || "",
                "Full Episode Video Length": data["Full Episode Video Length"] || "",
                "Full Episode Video Description": data["Full Episode Video Description"] || "",
                "Full Episode Audio File": data["Full Episode Audio File"] || "",
                "Full Episode YouTube URL": data["Full Episode YouTube URL"] || "",
                // "Full Episode Details": data["Full Episode Details"] || "",
                "Unedited Full Episode Transcript": data["Unedited Full Episode Transcript"] || "",
                "Edited Full Episode Transcript": data["Edited Full Episode Transcript"] || "",
                "Provocative Statements": data["Provocative Statements"] || "",
                "Custom Requests": data["Custom Requests"] || "",
            }];
        }
        return [];
    }

    function normalizeFullEpisodeExtendedContent(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeExtendedContent(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Article URL": item["Article URL"] || "",
                "Article Text": item["Article Text"] || "",
                "YouTube Short Video File": item["YouTube Short Video File"] || "",
                "YouTube Short URL": item["YouTube Short URL"] || "",
                "YouTube Short Transcript": item["YouTube Short Transcript"] || "",
                "LinkedIn Video File": item["LinkedIn Video File"] || "",
                "LinkedIn Video Transcript": item["LinkedIn Video Transcript"] || "",
                "LinkedIn Post Text": item["LinkedIn Post Text"] || "",
                "LinkedIn Executive Comments": item["LinkedIn Executive Comments"] || "",
                "Emails Marketing": item["Emails Marketing"] || "",
                "Emails Sales": item["Emails Sales"] || "",
                "Full Episode Quote Card": item["Full Episode Quote Card"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Article URL": data["Article URL"] || "",
                "Article Text": data["Article Text"] || "",
                "YouTube Short Video File": data["YouTube Short Video File"] || "",
                "YouTube Short URL": data["YouTube Short URL"] || "",
                "YouTube Short Transcript": data["YouTube Short Transcript"] || "",
                "LinkedIn Video File": data["LinkedIn Video File"] || "",
                "LinkedIn Video Transcript": data["LinkedIn Video Transcript"] || "",
                "LinkedIn Post Text": data["LinkedIn Post Text"] || "",
                "LinkedIn Executive Comments": data["LinkedIn Executive Comments"] || "",
                "Emails Marketing": data["Emails Marketing"] || "",
                "Emails Sales": data["Emails Sales"] || "",
                "Full Episode Quote Card": data["Full Episode Quote Card"] || ""
            }];
        }
        return [];
    }

    function normalizeFullEpisodeHighlightVideo(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeHighlightVideo(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Highlight Video Title": item["Highlight Video Title"] || "",
                "Highlight Video Length": item["Highlight Video Length"] || "",
                "Highlight Video Description": item["Highlight Video Description"] || "",
                "Highlight Video File": item["Highlight Video File"] || "",
                " HighlightYouTube URL": item["YHighlight ouTube URL"] || "",
                "Highlight Video Transcript": item["Highlight Video Transcript"] || "",
                "Highlights Video LinkedIn Post Information (post text, comments & emails)": item["Highlights Video LinkedIn Post Information (post text, comments & emails)"] || "",
                // "Highlights Video Details": item["Highlights Video Details"] || "",
                // "LinkedIn Post Text": item["LinkedIn Post Text"] || "",
                // "LinkedIn Executive Comments": item["LinkedIn Executive Comments"] || "",
                // "Emails Marketing": item["Emails Marketing"] || "",
                // "Emails Sales": item["Emails Sales"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Highlight Video Title": data["Highlight Video Title"] || "",
                "Highlight Video Length": data["Highlight Video Length"] || "",
                "Highlight Video Description": data["Highlight Video Description"] || "",
                "Highlight Video File": data["Highlight Video File"] || "",
                " HighlightYouTube URL": data["YHighlight ouTube URL"] || "",
                "Highlight Video Transcript": data["Highlight Video Transcript"] || "",
                "Highlights Video LinkedIn Post Information (post text, comments & emails)": data["Highlights Video LinkedIn Post Information (post text, comments & emails)"] || "",
            }];
        }
        return [];
    }

    function normalizeFullEpisodeIntroductionVideo(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeIntroductionVideo(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Introduction Video Title": item["Introduction Video Title"] || "",
                "Introduction Video Length": item["Introduction Video Length"] || "",
                "Introduction Video Description": item["Introduction Video Description"] || "",
                "Introduction Video File": item["Introduction Video File"] || "",
                "Introduction Video YouTube URL": item["Introduction Video YouTube URL"] || "",
                "Introduction Video Transcript": item["Introduction Video Transcript"] || ""
            }));
        }

        if (typeof data === 'object') {
            return [{
                "Introduction Video Title": data["Introduction Video Title"] || "",
                "Introduction Video Length": data["Introduction Video Length"] || "",
                "Introduction Video Description": data["Introduction Video Description"] || "",
                "Introduction Video File": data["Introduction Video File"] || "",
                "Introduction Video YouTube URL": data["Introduction Video YouTube URL"] || "",
                "Introduction Video Transcript": data["Introduction Video Transcript"] || ""
            }];
        }

        return [];
    }

    function normalizeFullEpisodeQAVideos(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeQAVideos(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "QAV1 Video Title": item["QAV1 Video Title"] || "",
                "QAV1 Video Length": item["QAV1 Video Length"] || "",
                "QAV1 Video Description": item["QAV1 Video Description"] || "",
                "QAV1 Video Quote": item["QAV1 Video Quote"] || "",
                "QAV1 Video Hashtags": item["QAV1 Video Hashtags"] || "",
                "QAV1 Video LinkedIn Post Information (post text, comments & emails)":
                    item["QAV1 Video LinkedIn Post Information (post text, comments & emails)"] || "",
                "QAV1 Video File": item["QAV1 Video File"] || "",
                "QAV1 YouTube URL": item["QAV1 YouTube URL"] || "",
                "QAV1 Video Transcript": item["QAV1 Video Transcript"] || "",
                "QAV1 Article URL": item["QAV1 Article URL"] || "",
                "QAV1 Article Text": item["QAV1 Article Text"] || "",
                "QAV1 YouTube Short Video File": item["QAV1 YouTube Short Video File"] || "",
                "QAV1 YouTube Short URL": item["QAV1 YouTube Short URL"] || "",
                "QAV1 YouTube Short Transcript": item["QAV1 YouTube Short Transcript"] || "",
                "QAV1 LinkedIn Short Video File": item["QAV1 LinkedIn Short Video File"] || "",
                "QAV1 Quote Card": item["QAV1 Quote Card"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "QAV1 Video Title": data["QAV1 Video Title"] || "",
                "QAV1 Video Length": data["QAV1 Video Length"] || "",
                "QAV1 Video Description": data["QAV1 Video Description"] || "",
                "QAV1 Video Quote": data["QAV1 Video Quote"] || "",
                "QAV1 Video Hashtags": data["QAV1 Video Hashtags"] || "",
                "QAV1 Video LinkedIn Post Information (post text, comments & emails)":
                    data["QAV1 Video LinkedIn Post Information (post text, comments & emails)"] || "",
                "QAV1 Video File": data["QAV1 Video File"] || "",
                "QAV1 YouTube URL": data["QAV1 YouTube URL"] || "",
                "QAV1 Video Transcript": data["QAV1 Video Transcript"] || "",
                "QAV1 Article URL": data["QAV1 Article URL"] || "",
                "QAV1 Article Text": data["QAV1 Article Text"] || "",
                "QAV1 YouTube Short Video File": data["QAV1 YouTube Short Video File"] || "",
                "QAV1 YouTube Short URL": data["QAV1 YouTube Short URL"] || "",
                "QAV1 YouTube Short Transcript": data["QAV1 YouTube Short Transcript"] || "",
                "QAV1 LinkedIn Short Video File": data["QAV1 LinkedIn Short Video File"] || "",
                "QAV1 Quote Card": data["QAV1 Quote Card"] || ""
            }];
        }
        return [];
    }

    function normalizeFullEpisodePodbook(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodePodbook(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Podbook Interactive Link": item["Podbook Interactive Link"] || "",
                "Podbook Website URL": item["Podbook Website URL"] || "",
                "Podbook Embed Code": item["Podbook Embed Code"] || "",
                "Podbook Presentation": item["Podbook Presentation"] || "",
                "Podbook Loom Folder": item["Podbook Loom Folder"] || ""
            }));
        }

        if (typeof data === 'object') {
            return [{
                "Podbook Interactive Link": data["Podbook Interactive Link"] || "",
                "Podbook Website URL": data["Podbook Website URL"] || "",
                "Podbook Embed Code": data["Podbook Embed Code"] || "",
                "Podbook Presentation": data["Podbook Presentation"] || "",
                "Podbook Loom Folder": data["Podbook Loom Folder"] || ""
            }];
        }

        return [];
    }

    function normalizeFullEpisodeFullCaseStudy(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeFullCaseStudy(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Full Case Study Interactive Link": item["Full Case Study Interactive Link"] || "",
                "Full Case Study Website URL": item["Full Case Study Website URL"] || "",
                "Full Case Study Embed Code": item["Full Case Study Embed Code"] || "",
                "Full Case Study Text": item["Full Case Study Text"] || "",
                "Full Case Study LinkedIn Post Information (post text, comments & emails)": item["Full Case Study LinkedIn Post Information (post text, comments & emails)"] || "",
                "Problem Section Video File": item["Problem Section Video File"] || "",
                "Problem Section Video Length": item["Problem Section Video Length"] || "",
                "Problem Section Video Transcript": item["Problem Section Video Transcript"] || "",
                "Solutions Section Video File": item["Solutions Section Video File"] || "",
                "Solutions Section Video Length": item["Solutions Section Video Length"] || "",
                "Solutions Section Video Transcript": item["Solutions Section Video Transcript"] || "",
                "Results Section Video File": item["Results Section Video File"] || "",
                "Results Section Video Length": item["Results Section Video Length"] || "",
                "Results Section Video Transcript": item["Results Section Video Transcript"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Full Case Study Interactive Link": data["Full Case Study Interactive Link"] || "",
                "Full Case Study Website URL": data["Full Case Study Website URL"] || "",
                "Full Case Study Embed Code": data["Full Case Study Embed Code"] || "",
                "Full Case Study Text": data["Full Case Study Text"] || "",
                "Full Case Study LinkedIn Post Information (post text, comments & emails)": data["Full Case Study LinkedIn Post Information (post text, comments & emails)"] || "",
                "Problem Section Video File": data["Problem Section Video File"] || "",
                "Problem Section Video Length": data["Problem Section Video Length"] || "",
                "Problem Section Video Transcript": data["Problem Section Video Transcript"] || "",
                "Solutions Section Video File": data["Solutions Section Video File"] || "",
                "Solutions Section Video Length": data["Solutions Section Video Length"] || "",
                "Solutions Section Video Transcript": data["Solutions Section Video Transcript"] || "",
                "Results Section Video File": data["Results Section Video File"] || "",
                "Results Section Video Length": data["Results Section Video Length"] || "",
                "Results Section Video Transcript": data["Results Section Video Transcript"] || ""
            }];
        }

        return [];
    }

    function normalizeFullEpisodeOnePageCaseStudy(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeOnePageCaseStudy(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "One Page Case Study Interactive Link": item["One Page Case Study Interactive Link"] || "",
                "One Page Case Study Website URL": item["One Page Case Study Website URL"] || "",
                "One Page Case Study Embed Code": item["One Page Case Study Embed Code"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "One Page Case Study Interactive Link": data["One Page Case Study Interactive Link"] || "",
                "One Page Case Study Website URL": data["One Page Case Study Website URL"] || "",
                "One Page Case Study Embed Code": data["One Page Case Study Embed Code"] || ""
            }];
        }

        return [];
    }

    function normalizeFullEpisodeOtherCaseStudy(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeOtherCaseStudy(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Other Case Study Interactive Experience": item["Other Case Study Interactive Experience"] || "",
                "Case Study Text": item["Case Study Text"] || "",
                "Sales Email": item["Sales Email"] || "",
                "Other Case Study Video": item["Other Case Study Video"] || "",
                "Other Case Study Video Length": item["Other Case Study Video Length"] || "",
                "Other Case Study Video Transcript": item["Other Case Study Video Transcript"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Other Case Study Interactive Experience": data["Other Case Study Interactive Experience"] || "",
                "Case Study Text": data["Case Study Text"] || "",
                "Sales Email": data["Sales Email"] || "",
                "Other Case Study Video": data["Other Case Study Video"] || "",
                "Other Case Study Video Length": data["Other Case Study Video Length"] || "",
                "Other Case Study Video Transcript": data["Other Case Study Video Transcript"] || ""
            }];
        }
        return [];
    }

    function normalizeFullEpisodeICPAdvice(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeICPAdvice(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Post-Podcast Video": item["Post-Podcast Video"] || "",
                "Unedited Post-Podcast Video Length": item["Unedited Post-Podcast Video Length"] || "",
                "Unedited Post-Podcast Transcript": item["Unedited Post-Podcast Transcript"] || "",
                "Post-Podcast Insights Report": item["Post-Podcast Insights Report"] || "",
                "Post-Podcast Vision Report": item["Post-Podcast Vision Report"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Post-Podcast Video": data["Post-Podcast Video"] || "",
                "Unedited Post-Podcast Video Length": data["Unedited Post-Podcast Video Length"] || "",
                "Unedited Post-Podcast Transcript": data["Unedited Post-Podcast Transcript"] || "",
                "Post-Podcast Insights Report": data["Post-Podcast Insights Report"] || "",
                "Post-Podcast Vision Report": data["Post-Podcast Vision Report"] || ""
            }];
        }
        return [];
    }
    function normalizeFullEpisodeChallengeQuestions(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeFullEpisodeChallengeQuestions(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Unedited Challenge Question Video": item["Unedited Challenge Question Video"] || "",
                "Unedited Challenge Question Video Length": item["Unedited Challenge Question Video Length"] || "",
                "Unedited Challenge Question Transcript": item["Unedited Challenge Question Transcript"] || "",
                "Challenge Report": item["Challenge Report"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Unedited Challenge Question Video": data["Unedited Challenge Question Video"] || "",
                "Unedited Challenge Question Video Length": data["Unedited Challenge Question Video Length"] || "",
                "Unedited Challenge Question Transcript": data["Unedited Challenge Question Transcript"] || "",
                "Challenge Report": data["Challenge Report"] || ""
            }];
        }
        return [];
    }

    function normalizeIcpAdviceReport(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeIcpAdviceReport(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "ICP Advice Post-Podcast Video File": item["ICP Advice Post-Podcast Video File"] || "",
                "ICP Advice Post-Podcast Video Length": item["ICP Advice Post-Podcast Video Length"] || "",
                "ICP Advice Post-Podcast Video Transcript": item["ICP Advice Post-Podcast Video Transcript"] || "",
                "ICP Advice Report": item["ICP Advice Report"] || ""
            }));
        }
        if (typeof data === 'object') {
            // Ensure we're not accidentally picking up SQL Analysis Report data
            if (data["SQL Analysis Post-Podcast Video File"]) {
                return []; // This is SQL Analysis data, not ICP Advice
            }
            return [{
                "ICP Advice Post-Podcast Video File": data["ICP Advice Post-Podcast Video File"] || "",
                "ICP Advice Post-Podcast Video Length": data["ICP Advice Post-Podcast Video Length"] || "",
                "ICP Advice Post-Podcast Video Transcript": data["ICP Advice Post-Podcast Video Transcript"] || "",
                "ICP Advice Report": data["ICP Advice Report"] || ""
            }];
        }
        return [];
    }

    function normalizeSqlAnalysisReport(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeSqlAnalysisReport(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "SQL Analysis Post-Podcast Video File": item["SQL Analysis Post-Podcast Video File"] || "",
                "SQL Analysis Post-Podcast Video Length": item["SQL Analysis Post-Podcast Video Length"] || "",
                "SQL Analysis Post-Podcast Video Transcript": item["SQL Analysis Post-Podcast Video Transcript"] || "",
                "SQL Analysis Report": item["SQL Analysis Report"] || ""
            }));
        }
        if (typeof data === 'object') {
            // Ensure we're not accidentally picking up Challenge Questions data
            if (data["Challenge Questions Prep Call Video File"]) {
                return []; // This is Challenge Questions data, not SQL Analysis
            }
            return [{
                "SQL Analysis Post-Podcast Video File": data["SQL Analysis Post-Podcast Video File"] || "",
                "SQL Analysis Post-Podcast Video Length": data["SQL Analysis Post-Podcast Video Length"] || "",
                "SQL Analysis Post-Podcast Video Transcript": data["SQL Analysis Post-Podcast Video Transcript"] || "",
                "SQL Analysis Report": data["SQL Analysis Report"] || ""
            }];
        }
        return [];
    }

    function normalizeChallengeQuestions(data) {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return normalizeChallengeQuestions(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(data)) {
            return data.map(item => ({
                "Challenge Questions Prep Call Video File": item["Challenge Questions Prep Call Video File"] || "",
                "Challenge Questions Prep Call Video Length": item["Challenge Questions Prep Call Video Length"] || "",
                "Challenge Questions Prep Call Video Transcript": item["Challenge Questions Prep Call Video Transcript"] || "",
                "Challenge Questions Report": item["Challenge Questions Report"] || ""
            }));
        }
        if (typeof data === 'object') {
            return [{
                "Challenge Questions Prep Call Video File": data["Challenge Questions Prep Call Video File"] || "",
                "Challenge Questions Prep Call Video Length": data["Challenge Questions Prep Call Video Length"] || "",
                "Challenge Questions Prep Call Video Transcript": data["Challenge Questions Prep Call Video Transcript"] || "",
                "Challenge Questions Report": data["Challenge Questions Report"] || ""
            }];
        }
        return [];
    }

    useEffect(() => {
        if (entityData?.id) {
            const matchedData = themesRank?.find(item => item.id == entityData.id);


            // Add this in the useEffect that loads entityData
            // eBook
            const eBookData = matchedData?.eBook;
            if (eBookData) {
                try {
                    setEBookEntries(normalizeEBook(eBookData));
                } catch (e) {
                    console.error("Error parsing eBook data:", e);
                    setEBookEntries([]);
                }
            } else {
                setEBookEntries([]);
            }

            // Guest Challenge Report
            const guestChallengeReportData = matchedData?.['Multi-Guest_Challenge_Report_Text'];
            if (guestChallengeReportData) {
                try {
                    setGuestChallengeReportEntries(normalizeGuestChallengeReport(guestChallengeReportData));
                } catch (e) {
                    console.error("Error parsing Guest Challenge Report data:", e);
                    setGuestChallengeReportEntries([]);
                }
            } else {
                setGuestChallengeReportEntries([]);
            }
            // ICP Advice Report - ensure it's not picking up SQL data
            const icpAdviceReportData = matchedData?.ICP_Advice_Report;
            if (icpAdviceReportData) {
                try {
                    const normalized = normalizeIcpAdviceReport(icpAdviceReportData);
                    // Filter out any entries that might contain SQL data
                    const filtered = normalized.filter(item =>
                        !item["SQL Analysis Post-Podcast Video File"] &&
                        !item["SQL Analysis Report"]
                    );
                    setIcpAdviceReportEntries(filtered);
                } catch (e) {
                    console.error("Error parsing ICP Advice Report data:", e);
                    setIcpAdviceReportEntries([]);
                }
            } else {
                setIcpAdviceReportEntries([]);
            }

            // SQL Analysis Report - ensure it's not picking up Challenge data
            const sqlAnalysisReportData = matchedData?.SQL_Analysis_Report;
            if (sqlAnalysisReportData) {
                try {
                    const normalized = normalizeSqlAnalysisReport(sqlAnalysisReportData);
                    // Filter out any entries that might contain Challenge data
                    const filtered = normalized.filter(item =>
                        !item["Challenge Questions Prep Call Video File"] &&
                        !item["Challenge Questions Report"]
                    );
                    setSqlAnalysisReportEntries(filtered);
                } catch (e) {
                    console.error("Error parsing SQL Analysis Report data:", e);
                    setSqlAnalysisReportEntries([]);
                }
            } else {
                setSqlAnalysisReportEntries([]);
            }

            // Challenge Questions
            const challengeQuestionsData = matchedData?.Challenge_Questions;
            if (challengeQuestionsData) {
                try {
                    setChallengeQuestionsEntries(normalizeChallengeQuestions(challengeQuestionsData));
                } catch (e) {
                    console.error("Error parsing Challenge Questions data:", e);
                    setChallengeQuestionsEntries([]);
                }
            } else {
                setChallengeQuestionsEntries([]);
            }


            const emailData = matchedData?.Emails;
            if (emailData) {
                try {
                    setEmailEntries(normalizeEmails(emailData));
                } catch (e) {
                    console.error("Error parsing email data:", e);
                    setEmailEntries([]);
                }
            } else {
                setEmailEntries([]);
            }

            // Full Episode Details
            const fullEpisodeDetailsData = matchedData?.DETAILS_FULL_EPISODES;
            if (fullEpisodeDetailsData) {
                try {
                    setFullEpisodeDetailsEntries(normalizeFullEpisodeDetails(fullEpisodeDetailsData));
                } catch (e) {
                    console.error("Error parsing full episode details data:", e);
                    setFullEpisodeDetailsEntries([]);
                }
            } else {
                setFullEpisodeDetailsEntries([]);
            }

            // Full Episode Video
            const fullEpisodeVideoData = matchedData?.FULL_EPISODE_VIDEO;
            if (fullEpisodeVideoData) {
                try {
                    setFullEpisodeVideoEntries(normalizeFullEpisodeVideo(fullEpisodeVideoData));
                } catch (e) {
                    console.error("Error parsing full episode video data:", e);
                    setFullEpisodeVideoEntries([]);
                }
            } else {
                setFullEpisodeVideoEntries([]);
            }

            // Full Episode Extended Content
            const fullEpisodeExtendedContentData = matchedData?.FULL_EPISODE_EXTENDED_CONTENT;
            if (fullEpisodeExtendedContentData) {
                try {
                    setFullEpisodeExtendedContentEntries(normalizeFullEpisodeExtendedContent(fullEpisodeExtendedContentData));
                } catch (e) {
                    console.error("Error parsing full episode extended content data:", e);
                    setFullEpisodeExtendedContentEntries([]);
                }
            } else {
                setFullEpisodeExtendedContentEntries([]);
            }

            // Full Episode Highlight Video
            const fullEpisodeHighlightVideoData = matchedData?.FULL_EPISODE_HIGHLIGHT_VIDEO;
            if (fullEpisodeHighlightVideoData) {
                try {
                    setFullEpisodeHighlightVideoEntries(normalizeFullEpisodeHighlightVideo(fullEpisodeHighlightVideoData));
                } catch (e) {
                    console.error("Error parsing full episode highlight video data:", e);
                    setFullEpisodeHighlightVideoEntries([]);
                }
            } else {
                setFullEpisodeHighlightVideoEntries([]);
            }

            // Full Episode Introduction Video
            const fullEpisodeIntroductionVideoData = matchedData?.FULL_EPISODE_INTRODUCTION_VIDEO;
            if (fullEpisodeIntroductionVideoData) {
                try {
                    setFullEpisodeIntroductionVideoEntries(normalizeFullEpisodeIntroductionVideo(fullEpisodeIntroductionVideoData));
                } catch (e) {
                    console.error("Error parsing full episode introduction video data:", e);
                    setFullEpisodeIntroductionVideoEntries([]);
                }
            } else {
                setFullEpisodeIntroductionVideoEntries([]);
            }

            // Full Episode QA Videos
            const fullEpisodeQAVideosData = matchedData?.FULL_EPISODE_QA_VIDEOS;
            if (fullEpisodeQAVideosData) {
                try {
                    setFullEpisodeQAVideosEntries(normalizeFullEpisodeQAVideos(fullEpisodeQAVideosData));
                } catch (e) {
                    console.error("Error parsing full episode QA videos data:", e);
                    setFullEpisodeQAVideosEntries([]);
                }
            } else {
                setFullEpisodeQAVideosEntries([]);
            }

            // Full Episode Podbook
            const fullEpisodePodbookData = matchedData?.FULL_EPISODE_PODBOOK;
            if (fullEpisodePodbookData) {
                try {
                    setFullEpisodePodbookEntries(normalizeFullEpisodePodbook(fullEpisodePodbookData));
                } catch (e) {
                    console.error("Error parsing full episode podbook data:", e);
                    setFullEpisodePodbookEntries([]);
                }
            } else {
                setFullEpisodePodbookEntries([]);
            }

            // Full Episode Full Case Study
            const fullEpisodeFullCaseStudyData = matchedData?.FULL_EPISODE_FULL_CASE_STUDY;
            if (fullEpisodeFullCaseStudyData) {
                try {
                    setFullEpisodeFullCaseStudyEntries(normalizeFullEpisodeFullCaseStudy(fullEpisodeFullCaseStudyData));
                } catch (e) {
                    console.error("Error parsing full episode full case study data:", e);
                    setFullEpisodeFullCaseStudyEntries([]);
                }
            } else {
                setFullEpisodeFullCaseStudyEntries([]);
            }

            // Full Episode One Page Case Study
            const fullEpisodeOnePageCaseStudyData = matchedData?.FULL_EPISODE_ONE_PAGE_CASE_STUDY;
            if (fullEpisodeOnePageCaseStudyData) {
                try {
                    setFullEpisodeOnePageCaseStudyEntries(normalizeFullEpisodeOnePageCaseStudy(fullEpisodeOnePageCaseStudyData));
                } catch (e) {
                    console.error("Error parsing full episode one page case study data:", e);
                    setFullEpisodeOnePageCaseStudyEntries([]);
                }
            } else {
                setFullEpisodeOnePageCaseStudyEntries([]);
            }

            // Full Episode Other Case Study
            const fullEpisodeOtherCaseStudyData = matchedData?.FULL_EPISODE_OTHER_CASE_STUDY;
            if (fullEpisodeOtherCaseStudyData) {
                try {
                    setFullEpisodeOtherCaseStudyEntries(normalizeFullEpisodeOtherCaseStudy(fullEpisodeOtherCaseStudyData));
                } catch (e) {
                    console.error("Error parsing full episode other case study data:", e);
                    setFullEpisodeOtherCaseStudyEntries([]);
                }
            } else {
                setFullEpisodeOtherCaseStudyEntries([]);
            }

            // Full Episode ICP Advice
            const fullEpisodeICPAdviceData = matchedData?.FULL_EPISODE_ICP_ADVICE;
            if (fullEpisodeICPAdviceData) {
                try {
                    setFullEpisodeICPAdviceEntries(normalizeFullEpisodeICPAdvice(fullEpisodeICPAdviceData));
                } catch (e) {
                    console.error("Error parsing full episode ICP advice data:", e);
                    setFullEpisodeICPAdviceEntries([]);
                }
            } else {
                setFullEpisodeICPAdviceEntries([]);
            }

            // Full Episode Challenge Questions
            const fullEpisodeChallengeQuestionsData = matchedData?.FULL_EPISODE_CHALLENGE_QUESTIONS;
            if (fullEpisodeChallengeQuestionsData) {
                try {
                    setFullEpisodeChallengeQuestionsEntries(normalizeFullEpisodeChallengeQuestions(fullEpisodeChallengeQuestionsData));
                } catch (e) {
                    console.error("Error parsing full episode challenge questions data:", e);
                    setFullEpisodeChallengeQuestionsEntries([]);
                }
            } else {
                setFullEpisodeChallengeQuestionsEntries([]);
            }

            const additionalGuestProjectData = matchedData?.Additional_Guest_Projects;

            // Handle Additional Guest Projects
            if (additionalGuestProjectData) {
                try {
                    setAdditionalProjectEntries(normalizeAdditionalProjects(additionalGuestProjectData));
                } catch (e) {
                    console.error("Error parsing prep call data:", e);
                    setAdditionalProjectEntries([]);
                }
            } else {
                setAdditionalProjectEntries([]);
            }
            const prepCallData = matchedData?.Prep_Call;
            // Handle Prep Calls
            if (prepCallData) {
                try {
                    setPrepCallEntries(normalizePrepCalls(prepCallData));
                } catch (e) {
                    console.error("Error parsing prep call data:", e);
                    setPrepCallEntries([]);
                }
            } else {
                setPrepCallEntries([]);
            }
            // Handle Video Types
            const videoData = matchedData?.["Video Type"];
            if (videoData) {
                try {
                    setVideoTypeEntries(normalizeVideoType(videoData));
                } catch (e) {
                    console.log("Error parsing video types:", e);
                    setVideoTypeEntries([]);
                }
            } else {
                setVideoTypeEntries([]);
            }

            // --- Handle Themes
            const themeData = matchedData?.Themes;
            if (themeData) {
                try {
                    const parsed = Array.isArray(themeData) ? themeData : JSON.parse(themeData);
                    setThemeEntries(normalizeThemes(parsed));
                } catch (e) {
                    console.log("Error parsing themes:", e);
                    setThemeEntries([]);
                }
            } else {
                setThemeEntries([]);
            }

            // --- Handle Validations
            const validationData = matchedData?.Validations;
            if (validationData) {
                try {
                    const parsed = Array.isArray(validationData) ? validationData : JSON.parse(validationData);
                    setValidationEntries(normalizeValidations(parsed));
                } catch (e) {
                    console.log("Error parsing validations:", e);
                    setValidationEntries([]);
                }
            } else {
                setValidationEntries([]);
            }

            // --- Handle Objections
            const objectionData = matchedData?.Objections;
            if (objectionData) {
                try {
                    const parsed = Array.isArray(objectionData) ? objectionData : JSON.parse(objectionData);
                    setObjectionEntries(normalizeObjections(parsed));
                } catch (e) {
                    console.log("Error parsing objections:", e);
                    setObjectionEntries([]);
                }
            } else {
                setObjectionEntries([]);
            }
            // --- Handle  Challenges
            const challengesData = matchedData?.Challenges;
            if (challengesData) {
                try {
                    const parsed = Array.isArray(challengesData) ? challengesData : JSON.parse(challengesData);
                    setChallengesEntries(normalizeChallenges(parsed));
                } catch (e) {
                    console.log("Error parsing challenges:", e);
                    setChallengesEntries([]);
                }
            } else {
                setChallengesEntries([]);
            }

            // --- Handle Sales Insights 
            const salesInsightsData = matchedData?.["Sales Insights"];
            if (salesInsightsData) {
                try {
                    const parsed = Array.isArray(salesInsightsData) ? salesInsightsData : JSON.parse(salesInsightsData);
                    setSalesInsightsEntries(normalizeSalesInsights(parsed));
                } catch (e) {
                    console.log("Error parsing Sales Insights:", e);
                    setSalesInsightsEntries([]);
                }
            } else {
                setSalesInsightsEntries([]);
            }
            // === NEW: Handle Case Study Other Video ===========================
            const otherVideoData =
                matchedData?.Case_Study_Other_Video ?? matchedData?.Case_Study_Other_Video;
            if (otherVideoData) {
                try {
                    const parsed = Array.isArray(otherVideoData) ? otherVideoData : JSON.parse(otherVideoData);
                    setCaseStudyVideoEntries(normalizeCaseStudyOtherVideo(parsed));
                } catch (e) {
                    console.log("Error parsing Case Study Other Video:", e);
                    setCaseStudyVideoEntries([]);
                }
            } else {
                setCaseStudyVideoEntries([]);
            }

            // --- Mentioned Details 
            if (entityData?.Mentioned_Quotes) {
                try {
                    const parsed = Array.isArray(entityData.Mentioned_Quotes)
                        ? entityData.Mentioned_Quotes
                        : JSON.parse(entityData.Mentioned_Quotes);
                    setMentionedQuotes(parsed || []);
                } catch (e) {
                    setMentionedQuotes([]);
                }
            } else {
                setMentionedQuotes([]);
            }

            // Guest Details
            if (entityData?.Guest) {
                try {
                    setGuestEntries(normalizeGuestData(entityData.Guest, entityData));
                } catch (e) {
                    console.error("Error parsing guest data:", e);
                    setGuestEntries([]);
                }
            } else {
                setGuestEntries([]);
            }
            // Handle Avatar data (if it's a string array)
            if (entityData?.Avatar) {
                try {
                    let avatarUrls = [];
                    if (typeof entityData.Avatar === 'string') {
                        // Try to parse as JSON array first
                        try {
                            avatarUrls = JSON.parse(entityData.Avatar);
                            if (!Array.isArray(avatarUrls)) {
                                // If not an array, treat as single URL
                                avatarUrls = [entityData.Avatar];
                            }
                        } catch (e) {
                            // If parsing fails, treat as single URL
                            avatarUrls = [entityData.Avatar];
                        }
                    } else if (Array.isArray(entityData.Avatar)) {
                        avatarUrls = entityData.Avatar;
                    }

                    // Update guest entries with avatar URLs
                    setGuestEntries(prev => prev.map((guest, index) => ({
                        ...guest,
                        Avatar: avatarUrls[index] || ""
                    })));
                } catch (e) {
                    console.error("Error parsing avatar data:", e);
                }
            }




        } else {
            // Clear on new entry
            setThemeEntries([]);
            setValidationEntries([]);
            setObjectionEntries([]);
            setChallengesEntries([]);
            setSalesInsightsEntries([]);
            setGuestEntries([]);
            setPrepCallEntries([]);
        }
    }, [entityData, themesRank]);


    const validationSchema = Yup.object(
        displayFields.reduce((schema, field) => {
            if (field.key === "Themes" || field.key === "Objections" || field.key === "Validations" || field.key == "Challenges" || field.key == "Sales Insights", field.key == 'Video Type') {
                schema[field.key] = Yup.array().of(
                    Yup.object().shape({
                        [field.key.toLowerCase().slice(0, -1)]: Yup.string().required(`${field.key.slice(0, -1)} is required`),
                        ranking: Yup.number()
                            .min(1, "Ranking must be at least 1")
                            .max(10, "Ranking must be at most 10")
                            .required("Ranking is required"),
                        justification: Yup.string().required("Justification is required"),
                        perception: Yup.string(),
                        whyItMatters: Yup.string(),
                        deeperInsight: Yup.string(),
                        supportingQuotes: Yup.string(),
                    })
                );
            } else if (!["ranking", "Ranking Justification",
                "Challenge Report_Unedited Video Link",
                "Challenge Report_Unedited Transcript Link",
                "Challenge Report_Summary",
                "Podcast Report_Unedited Video Link",
                "Podcast Report_Unedited Transcript Link",
                "Podcast Report_Summary",
                "Post-Podcast Report_Unedited Video Link",
                "Post-Podcast Report_Unedited Transcript Link",
                "Post-Podcast Report_Summary",
                "Quote Card - Extended Media"].includes(field.key)) {
                if (MULTISELECT_FIELDS.includes(field.key)) {
                    schema[field.key] = Yup.array()
                        .of(Yup.string())
                        .min(1, `${field.label} is required`);
                } else if (SINGLESELECT_FIELDS.includes(field.key)) {
                    schema[field.key] = Yup.string().required(`${field.label} is required`);
                } else if (field.type === "number") {
                    schema[field.key] = Yup.number()
                        .required(`${field.label} is required`)
                        .positive(`${field.label} must be positive`);
                } else if (field.type === "url") {
                    schema[field.key] = Yup.string().url(`${field.label} must be a valid URL`);
                } else if (field.type === "ranking") {
                    schema[field.key] = Yup.number()
                        .min(1, `${field.label} must be at least 1`)
                        .max(10, `${field.label} must be at most 10`)
                        .required(`${field.label} is required`);
                } else {
                    schema[field.key] = Yup.string().required(`${field.label} is required`);
                }
            }
            return schema;
        }, {})
    );
    const normalizeSelectOptions = (value, options = []) => {
        if (!value) return [];

        // Handle both array and single value cases
        const valuesArray = Array.isArray(value) ? value : [value];

        return valuesArray.map(item => {
            // If already in correct format
            if (typeof item === 'object' && item.label && item.value) {
                return item;
            }

            // Find matching option
            const stringValue = String(item);
            const matchedOption = options.find(opt =>
                opt.value === stringValue || opt.label === stringValue
            );

            return matchedOption || {
                label: stringValue,
                value: stringValue
            };
        });
    };
    // Initialize form values properly
    const initialValues = {};
    displayFields.forEach(field => {
        if (field.key === "Themes" || field.key === "Objections" || field.key === "Validations" ||
            field.key === "Challenges" || field.key == "Sales Insights" || field.key == 'Case_Study_Other_Video' || field.key == 'Video Type') {
            initialValues[field.key] = normalizeThemes(entityData?.[field.key] || []);
        } else if (!["ranking", "Ranking Justification"].includes(field.key)) {
            // Handle file_type and category as arrays
            if (field.key === 'file_type' || field.key === 'category') {
                initialValues[field.key] = normalizeSelectOptions(
                    entityData?.[field.key],
                    OPTIONS[field.key] || []
                );
            }
            // Handle file field
            else if (field.key === 'file') {
                initialValues[field.key] = entityData?.[field.key] || null;
            }
            // Update this part in your initialValues setup
            else if (field.key === 'template_id' || field.key === 'department_id') {
                const rawValue = (prefilledData && prefilledData[field.key]) || entityData?.[field.key];
                const options = field.options || OPTIONS[field.key] || [];

                // Force conversion to option object
                if (rawValue !== undefined && rawValue !== null) {
                    initialValues[field.key] = typeof rawValue === 'object' ?
                        rawValue :
                        options.find(opt => opt.value == rawValue) || {
                            value: rawValue,
                            label: String(rawValue)
                        };
                } else {
                    initialValues[field.key] = null;
                }
            }
            else {
                initialValues[field.key] = (prefilledData && prefilledData[field.key]) || entityData?.[field.key] ||
                    (MULTISELECT_FIELDS.includes(field.key) ? [] :
                        SINGLESELECT_FIELDS.includes(field.key) ? "" :
                            field.type === "number" ? 0 :
                                field.type === "image" ? "" :
                                    "");
            }
        }
    });
    const formik = useFormik({
        initialValues,

        // validationSchema,
        onSubmit: async (values) => {
            try {
                // Ensure any pending in-progress inputs are appended before saving
                let themesData = null;
                if (themeEntries.length > 0) {
                    themesData = themeEntries.map(entry => ({
                        theme: String(entry.theme || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }
                let objectionData = null;
                if (objectionEntries.length > 0) {
                    objectionData = objectionEntries.map(entry => ({
                        objection: String(entry.objection || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }
                let validationData = null;
                if (validationEntries.length > 0) {
                    validationData = validationEntries.map(entry => ({
                        validation: String(entry.validation || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }
                let challengesData = null;
                if (challengesEntries.length > 0) {
                    challengesData = challengesEntries.map(entry => ({
                        challenges: String(entry.challenges || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }
                let salesInsightsData = null;
                if (salesInsightsEntries.length > 0) {
                    salesInsightsData = salesInsightsEntries.map(entry => ({
                        insight: String(entry.insight || ""),
                        ranking: parseInt(entry.ranking) || 0,
                        justification: String(entry.justification || ""),
                        perception: String(entry.perception || ""),
                        whyItMatters: String(entry.whyItMatters || ""),
                        deeperInsight: String(entry.deeperInsight || ""),
                        supportingQuotes: String(entry.supportingQuotes || "")
                    }));
                }

                // Create the payload with properly formatted values
                const formattedValuesDashboard = {
                    ...values,
                    company_id: localStorage.getItem('company_id'),
                    template_id: values.template_id?.value || values.template_id || null,
                    department_id: values.department_id?.value || values.department_id || null,
                    Guest: values.Guest ? JSON.stringify(values.Guest) : null,
                    Avatar: values.Avatar ? JSON.stringify(values.Avatar) : null,
                    dynamic_fields: formik.values.dynamic_fields ||
                        (formik.values.dynamic_fields_description ?
                            extractFieldsFromTemplate(formik.values.dynamic_fields_description) :
                            null),

                    // Only include these fields if they exist in your schema
                    ...(videoTypeEntries.length > 0 && { video_type: videoTypeEntries }),
                    ...(themeEntries.length > 0 && { themes: themeEntries }),
                    ...(objectionEntries.length > 0 && { objections: objectionEntries }),
                    ...(validationEntries.length > 0 && { validations: validationEntries }),
                    ...(challengesEntries.length > 0 && { challenges: challengesEntries }),
                    ...(salesInsightsEntries.length > 0 && { sales_insights: salesInsightsEntries }),
                    ...(caseStudyVideoEntries.length > 0 && { case_study_other_video: caseStudyVideoEntries }),
                    ...(additionalProjectEntries.length > 0 && { additional_guest_projects: additionalProjectEntries }),
                    ...(emailEntries.length > 0 && { emails: emailEntries }),
                    ...(fullEpisodeDetailsEntries.length > 0 && { details_full_episodes: fullEpisodeDetailsEntries }),
                    ...(fullEpisodeVideoEntries.length > 0 && { full_episode_video: fullEpisodeVideoEntries }),
                    ...(fullEpisodeExtendedContentEntries.length > 0 && { full_episode_extended_content: fullEpisodeExtendedContentEntries }),
                    ...(fullEpisodeHighlightVideoEntries.length > 0 && { full_episode_highlight_video: fullEpisodeHighlightVideoEntries }),
                    ...(fullEpisodeIntroductionVideoEntries.length > 0 && { full_episode_introduction_video: fullEpisodeIntroductionVideoEntries }),
                    ...(fullEpisodeQAVideosEntries.length > 0 && { full_episode_qa_videos: fullEpisodeQAVideosEntries }),
                    ...(fullEpisodePodbookEntries.length > 0 && { full_episode_podbook: fullEpisodePodbookEntries }),
                    ...(fullEpisodeFullCaseStudyEntries.length > 0 && { full_episode_full_case_study: fullEpisodeFullCaseStudyEntries }),
                    ...(fullEpisodeOnePageCaseStudyEntries.length > 0 && { full_episode_one_page_case_study: fullEpisodeOnePageCaseStudyEntries }),
                    ...(fullEpisodeOtherCaseStudyEntries.length > 0 && { full_episode_other_case_study: fullEpisodeOtherCaseStudyEntries }),
                    ...(fullEpisodeICPAdviceEntries.length > 0 && { full_episode_icp_advice: fullEpisodeICPAdviceEntries }),
                    ...(fullEpisodeChallengeQuestionsEntries.length > 0 && { full_episode_challenge_questions: fullEpisodeChallengeQuestionsEntries }),
                    ...(icpAdviceReportEntries.length > 0 && { ICP_Advice_Report: icpAdviceReportEntries }),
                    ...(sqlAnalysisReportEntries.length > 0 && { SQL_Analysis_Report: sqlAnalysisReportEntries }),
                    ...(challengeQuestionsEntries.length > 0 && { Challenge_Questions: challengeQuestionsEntries }),
                    ...(eBookEntries.length > 0 && { eBook: eBookEntries }),
                    ...(guestChallengeReportEntries.length > 0 && { 'Multi-Guest_Challenge_Report_Text': guestChallengeReportEntries }),
                };

                const formattedValue = isDashboardForm ? formattedValuesDashboard : {
                    company_id: localStorage.getItem('company_id'),
                    ...values
                };

                // Remove any undefined or null values from the final payload
                const formattedValues = Object.fromEntries(
                    Object.entries(formattedValue).filter(([_, v]) => v !== null && v !== undefined)
                );
                console.log("forrr", formattedValues);


                // Uplod images and Files
                for (const field of displayFields) {
                    const fieldValue = values[field.key];

                    console.log(`Processing field: ${field.key}`, {
                        type: field.type,
                        value: fieldValue,
                        isFile: fieldValue instanceof File
                    });

                    // Handle file uploads (both files and images)
                    if (field.type === "file" || field.type === "image") {
                        try {
                            // Case 1: Already uploaded file (has URL)
                            if (typeof fieldValue === "object" && fieldValue?.url) {
                                formattedValues[field.key] = fieldValue.url;
                                continue;
                            }

                            // Case 2: New file upload
                            if (fieldValue instanceof File) {
                                const bucketName = field.type === "image" ? "images" : "documents";
                                const fileExt = fieldValue.name.split(".").pop();
                                const fileName = `${Date.now()}.${fileExt}`;
                                const filePath = `${fileName}`;

                                // Upload the file
                                const { error: uploadError, data: uploadData } = await supabase
                                    .storage
                                    .from(bucketName)
                                    .upload(filePath, fieldValue, {
                                        cacheControl: "3600",
                                        upsert: false // Set to true if you want to overwrite existing files
                                    });

                                if (uploadError) {
                                    console.log(`Upload failed for ${field.key}:`, uploadError);
                                    throw uploadError;
                                }

                                console.log(`Successfully uploaded to ${bucketName}:`, uploadData);

                                // Get public URL
                                const { data: publicUrlData } = supabase
                                    .storage
                                    .from(bucketName)
                                    .getPublicUrl(filePath);

                                formattedValues[field.key] = publicUrlData.publicUrl;
                                continue;
                            }

                            // Case 3: String value (could be initial value or fakepath)
                            if (typeof fieldValue === "string") {
                                // If it's a URL, keep it
                                if (fieldValue.startsWith('http')) {
                                    formattedValues[field.key] = fieldValue;
                                }
                                // If it's a fakepath, ignore it (no file was selected)
                                else if (fieldValue.includes('fakepath')) {
                                    formattedValues[field.key] = ''; // or null, depending on your needs
                                }
                                continue;
                            }
                        } catch (error) {
                            console.log(`File processing failed for ${field.key}:`, error);
                            formattedValues[field.key] = null;
                            continue;
                        }
                    }
                    if (field.key === 'template_id' || field.key === 'department_id') {
                        continue;
                    }
                    // Non-file fields
                    formattedValues[field.key] = fieldValue;
                }

                //For template_id and department_id:
                if (formattedValues.template_id) {
                    formattedValues.template_id = formik.values?.template_id?.value || formik.values.template_id || null;
                }
                if (formattedValues.department_id) {
                    formattedValues.department_id = formik.values?.department_id?.value || formik.values.department_id || null;
                }
                if (formattedValues.Emails) {
                    formattedValues.Emails = formik.values?.Emails?.value || formik.values.Emails || null;
                }

                if (formattedValues.Additional_Guest_Projects) {
                    formattedValues.Additional_Guest_Projects = formik.values?.Additional_Guest_Projects?.value || formik.values.Additional_Guest_Projects || null;
                }
                if (formattedValues.DETAILS_FULL_EPISODES) {
                    formattedValues.DETAILS_FULL_EPISODES = formik.values?.DETAILS_FULL_EPISODES?.value || formik.values.DETAILS_FULL_EPISODES || null;
                }

                if (formattedValues.FULL_EPISODE_VIDEO) {
                    formattedValues.FULL_EPISODE_VIDEO = formik.values?.FULL_EPISODE_VIDEO?.value || formik.values.FULL_EPISODE_VIDEO || null;
                }

                if (formattedValues.FULL_EPISODE_EXTENDED_CONTENT) {
                    formattedValues.FULL_EPISODE_EXTENDED_CONTENT = formik.values?.FULL_EPISODE_EXTENDED_CONTENT?.value || formik.values.FULL_EPISODE_EXTENDED_CONTENT || null;
                }

                if (formattedValues.FULL_EPISODE_HIGHLIGHT_VIDEO) {
                    formattedValues.FULL_EPISODE_HIGHLIGHT_VIDEO = formik.values?.FULL_EPISODE_HIGHLIGHT_VIDEO?.value || formik.values.FULL_EPISODE_HIGHLIGHT_VIDEO || null;
                }

                if (formattedValues.FULL_EPISODE_INTRODUCTION_VIDEO) {
                    formattedValues.FULL_EPISODE_INTRODUCTION_VIDEO = formik.values?.FULL_EPISODE_INTRODUCTION_VIDEO?.value || formik.values.FULL_EPISODE_INTRODUCTION_VIDEO || null;
                }

                if (formattedValues.FULL_EPISODE_QA_VIDEOS) {
                    formattedValues.FULL_EPISODE_QA_VIDEOS = formik.values?.FULL_EPISODE_QA_VIDEOS?.value || formik.values.FULL_EPISODE_QA_VIDEOS || null;
                }

                if (formattedValues.FULL_EPISODE_PODBOOK) {
                    formattedValues.FULL_EPISODE_PODBOOK = formik.values?.FULL_EPISODE_PODBOOK?.value || formik.values.FULL_EPISODE_PODBOOK || null;
                }

                if (formattedValues.FULL_EPISODE_FULL_CASE_STUDY) {
                    formattedValues.FULL_EPISODE_FULL_CASE_STUDY = formik.values?.FULL_EPISODE_FULL_CASE_STUDY?.value || formik.values.FULL_EPISODE_FULL_CASE_STUDY || null;
                }

                if (formattedValues.FULL_EPISODE_ONE_PAGE_CASE_STUDY) {
                    formattedValues.FULL_EPISODE_ONE_PAGE_CASE_STUDY = formik.values?.FULL_EPISODE_ONE_PAGE_CASE_STUDY?.value || formik.values.FULL_EPISODE_ONE_PAGE_CASE_STUDY || null;
                }

                if (formattedValues.FULL_EPISODE_OTHER_CASE_STUDY) {
                    formattedValues.FULL_EPISODE_OTHER_CASE_STUDY = formik.values?.FULL_EPISODE_OTHER_CASE_STUDY?.value || formik.values.FULL_EPISODE_OTHER_CASE_STUDY || null;
                }

                if (formattedValues.FULL_EPISODE_ICP_ADVICE) {
                    formattedValues.FULL_EPISODE_ICP_ADVICE = formik.values?.FULL_EPISODE_ICP_ADVICE?.value || formik.values.FULL_EPISODE_ICP_ADVICE || null;
                }

                if (formattedValues.FULL_EPISODE_CHALLENGE_QUESTIONS) {
                    formattedValues.FULL_EPISODE_CHALLENGE_QUESTIONS = formik.values?.FULL_EPISODE_CHALLENGE_QUESTIONS?.value || formik.values.FULL_EPISODE_CHALLENGE_QUESTIONS || null;
                }

                if (formattedValues.ICP_Advice_Report) {
                    formattedValues.ICP_Advice_Report = formik.values?.ICP_Advice_Report?.value || formik.values.ICP_Advice_Report || null;
                }

                if (formattedValues.SQL_Analysis_Report) {
                    formattedValues.SQL_Analysis_Report = formik.values?.SQL_Analysis_Report?.value || formik.values.SQL_Analysis_Report || null;
                }

                if (formattedValues.Challenge_Questions) {
                    formattedValues.Challenge_Questions = formik.values?.Challenge_Questions?.value || formik.values.Challenge_Questions || null;
                }

                // Only include fields the current table supports (based on displayFields)
                try {
                    const allowedKeys = new Set((displayFields || []).map(f => f.key));
                    const alwaysAllow = new Set(['company_id', 'template_id', 'department_id', 'dynamic_fields', 'id_order']);
                    Object.keys(formattedValues).forEach((key) => {
                        if (!allowedKeys.has(key) && !alwaysAllow.has(key)) {
                            delete formattedValues[key];
                        }
                    });
                } catch (_) { /* noop */ }

                console.log("Final formatted values:", formattedValues);

                let response;
                // ✅ Force file_type, category, and tags into valid arrays for jsonb
                if (isFilesData) {
                    ['file_type', 'category', 'tags', 'market_categories', 'content_categories'].forEach((key) => {
                        if (!(key in formattedValues)) return;
                        const val = formattedValues[key];

                        if (Array.isArray(val)) {
                            formattedValues[key] = val
                                .map((v) => {
                                    if (typeof v === 'string') return v.trim();
                                    if (v && typeof v === 'object' && v.value) return v.value;
                                    return null;
                                })
                                .filter(Boolean);
                        } else if (val && typeof val === 'object' && val.value) {
                            formattedValues[key] = [val.value];
                        } else if (typeof val === 'string') {
                            formattedValues[key] = val.trim() ? [val.trim()] : null;
                        } else {
                            formattedValues[key] = null;
                        }
                    });

                }


                if (isEditMode) {
                    response = await supabase
                        .from(tableName)
                        .update(formattedValues)
                        .eq("id", entityData.id);
                }

                if (currentRowId) {
                    // Update existing record
                    response = await supabase
                        .from(tableName)
                        .update(formattedValues)
                        .eq("id", currentRowId);
                } else {
                    // Create new record (fallback)
                    response = await supabase
                        .from(tableName)
                        .insert([formattedValues]);
                }
                if (response.error) throw response.error;
                console.log("Creating record with values:", formattedValues);


                Alert.show('Success', isEditMode ? 'Record updated successfully.' : 'Record created successfully.', [{
                    text: 'OK',
                    primary: true,
                }]);
                // Refresh data
                const { count, error: countError } = await supabase
                    .from(tableName)
                    .select("*", { count: "exact", head: true })
                    .order('id_order', { ascending: false });

                if (countError) throw countError;
                setTotalRecords(count || 0);

                if ((currentPage - 1) * itemsPerPage >= count) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                const { data, error } = await supabase
                    .from(tableName)
                    .select("*")
                    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
                    .order('id_order', { ascending: false });

                if (error) throw error;

                setUsers(data);
                onSubmit(formattedValues);
                onClose();
                fetchUsers();
            } catch (error) {
                console.log("Error saving data:", error);
                ShowCustomToast("Error saving data: " + error.message, "error");
            } finally {
                setIsSaving(false);
            }
        },
    });
    useEffect(() => {
        if (isEditMode && entityData && entityData.id) {
            setCurrentRowId(entityData.id);

            // Load existing data into state
            if (entityData.guests) {
                setGuestEntries(entityData.guests);
            }
            if (entityData.prep_call) {
                setPrepCallEntries([entityData.prep_call]);
            }
            // Load other data similarly
        }
    }, [isEditMode, entityData]);
    const handleAddMentionedQuote = () => {
        if (!currentMentionedQuote.trim()) return;

        setMentionedQuotes([...mentionedQuotes, currentMentionedQuote.trim()]);
        setCurrentMentionedQuote("");
    };

    const handleRemoveMentionedQuote = (index) => {
        setMentionedQuotes(mentionedQuotes.filter((_, i) => i !== index));
    };

    // eBook Handlers
    const handleAddEBook = () => {
        const newEntry = { ...currentEBook };

        if (eBookEditIndex !== null) {
            const updated = [...eBookEntries];
            updated[eBookEditIndex] = newEntry;
            setEBookEntries(updated);
            setEBookEditIndex(null);
        } else {
            setEBookEntries([...eBookEntries, newEntry]);
        }

        setCurrentEBook({
            "eBook Interactive Link": "",
            "eBook Website URL": "",
            "eBook Embed Code": "",
            "eBook Text": "",
            "eBook LinkedIn Post Information (post text, comments & emails)": ""
        });
    };

    const handleEditEBook = (index) => {
        const entry = eBookEntries[index];
        setCurrentEBook({
            "eBook Interactive Link": entry["eBook Interactive Link"] || "",
            "eBook Website URL": entry["eBook Website URL"] || "",
            "eBook Embed Code": entry["eBook Embed Code"] || "",
            "eBook Text": entry["eBook Text"] || "",
            "eBook LinkedIn Post Information (post text, comments & emails)": entry["eBook LinkedIn Post Information (post text, comments & emails)"] || ""
        });
        setEBookEditIndex(index);
    };

    const handleRemoveEBook = (index) => {
        const updated = eBookEntries.filter((_, i) => i !== index);
        setEBookEntries(updated);
        if (eBookEditIndex === index) {
            setCurrentEBook({
                "eBook Interactive Link": "",
                "eBook Website URL": "",
                "eBook Embed Code": "",
                "eBook Text": "",
                "eBook LinkedIn Post Information (post text, comments & emails)": ""
            });
            setEBookEditIndex(null);
        } else if (eBookEditIndex > index) {
            setEBookEditIndex(eBookEditIndex - 1);
        }
    };

    // Guest Challenge Report Handlers
    const handleAddGuestChallengeReport = () => {
        const newEntry = { ...currentGuestChallengeReport };

        if (guestChallengeReportEditIndex !== null) {
            const updated = [...guestChallengeReportEntries];
            updated[guestChallengeReportEditIndex] = newEntry;
            setGuestChallengeReportEntries(updated);
            setGuestChallengeReportEditIndex(null);
        } else {
            setGuestChallengeReportEntries([...guestChallengeReportEntries, newEntry]);
        }

        setCurrentGuestChallengeReport({
            "Multi-Guest Challenge Report Interactive Link": "",
            "Multi-Guest Challenge Report Website URL": "",
            "Multi-Guest Challenge Report Embed Code": "",
            "Multi-Guest Challenge Report Text": "",
            "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": ""
        });
    };

    const handleEditGuestChallengeReport = (index) => {
        const entry = guestChallengeReportEntries[index];
        setCurrentGuestChallengeReport({
            "Multi-Guest Challenge Report Interactive Link": entry["Multi-Guest Challenge Report Interactive Link"] || "",
            "Multi-Guest Challenge Report Website URL": entry["Multi-Guest Challenge Report Website URL"] || "",
            "Multi-Guest Challenge Report Embed Code": entry["Multi-Guest Challenge Report Embed Code"] || "",
            "Multi-Guest Challenge Report Text": entry["Multi-Guest Challenge Report Text"] || "",
            "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": entry["Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)"] || ""
        });
        setGuestChallengeReportEditIndex(index);
    };

    const handleRemoveGuestChallengeReport = (index) => {
        const updated = guestChallengeReportEntries.filter((_, i) => i !== index);
        setGuestChallengeReportEntries(updated);
        if (guestChallengeReportEditIndex === index) {
            setCurrentGuestChallengeReport({
                "Multi-Guest Challenge Report Interactive Link": "",
                "Multi-Guest Challenge Report Website URL": "",
                "Multi-Guest Challenge Report Embed Code": "",
                "Multi-Guest Challenge Report Text": "",
                "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": ""
            });
            setGuestChallengeReportEditIndex(null);
        } else if (guestChallengeReportEditIndex > index) {
            setGuestChallengeReportEditIndex(guestChallengeReportEditIndex - 1);
        }
    };
    useEffect(() => {
        if ('Mentioned_Quotes' in formik.values) {
            formik.setFieldValue('Mentioned_Quotes', mentionedQuotes.length > 0 ? mentionedQuotes : null);
        }
    }, [mentionedQuotes, formik.values]);
    useEffect(() => {
        // Only set fields that exist in formik.values
        if ('Video Type' in formik.values) {
            formik.setFieldValue('Video Type', videoTypeEntries.length > 0 ? videoTypeEntries : null);
        }
        if ('Themes' in formik.values) {
            formik.setFieldValue('Themes', themeEntries.length > 0 ? themeEntries : null);
        }
        if ('Validations' in formik.values) {
            formik.setFieldValue('Validations', validationEntries.length > 0 ? validationEntries : null);
        }
        if ('Challenges' in formik.values) {
            formik.setFieldValue('Challenges', challengesEntries.length > 0 ? challengesEntries : null);
        }
        if ('Sales Insights' in formik.values) {
            formik.setFieldValue('Sales Insights', salesInsightsEntries.length > 0 ? salesInsightsEntries : null);
        }
        if ('Case_Study_Other_Video' in formik.values) {
            formik.setFieldValue('Case_Study_Other_Video', caseStudyVideoEntries.length > 0 ? caseStudyVideoEntries : null);
        }
        if ('Objections' in formik.values) {
            formik.setFieldValue('Objections', objectionEntries.length > 0 ? objectionEntries : null);
        }
        if ('Additional_Guest_Projects' in formik.values) {
            formik.setFieldValue('Additional_Guest_Projects', additionalProjectEntries.length > 0 ? additionalProjectEntries : null);
        }
        if ('Emails' in formik.values) {
            formik.setFieldValue('Emails', emailEntries.length > 0 ? emailEntries : null);
        }
        if ('DETAILS_FULL_EPISODES' in formik.values) {
            formik.setFieldValue('DETAILS_FULL_EPISODES', fullEpisodeDetailsEntries.length > 0 ? fullEpisodeDetailsEntries : null);
        }
        if ('FULL_EPISODE_VIDEO' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_VIDEO', fullEpisodeVideoEntries.length > 0 ? fullEpisodeVideoEntries : null);
        }
        if ('FULL_EPISODE_EXTENDED_CONTENT' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_EXTENDED_CONTENT', fullEpisodeExtendedContentEntries.length > 0 ? fullEpisodeExtendedContentEntries : null);
        }
        if ('FULL_EPISODE_HIGHLIGHT_VIDEO' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_HIGHLIGHT_VIDEO', fullEpisodeHighlightVideoEntries.length > 0 ? fullEpisodeHighlightVideoEntries : null);
        }
        if ('FULL_EPISODE_INTRODUCTION_VIDEO' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_INTRODUCTION_VIDEO', fullEpisodeIntroductionVideoEntries.length > 0 ? fullEpisodeIntroductionVideoEntries : null);
        }
        if ('FULL_EPISODE_QA_VIDEOS' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_QA_VIDEOS', fullEpisodeQAVideosEntries.length > 0 ? fullEpisodeQAVideosEntries : null);
        }
        if ('FULL_EPISODE_PODBOOK' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_PODBOOK', fullEpisodePodbookEntries.length > 0 ? fullEpisodePodbookEntries : null);
        }
        if ('FULL_EPISODE_FULL_CASE_STUDY' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_FULL_CASE_STUDY', fullEpisodeFullCaseStudyEntries.length > 0 ? fullEpisodeFullCaseStudyEntries : null);
        }
        if ('FULL_EPISODE_ONE_PAGE_CASE_STUDY' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_ONE_PAGE_CASE_STUDY', fullEpisodeOnePageCaseStudyEntries.length > 0 ? fullEpisodeOnePageCaseStudyEntries : null);
        }
        if ('FULL_EPISODE_OTHER_CASE_STUDY' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_OTHER_CASE_STUDY', fullEpisodeOtherCaseStudyEntries.length > 0 ? fullEpisodeOtherCaseStudyEntries : null);
        }
        if ('FULL_EPISODE_ICP_ADVICE' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_ICP_ADVICE', fullEpisodeICPAdviceEntries.length > 0 ? fullEpisodeICPAdviceEntries : null);
        }
        if ('FULL_EPISODE_CHALLENGE_QUESTIONS' in formik.values) {
            formik.setFieldValue('FULL_EPISODE_CHALLENGE_QUESTIONS', fullEpisodeChallengeQuestionsEntries.length > 0 ? fullEpisodeChallengeQuestionsEntries : null);
        }
        if ('ICP_Advice_Report' in formik.values) {
            formik.setFieldValue('ICP_Advice_Report', icpAdviceReportEntries.length > 0 ? icpAdviceReportEntries : null);
        }
        if ('SQL_Analysis_Report' in formik.values) {
            formik.setFieldValue('SQL_Analysis_Report', sqlAnalysisReportEntries.length > 0 ? sqlAnalysisReportEntries : null);
        }
        if ('Challenge_Questions' in formik.values) {
            formik.setFieldValue('Challenge_Questions', challengeQuestionsEntries.length > 0 ? challengeQuestionsEntries : null);
        }
        if ('eBook' in formik.values) {
            formik.setFieldValue('eBook', eBookEntries.length > 0 ? eBookEntries : null);
        }

        if ('Multi-Guest_Challenge_Report_Text' in formik.values) {
            formik.setFieldValue('Multi-Guest_Challenge_Report_Text', guestChallengeReportEntries.length > 0 ? guestChallengeReportEntries : null);
        }


    }, [
        themeEntries,
        validationEntries,
        challengesEntries,
        salesInsightsEntries,
        caseStudyVideoEntries,
        objectionEntries,
        formik.values
    ]);
    // Video Type Handlers - Updated version

    const handleAddVideo = () => {
        const newVideo = {
            video_title: currentVideoTitle,
            video_length: currentVideoLength,
            video_link: currentVideoLink,
            video_desc: currentVideoDesc,
        };

        if (editingVideoIndex !== null) {
            const updatedVideos = [...currentVideos];
            updatedVideos[editingVideoIndex] = newVideo;
            setCurrentVideos(updatedVideos);
            setEditingVideoIndex(null);
        } else {
            setCurrentVideos([...currentVideos, newVideo]);
        }

        setCurrentVideoTitle('');
        setCurrentVideoLength('');
        setCurrentVideoLink('');
        setCurrentVideoDesc('');
    };

    const handleEditVideo = (index) => {
        const video = currentVideos[index];
        setCurrentVideoTitle(video.video_title);
        setCurrentVideoLength(video.video_length);
        setCurrentVideoLink(video.video_link);
        setCurrentVideoDesc(video.video_desc);
        setEditingVideoIndex(index);
    };
    const handleSaveVideoGroup = () => {
        const newGroup = {
            videoType: currentVideoType,
            videos: [...currentVideos],
        };

        if (videoTypeEditIndex !== null) {
            // Update existing entry
            const updated = [...videoTypeEntries];
            updated[videoTypeEditIndex] = newGroup;
            setVideoTypeEntries(updated);
        } else {
            // Add new entry
            setVideoTypeEntries([...videoTypeEntries, newGroup]);
        }

        // Reset form
        setCurrentVideoType("");
        setCurrentVideos([]);
        setVideoTypeEditIndex(null);
    };

    // Edit an existing video group
    const handleEditVideoGroup = (index) => {
        const group = videoTypeEntries[index];
        if (!group) return;

        setCurrentVideoType(group.videoType);
        setCurrentVideos([...group.videos]);
        setVideoTypeEditIndex(index);
    };

    // Remove an entire video group
    const handleRemoveVideoGroup = (index) => {
        const updated = [...videoTypeEntries];
        updated.splice(index, 1);
        setVideoTypeEntries(updated);

        if (videoTypeEditIndex === index) {
            // If editing the removed group, reset form
            setCurrentVideoType("");
            setCurrentVideos([]);
            setVideoTypeEditIndex(null);
        } else if (videoTypeEditIndex > index) {
            // Adjust edit index if needed
            setVideoTypeEditIndex(videoTypeEditIndex - 1);
        }
    };

    //Themes Handlers
    const handleAddTheme = () => {
        // if (!currentTheme || !currentRanking || !currentJustification) {
        //     ShowCustomToast("Please fill all theme fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            theme: currentTheme,
            ranking: parseInt(currentRanking) || 0,
            justification: currentJustification,
            perception: currentPerception,
            whyItMatters: currentWhyItMatters,
            deeperInsight: currentDeeperInsight,
            supportingQuotes: currentSupportingQuotes
        };

        if (editIndex !== null) {
            const updated = [...themeEntries];
            updated[editIndex] = newEntry;
            setThemeEntries(updated);
            setEditIndex(null);
        } else {
            setThemeEntries([...themeEntries, newEntry]);
        }

        // Reset fields
        setCurrentTheme("");
        setCurrentRanking("");
        setCurrentJustification("");
        setCurrentPerception("");
        setCurrentWhyItMatters("");
        setCurrentDeeperInsight("");
        setCurrentSupportingQuotes("");

    };

    const handleEditTheme = (index) => {
        const entry = themeEntries[index];
        setCurrentTheme(entry.theme);
        setCurrentRanking(entry.ranking);
        setCurrentJustification(entry.justification);
        setCurrentPerception(entry.perception);
        setCurrentWhyItMatters(entry.whyItMatters);
        setCurrentDeeperInsight(entry.deeperInsight);
        setCurrentSupportingQuotes(entry.supportingQuotes);
        setEditIndex(index);
    };

    const handleRemoveTheme = (index) => {
        const updated = themeEntries.filter((_, i) => i !== index);
        setThemeEntries(updated);
        if (editIndex === index) {
            setCurrentTheme("");
            setCurrentRanking("");
            setCurrentJustification("");
            setCurrentPerception("");
            setCurrentWhyItMatters("");
            setCurrentDeeperInsight("");
            setCurrentSupportingQuotes("");

            setEditIndex(null);
        } else if (editIndex > index) {
            setEditIndex(editIndex - 1);
        }
    };

    // Objection handlers
    const handleAddObjection = () => {
        // if (!currentObjection || !currentObjectionRanking || !currentObjectionJustification) {
        //     ShowCustomToast("Please fill all objection fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            objection: currentObjection,
            ranking: parseInt(currentObjectionRanking) || 0,
            justification: currentObjectionJustification,
            perception: currentObjectionPerception,
            whyItMatters: currentObjectionWhyItMatters,
            deeperInsight: currentObjectionDeeperInsight,
            supportingQuotes: currentObjectionSupportingQuotes
        };

        if (objectionEditIndex !== null) {
            const updated = [...objectionEntries];
            updated[objectionEditIndex] = newEntry;
            setObjectionEntries(updated);
            setObjectionEditIndex(null);
        } else {
            setObjectionEntries([...objectionEntries, newEntry]);
        }

        setCurrentObjection("");
        setCurrentObjectionRanking("");
        setCurrentObjectionJustification("");
        setCurrentObjectionPerception("");
        setCurrentObjectionWhyItMatters("");
        setCurrentObjectionDeeperInsight("");
        setCurrentObjectionSupportingQuotes("");
    };

    const handleEditObjection = (index) => {
        const entry = objectionEntries[index];
        setCurrentObjection(entry.objection);
        setCurrentObjectionRanking(entry.ranking);
        setCurrentObjectionJustification(entry.justification);
        setCurrentObjectionPerception(entry.perception);
        setCurrentObjectionWhyItMatters(entry.whyItMatters);
        setCurrentObjectionDeeperInsight(entry.deeperInsight);
        setCurrentObjectionSupportingQuotes(entry.supportingQuotes);
        setObjectionEditIndex(index);
    };
    const handleRemoveObjection = (index) => {
        const updated = objectionEntries.filter((_, i) => i !== index);
        setObjectionEntries(updated);
        if (objectionEditIndex === index) {
            setCurrentObjection("");
            setCurrentObjectionRanking("");
            setCurrentObjectionJustification("");
            setCurrentObjectionPerception("");
            setCurrentObjectionWhyItMatters("");
            setCurrentObjectionDeeperInsight("");
            setCurrentObjectionSupportingQuotes("");
            setObjectionEditIndex(null);
        } else if (objectionEditIndex > index) {
            setObjectionEditIndex(objectionEditIndex - 1);
        }
    };

    // ICP Advice Report Handlers
    const handleAddIcpAdviceReport = () => {
        const newEntry = { ...currentIcpAdviceReport };

        if (icpAdviceReportEditIndex !== null) {
            const updated = [...icpAdviceReportEntries];
            updated[icpAdviceReportEditIndex] = newEntry;
            setIcpAdviceReportEntries(updated);
            setIcpAdviceReportEditIndex(null);
        } else {
            setIcpAdviceReportEntries([...icpAdviceReportEntries, newEntry]);
        }

        setCurrentIcpAdviceReport({
            "ICP Advice Post-Podcast Video File": "",
            "ICP Advice Post-Podcast Video Length": "",
            "ICP Advice Post-Podcast Video Transcript": "",
            "ICP Advice Report": "",
            "VoC FILE": ""
        });
    };

    const handleEditIcpAdviceReport = (index) => {
        const entry = icpAdviceReportEntries[index];
        setCurrentIcpAdviceReport({
            "ICP Advice Post-Podcast Video File": entry["ICP Advice Post-Podcast Video File"] || "",
            "ICP Advice Post-Podcast Video Length": entry["ICP Advice Post-Podcast Video Length"] || "",
            "ICP Advice Post-Podcast Video Transcript": entry["ICP Advice Post-Podcast Video Transcript"] || "",
            "ICP Advice Report": entry["ICP Advice Report"] || "",
            "VoC FILE": entry["VoC FILE"] || ""
        });
        setIcpAdviceReportEditIndex(index);
    };

    const handleRemoveIcpAdviceReport = (index) => {
        const updated = icpAdviceReportEntries.filter((_, i) => i !== index);
        setIcpAdviceReportEntries(updated);
        if (icpAdviceReportEditIndex === index) {
            setCurrentIcpAdviceReport({
                "ICP Advice Post-Podcast Video File": "",
                "ICP Advice Post-Podcast Video Length": "",
                "ICP Advice Post-Podcast Video Transcript": "",
                "ICP Advice Report": "",
                "VoC FILE": ""
            });
            setIcpAdviceReportEditIndex(null);
        } else if (icpAdviceReportEditIndex > index) {
            setIcpAdviceReportEditIndex(icpAdviceReportEditIndex - 1);
        }
    };

    // SQL Analysis Report Handlers
    const handleAddSqlAnalysisReport = () => {
        const newEntry = { ...currentSqlAnalysisReport };

        if (sqlAnalysisReportEditIndex !== null) {
            const updated = [...sqlAnalysisReportEntries];
            updated[sqlAnalysisReportEditIndex] = newEntry;
            setSqlAnalysisReportEntries(updated);
            setSqlAnalysisReportEditIndex(null);
        } else {
            setSqlAnalysisReportEntries([...sqlAnalysisReportEntries, newEntry]);
        }

        setCurrentSqlAnalysisReport({
            "SQL Analysis Post-Podcast Video File": "",
            "SQL Analysis Post-Podcast Video Length": "",
            "SQL Analysis Post-Podcast Video Transcript": "",
            "SQL Analysis Report": ""
        });
    };

    const handleEditSqlAnalysisReport = (index) => {
        const entry = sqlAnalysisReportEntries[index];
        setCurrentSqlAnalysisReport({
            "SQL Analysis Post-Podcast Video File": entry["SQL Analysis Post-Podcast Video File"] || "",
            "SQL Analysis Post-Podcast Video Length": entry["SQL Analysis Post-Podcast Video Length"] || "",
            "SQL Analysis Post-Podcast Video Transcript": entry["SQL Analysis Post-Podcast Video Transcript"] || "",
            "SQL Analysis Report": entry["SQL Analysis Report"] || ""
        });
        setSqlAnalysisReportEditIndex(index);
    };

    const handleRemoveSqlAnalysisReport = (index) => {
        const updated = sqlAnalysisReportEntries.filter((_, i) => i !== index);
        setSqlAnalysisReportEntries(updated);
        if (sqlAnalysisReportEditIndex === index) {
            setCurrentSqlAnalysisReport({
                "SQL Analysis Post-Podcast Video File": "",
                "SQL Analysis Post-Podcast Video Length": "",
                "SQL Analysis Post-Podcast Video Transcript": "",
                "SQL Analysis Report": ""
            });
            setSqlAnalysisReportEditIndex(null);
        } else if (sqlAnalysisReportEditIndex > index) {
            setSqlAnalysisReportEditIndex(sqlAnalysisReportEditIndex - 1);
        }
    };

    // Challenge Questions Handlers
    const handleAddChallengeQuestions = () => {
        const newEntry = { ...currentChallengeQuestions };

        if (challengeQuestionsEditIndex !== null) {
            const updated = [...challengeQuestionsEntries];
            updated[challengeQuestionsEditIndex] = newEntry;
            setChallengeQuestionsEntries(updated);
            setChallengeQuestionsEditIndex(null);
        } else {
            setChallengeQuestionsEntries([...challengeQuestionsEntries, newEntry]);
        }

        setCurrentChallengeQuestions({
            "Challenge Questions Prep Call Video File": "",
            "Challenge Questions Prep Call Video Length": "",
            "Challenge Questions Prep Call Video Transcript": "",
            "Challenge Questions Report": ""
        });
    };

    const handleEditChallengeQuestions = (index) => {
        const entry = challengeQuestionsEntries[index];
        setCurrentChallengeQuestions({
            "Challenge Questions Prep Call Video File": entry["Challenge Questions Prep Call Video File"] || "",
            "Challenge Questions Prep Call Video Length": entry["Challenge Questions Prep Call Video Length"] || "",
            "Challenge Questions Prep Call Video Transcript": entry["Challenge Questions Prep Call Video Transcript"] || "",
            "Challenge Questions Report": entry["Challenge Questions Report"] || ""
        });
        setChallengeQuestionsEditIndex(index);
    };

    const handleRemoveChallengeQuestions = (index) => {
        const updated = challengeQuestionsEntries.filter((_, i) => i !== index);
        setChallengeQuestionsEntries(updated);
        if (challengeQuestionsEditIndex === index) {
            setCurrentChallengeQuestions({
                "Challenge Questions Prep Call Video File": "",
                "Challenge Questions Prep Call Video Length": "",
                "Challenge Questions Prep Call Video Transcript": "",
                "Challenge Questions Report": ""
            });
            setChallengeQuestionsEditIndex(null);
        } else if (challengeQuestionsEditIndex > index) {
            setChallengeQuestionsEditIndex(challengeQuestionsEditIndex - 1);
        }
    };
    // Challenges handlers
    const handleAddChallenges = () => {
        // if (!currentChallenges || !currentChallengesRanking || !currentChallengesJustification) {
        //     ShowCustomToast("Please fill all challenge fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            challenges: currentChallenges,
            ranking: parseInt(currentChallengesRanking) || 0,
            justification: currentChallengesJustification,
            perception: currentChallengesPerception,
            whyItMatters: currentChallengesWhyItMatters,
            deeperInsight: currentChallengesDeeperInsight,
            supportingQuotes: currentChallengesSupportingQuotes
        };

        if (challengesEditIndex !== null) {
            const updated = [...challengesEntries];
            updated[challengesEditIndex] = newEntry;
            setChallengesEntries(updated);
            setChallengesEditIndex(null);
        } else {
            setChallengesEntries([...challengesEntries, newEntry]);
        }

        setCurrentChallenges("");
        setCurrentChallengesRanking("");
        setCurrentChallengesJustification("");
        setCurrentChallengesPerception("");
        setCurrentChallengesWhyItMatters("");
        setCurrentChallengesDeeperInsight("");
        setCurrentChallengesSupportingQuotes("");

    };

    const handleEditChallenges = (index) => {
        const entry = challengesEntries[index];
        setCurrentChallenges(entry.challenges);
        setCurrentChallengesRanking(entry.ranking);
        setCurrentChallengesJustification(entry.justification);
        setCurrentChallengesPerception(entry.perception);
        setCurrentChallengesWhyItMatters(entry.whyItMatters);
        setCurrentChallengesDeeperInsight(entry.deeperInsight);
        setCurrentChallengesSupportingQuotes(entry.supportingQuotes);
        setChallengesEditIndex(index);
    };

    const handleRemoveChallenges = (index) => {
        const updated = challengesEntries.filter((_, i) => i !== index);
        setChallengesEntries(updated);
        if (challengesEditIndex === index) {
            setCurrentChallenges("");
            setCurrentChallengesRanking("");
            setCurrentChallengesJustification("");
            setCurrentChallengesPerception("");
            setCurrentChallengesWhyItMatters("");
            setCurrentChallengesDeeperInsight("");
            setCurrentChallengesSupportingQuotes("");
            setChallengesEditIndex(null);
        } else if (challengesEditIndex > index) {
            setChallengesEditIndex(challengesEditIndex - 1);
        }
    };

    // Sales Insights handlers
    const handleAddSalesInsight = () => {
        // if (!currentSalesInsight || !currentSalesInsightRanking || !currentSalesInsightJustification) {
        //     ShowCustomToast("Please fill all Sales Insight fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            insight: currentSalesInsight,
            ranking: parseInt(currentSalesInsightRanking) || 0,
            justification: currentSalesInsightJustification,
            perception: currentSalesInsightPerception,
            whyItMatters: currentSalesInsightWhyItMatters,
            deeperInsight: currentSalesInsightDeeperInsight,
            supportingQuotes: currentSalesInsightSupportingQuotes
        };

        if (salesInsightsEditIndex !== null) {
            const updated = [...salesInsightsEntries];
            updated[salesInsightsEditIndex] = newEntry;
            setSalesInsightsEntries(updated);
            setSalesInsightsEditIndex(null);
        } else {
            setSalesInsightsEntries([...salesInsightsEntries, newEntry]);
        }

        setCurrentSalesInsight("");
        setCurrentSalesInsightRanking("");
        setCurrentSalesInsightJustification("");
        setCurrentSalesInsightPerception("");
        setCurrentSalesInsightWhyItMatters("");
        setCurrentSalesInsightDeeperInsight("");
        setCurrentSalesInsightSupportingQuotes("");
    };

    const handleEditSalesInsight = (index) => {
        const entry = salesInsightsEntries[index];
        setCurrentSalesInsight(entry.insight);
        setCurrentSalesInsightRanking(entry.ranking);
        setCurrentSalesInsightJustification(entry.justification);
        setCurrentSalesInsightPerception(entry.perception);
        setCurrentSalesInsightWhyItMatters(entry.whyItMatters);
        setCurrentSalesInsightDeeperInsight(entry.deeperInsight);
        setCurrentSalesInsightSupportingQuotes(entry.supportingQuotes);
        setSalesInsightsEditIndex(index);
    };

    const handleRemoveSalesInsight = (index) => {
        const updated = salesInsightsEntries.filter((_, i) => i !== index);
        setSalesInsightsEntries(updated);
        if (salesInsightsEditIndex === index) {
            setCurrentSalesInsight("");
            setCurrentSalesInsightRanking("");
            setCurrentSalesInsightJustification("");
            setCurrentSalesInsightPerception("");
            setCurrentSalesInsightWhyItMatters("");
            setCurrentSalesInsightDeeperInsight("");
            setCurrentSalesInsightSupportingQuotes("");
            setSalesInsightsEditIndex(null);
        } else if (salesInsightsEditIndex > index) {
            setSalesInsightsEditIndex(salesInsightsEditIndex - 1);
        }
    };

    // CaseStudyVideo handlers
    const handleAddCaseStudyVideo = () => {
        // Optional validation (uncomment if required)
        // if (!currentVideoTitle || !currentVideoLink) {
        //     ShowCustomToast("Please fill required fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            video_title: currentVideoTitle,
            video_link: currentVideoLink,
            copy_and_paste_text: currentCopyAndPasteText,
            link_to_document: currentLinkToDocument
        };

        if (caseStudyVideoEditIndex !== null) {
            const updated = [...caseStudyVideoEntries];
            updated[caseStudyVideoEditIndex] = newEntry;
            setCaseStudyVideoEntries(updated);
            setCaseStudyVideoEditIndex(null);
        } else {
            setCaseStudyVideoEntries([...caseStudyVideoEntries, newEntry]);
        }

        // Reset fields
        setCurrentVideoTitle("");
        setCurrentVideoLink("");
        setCurrentCopyAndPasteText("");
        setCurrentLinkToDocument("");
    };

    const handleEditCaseStudyVideo = (index) => {
        const entry = caseStudyVideoEntries[index];
        setCurrentVideoTitle(entry.video_title);
        setCurrentVideoLink(entry.video_link);
        setCurrentCopyAndPasteText(entry.copy_and_paste_text);
        setCurrentLinkToDocument(entry.link_to_document);
        setCaseStudyVideoEditIndex(index);
    };
    const handleRemoveCaseStudyVideo = (index) => {
        const updated = caseStudyVideoEntries.filter((_, i) => i !== index);
        setCaseStudyVideoEntries(updated);

        if (caseStudyVideoEditIndex === index) {
            setCurrentVideoTitle("");
            setCurrentVideoLink("");
            setCurrentCopyAndPasteText("");
            setCurrentLinkToDocument("");
            setCaseStudyVideoEditIndex(null);
        } else if (caseStudyVideoEditIndex > index) {
            setCaseStudyVideoEditIndex(caseStudyVideoEditIndex - 1);
        }
    };


    // Validation handlers 
    const handleAddValidation = () => {
        // if (!currentValidation || !currentValidationRanking || !currentValidationJustification) {
        //     ShowCustomToast("Please fill all validation fields before adding.", "error");
        //     return;
        // }

        const newEntry = {
            validation: currentValidation,
            ranking: parseInt(currentValidationRanking) || 0,
            justification: currentValidationJustification,
            perception: currentValidationPerception,
            whyItMatters: currentValidationWhyItMatters,
            deeperInsight: currentValidationDeeperInsight,
            supportingQuotes: currentValidationSupportingQuotes
        };

        if (validationEditIndex !== null) {
            const updated = [...validationEntries];
            updated[validationEditIndex] = newEntry;
            setValidationEntries(updated);
            setValidationEditIndex(null);
        } else {
            setValidationEntries([...validationEntries, newEntry]);
        }

        setCurrentValidation("");
        setCurrentValidationRanking("");
        setCurrentValidationJustification("");
        setCurrentValidationPerception("");
        setCurrentValidationWhyItMatters("");
        setCurrentValidationDeeperInsight("");
        setCurrentValidationSupportingQuotes("");
    };

    const handleEditValidation = (index) => {
        const entry = validationEntries[index];
        setCurrentValidation(entry.validation);
        setCurrentValidationRanking(entry.ranking);
        setCurrentValidationJustification(entry.justification);
        setCurrentValidationPerception(entry.perception);
        setCurrentValidationWhyItMatters(entry.whyItMatters);
        setCurrentValidationDeeperInsight(entry.deeperInsight);
        setCurrentValidationSupportingQuotes(entry.supportingQuotes);
        setValidationEditIndex(index);
    };

    const handleRemoveValidation = (index) => {
        const updated = validationEntries.filter((_, i) => i !== index);
        setValidationEntries(updated);
        if (validationEditIndex === index) {
            setCurrentValidation("");
            setCurrentValidationRanking("");
            setCurrentValidationJustification("");
            setCurrentValidationPerception("");
            setCurrentValidationWhyItMatters("");
            setCurrentValidationDeeperInsight("");
            setCurrentValidationSupportingQuotes("");
            setValidationEditIndex(null);
        } else if (validationEditIndex > index) {
            setValidationEditIndex(validationEditIndex - 1);
        }
    };

    // Handler for Guests
    const handleAddGuest = async () => {
        // Validate at least one field is filled
        // if (!currentGuest["Guest Title"] && !currentGuest["Guest Company"] && !currentGuest["Guest Industry"]) {
        //     ShowCustomToast("Please fill guest details", "error");
        //     return;
        // }

        let avatarUrl = currentGuest.Avatar;

        // If Avatar is a File object, upload it first
        if (currentGuest.Avatar instanceof File) {
            try {
                const fileExt = currentGuest.Avatar.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload the file
                const { error: uploadError } = await supabase
                    .storage
                    .from('images')
                    .upload(filePath, currentGuest.Avatar);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('images')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            } catch (error) {
                console.error("Avatar upload failed:", error);
                ShowCustomToast("Failed to upload avatar", "error");
                // Continue without avatar instead of aborting save
                avatarUrl = null;
            }
        }
        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
        const newEntry = {
            "Guest": currentGuest["Guest"],
            "Persona": currentGuest["Persona"],
            "Industry Vertical": currentGuest["Industry Vertical"],
            "Guest Title": currentGuest["Guest Title"],
            "Guest Company": currentGuest["Guest Company"],
            "Guest Industry": currentGuest["Guest Industry"],
            "Tracker": currentGuest['Tracker'],
            "LinkedIn Profile": currentGuest['LinkedIn Profile'],
            "Dossier": currentGuest['Dossier'],
            "Avatar": avatarUrl || null
        };

        let nextGuestEntries;
        if (guestEditIndex !== null) {
            const updated = [...guestEntries];
            updated[guestEditIndex] = newEntry;
            setGuestEntries(updated);
            nextGuestEntries = updated;
            setGuestEditIndex(null);
        } else {
            const appended = [...guestEntries, newEntry];
            setGuestEntries(appended);
            nextGuestEntries = appended;
        }

        setCurrentGuest({
            "Avatar": "",
            "Guest": "",
            "Persona": "",
            "Industry Vertical": "",
            "Guest Title": "",
            "Guest Company": "",
            "Guest Industry": "",
            "Tracker": "",
            "LinkedIn Profile": "",
            "Dossier": "",

        });
        return { type: 'guest', entries: nextGuestEntries };
    };

    const handleEditGuest = (index) => {
        const entry = guestEntries[index];
        setCurrentGuest({
            ...entry,
            Avatar: entry.Avatar // Keep the existing URL or File
        });
        setGuestEditIndex(index);
    };


    const handleRemoveGuest = (index) => {
        const updated = guestEntries.filter((_, i) => i !== index);
        setGuestEntries(updated);
        if (guestEditIndex === index) {
            setCurrentGuest({
                "Avatar": "",
                "Guest": "",
                "Persona": "",
                "Industry Vertical": "",
                "Guest Title": "",
                "Guest Company": "",
                "Guest Industry": "",
                "Tracker": "",
                "LinkedIn Profile": "",
                "Dossier": "",

            });
            setGuestEditIndex(null);
        } else if (guestEditIndex > index) {
            setGuestEditIndex(guestEditIndex - 1);
        }
    };

    // Handler for Prep_Calls

    const handleAddPrepCall = () => {
        // Validate at least one field is filled
        // if (!currentPrepCall["Unedited Prep Call Video"] &&
        //     !currentPrepCall["Unedited Prep Call Transcript"] &&
        //     !currentPrepCall["Discussion Guide"]) {
        //     ShowCustomToast("Please fill at least one prep call field", "error");
        //     return;
        // }

        const newEntry = {
            "Unedited Prep Call Video": currentPrepCall["Unedited Prep Call Video"],
            "Unedited Prep Call Transcript": currentPrepCall["Unedited Prep Call Transcript"],
            "Discussion Guide": currentPrepCall["Discussion Guide"]
        };

        let nextPrepCallEntries;
        if (prepCallEditIndex !== null) {
            // Update existing entry
            const updated = [...prepCallEntries];
            updated[prepCallEditIndex] = newEntry;
            setPrepCallEntries(updated);
            nextPrepCallEntries = updated;
            setPrepCallEditIndex(null);
        } else {
            // Add new entry
            const appended = [...prepCallEntries, newEntry];
            setPrepCallEntries(appended);
            nextPrepCallEntries = appended;
        } {
            // Add new entry
            const appended = [...prepCallEntries, newEntry];
            setPrepCallEntries(appended);
            nextPrepCallEntries = appended;
        }

        // Reset form
        setCurrentPrepCall({
            "Unedited Prep Call Video": "",
            "Unedited Prep Call Transcript": "",
            "Discussion Guide": ""
        });
        return { type: 'prepCall', entries: nextPrepCallEntries };
    };

    const handleEditPrepCall = (index) => {
        const entry = prepCallEntries[index];
        setCurrentPrepCall({
            "Unedited Prep Call Video": entry["Unedited Prep Call Video"] || "",
            "Unedited Prep Call Transcript": entry["Unedited Prep Call Transcript"] || "",
            "Discussion Guide": entry["Discussion Guide"] || ""
        });
        setPrepCallEditIndex(index);
    };

    const handleRemovePrepCall = (index) => {
        const updated = prepCallEntries.filter((_, i) => i !== index);
        setPrepCallEntries(updated);
        if (prepCallEditIndex === index) {
            setCurrentPrepCall({
                "Unedited Prep Call Video": "",
                "Unedited Prep Call Transcript": "",
                "Discussion Guide": ""
            });
            setPrepCallEditIndex(null);
        } else if (prepCallEditIndex > index) {
            setPrepCallEditIndex(prepCallEditIndex - 1);
        }
    };

    // Handler fro Additionl Guest Details
    const handleAddAdditionalProject = () => {
        // Validate at least one field is filled
        // if (!currentAdditionalProject["Podcast"] &&
        //     !currentAdditionalProject["eBooks"] &&
        //     !currentAdditionalProject["Articles"] &&
        //     !currentAdditionalProject["Other"]) {
        //     ShowCustomToast("Please fill at least one project field", "error");
        //     return;
        // }

        const newEntry = {
            "Podcast": currentAdditionalProject["Podcast"],
            "eBooks": currentAdditionalProject["eBooks"],
            "Articles": currentAdditionalProject["Articles"],
            "Other": currentAdditionalProject["Other"]
        };

        if (additionalProjectEditIndex !== null) {
            // Update existing entry
            const updated = [...additionalProjectEntries];
            updated[additionalProjectEditIndex] = newEntry;
            setAdditionalProjectEntries(updated);
            setAdditionalProjectEditIndex(null);
        } else {
            // Add new entry
            setAdditionalProjectEntries([...additionalProjectEntries, newEntry]);
        }

        // Reset form
        setCurrentAdditionalProject({
            "Podcast": "",
            "eBooks": "",
            "Articles": "",
            "Other": ""
        });
    };

    // Add these edit/remove handlers
    const handleEditAdditionalProject = (index) => {
        const entry = additionalProjectEntries[index];
        setCurrentAdditionalProject({
            "Podcast": entry["Podcast"] || "",
            "eBooks": entry["eBooks"] || "",
            "Articles": entry["Articles"] || "",
            "Other": entry["Other"] || ""
        });
        setAdditionalProjectEditIndex(index);
    };

    const handleRemoveAdditionalProject = (index) => {
        const updated = additionalProjectEntries.filter((_, i) => i !== index);
        setAdditionalProjectEntries(updated);
        if (additionalProjectEditIndex === index) {
            setCurrentAdditionalProject({
                "Podcast": "",
                "eBooks": "",
                "Articles": "",
                "Other": ""
            });
            setAdditionalProjectEditIndex(null);
        } else if (additionalProjectEditIndex > index) {
            setAdditionalProjectEditIndex(additionalProjectEditIndex - 1);
        }
    };

    const handleAddEmail = () => {
        // Validate at least one field is filled
        // if (!currentEmail["Guest"] && !currentEmail["Cold"] && !currentEmail["Warm"]) {
        //     ShowCustomToast("Please fill at least one email field", "error");
        //     return;
        // }

        const newEntry = {
            ...currentEmail,
            category: EMAIL_CATEGORIES
        };

        if (emailEditIndex !== null) {
            // Update existing entry
            const updated = [...emailEntries];
            updated[emailEditIndex] = newEntry;
            setEmailEntries(updated);
            setEmailEditIndex(null);
        } else {
            // Add new entry
            setEmailEntries([...emailEntries, newEntry]);
        }

        // Reset form
        setCurrentEmail({
            "Guest": "",
            "Cold": "",
            "Warm": ""
        });
    };

    const handleEditEmail = (index) => {
        const entry = emailEntries[index];
        setCurrentEmail({
            "Guest": entry["Guest"] || "",
            "Cold": entry["Cold"] || "",
            "Warm": entry["Warm"] || ""
        });
        setEmailEditIndex(index);
    };

    const handleRemoveEmail = (index) => {
        const updated = emailEntries.filter((_, i) => i !== index);
        setEmailEntries(updated);
        if (emailEditIndex === index) {
            setCurrentEmail({
                "Guest": "",
                "Cold": "",
                "Warm": ""
            });
            setEmailEditIndex(null);
        } else if (emailEditIndex > index) {
            setEmailEditIndex(emailEditIndex - 1);
        }
    };

    // Full Episode Video Handlers

    const handleAddFullEpisodeDetails = () => {
        // if (!currentFullEpisodeDetails["Episode ID"] &&
        //     !currentFullEpisodeDetails["Episode Title"]) {
        //     ShowCustomToast("Please fill at least Episode ID or Title", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeDetails };

        if (fullEpisodeDetailsEditIndex !== null) {
            const updated = [...fullEpisodeDetailsEntries];
            updated[fullEpisodeDetailsEditIndex] = newEntry;
            setFullEpisodeDetailsEntries(updated);
            setFullEpisodeDetailsEditIndex(null);
        } else {
            setFullEpisodeDetailsEntries([...fullEpisodeDetailsEntries, newEntry]);
        }

        setCurrentFullEpisodeDetails({
            "Episode ID": "",
            "Episode Number": "",
            "Episode Title": "",
            "Date Recorded": "",
            "Category": "",
            "Short Episode Description": "",
            "Long Episode Description": "",
            "Formate": "",
            "Short and Long-Tail SEO Keywords": "",
            "All Asset Folder": ""
        });
    };

    const handleEditFullEpisodeDetails = (index) => {
        const entry = fullEpisodeDetailsEntries[index];
        setCurrentFullEpisodeDetails({
            "Episode ID": entry["Episode ID"] || "",
            "Episode Number": entry["Episode Number"] || "",
            "Episode Title": entry["Episode Title"] || "",
            "Date Recorded": entry["Date Recorded"] || "",
            "Category": entry["Category"] || "",
            "Short Episode Description": entry["Short Episode Description"] || "",
            "Long Episode Description": entry["Long Episode Description"] || "",
            "Formate": entry["Formate"] || "",
            "Short and Long-Tail SEO Keywords": entry["Short and Long-Tail SEO Keywords"] || "",
            "All Asset Folder": entry["All Asset Folder"] || ""
        });
        setFullEpisodeDetailsEditIndex(index);
    };

    const handleRemoveFullEpisodeDetails = (index) => {
        const updated = fullEpisodeDetailsEntries.filter((_, i) => i !== index);
        setFullEpisodeDetailsEntries(updated);
        if (fullEpisodeDetailsEditIndex === index) {
            setCurrentFullEpisodeDetails({
                "Episode ID": "",
                "Episode Number": "",
                "Episode Title": "",
                "Date Recorded": "",
                "Category": "",
                "Short Episode Description": "",
                "Long Episode Description": "",
                "Formate": "",
                "Short and Long-Tail SEO Keywords": "",
                "All Asset Folder": ""
            });
            setFullEpisodeDetailsEditIndex(null);
        } else if (fullEpisodeDetailsEditIndex > index) {
            setFullEpisodeDetailsEditIndex(fullEpisodeDetailsEditIndex - 1);
        }
    };
    //.................................

    const handleAddFullEpisodeVideo = () => {
        // if (!currentFullEpisodeVideo["Video File"] && !currentFullEpisodeVideo["YouTube URL"]) {
        //     ShowCustomToast("Please fill at least Video File or YouTube URL", "error");
        //     return;
        // }


        const newEntry = { ...currentFullEpisodeVideo };

        if (fullEpisodeVideoEditIndex !== null) {
            const updated = [...fullEpisodeVideoEntries];
            updated[fullEpisodeVideoEditIndex] = newEntry;
            setFullEpisodeVideoEntries(updated);
            setFullEpisodeVideoEditIndex(null);
        } else {
            setFullEpisodeVideoEntries([...fullEpisodeVideoEntries, newEntry]);
        }

        setCurrentFullEpisodeVideo({
            "Full Episode Video Title": "",
            "Full Episode Video Length": "",
            "Full Episode Video Description": "",
            "Full Episode Video File": "",
            "Full Episode Audio File": "",
            "Full Episode YouTube URL": "",
            // "Full Episode Details",
            "Unedited Full Episode Transcript": "",
            "Edited Full Episode Transcript": "",
            "Provocative Statements": "",
            "Custom Requests": "",
        });
    };

    const handleEditFullEpisodeVideo = (index) => {
        const entry = fullEpisodeVideoEntries[index];
        setCurrentFullEpisodeVideo({
            "Full Episode Video Title": entry["Full Episode Video Title"] || "",
            "Full Episode Video Length": entry["Full Episode Video Length"] || "",
            "Full Episode Video Description": entry["Full Episode Video Description"] || "",
            "Full Episode Audio File": entry["Full Episode Audio File"] || "",
            "Full Episode YouTube URL": entry["Full Episode YouTube URL"] || "",
            // "Full Episode Details": entry["Full Episode Details"] || "",
            "Unedited Full Episode Transcript": entry["Unedited Full Episode Transcript"] || "",
            "Edited Full Episode Transcript": entry["Edited Full Episode Transcript"] || "",
            "Provocative Statements": entry["Provocative Statements"] || "",
            "Custom Requests": entry["Custom Requests"] || "",
            // "LinkedIn Post Text": entry["LinkedIn Post Text"] || "",
            // "LinkedIn Executive Comments": entry["LinkedIn Executive Comments"] || "",
            // "Emails Marketing": entry["Emails Marketing"] || "",
            // "Emails Sales": entry["Emails Sales"] || ""
        });
        setFullEpisodeVideoEditIndex(index);
    };

    const handleRemoveFullEpisodeVideo = (index) => {
        const updated = fullEpisodeVideoEntries.filter((_, i) => i !== index);
        setFullEpisodeVideoEntries(updated);
        if (fullEpisodeVideoEditIndex === index) {
            setCurrentFullEpisodeVideo({
                "Full Episode Video Title": "",
                "Full Episode Video Length": "",
                "Full Episode Video Description": "",
                "Full Episode Video File": "",
                "Full Episode Audio File": "",
                "Full Episode YouTube URL": "",
                // "Full Episode Details",
                "Unedited Full Episode Transcript": "",
                "Edited Full Episode Transcript": "",
                "Provocative Statements": "",
                "Custom Requests": ""
            });
            setFullEpisodeVideoEditIndex(null);
        } else if (fullEpisodeVideoEditIndex > index) {
            setFullEpisodeVideoEditIndex(fullEpisodeVideoEditIndex - 1);
        }
    };

    //.................................

    // Full Episode Extended Content Handlers
    const handleAddFullEpisodeExtendedContent = () => {
        // if (!currentFullEpisodeExtendedContent["Article URL"] &&
        //     !currentFullEpisodeExtendedContent["YouTube Short URL"]) {
        //     ShowCustomToast("Please fill at least Article URL or YouTube Short URL", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeExtendedContent };

        if (fullEpisodeExtendedContentEditIndex !== null) {
            const updated = [...fullEpisodeExtendedContentEntries];
            updated[fullEpisodeExtendedContentEditIndex] = newEntry;
            setFullEpisodeExtendedContentEntries(updated);
            setFullEpisodeExtendedContentEditIndex(null);
        } else {
            setFullEpisodeExtendedContentEntries([...fullEpisodeExtendedContentEntries, newEntry]);
        }

        setCurrentFullEpisodeExtendedContent({
            "Article URL": "",
            "Article Text": "",
            "YouTube Short Video File": "",
            "YouTube Short URL": "",
            "YouTube Short Transcript": "",
            "LinkedIn Video File": "",
            "LinkedIn Video Transcript": "",
            "LinkedIn Post Text": "",
            "LinkedIn Executive Comments": "",
            "Emails Marketing": "",
            "Emails Sales": "",
            "Full Episode Quote Card": ""
        });
    };

    const handleEditFullEpisodeExtendedContent = (index) => {
        const entry = fullEpisodeExtendedContentEntries[index];
        setCurrentFullEpisodeExtendedContent({
            "Article URL": entry["Article URL"] || "",
            "Article Text": entry["Article Text"] || "",
            "YouTube Short Video File": entry["YouTube Short Video File"] || "",
            "YouTube Short URL": entry["YouTube Short URL"] || "",
            "YouTube Short Transcript": entry["YouTube Short Transcript"] || "",
            "LinkedIn Video File": entry["LinkedIn Video File"] || "",
            "LinkedIn Video Transcript": entry["LinkedIn Video Transcript"] || "",
            "LinkedIn Post Text": entry["LinkedIn Post Text"] || "",
            "LinkedIn Executive Comments": entry["LinkedIn Executive Comments"] || "",
            "Emails Marketing": entry["Emails Marketing"] || "",
            "Emails Sales": entry["Emails Sales"] || "",
            "Full Episode Quote Card": entry["Full Episode Quote Card"] || ""
        });
        setFullEpisodeExtendedContentEditIndex(index);
    };

    const handleRemoveFullEpisodeExtendedContent = (index) => {
        const updated = fullEpisodeExtendedContentEntries.filter((_, i) => i !== index);
        setFullEpisodeExtendedContentEntries(updated);
        if (fullEpisodeExtendedContentEditIndex === index) {
            setCurrentFullEpisodeExtendedContent({
                "Article URL": "",
                "Article Text": "",
                "YouTube Short Video File": "",
                "YouTube Short URL": "",
                "YouTube Short Transcript": "",
                "LinkedIn Video File": "",
                "LinkedIn Video Transcript": "",
                "LinkedIn Post Text": "",
                "LinkedIn Executive Comments": "",
                "Emails Marketing": "",
                "Emails Sales": "",
                "Full Episode Quote Card": ""
            });
            setFullEpisodeExtendedContentEditIndex(null);
        } else if (fullEpisodeExtendedContentEditIndex > index) {
            setFullEpisodeExtendedContentEditIndex(fullEpisodeExtendedContentEditIndex - 1);
        }
    };

    //.................................

    // Full Episode Highlight Video Handlers
    const handleAddFullEpisodeHighlightVideo = () => {
        // if (!currentFullEpisodeHighlightVideo["Video File"] &&
        //     !currentFullEpisodeHighlightVideo["YouTube URL"]) {
        //     ShowCustomToast("Please fill at least Video File or YouTube URL", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeHighlightVideo };

        if (fullEpisodeHighlightVideoEditIndex !== null) {
            const updated = [...fullEpisodeHighlightVideoEntries];
            updated[fullEpisodeHighlightVideoEditIndex] = newEntry;
            setFullEpisodeHighlightVideoEntries(updated);
            setFullEpisodeHighlightVideoEditIndex(null);
        } else {
            setFullEpisodeHighlightVideoEntries([...fullEpisodeHighlightVideoEntries, newEntry]);
        }

        setCurrentFullEpisodeHighlightVideo({
            "Highlight Video Title": "",
            "Highlight Video Length": "",
            "Highlight Video Description": "",
            "Highlight Video File": "",
            "Highlight YouTube URL": "",
            "Highlight Video Transcript": "",
            "Highlights Video LinkedIn Post Information (post text, comments & emails)": ""

        });
    };

    const handleEditFullEpisodeHighlightVideo = (index) => {
        const entry = fullEpisodeHighlightVideoEntries[index];
        setCurrentFullEpisodeHighlightVideo({
            "Highlight Video Title": entry["Highlight Video Title"] || "",
            "Highlight Video Length": entry["Highlight Video Length"] || "",
            "Highlight Video Description": entry["Highlight Video Description"] || "",
            "Highlight Video File": entry["Highlight Video File"] || "",
            " HighlightYouTube URL": entry["YHighlight ouTube URL"] || "",
            "Highlight Video Transcript": entry["Highlight Video Transcript"] || "",
            "Highlights Video LinkedIn Post Information (post text, comments & emails)": entry["Highlights Video LinkedIn Post Information (post text, comments & emails)"] || "",

        });
        setFullEpisodeHighlightVideoEditIndex(index);
    };

    const handleRemoveFullEpisodeHighlightVideo = (index) => {
        const updated = fullEpisodeHighlightVideoEntries.filter((_, i) => i !== index);
        setFullEpisodeHighlightVideoEntries(updated);
        if (fullEpisodeHighlightVideoEditIndex === index) {
            setCurrentFullEpisodeHighlightVideo({
                "Highlight Video Title": "",
                "Highlight Video Length": "",
                "Highlight Video Description": "",
                "Highlight Video File": "",
                "Highlight YouTube URL": "",
                "Highlight Video Transcript": "",
                "Highlights Video LinkedIn Post Information (post text, comments & emails)": ""

            });
            setFullEpisodeHighlightVideoEditIndex(null);
        } else if (fullEpisodeHighlightVideoEditIndex > index) {
            setFullEpisodeHighlightVideoEditIndex(fullEpisodeHighlightVideoEditIndex - 1);
        }
    };

    // Full Episode Introduction Video Handlers
    const handleAddFullEpisodeIntroductionVideo = () => {
        // if (!currentFullEpisodeIntroductionVideo["Video File"] &&
        //     !currentFullEpisodeIntroductionVideo["YouTube URL"]) {
        //     ShowCustomToast("Please fill at least Video File or YouTube URL", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeIntroductionVideo };

        if (fullEpisodeIntroductionVideoEditIndex !== null) {
            const updated = [...fullEpisodeIntroductionVideoEntries];
            updated[fullEpisodeIntroductionVideoEditIndex] = newEntry;
            setFullEpisodeIntroductionVideoEntries(updated);
            setFullEpisodeIntroductionVideoEditIndex(null);
        } else {
            setFullEpisodeIntroductionVideoEntries([...fullEpisodeIntroductionVideoEntries, newEntry]);
        }

        setCurrentFullEpisodeIntroductionVideo({
            "Introduction Video Title": "",
            "Introduction Video Length": "",
            "Introduction Video Description": "",
            "Introduction Video File": "",
            "Introduction Video YouTube URL": "",
            "Introduction Video Transcript": "",
        });
    };

    const handleEditFullEpisodeIntroductionVideo = (index) => {
        const entry = fullEpisodeIntroductionVideoEntries[index];
        setCurrentFullEpisodeIntroductionVideo({
            "Introduction Video Title": entry["Introduction Video Title"] || "",
            "Introduction Video Length": entry["Introduction Video Length"] || "",
            "Introduction Video Description": entry["Introduction Video Description"] || "",
            "Introduction Video File": entry["Introduction Video File"] || "",
            "Introduction Video YouTube URL": entry["Introduction Video YouTube URL"] || "",
            "Introduction Video Transcript": entry["Introduction Video Transcript"] || ""
        });
        setFullEpisodeIntroductionVideoEditIndex(index);
    };

    const handleRemoveFullEpisodeIntroductionVideo = (index) => {
        const updated = fullEpisodeIntroductionVideoEntries.filter((_, i) => i !== index);
        setFullEpisodeIntroductionVideoEntries(updated);
        if (fullEpisodeIntroductionVideoEditIndex === index) {
            setCurrentFullEpisodeIntroductionVideo({
                "Introduction Video Title": "",
                "Introduction Video Length": "",
                "Introduction Video Description": "",
                "Introduction Video File": "",
                "Introduction Video YouTube URL": "",
                "Introduction Video Transcript": "",
            });
            setFullEpisodeIntroductionVideoEditIndex(null);
        } else if (fullEpisodeIntroductionVideoEditIndex > index) {
            setFullEpisodeIntroductionVideoEditIndex(fullEpisodeIntroductionVideoEditIndex - 1);
        }
    };

    // Full Episode QA Videos Handlers
    const [qavLabelIndex, setQavLabelIndex] = useState(1);
    const getDisplayQavLabel = (label) => label.replace('QAV1', `QAV${qavLabelIndex}`);
    const handleAddFullEpisodeQAVideos = () => {
        // if (!currentFullEpisodeQAVideos["QAV1 Video File"] &&
        //     !currentFullEpisodeQAVideos["QAV1 YouTube URL"]) {
        //     ShowCustomToast("Please fill at least QAV1 Video File or QAV1 YouTube URL", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeQAVideos };

        if (fullEpisodeQAVideosEditIndex !== null) {
            const updated = [...fullEpisodeQAVideosEntries];
            updated[fullEpisodeQAVideosEditIndex] = newEntry;
            setFullEpisodeQAVideosEntries(updated);
            setFullEpisodeQAVideosEditIndex(null);
            setQavLabelIndex(updated.length + 1);
        } else {
            const next = [...fullEpisodeQAVideosEntries, newEntry];
            setFullEpisodeQAVideosEntries(next);
            setQavLabelIndex(next.length + 1);
        }

        setCurrentFullEpisodeQAVideos({
            "QAV1 Video Title": "",
            "QAV1 Video Length": "",
            "QAV1 Video Description": "",
            "QAV1 Video Quote": "",
            "QAV1 Video Hashtags": "",
            "QAV1 Video LinkedIn Post Information (post text, comments & emails)": "",
            "QAV1 Video File": "",
            "QAV1 YouTube URL": "",
            "QAV1 Video Transcript": "",
            "QAV1 Article URL": "",
            "QAV1 Article Text": "",
            "QAV1 YouTube Short Video File": "",
            "QAV1 YouTube Short URL": "",
            "QAV1 YouTube Short Transcript": "",
            "QAV1 LinkedIn Short Video File": "",
            "QAV1 Quote Card": ""
        });
    };

    const handleEditFullEpisodeQAVideos = (index) => {
        const entry = fullEpisodeQAVideosEntries[index];
        setCurrentFullEpisodeQAVideos({
            "QAV1 Video Title": entry["QAV1 Video Title"] || "",
            "QAV1 Video Length": entry["QAV1 Video Length"] || "",
            "QAV1 Video Description": entry["QAV1 Video Description"] || "",
            "QAV1 Video Quote": entry["QAV1 Video Quote"] || "",
            "QAV1 Video Hashtags": entry["QAV1 Video Hashtags"] || "",
            "QAV1 Video LinkedIn Post Information (post text, comments & emails)":
                entry["QAV1 Video LinkedIn Post Information (post text, comments & emails)"] || "",
            "QAV1 Video File": entry["QAV1 Video File"] || "",
            "QAV1 YouTube URL": entry["QAV1 YouTube URL"] || "",
            "QAV1 Video Transcript": entry["QAV1 Video Transcript"] || "",
            "QAV1 Article URL": entry["QAV1 Article URL"] || "",
            "QAV1 Article Text": entry["QAV1 Article Text"] || "",
            "QAV1 YouTube Short Video File": entry["QAV1 YouTube Short Video File"] || "",
            "QAV1 YouTube Short URL": entry["QAV1 YouTube Short URL"] || "",
            "QAV1 YouTube Short Transcript": entry["QAV1 YouTube Short Transcript"] || "",
            "QAV1 LinkedIn Short Video File": entry["QAV1 LinkedIn Short Video File"] || "",
            "QAV1 Quote Card": entry["QAV1 Quote Card"] || ""
        });
        setFullEpisodeQAVideosEditIndex(index);
        setQavLabelIndex(index + 1);
    };

    const handleRemoveFullEpisodeQAVideos = (index) => {
        const updated = fullEpisodeQAVideosEntries.filter((_, i) => i !== index);
        setFullEpisodeQAVideosEntries(updated);
        setQavLabelIndex(updated.length + 1);
        if (fullEpisodeQAVideosEditIndex === index) {
            setCurrentFullEpisodeQAVideos({
                "QAV1 Video Title": "",
                "QAV1 Video Length": "",
                "QAV1 Video Description": "",
                "QAV1 Video Quote": "",
                "QAV1 Video Hashtags": "",
                "QAV1 Video LinkedIn Post Information (post text, comments & emails)": "",
                "QAV1 Video File": "",
                "QAV1 YouTube URL": "",
                "QAV1 Video Transcript": "",
                "QAV1 Article URL": "",
                "QAV1 Article Text": "",
                "QAV1 YouTube Short Video File": "",
                "QAV1 YouTube Short URL": "",
                "QAV1 YouTube Short Transcript": "",
                "QAV1 LinkedIn Short Video File": "",
                "QAV1 Quote Card": ""
            });
            setFullEpisodeQAVideosEditIndex(null);
        } else if (fullEpisodeQAVideosEditIndex > index) {
            setFullEpisodeQAVideosEditIndex(fullEpisodeQAVideosEditIndex - 1);
        }
    };

    // Full Episode Podbook Handlers
    const handleAddFullEpisodePodbook = () => {
        // if (!currentFullEpisodePodbook["Interactive Experience"] &&
        //     !currentFullEpisodePodbook["Website URL"]) {
        //     ShowCustomToast("Please fill at least Interactive Experience or Website URL", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodePodbook };

        if (fullEpisodePodbookEditIndex !== null) {
            const updated = [...fullEpisodePodbookEntries];
            updated[fullEpisodePodbookEditIndex] = newEntry;
            setFullEpisodePodbookEntries(updated);
            setFullEpisodePodbookEditIndex(null);
        } else {
            setFullEpisodePodbookEntries([...fullEpisodePodbookEntries, newEntry]);
        }

        setCurrentFullEpisodePodbook({

            "Podbook Interactive Link": "",
            "Podbook Website URL": "",
            "Podbook Embed Code": "",
            "Podbook Presentation": "",
            "Podbook Loom Folder": ""

        });
    };

    const handleEditFullEpisodePodbook = (index) => {
        const entry = fullEpisodePodbookEntries[index];
        setCurrentFullEpisodePodbook({
            "Podbook Interactive Link": entry["Podbook Interactive Link"] || "",
            "Podbook Website URL": entry["Podbook Website URL"] || "",
            "Podbook Embed Code": entry["Podbook Embed Code"] || "",
            "Podbook Presentation": entry["Podbook Presentation"] || "",
            "Podbook Loom Folder": entry["Podbook Loom Folder"] || ""
        });
        setFullEpisodePodbookEditIndex(index);
    };

    const handleRemoveFullEpisodePodbook = (index) => {
        const updated = fullEpisodePodbookEntries.filter((_, i) => i !== index);
        setFullEpisodePodbookEntries(updated);
        if (fullEpisodePodbookEditIndex === index) {
            setCurrentFullEpisodePodbook({
                "Podbook Interactive Link": "",
                "Podbook Website URL": "",
                "Podbook Embed Code": "",
                "Podbook Presentation": "",
                "Podbook Loom Folder": ""
            });
            setFullEpisodePodbookEditIndex(null);
        } else if (fullEpisodePodbookEditIndex > index) {
            setFullEpisodePodbookEditIndex(fullEpisodePodbookEditIndex - 1);
        }
    };

    // Full Episode Full Case Study Handlers
    const handleAddFullEpisodeFullCaseStudy = () => {
        // if (!currentFullEpisodeFullCaseStudy["Interactive Experience"] &&
        //     !currentFullEpisodeFullCaseStudy["Case Study Text"]) {
        //     ShowCustomToast("Please fill at least Interactive Experience or Case Study Text", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeFullCaseStudy };

        if (fullEpisodeFullCaseStudyEditIndex !== null) {
            const updated = [...fullEpisodeFullCaseStudyEntries];
            updated[fullEpisodeFullCaseStudyEditIndex] = newEntry;
            setFullEpisodeFullCaseStudyEntries(updated);
            setFullEpisodeFullCaseStudyEditIndex(null);
        } else {
            setFullEpisodeFullCaseStudyEntries([...fullEpisodeFullCaseStudyEntries, newEntry]);
        }

        setCurrentFullEpisodeFullCaseStudy({
            "Full Case Study Interactive Link": "",
            "Full Case Study Website URL": "",
            "Full Case Study Embed Code": "",
            "Full Case Study Text": "",
            "Full Case Study LinkedIn Post Information (post text, comments & emails)": "",
            "Problem Section Video File": "",
            "Problem Section Video Length": "",
            "Problem Section Video Transcript": "",
            "Solutions Section Video File": "",
            "Solutions Section Video Length": "",
            "Solutions Section Video Transcript": "",
            "Results Section Video File": "",
            "Results Section Video Length": "",
            "Results Section Video Transcript": ""
        });

    };

    const handleEditFullEpisodeFullCaseStudy = (index) => {
        const entry = fullEpisodeFullCaseStudyEntries[index];
        setCurrentFullEpisodeFullCaseStudy({
            "Full Case Study Interactive Link": entry["Full Case Study Interactive Link"] || "",
            "Full Case Study Website URL": entry["Full Case Study Website URL"] || "",
            "Full Case Study Embed Code": entry["Full Case Study Embed Code"] || "",
            "Full Case Study Text": entry["Full Case Study Text"] || "",
            "Full Case Study LinkedIn Post Information (post text, comments & emails)": entry["Full Case Study LinkedIn Post Information (post text, comments & emails)"] || "",
            "Problem Section Video File": entry["Problem Section Video File"] || "",
            "Problem Section Video Length": entry["Problem Section Video Length"] || "",
            "Problem Section Video Transcript": entry["Problem Section Video Transcript"] || "",
            "Solutions Section Video File": entry["Solutions Section Video File"] || "",
            "Solutions Section Video Length": entry["Solutions Section Video Length"] || "",
            "Solutions Section Video Transcript": entry["Solutions Section Video Transcript"] || "",
            "Results Section Video File": entry["Results Section Video File"] || "",
            "Results Section Video Length": entry["Results Section Video Length"] || "",
            "Results Section Video Transcript": entry["Results Section Video Transcript"] || ""
        });

        setFullEpisodeFullCaseStudyEditIndex(index);
    };

    const handleRemoveFullEpisodeFullCaseStudy = (index) => {
        const updated = fullEpisodeFullCaseStudyEntries.filter((_, i) => i !== index);
        setFullEpisodeFullCaseStudyEntries(updated);
        if (fullEpisodeFullCaseStudyEditIndex === index) {

            setCurrentFullEpisodeFullCaseStudy({
                "Full Case Study Interactive Link": "",
                "Full Case Study Website URL": "",
                "Full Case Study Embed Code": "",
                "Full Case Study Text": "",
                "Full Case Study LinkedIn Post Information (post text, comments & emails)": "",
                "Problem Section Video File": "",
                "Problem Section Video Length": "",
                "Problem Section Video Transcript": "",
                "Solutions Section Video File": "",
                "Solutions Section Video Length": "",
                "Solutions Section Video Transcript": "",
                "Results Section Video File": "",
                "Results Section Video Length": "",
                "Results Section Video Transcript": ""
            });
            setFullEpisodeFullCaseStudyEditIndex(null);
        } else if (fullEpisodeFullCaseStudyEditIndex > index) {
            setFullEpisodeFullCaseStudyEditIndex(fullEpisodeFullCaseStudyEditIndex - 1);
        }
    };

    // Full Episode One Page Case Study Handlers
    const handleAddFullEpisodeOnePageCaseStudy = () => {
        // if (!currentFullEpisodeOnePageCaseStudy["Interactive Experience"] &&
        //     !currentFullEpisodeOnePageCaseStudy["One Page Text"]) {
        //     ShowCustomToast("Please fill at least Interactive Experience or One Page Text", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeOnePageCaseStudy };

        if (fullEpisodeOnePageCaseStudyEditIndex !== null) {
            const updated = [...fullEpisodeOnePageCaseStudyEntries];
            updated[fullEpisodeOnePageCaseStudyEditIndex] = newEntry;
            setFullEpisodeOnePageCaseStudyEntries(updated);
            setFullEpisodeOnePageCaseStudyEditIndex(null);
        } else {
            setFullEpisodeOnePageCaseStudyEntries([...fullEpisodeOnePageCaseStudyEntries, newEntry]);
        }
        setCurrentFullEpisodeOnePageCaseStudy({
            "One Page Case Study Interactive Link": "",
            "One Page Case Study Website URL": "",
            "One Page Case Study Embed Code": ""
        });

    };

    const handleEditFullEpisodeOnePageCaseStudy = (index) => {
        const entry = fullEpisodeOnePageCaseStudyEntries[index];
        setCurrentFullEpisodeOnePageCaseStudy({
            "One Page Case Study Interactive Link": entry["One Page Case Study Interactive Link"] || "",
            "One Page Case Study Website URL": entry["One Page Case Study Website URL"] || "",
            "One Page Case Study Embed Code": entry["One Page Case Study Embed Code"] || ""
        });

        setFullEpisodeOnePageCaseStudyEditIndex(index);
    };

    const handleRemoveFullEpisodeOnePageCaseStudy = (index) => {
        const updated = fullEpisodeOnePageCaseStudyEntries.filter((_, i) => i !== index);
        setFullEpisodeOnePageCaseStudyEntries(updated);
        if (fullEpisodeOnePageCaseStudyEditIndex === index) {
            setCurrentFullEpisodeOnePageCaseStudy({
                "One Page Case Study Interactive Link": "",
                "One Page Case Study Website URL": "",
                "One Page Case Study Embed Code": ""
            });
            setFullEpisodeOnePageCaseStudyEditIndex(null);
        } else if (fullEpisodeOnePageCaseStudyEditIndex > index) {
            setFullEpisodeOnePageCaseStudyEditIndex(fullEpisodeOnePageCaseStudyEditIndex - 1);
        }
    };

    // Full Episode Other Case Study Handlers
    // const handleAddFullEpisodeOtherCaseStudy = () => {
    //     // if (!currentFullEpisodeOtherCaseStudy["Other Case Study Interactive Experience"] &&
    //     //     !currentFullEpisodeOtherCaseStudy["Case Study Text"]) {
    //     //     ShowCustomToast("Please fill at least Interactive Experience or Case Study Text", "error");
    //     //     return;
    //     // }

    //     const newEntry = { ...currentFullEpisodeOtherCaseStudy };

    //     if (fullEpisodeOtherCaseStudyEditIndex !== null) {
    //         const updated = [...fullEpisodeOtherCaseStudyEntries];
    //         updated[fullEpisodeOtherCaseStudyEditIndex] = newEntry;
    //         setFullEpisodeOtherCaseStudyEntries(updated);
    //         setFullEpisodeOtherCaseStudyEditIndex(null);
    //     } else {
    //         setFullEpisodeOtherCaseStudyEntries([...fullEpisodeOtherCaseStudyEntries, newEntry]);
    //     }

    //     setCurrentFullEpisodeOtherCaseStudy({
    //         "Other Case Study Interactive Experience": "",
    //         "Case Study Text": "",
    //         "Sales Email": "",
    //         "Other Case Study Video": "",
    //         "Other Case Study Video Length": "",
    //         "Other Case Study Video Transcript": ""
    //     });
    // };

    // const handleEditFullEpisodeOtherCaseStudy = (index) => {
    //     const entry = fullEpisodeOtherCaseStudyEntries[index];
    //     setCurrentFullEpisodeOtherCaseStudy({
    //         "Other Case Study Interactive Experience": entry["Other Case Study Interactive Experience"] || "",
    //         "Case Study Text": entry["Case Study Text"] || "",
    //         "Sales Email": entry["Sales Email"] || "",
    //         "Other Case Study Video": entry["Other Case Study Video"] || "",
    //         "Other Case Study Video Length": entry["Other Case Study Video Length"] || "",
    //         "Other Case Study Video Transcript": entry["Other Case Study Video Transcript"] || ""
    //     });
    //     setFullEpisodeOtherCaseStudyEditIndex(index);
    // };

    // const handleRemoveFullEpisodeOtherCaseStudy = (index) => {
    //     const updated = fullEpisodeOtherCaseStudyEntries.filter((_, i) => i !== index);
    //     setFullEpisodeOtherCaseStudyEntries(updated);
    //     if (fullEpisodeOtherCaseStudyEditIndex === index) {
    //         setCurrentFullEpisodeOtherCaseStudy({
    //             "Other Case Study Interactive Experience": "",
    //             "Case Study Text": "",
    //             "Sales Email": "",
    //             "Other Case Study Video": "",
    //             "Other Case Study Video Length": "",
    //             "Other Case Study Video Transcript": ""
    //         });
    //         setFullEpisodeOtherCaseStudyEditIndex(null);
    //     } else if (fullEpisodeOtherCaseStudyEditIndex > index) {
    //         setFullEpisodeOtherCaseStudyEditIndex(fullEpisodeOtherCaseStudyEditIndex - 1);
    //     }
    // };

    // Full Episode ICP Advice Handlers
    const handleAddFullEpisodeICPAdvice = () => {
        // if (!currentFullEpisodeICPAdvice["Post-Podcast Video"] &&
        //     !currentFullEpisodeICPAdvice["Post-Podcast Insights Report"]) {
        //     ShowCustomToast("Please fill at least Post-Podcast Video or Insights Report", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeICPAdvice };

        if (fullEpisodeICPAdviceEditIndex !== null) {
            const updated = [...fullEpisodeICPAdviceEntries];
            updated[fullEpisodeICPAdviceEditIndex] = newEntry;
            setFullEpisodeICPAdviceEntries(updated);
            setFullEpisodeICPAdviceEditIndex(null);
        } else {
            setFullEpisodeICPAdviceEntries([...fullEpisodeICPAdviceEntries, newEntry]);
        }

        setCurrentFullEpisodeICPAdvice({
            "Post-Podcast Video": "",
            "Unedited Post-Podcast Video Length": "",
            "Unedited Post-Podcast Transcript": "",
            "Post-Podcast Insights Report": "",
            "Post-Podcast Vision Report": ""
        });
    };
    const handleEditFullEpisodeICPAdvice = (index) => {
        const entry = fullEpisodeICPAdviceEntries[index];
        setCurrentFullEpisodeICPAdvice({
            "Post-Podcast Video": entry["Post-Podcast Video"] || "",
            "Unedited Post-Podcast Video Length": entry["Unedited Post-Podcast Video Length"] || "",
            "Unedited Post-Podcast Transcript": entry["Unedited Post-Podcast Transcript"] || "",
            "Post-Podcast Insights Report": entry["Post-Podcast Insights Report"] || "",
            "Post-Podcast Vision Report": entry["Post-Podcast Vision Report"] || ""
        });
        setFullEpisodeICPAdviceEditIndex(index);
    };

    const handleRemoveFullEpisodeICPAdvice = (index) => {
        const updated = fullEpisodeICPAdviceEntries.filter((_, i) => i !== index);
        setFullEpisodeICPAdviceEntries(updated);
        if (fullEpisodeICPAdviceEditIndex === index) {
            setCurrentFullEpisodeICPAdvice({
                "Post-Podcast Video": "",
                "Unedited Post-Podcast Video Length": "",
                "Unedited Post-Podcast Transcript": "",
                "Post-Podcast Insights Report": "",
                "Post-Podcast Vision Report": ""
            });
            setFullEpisodeICPAdviceEditIndex(null);
        } else if (fullEpisodeICPAdviceEditIndex > index) {
            setFullEpisodeICPAdviceEditIndex(fullEpisodeICPAdviceEditIndex - 1);
        }
    };

    // Full Episode Challenge Questions Handlers
    const handleAddFullEpisodeChallengeQuestions = () => {
        // if (!currentFullEpisodeChallengeQuestions["Unedited Challenge Question Video"] &&
        //     !currentFullEpisodeChallengeQuestions["Challenge Report"]) {
        //     ShowCustomToast("Please fill at least Challenge Question Video or Challenge Report", "error");
        //     return;
        // }

        const newEntry = { ...currentFullEpisodeChallengeQuestions };

        if (fullEpisodeChallengeQuestionsEditIndex !== null) {
            const updated = [...fullEpisodeChallengeQuestionsEntries];
            updated[fullEpisodeChallengeQuestionsEditIndex] = newEntry;
            setFullEpisodeChallengeQuestionsEntries(updated);
            setFullEpisodeChallengeQuestionsEditIndex(null);
        } else {
            setFullEpisodeChallengeQuestionsEntries([...fullEpisodeChallengeQuestionsEntries, newEntry]);
        }

        setCurrentFullEpisodeChallengeQuestions({
            "Unedited Challenge Question Video": "",
            "Unedited Challenge Question Video Length": "",
            "Unedited Challenge Question Transcript": "",
            "Challenge Report": ""
        });
    };

    const handleEditFullEpisodeChallengeQuestions = (index) => {
        const entry = fullEpisodeChallengeQuestionsEntries[index];
        setCurrentFullEpisodeChallengeQuestions({
            "Unedited Challenge Question Video": entry["Unedited Challenge Question Video"] || "",
            "Unedited Challenge Question Video Length": entry["Unedited Challenge Question Video Length"] || "",
            "Unedited Challenge Question Transcript": entry["Unedited Challenge Question Transcript"] || "",
            "Challenge Report": entry["Challenge Report"] || ""
        });
        setFullEpisodeChallengeQuestionsEditIndex(index);
    };

    const handleRemoveFullEpisodeChallengeQuestions = (index) => {
        const updated = fullEpisodeChallengeQuestionsEntries.filter((_, i) => i !== index);
        setFullEpisodeChallengeQuestionsEntries(updated);
        if (fullEpisodeChallengeQuestionsEditIndex === index) {
            setCurrentFullEpisodeChallengeQuestions({
                "Unedited Challenge Question Video": "",
                "Unedited Challenge Question Video Length": "",
                "Unedited Challenge Question Transcript": "",
                "Challenge Report": ""
            });
            setFullEpisodeChallengeQuestionsEditIndex(null);
        } else if (fullEpisodeChallengeQuestionsEditIndex > index) {
            setFullEpisodeChallengeQuestionsEditIndex(fullEpisodeChallengeQuestionsEditIndex - 1);
        }
    };

    const handleFormSubmit = async () => {
        const addHandlers = [];
        if (Object.values(currentGuest).some(val => val !== "")) {
            const newGuest = await handleAddGuest();
            addHandlers.push(newGuest);
        }

        if (Object.values(currentPrepCall).some(val => val !== "")) {
            addHandlers.push(handleAddPrepCall());
        }

        if (Object.values(currentAdditionalProject).some(val => val !== "")) {
            addHandlers.push(handleAddAdditionalProject());
        }

        if (Object.values(currentFullEpisodeDetails).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeDetails());
        }

        if (Object.values(currentFullEpisodeVideo).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeVideo());
        }

        if (Object.values(currentFullEpisodeExtendedContent).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeExtendedContent());
        }

        if (Object.values(currentFullEpisodeHighlightVideo).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeHighlightVideo());
        }

        if (Object.values(currentFullEpisodeIntroductionVideo).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeIntroductionVideo());
        }

        if (Object.values(currentFullEpisodeQAVideos).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeQAVideos());
        }

        if (Object.values(currentFullEpisodePodbook).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodePodbook());
        }

        if (Object.values(currentFullEpisodeFullCaseStudy).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeFullCaseStudy());
        }

        if (Object.values(currentFullEpisodeOnePageCaseStudy).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeOnePageCaseStudy());
        }


        if (Object.values(currentFullEpisodeICPAdvice).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeICPAdvice());
        }

        if (Object.values(currentFullEpisodeChallengeQuestions).some(val => val !== "")) {
            addHandlers.push(handleAddFullEpisodeChallengeQuestions());
        }
        // Add report section handlers
        if (Object.values(currentIcpAdviceReport).some(val => val !== "")) {
            addHandlers.push(handleAddIcpAdviceReport());
        }

        if (Object.values(currentSqlAnalysisReport).some(val => val !== "")) {
            addHandlers.push(handleAddSqlAnalysisReport());
        }

        if (Object.values(currentChallengeQuestions).some(val => val !== "")) {
            addHandlers.push(handleAddChallengeQuestions());
        }

        if (Object.values(currentEBook).some(val => val !== "")) {
            addHandlers.push(handleAddEBook());
        }

        if (Object.values(currentGuestChallengeReport).some(val => val !== "")) {
            addHandlers.push(handleAddGuestChallengeReport());
        }

        // Wait for all handlers to complete and capture results
        const handlerResults = await Promise.all(addHandlers);

        // Convert all rankings to numbers in theme entries
        const validatedThemeEntries = themeEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        const validatedObjectionEntries = objectionEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        const validatedValidationEntries = validationEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));
        const validatedChallengesEntries = challengesEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));
        const validatedSalesInsightsEntries = salesInsightsEntries.map(entry => ({
            ...entry,
            ranking: Number(entry.ranking)
        }));

        setThemeEntries(validatedThemeEntries);
        setObjectionEntries(validatedObjectionEntries);
        setValidationEntries(validatedValidationEntries);
        setChallengesEntries(validatedChallengesEntries);
        setSalesInsightsEntries(validatedSalesInsightsEntries);

        try {
            const latestGuestEntries = handlerResults?.find(r => r && r.type === 'guest')?.entries || guestEntries;
            const latestPrepCallEntries = handlerResults?.find(r => r && r.type === 'prepCall')?.entries || prepCallEntries;


            const guestData = latestGuestEntries.map(guest => ({
                "Guest": guest["Guest"],
                "Persona": guest["Persona"],
                "Industry Vertical": guest["Industry Vertical"],
                "Guest Title": guest["Guest Title"],
                "Guest Company": guest["Guest Company"],
                "Guest Industry": guest["Guest Industry"],
                "Tracker": guest['Tracker'],
                "LinkedIn Profile": guest['LinkedIn Profile'],
                "Dossier": guest['Dossier'],
            }));

            const avatarUrls = latestGuestEntries.map(guest => guest.Avatar).filter(Boolean);
            // If dynamic_fields_description exists but dynamic_fields doesn't, extract fields
            if (formik.values.dynamic_fields_description && !formik.values.dynamic_fields) {
                const fields = extractFieldsFromTemplate(formik.values.dynamic_fields_description);
                formik.setFieldValue('dynamic_fields', fields);
            }
            formik.setValues({
                ...formik.values,
                Guest: guestData.length > 0 ? guestData : null,
                Avatar: avatarUrls.length > 0 ? avatarUrls : null,
                Prep_Call: latestPrepCallEntries.length > 0 ? latestPrepCallEntries : null,
                Additional_Guest_Projects: additionalProjectEntries.length > 0 ? additionalProjectEntries : null,
                Emails: emailEntries.length > 0 ? emailEntries : null,
                DETAILS_FULL_EPISODES: fullEpisodeDetailsEntries.length > 0 ? fullEpisodeDetailsEntries : null,
                FULL_EPISODE_VIDEO: fullEpisodeVideoEntries.length > 0 ? fullEpisodeVideoEntries : null,
                FULL_EPISODE_EXTENDED_CONTENT: fullEpisodeExtendedContentEntries.length > 0 ? fullEpisodeExtendedContentEntries : null,
                FULL_EPISODE_HIGHLIGHT_VIDEO: fullEpisodeHighlightVideoEntries.length > 0 ? fullEpisodeHighlightVideoEntries : null,
                FULL_EPISODE_INTRODUCTION_VIDEO: fullEpisodeIntroductionVideoEntries.length > 0 ? fullEpisodeIntroductionVideoEntries : null,
                FULL_EPISODE_QA_VIDEOS: fullEpisodeQAVideosEntries.length > 0 ? fullEpisodeQAVideosEntries : null,
                FULL_EPISODE_PODBOOK: fullEpisodePodbookEntries.length > 0 ? fullEpisodePodbookEntries : null,
                FULL_EPISODE_FULL_CASE_STUDY: fullEpisodeFullCaseStudyEntries.length > 0 ? fullEpisodeFullCaseStudyEntries : null,
                FULL_EPISODE_ONE_PAGE_CASE_STUDY: fullEpisodeOnePageCaseStudyEntries.length > 0 ? fullEpisodeOnePageCaseStudyEntries : null,
                FULL_EPISODE_OTHER_CASE_STUDY: fullEpisodeOtherCaseStudyEntries.length > 0 ? fullEpisodeOtherCaseStudyEntries : null,
                FULL_EPISODE_ICP_ADVICE: fullEpisodeICPAdviceEntries.length > 0 ? fullEpisodeICPAdviceEntries : null,
                FULL_EPISODE_CHALLENGE_QUESTIONS: fullEpisodeChallengeQuestionsEntries.length > 0 ? fullEpisodeChallengeQuestionsEntries : null,
                ICP_Advice_Report: icpAdviceReportEntries.length > 0 ? icpAdviceReportEntries : null,
                SQL_Analysis_Report: sqlAnalysisReportEntries.length > 0 ? sqlAnalysisReportEntries : null,
                Challenge_Questions: challengeQuestionsEntries.length > 0 ? challengeQuestionsEntries : null,
                eBook: eBookEntries.length > 0 ? eBookEntries : null,
                'Multi-Guest_Challenge_Report_Text': guestChallengeReportEntries.length > 0 ? guestChallengeReportEntries : null,

            });

            // Ensure Formik state is committed before submit
            await new Promise(resolve => setTimeout(resolve, 0));
            await formik.submitForm();
        } catch (error) {
            console.log("Form submission error:", error);
        }
        // setTimeout(async () => {
        //     const errors = await formik.validateForm();
        //     if (Object.keys(errors).length > 0) {
        //         ShowCustomToast("Please fill all required fields.", 'info', 2000);
        //         return;
        //     }
        //     formik.handleSubmit();
        // }, 0);

    };
// Custom placeholder mapping based on your detailed field descriptions
    const customPlaceholders = {
        // Guest Fields
        "Avatar": "Choose File > No File Chosen",
        "Persona": "Select Persona",
        "Guest": "Enter the guest's full name",
        "Guest Title": "Enter the guest's title as shown on LinkedIn",
        "Guest Company": "Enter the guest's company name",
        "Guest's LinkedIn Profile": "Enter the link to the guest's personal profile on LinkedIn",
        "Guest Industry": "Enter the guest's industry as shown within their LinkedIn company page's ABOUT section",
        "Industry Vertical": "Select Industry Vertical. Leave blank if unknown",
        "Guest's Tracker": "Enter the link. Copy from the browser when the pop-up is in view",
        "Guest's Dossier": "Enter the 'share' link to the dossier document. Leave blank if not created",

        // Prep Call Fields
        "Unedited Prep Call Video": "Enter the 'Share' link to the Unedited Prep Call Video",
        "Unedited Prep Call Transcript": "Enter the 'Share' link to the Unedited Prep Call Transcript",
        "Discussion Guide": "Enter the 'Share' link to the Discussion Guide",

        // Full Episode Details
        "Episode ID": "Enter Content Strategies Internal Episode ID",
        "Episode Number": "Enter Episode Number",
        "Episode Title": "Enter Episode Title",
        "Date Recorded": "mm/dd/yyyy",
        "Category": "Podcasts",
        "Short Episode Description": "Copy and paste the short episode description here",
        "Long Episode Description": "Copy and paste the long description here",
        "Formate": "Multi-Media",
        "Short and Long-Tail SEO Keywords": "Copy and paste keywords, separated by a comma",
        "All Asset Folder": "Enter the link to the All-Asset Folder on the client's server",

        // Full Episode Video
        "Full Episode Video Title": "Copy and paste the video title here",
        "Full Episode Video Length": "Enter the video length here (Example: 31:42)",
        "Full Episode Video Description": "Copy and paste the short video description here",
        "Full Episode Video File": "Enter the 'share' link to the video's file",
        "Full Episode Audio File": "Enter the 'share' link to the audio file",
        "Full Episode YouTube URL": "Enter the video's YouTube link",
        "Unedited Full Episode Transcript": "Enter the 'share' link to the unedited transcript",
        "Edited Full Episode Transcript": "Enter the 'share' link to the edited transcript",
        "Provocative Statements": "Enter the 'share' link to the document",
        "Custom Requests": "Enter the 'share' link to the document",

        // Extended Content
        "Article URL": "Enter the link to the article on the client's website",
        "Article Text": "Enter the 'share' link to the article's Google Doc",
        "Full Episode Quote Card": "Enter the 'share' link to the Quote Card image",

        // Highlight Video
        "Highlight Video Title": "Copy and paste the video title here",
        "Highlight Video Length": "Enter the video length here (Example: 3:18)",
        "Highlight Video Description": "Copy and paste the video description here",
        "Highlight Video File": "Enter the 'share' link to the video's file",
        "Highlight YouTube URL": "Enter the video's YouTube link",
        "Highlight Video Transcript": "Enter the 'share' link to the video's transcript",
        "Highlights Video LinkedIn Post Information (post text, comments & emails)": "Enter the 'share' link to the LinkedIn Post Text/Comments/Emails document",

        // Introduction Video
        "Introduction Video Title": "Copy and paste the video title here",
        "Introduction Video Length": "Enter the video length here (Example: 3:18)",
        "Introduction Video Description": "Copy and paste the video description here",
        "Introduction Video File": "Enter the 'share' link to the video's file",
        "Introduction Video YouTube URL": "Enter the video's YouTube link",
        "Introduction Video Transcript": "Enter the 'share' link to the video's transcript",

        // Q&A Videos
        "QAV1 Video Title": "Copy and paste the video title here",
        "QAV1 Video Length": "Enter the video length here (Example: 3:18)",
        "QAV1 Video Description": "Copy and paste the video description here",
        "QAV1 Video Quote": "Copy and paste the video quote here",
        "QAV1 Video Hashtags": "Copy and paste the video hashtags here",
        "QAV1 Video LinkedIn Post Information (post text, comments & emails)": "Coming soon: a button to auto-create this document",
        "QAV1 Video File": "Enter the 'share' link to the video's file",
        "QAV1 YouTube URL": "Enter the video's YouTube link",
        "QAV1 Video Transcript": "Enter the 'share' link to the video's transcript",
        "QAV1 Article URL": "Enter the link to the article on the client's website. Leave blank if not created",
        "QAV1 Article Text": "Enter the 'share' link to the article's Google Doc. Leave blank if not created",
        "QAV1 YouTube Short Video File": "Enter the 'share' link to the video's file. Leave blank if not created",
        "QAV1 YouTube Short URL": "Enter the video's YouTube link. Leave blank if not created",
        "QAV1 YouTube Short Transcript": "Enter the 'share' link to the video's transcript. Leave blank if not created",
        "QAV1 LinkedIn Short Video File": "Enter the 'share' link to the video's file. Leave blank if not created",
        "QAV1 Quote Card": "Enter the 'share' link to the Quote Card image. Leave blank if not created",

        // Podbook
        "Podbook Interactive Link": "Enter the link to the experience hosted on Relayto",
        "Podbook Website URL": "Enter the link to the podbook on the client's website",
        "Podbook Embed Code": "Copy and paste the embed code found through Relayto",
        "Podbook Presentation": "Enter the link to the PowerPoint or Google Slides used to make the Podbook",
        "Podbook Loom Folder": "Enter the link to the Loom folder containing all the videos used in the Podbook",

        // Full Case Study
        "Full Case Study Interactive Link": "Enter the link to the experience hosted on Relayto",
        "Full Case Study Website URL": "Enter the link to the podbook on the client's website",
        "Full Case Study Embed Code": "Copy and paste the embed code found through Relayto",
        "Full Case Study Text": "Enter the 'Share' link to the Full Case Study text document",
        "Full Case Study LinkedIn Post Information (post text, comments & emails)": "Coming soon: a button to auto-create this document",
        "Problem Section Video File": "Enter the 'share' link to the video's file",
        "Problem Section Video Length": "Enter the video length here (Example: 1:38)",
        "Problem Section Video Transcript": "Enter the 'share' link to the problem section video's transcript",
        "Solutions Section Video File": "Enter the 'share' link to the video's file",
        "Solutions Section Video Length": "Enter the video length here (Example: 1:38)",
        "Solutions Section Video Transcript": "Enter the 'share' link to the solution section video's transcript",
        "Results Section Video File": "Enter the 'share' link to the video's file",
        "Results Section Video Length": "Enter the video length here (Example: 1:38)",
        "Results Section Video Transcript": "Enter the 'share' link to the solution section video's transcript",

        // One Page Case Study
        "One Page Case Study Interactive Link": "Enter the link to the experience hosted on Relayto",
        "One Page Case Study Website URL": "Enter the link to the podbook on the client's website",
        "One Page Case Study Embed Code": "Copy and paste the embed code found through Relayto",

        // eBook
        "eBook Interactive Link": "Enter the link to the experience hosted on Relayto",
        "eBook Website URL": "Enter the link to the eBook on the client's website",
        "eBook Embed Code": "Copy and paste the embed code found through Relayto",
        "eBook Text": "Enter the 'Share' link to the eBook text document",
        "eBook LinkedIn Post Information (post text, comments & emails)": "Coming soon: a button to auto-create this document",

        // Multi-Guest Challenge Report
        "Multi-Guest Challenge Report Interactive Link": "Enter the link to the experience hosted on Relayto",
        "Multi-Guest Challenge Report Website URL": "Enter the link to the eBook on the client's website",
        "Multi-Guest Challenge Report Embed Code": "Copy and paste the embed code found through Relayto",
        "Multi-Guest Challenge Report Text": "Enter the 'Share' link to the eBook text document",
        "Multi-Guest Challenge Report LinkedIn Post Information (post text, comments & emails)": "Coming soon: a button to auto-create this document",

        // ICP Advice Report
        "ICP Advice Post-Podcast Video File": "Enter the 'share' link to the video's file",
        "ICP Advice Post-Podcast Video Length": "Enter the video length here (Example: 1:38)",
        "ICP Advice Post-Podcast Video Transcript": "Enter the 'share' link to the ICP Advice Post-Podcast video's transcript",
        "ICP Advice Report": "Enter the 'share' link to the report document. Leave blank if not created",

        // SQL Analysis Report
        "SQL Analysis Post-Podcast Video File": "Enter the 'share' link to the video's file",
        "SQL Analysis Post-Podcast Video Length": "Enter the video length here (Example: 1:38)",
        "SQL Analysis Post-Podcast Video Transcript": "Enter the 'share' link to the SQL Analysis Post-Podcast video's transcript",
        "SQL Analysis Report": "Enter the 'share' link to the report document. Leave blank if not created",

        // Challenge Questions
        "Challenge Questions Prep Call Video File": "Enter the 'share' link to the video's file",
        "Challenge Questions Prep Call Video Length": "Enter the video length here (Example: 1:38)",
        "Challenge Questions Prep Call Video Transcript": "Enter the 'share' link to the Challenge Questions Prep Call video transcript",
        "Challenge Questions Report": "Enter the 'share' link to the report document. Leave blank if not created"
    };



    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="shadow-lg p-4 border border-gray-300 rounded-lg w-[50%]" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                    <h2 className="text-[20px] font-bold px-4 -mt-2 p-0 w-full">
                        {isEditMode ? updateRecord : createRecord}
                        <hr className="border-t border-gray-300 mb-2 mt-[10px] -mx-8" />
                    </h2>

                    <form onSubmit={formik.handleSubmit} className=" rounded-lg p-4 -mt-[10px]">
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {displayFields.some(field =>
                                ['Guest', 'Prep_Call', 'Additional_Guest_Projects', 'Emails',
                                    'FULL_EPISODE_VIDEO', 'FULL_EPISODE_HIGHLIGHT_VIDEO',
                                    'FULL_EPISODE_INTRODUCTION_VIDEO', 'FULL_EPISODE_QA_VIDEOS',
                                    'FULL_EPISODE_PODBOOK', 'FULL_EPISODE_FULL_CASE_STUDY',
                                    'FULL_EPISODE_ONE_PAGE_CASE_STUDY', 'FULL_EPISODE_OTHER_CASE_STUDY',
                                    'FULL_EPISODE_ICP_ADVICE', 'FULL_EPISODE_CHALLENGE_QUESTIONS', 'ICP_Advice_Report', 'SQL_Analysis_Report', 'Challenge_Questions', 'eBook', 'Multi-Guest_Challenge_Report_Text'].includes(field.key)
                            ) && (
                                    <>
                                        {/* Multi-step form container */}
                                        <div className="space-y-6  ">
                                            {/* Step indicator - moved outside and only shown once */}
                                            <div className="flex justify-center sticky top-0 z-[9999]">
                                                <div className="flex space-x-4 -mb-2">
                                                    {[
                                                        { step: 1, label: "Guest Details" },
                                                        { step: 2, label: "Prep Calls" },
                                                        { step: 3, label: "Full Episodes" },
                                                        { step: 4, label: "Special Projects" },
                                                        { step: 5, label: "Reports" },
                                                    ].map(({ step, label }) => (
                                                        <Tooltip key={step} content={label}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setCurrentStep(step)}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${currentStep === step
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                    }`}
                                                            >
                                                                {step}
                                                            </button>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </div>


                                            <hr className="border-t border-gray-300 -mx-2" />
                                            {/* Step 1: Guest Information */}
                                            {currentStep === 1 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 -mt-4">Guest:</h3>
                                                    <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor }}>

                                                        <div className="grid grid-cols-1 gap-4">
                                                            {GUEST_FIELDS.map(fieldKey => (
                                                                <div key={fieldKey}>
                                                                    <label className="block font-semibold text-sm mb-1">
                                                                        {fieldKey === "Guest" ? "Guest Name" : fieldKey}:
                                                                    </label>
                                                                    {fieldKey === 'Avatar' ? (
                                                                        <div>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                ref={avatarInputRef}
                                                                                onChange={(event) => {
                                                                                    const file = event.target.files[0];
                                                                                    if (file) {
                                                                                        setCurrentGuest(prev => ({
                                                                                            ...prev,
                                                                                            Avatar: file
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                                className="w-full p-2 border rounded"
                                                                            />
                                                                            {currentGuest.Avatar && typeof currentGuest.Avatar === 'string' && (
                                                                                <img
                                                                                    src={currentGuest.Avatar}
                                                                                    alt="Current Avatar"
                                                                                    className="mt-2 h-16 w-16 rounded-full object-cover"
                                                                                />
                                                                            )}
                                                                            {/* {currentGuest.Avatar instanceof File && (
                                                                            <div className="mt-2 text-sm text-gray-400">
                                                                                {currentGuest.Avatar.name} (preview not available)
                                                                            </div>
                                                                        )} */}
                                                                        </div>
                                                                    ) : fieldKey === 'Persona' ? (  // Add this block for Persona
                                                                        <CustomSelect
                                                                            id="persona-select"
                                                                            options={OPTIONS['Persona'] || []}
                                                                            value={currentGuest[fieldKey] || ""}
                                                                            isMulti={false}
                                                                            onChange={(value) => setCurrentGuest(prev => ({
                                                                                ...prev,
                                                                                [fieldKey]: value
                                                                            }))}
                                                                            className="w-full"
                                                                            placeholder="Select Persona..."
                                                                        />
                                                                    ) : (
                                                                        <CustomInput
                                                                            type="text"
                                                                            value={currentGuest[fieldKey] || ""}
                                                                            onChange={(e) => setCurrentGuest(prev => ({
                                                                                ...prev,
                                                                                [fieldKey]: e.target.value
                                                                            }))}
                                                                            className="w-full p-2 border rounded"
                                                                            placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}


                                                        </div>

                                                        {guestEntries.length > 0 && (
                                                            <div className="mt-4">
                                                                <h4 className="font-medium text-sm mb-2">Added Guests:</h4>
                                                                {guestEntries.map((entry, index) => (
                                                                    <GuestEntry
                                                                        key={index}
                                                                        index={index}
                                                                        guest={entry}
                                                                        onEdit={handleEditGuest}
                                                                        onRemove={handleRemoveGuest}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center mt-2 -mb-4 py-2">
                                                            <div className="flex items-center">
                                                                {guestEntries.length > 0 && (
                                                                    <span className="text-sm text-gray-500 mr-3">
                                                                        {guestEntries.length} guest(s) added
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <CustomButton
                                                                    type="button"
                                                                    onClick={handleAddGuest}
                                                                    className="flex items-center w-[170px] gap-1 text-sm py-1 px-3"
                                                                >
                                                                    <PlusIcon className="h-3 w-3" />
                                                                    {guestEditIndex !== null ? "Update Guest" : "Add Another Guest"}
                                                                </CustomButton>
                                                                <CustomButton
                                                                    type="button"
                                                                    onClick={() => handleNextStep(2)}
                                                                    disabled={isSaving}
                                                                    className="text-white px-4 py-2 rounded"
                                                                >
                                                                    {isSaving ? 'Saving...' : 'Next: Prep Call'}
                                                                </CustomButton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Prep Call */}
                                            {currentStep === 2 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 -mt-4">Prep Call:</h3>
                                                    <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor }}>

                                                        <div className="grid grid-cols-1 gap-4">
                                                            {PREP_CALLS_FIELDS.map(fieldKey => (
                                                                <div key={fieldKey}>
                                                                    <label className="block font-semibold text-sm mb-1">
                                                                        {fieldKey}:
                                                                    </label>
                                                                    <CustomInput
                                                                        type={fieldKey.includes('Video') || fieldKey.includes('Guide') ? "url" : "text"}
                                                                        value={currentPrepCall[fieldKey] || ""}
                                                                        onChange={(e) => setCurrentPrepCall(prev => ({
                                                                            ...prev,
                                                                            [fieldKey]: e.target.value
                                                                        }))}
                                                                        className="w-full p-2 border rounded"
                                                                        placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                    />
                                                                </div>
                                                            ))}

                                                            {/* {(prepCallEntries.length === 0 || prepCallEditIndex !== null) && (
                                                                <div className="flex justify-end">
                                                                    <CustomButton
                                                                        type="button"
                                                                        onClick={handleAddPrepCall}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <PlusIcon className="h-4 w-4" />
                                                                        {prepCallEditIndex !== null ? "Update Prep Call" : "Add Prep Call"}
                                                                    </CustomButton>
                                                                </div>
                                                            )} */}

                                                        </div>

                                                        {prepCallEntries.length > 0 && (
                                                            <div className="mt-4">
                                                                <h4 className="font-medium text-sm mb-2">Added Prep Call:</h4>
                                                                {prepCallEntries.map((entry, index) => (
                                                                    <PrepCallEntry
                                                                        key={index}
                                                                        index={index}
                                                                        prepCall={entry}
                                                                        onEdit={handleEditPrepCall}
                                                                        onRemove={handleRemovePrepCall}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex justify-end w-full gap-2 mt-4 -mb-4">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={() => setCurrentStep(1)}
                                                                className="w-40 bg-gray-500 hover:bg-gray-600  text-white px-4 py-2 rounded"
                                                            >
                                                                Back: Guest Details
                                                            </CustomButton>
                                                            <div className="space-x-2">
                                                                <CustomButton
                                                                    type="button"
                                                                    onClick={() => handleNextStep(3)}
                                                                    disabled={isSaving}
                                                                    className="text-white px-4 py-2 rounded"
                                                                >
                                                                    {isSaving ? 'Saving...' : 'Next: Full Episodes'}
                                                                </CustomButton>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                            )}
                                            {/* Step 3: Full Episodes */}
                                            {currentStep === 3 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 -mt-4">Full Episode:</h3>
                                                    <div className="border rounded-lg p-6 shadow-sm">

                                                        {/* Episode Details */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-4">Episode Details:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {DETAILS_FULL_EPISODES.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey === "Formate" ? "Format" : fieldKey}:
                                                                            </label>
                                                                            {fieldKey === 'Date Recorded' ? (
                                                                                <CustomInput
                                                                                    type="date"
                                                                                    value={currentFullEpisodeDetails[fieldKey] || ''}
                                                                                    onChange={(e) => setCurrentFullEpisodeDetails(prev => ({
                                                                                        ...prev,
                                                                                        [fieldKey]: e.target.value
                                                                                    }))}
                                                                                    className="w-full p-2 border rounded bg-white text-gray-800 [color-scheme:dark] cursor-pointer"
                                                                                    onClick={(e) => e.target.showPicker()}
                                                                                />

                                                                            ) : (
                                                                                <CustomInput
                                                                                    type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                    value={currentFullEpisodeDetails[fieldKey] || ""}
                                                                                    onChange={(e) => setCurrentFullEpisodeDetails(prev => ({
                                                                                        ...prev,
                                                                                        [fieldKey]: e.target.value
                                                                                    }))}
                                                                                    className="w-full p-2 border rounded"
                                                                                    placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeDetailsEntries.length === 0 || fullEpisodeDetailsEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeDetails}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeDetailsEditIndex !== null ? "Update Full Episode Details" : "Add Full Episode Details"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {fullEpisodeDetailsEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Full Episode Details:</h4>
                                                                        {fullEpisodeDetailsEntries.map((entry, index) => (
                                                                            <FullEpisodeDetailsEntry
                                                                                key={index}
                                                                                index={index}
                                                                                details={entry}
                                                                                onEdit={handleEditFullEpisodeDetails}
                                                                                onRemove={handleRemoveFullEpisodeDetails}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* FULL_EPISODE_VIDEO */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Episode Video:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_VIDEO.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeVideo[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeVideo(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {/* 
                                                                    {(fullEpisodeVideoEntries.length === 0 || fullEpisodeVideoEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeVideo}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeVideoEditIndex !== null ? "Update Full Episode Video" : "Add Full Episode Video"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {fullEpisodeVideoEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Full Episode Videos:</h4>
                                                                        {fullEpisodeVideoEntries.map((entry, index) => (
                                                                            <FullEpisodeVideoEntry
                                                                                key={index}
                                                                                index={index}
                                                                                video={entry}
                                                                                onEdit={handleEditFullEpisodeVideo}
                                                                                onRemove={handleRemoveFullEpisodeVideo}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* FULL_EPISODE_EXTENDED_CONTENT */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Extended Content:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_EXTENDED_CONTENT.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeExtendedContent[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeExtendedContent(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeExtendedContentEntries.length === 0 || fullEpisodeExtendedContentEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeExtendedContent}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeExtendedContentEditIndex !== null ? "Update Extended Content" : "Add Extended Content"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {fullEpisodeExtendedContentEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Extended Content:</h4>
                                                                        {fullEpisodeExtendedContentEntries.map((entry, index) => (
                                                                            <FullEpisodeExtendedContentEntry
                                                                                key={index}
                                                                                index={index}
                                                                                content={entry}
                                                                                onEdit={handleEditFullEpisodeExtendedContent}
                                                                                onRemove={handleRemoveFullEpisodeExtendedContent}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* FULL_EPISODE_HIGHLIGHT_VIDEO */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Highlight Video:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_HIGHLIGHT_VIDEO.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeHighlightVideo[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeHighlightVideo(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeHighlightVideoEntries.length === 0 || fullEpisodeHighlightVideoEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeHighlightVideo}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeHighlightVideoEditIndex !== null ? "Update Highlight Video" : "Add Highlight Video"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {fullEpisodeHighlightVideoEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Highlight Videos:</h4>
                                                                        {fullEpisodeHighlightVideoEntries.map((entry, index) => (
                                                                            <FullEpisodeHighlightVideoEntry
                                                                                key={index}
                                                                                index={index}
                                                                                video={entry}
                                                                                onEdit={handleEditFullEpisodeHighlightVideo}
                                                                                onRemove={handleRemoveFullEpisodeHighlightVideo}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* FULL_EPISODE_INTRODUCTION_VIDEO */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Introduction Video:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_INTRODUCTION_VIDEO.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeIntroductionVideo[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeIntroductionVideo(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeIntroductionVideoEntries.length === 0 || fullEpisodeIntroductionVideoEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeIntroductionVideo}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeIntroductionVideoEditIndex !== null ? "Update Introduction Video" : "Add Introduction Video"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {fullEpisodeIntroductionVideoEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Introduction Videos:</h4>
                                                                        {fullEpisodeIntroductionVideoEntries.map((entry, index) => (
                                                                            <FullEpisodeIntroductionVideoEntry
                                                                                key={index}
                                                                                index={index}
                                                                                video={entry}
                                                                                onEdit={handleEditFullEpisodeIntroductionVideo}
                                                                                onRemove={handleRemoveFullEpisodeIntroductionVideo}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* FULL_EPISODE_QA_VIDEOS */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Q&A Videos:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_QA_VIDEOS.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {getDisplayQavLabel(fieldKey)}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeQAVideos[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeQAVideos(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeQAVideosEntries.length === 0 || fullEpisodeQAVideosEditIndex !== null) && ( */}
                                                                    <div className="flex justify-end">
                                                                        <CustomButton
                                                                            type="button"
                                                                            onClick={handleAddFullEpisodeQAVideos}
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            <PlusIcon className="h-4 w-4" />
                                                                            {fullEpisodeQAVideosEditIndex !== null ? "Update QA Videos" : "Add QA Videos"}
                                                                        </CustomButton>
                                                                    </div>
                                                                    {/* )} */}
                                                                </div>

                                                                {fullEpisodeQAVideosEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added QA Videos:</h4>
                                                                        {fullEpisodeQAVideosEntries.map((entry, index) => (
                                                                            <FullEpisodeQAVideosEntry
                                                                                key={index}
                                                                                index={index}
                                                                                qaVideos={entry}
                                                                                onEdit={handleEditFullEpisodeQAVideos}
                                                                                onRemove={handleRemoveFullEpisodeQAVideos}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* FULL_EPISODE_PODBOOK */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Podbook:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_PODBOOK.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodePodbook[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodePodbook(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodePodbookEntries.length === 0 || fullEpisodePodbookEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodePodbook}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodePodbookEditIndex !== null ? "Update Podbook" : "Add Podbook"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {fullEpisodePodbookEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Podbooks:</h4>
                                                                        {fullEpisodePodbookEntries.map((entry, index) => (
                                                                            <FullEpisodePodbookEntry
                                                                                key={index}
                                                                                index={index}
                                                                                podbook={entry}
                                                                                onEdit={handleEditFullEpisodePodbook}
                                                                                onRemove={handleRemoveFullEpisodePodbook}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* FULL_EPISODE_ICP_ADVICE */}
                                                        {/* <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">ICP Advice:</h2>

                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_ICP_ADVICE.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeICPAdvice[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeICPAdvice(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={`Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {(fullEpisodeICPAdviceEntries.length === 0 || fullEpisodeICPAdviceEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeICPAdvice}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeICPAdviceEditIndex !== null ? "Update ICP Advice" : "Add ICP Advice"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {fullEpisodeICPAdviceEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added ICP Advice:</h4>
                                                                        {fullEpisodeICPAdviceEntries.map((entry, index) => (
                                                                            <FullEpisodeICPAdviceEntry
                                                                                key={index}
                                                                                index={index}
                                                                                advice={entry}
                                                                                onEdit={handleEditFullEpisodeICPAdvice}
                                                                                onRemove={handleRemoveFullEpisodeICPAdvice}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div> */}
                                                        {/* FULL_EPISODE_CHALLENGE_QUESTIONS */}
                                                        {/* <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Challenge Questions:</h2>

                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_CHALLENGE_QUESTIONS.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Folder') ? "url" : "text"}
                                                                                value={currentFullEpisodeChallengeQuestions[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentFullEpisodeChallengeQuestions(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={`Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {(fullEpisodeChallengeQuestionsEntries.length === 0 || fullEpisodeChallengeQuestionsEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddFullEpisodeChallengeQuestions}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {fullEpisodeChallengeQuestionsEditIndex !== null ? "Update Challenge Questions" : "Add Challenge Questions"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {fullEpisodeChallengeQuestionsEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Challenge Questions:</h4>
                                                                        {fullEpisodeChallengeQuestionsEntries.map((entry, index) => (
                                                                            <FullEpisodeChallengeQuestionsEntry
                                                                                key={index}
                                                                                index={index}
                                                                                challenge={entry}
                                                                                onEdit={handleEditFullEpisodeChallengeQuestions}
                                                                                onRemove={handleRemoveFullEpisodeChallengeQuestions}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div> */}
                                                        {/* Navigation */}
                                                        <div className="flex justify-end w-full gap-2 -mt-4 -mb-6">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={() => setCurrentStep(2)}
                                                                className="w-40 bg-gray-500 hover:bg-gray-600  text-white px-4 py-2 rounded"
                                                            >
                                                                Back: Prep Call
                                                            </CustomButton>
                                                            <div className="space-x-2">
                                                                <CustomButton
                                                                    type="button"
                                                                    onClick={() => handleNextStep(4)}
                                                                    className=" text-white px-4 py-2 rounded"
                                                                >
                                                                    {isSaving ? 'Saving...' : '  Next: Special Projects'}
                                                                </CustomButton>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 4: Special Projects */}
                                            {currentStep === 4 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 -mt-4">Special Projects:</h3>
                                                    <div className="border rounded-lg p-6 shadow-sm">
                                                        {/* FULL_EPISODE_FULL_CASE_STUDY */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Full Case Study:</h2>

                                                            <div
                                                                className="border rounded-lg p-4 mb-4"
                                                                style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
                                                            >
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_FULL_CASE_STUDY.map((fieldKey) => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={
                                                                                    fieldKey.includes("URL") ||
                                                                                        fieldKey.includes("Link") ||
                                                                                        fieldKey.includes("Folder")
                                                                                        ? "url"
                                                                                        : "text"
                                                                                }
                                                                                value={currentFullEpisodeFullCaseStudy[fieldKey] || ""}
                                                                                onChange={(e) =>
                                                                                    setCurrentFullEpisodeFullCaseStudy((prev) => ({
                                                                                        ...prev,
                                                                                        [fieldKey]: e.target.value,
                                                                                    }))
                                                                                }
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeFullCaseStudyEntries.length === 0 ||
                                                                     fullEpisodeFullCaseStudyEditIndex !== null) && (
                                                                         <div className="flex justify-end">
                                                                             <CustomButton
                                                                                 type="button"
                                                                                 onClick={handleAddFullEpisodeFullCaseStudy}
                                                                                 className="flex items-center gap-1"
                                                                             >
                                                                                 <PlusIcon className="h-4 w-4" />
                                                                                 {fullEpisodeFullCaseStudyEditIndex !== null
                                                                                     ? "Update Full Case Study"
                                                                                     : "Add Full Case Study"}
                                                                             </CustomButton>
                                                                         </div>
                                                                     )} */}
                                                                </div>

                                                                {fullEpisodeFullCaseStudyEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">
                                                                            Added Full Case Studies:
                                                                        </h4>
                                                                        {fullEpisodeFullCaseStudyEntries.map((entry, index) => (
                                                                            <FullEpisodeFullCaseStudyEntry
                                                                                key={index}
                                                                                index={index}
                                                                                caseStudy={entry}
                                                                                onEdit={handleEditFullEpisodeFullCaseStudy}
                                                                                onRemove={handleRemoveFullEpisodeFullCaseStudy}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* FULL_EPISODE_ONE_PAGE_CASE_STUDY */}
                                                        <div className="mt-2">
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">
                                                                One Page Case Study:
                                                            </h2>

                                                            <div
                                                                className="border rounded-lg p-4 mb-4"
                                                                style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
                                                            >
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {FULL_EPISODE_ONE_PAGE_CASE_STUDY.map((fieldKey) => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={
                                                                                    fieldKey.includes("URL") ||
                                                                                        fieldKey.includes("Link") ||
                                                                                        fieldKey.includes("Folder")
                                                                                        ? "url"
                                                                                        : "text"
                                                                                }
                                                                                value={currentFullEpisodeOnePageCaseStudy[fieldKey] || ""}
                                                                                onChange={(e) =>
                                                                                    setCurrentFullEpisodeOnePageCaseStudy((prev) => ({
                                                                                        ...prev,
                                                                                        [fieldKey]: e.target.value,
                                                                                    }))
                                                                                }
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(fullEpisodeOnePageCaseStudyEntries.length === 0 ||
                                                                     fullEpisodeOnePageCaseStudyEditIndex !== null) && (
                                                                         <div className="flex justify-end">
                                                                             <CustomButton
                                                                                 type="button"
                                                                                 onClick={handleAddFullEpisodeOnePageCaseStudy}
                                                                                 className="flex items-center gap-1"
                                                                             >
                                                                                 <PlusIcon className="h-4 w-4" />
                                                                                 {fullEpisodeOnePageCaseStudyEditIndex !== null
                                                                                     ? "Update One Page Case Study"
                                                                                     : "Add One Page Case Study"}
                                                                             </CustomButton>
                                                                         </div>
                                                                     )} */}
                                                                </div>

                                                                {fullEpisodeOnePageCaseStudyEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">
                                                                            Added One Page Case Studies:
                                                                        </h4>
                                                                        {fullEpisodeOnePageCaseStudyEntries.map((entry, index) => (
                                                                            <FullEpisodeOnePageCaseStudyEntry
                                                                                key={index}
                                                                                index={index}
                                                                                caseStudy={entry}
                                                                                onEdit={handleEditFullEpisodeOnePageCaseStudy}
                                                                                onRemove={handleRemoveFullEpisodeOnePageCaseStudy}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* eBook */}
                                                        <div className="mt-2">
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">eBook:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {eBook.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Embed Code') ? "url" : "text"}
                                                                                value={currentEBook[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentEBook(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(eBookEntries.length === 0 || eBookEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddEBook}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {eBookEditIndex !== null ? "Update eBook" : "Add eBook"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {eBookEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added eBooks:</h4>
                                                                        {eBookEntries.map((entry, index) => (
                                                                            <EBookEntry
                                                                                key={index}
                                                                                index={index}
                                                                                eBook={entry}
                                                                                onEdit={handleEditEBook}
                                                                                onRemove={handleRemoveEBook}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Guest Challenge Report Text */}
                                                        <div className="mt-2">
                                                            <h2 className="text-md font-semibold mb-2 -mt-2">Multi-Guest Challenge Report:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {Guest_Challenge_Report_Text.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('Embed Code') ? "url" : "text"}
                                                                                value={currentGuestChallengeReport[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentGuestChallengeReport(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(guestChallengeReportEntries.length === 0 || guestChallengeReportEditIndex !== null) && (
                                                                        <div className="flex justify-end">
                                                                            <CustomButton
                                                                                type="button"
                                                                                onClick={handleAddGuestChallengeReport}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <PlusIcon className="h-4 w-4" />
                                                                                {guestChallengeReportEditIndex !== null ? "Update Guest Challenge Report" : "Add Guest Challenge Report"}
                                                                            </CustomButton>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {guestChallengeReportEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Guest Challenge Reports:</h4>
                                                                        {guestChallengeReportEntries.map((entry, index) => (
                                                                            <GuestChallengeReportEntry
                                                                                key={index}
                                                                                index={index}
                                                                                report={entry}
                                                                                onEdit={handleEditGuestChallengeReport}
                                                                                onRemove={handleRemoveGuestChallengeReport}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Navigation */}
                                                    <div className="flex justify-end w-full gap-2 -mb-4">
                                                        <CustomButton
                                                            type="button"
                                                            onClick={() => setCurrentStep(3)}
                                                            className="w-40 bg-gray-500 hover:bg-gray-600  text-white px-4 py-2 rounded"
                                                        >
                                                            Back: Full Episodes
                                                        </CustomButton>
                                                        <div className="space-x-2">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={() => handleNextStep(5)}
                                                                className=" text-white px-4 py-2 rounded"
                                                            >
                                                                {isSaving ? 'Saving...' : '  Next: Reports'}
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                </div>


                                            )}

                                            {/* Step 5: Reports */}
                                            {currentStep === 5 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 -mt-4">Reports:</h3>

                                                    {/* ICP Advice Report */}
                                                    <div className="border rounded-lg p-6 shadow-sm">
                                                        <h2 className="text-md font-semibold mb-2 -mt-2">ICP Advice Report:</h2>
                                                        <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {ICP_Advice_Report.map(fieldKey => (
                                                                    <div key={fieldKey}>
                                                                        <label className="block font-semibold text-sm mb-1">
                                                                            {fieldKey}:
                                                                        </label>
                                                                        <CustomInput
                                                                            type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('File') || fieldKey.includes('Video') ? "url" : "text"}
                                                                            value={currentIcpAdviceReport[fieldKey] || ""}
                                                                            onChange={(e) => setCurrentIcpAdviceReport(prev => ({
                                                                                ...prev,
                                                                                [fieldKey]: e.target.value
                                                                            }))}
                                                                            className="w-full p-2 border rounded"
                                                                            placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                        />
                                                                    </div>
                                                                ))}

                                                                {/* {(icpAdviceReportEntries.length === 0 || icpAdviceReportEditIndex !== null) && (
                                                                    <div className="flex justify-end">
                                                                        <CustomButton
                                                                            type="button"
                                                                            onClick={handleAddIcpAdviceReport}
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            <PlusIcon className="h-4 w-4" />
                                                                            {icpAdviceReportEditIndex !== null ? "Update ICP Advice Report" : "Add ICP Advice Report"}
                                                                        </CustomButton>
                                                                    </div>
                                                                )} */}
                                                            </div>

                                                            {icpAdviceReportEntries.length > 0 && (
                                                                <div className="mt-4">
                                                                    <h4 className="font-medium text-sm mb-2">Added ICP Advice Reports:</h4>
                                                                    {icpAdviceReportEntries.map((entry, index) => (
                                                                        <IcpAdviceReportEntry
                                                                            key={index}
                                                                            index={index}
                                                                            report={entry}
                                                                            onEdit={handleEditIcpAdviceReport}
                                                                            onRemove={handleRemoveIcpAdviceReport}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>


                                                        {/* SQL Analysis Report */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2 mt-4">SQL Analysis Report:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {SQL_Analysis_Report.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('File') || fieldKey.includes('Video') ? "url" : "text"}
                                                                                value={currentSqlAnalysisReport[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentSqlAnalysisReport(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(sqlAnalysisReportEntries.length === 0 || sqlAnalysisReportEditIndex !== null) && (
                                                                    <div className="flex justify-end">
                                                                        <CustomButton
                                                                            type="button"
                                                                            onClick={handleAddSqlAnalysisReport}
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            <PlusIcon className="h-4 w-4" />
                                                                            {sqlAnalysisReportEditIndex !== null ? "Update SQL Analysis Report" : "Add SQL Analysis Report"}
                                                                        </CustomButton>
                                                                    </div>
                                                                )} */}
                                                                </div>

                                                                {sqlAnalysisReportEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added SQL Analysis Reports:</h4>
                                                                        {sqlAnalysisReportEntries.map((entry, index) => (
                                                                            <SqlAnalysisReportEntry
                                                                                key={index}
                                                                                index={index}
                                                                                report={entry}
                                                                                onEdit={handleEditSqlAnalysisReport}
                                                                                onRemove={handleRemoveSqlAnalysisReport}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Challenge Questions */}
                                                        <div>
                                                            <h2 className="text-md font-semibold mb-2">Challenge Questions:</h2>
                                                            <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {Challenge_Questions.map(fieldKey => (
                                                                        <div key={fieldKey}>
                                                                            <label className="block font-semibold text-sm mb-1">
                                                                                {fieldKey}:
                                                                            </label>
                                                                            <CustomInput
                                                                                type={fieldKey.includes('URL') || fieldKey.includes('Link') || fieldKey.includes('File') || fieldKey.includes('Video') ? "url" : "text"}
                                                                                value={currentChallengeQuestions[fieldKey] || ""}
                                                                                onChange={(e) => setCurrentChallengeQuestions(prev => ({
                                                                                    ...prev,
                                                                                    [fieldKey]: e.target.value
                                                                                }))}
                                                                                className="w-full p-2 border rounded"
                                                                                placeholder={customPlaceholders[fieldKey] || `Enter ${fieldKey}`}
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* {(challengeQuestionsEntries.length === 0 || challengeQuestionsEditIndex !== null) && (
                                                                    <div className="flex justify-end">
                                                                        <CustomButton
                                                                            type="button"
                                                                            onClick={handleAddChallengeQuestions}
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            <PlusIcon className="h-4 w-4" />
                                                                            {challengeQuestionsEditIndex !== null ? "Update Challenge Questions" : "Add Challenge Questions"}
                                                                        </CustomButton>
                                                                    </div>
                                                                )} */}
                                                                </div>

                                                                {challengeQuestionsEntries.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-medium text-sm mb-2">Added Challenge Questions:</h4>
                                                                        {challengeQuestionsEntries.map((entry, index) => (
                                                                            <ChallengeQuestionsEntry
                                                                                key={index}
                                                                                index={index}
                                                                                challenges={entry}
                                                                                onEdit={handleEditChallengeQuestions}
                                                                                onRemove={handleRemoveChallengeQuestions}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Navigation */}
                                                    <div className="flex justify-end w-full gap-2 mt-2 -mb-6">
                                                        <CustomButton
                                                            type="button"
                                                            onClick={() => setCurrentStep(4)}
                                                            className="w-45 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                                        >
                                                            Back: Special Projects
                                                        </CustomButton>
                                                    </div>
                                                </div>
                                            )}



                                            {/* Step 5: Emails */}
                                            {/* {currentStep === 5 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 -mt-4">Email Details:</h3>
                                                    <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {EMAIL_FIELDS.map(fieldKey => (
                                                                <div key={fieldKey}>
                                                                    <label className="block font-semibold text-sm mb-1">
                                                                        {fieldKey} Email:
                                                                    </label>
                                                                    <CustomInput
                                                                        type="email"
                                                                        value={currentEmail[fieldKey] || ""}
                                                                        onChange={(e) => setCurrentEmail(prev => ({
                                                                            ...prev,
                                                                            [fieldKey]: e.target.value
                                                                        }))}
                                                                        className="w-full p-2 border rounded"
                                                                        placeholder={`Enter ${fieldKey} email`}
                                                                    />
                                                                </div>
                                                            ))}

                                                            {(emailEntries.length === 0 || emailEditIndex !== null) && (
                                                                <div className="flex justify-end">
                                                                    <CustomButton
                                                                        type="button"
                                                                        onClick={handleAddEmail}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <PlusIcon className="h-4 w-4" />
                                                                        {emailEditIndex !== null ? "Update Email" : "Add Email"}
                                                                    </CustomButton>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {emailEntries.length > 0 && (
                                                            <div className="mt-4">
                                                                <h4 className="font-medium text-sm mb-2">Added Emails:</h4>
                                                                {emailEntries.map((entry, index) => (
                                                                    <EmailEntry
                                                                        key={index}
                                                                        index={index}
                                                                        email={entry}
                                                                        onEdit={handleEditEmail}
                                                                        onRemove={handleRemoveEmail}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex justify-end w-full gap-2 -mt-4 -mb-4">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={() => setCurrentStep(4)}
                                                                className="w-50 bg-gray-500 hover:bg-gray-600  text-white px-4 py-2 rounded"
                                                            >
                                                                Back: Additional Projects
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                </div>

                                            )} */}
                                        </div>
                                    </>
                                )}
                            {displayFields.map((field) => (
                                <div key={field.key} className="mb-4">
                                    {![
                                        'Video Type',
                                        'Video Title',
                                        'Video Length',
                                        'Videos Link',
                                        'Video Description',
                                        'Themes',
                                        'Objections',
                                        'Validations',
                                        'Challenges',
                                        'Sales Insights',
                                        'Case_Study_Other_Video',
                                        'ranking',
                                        'Ranking Justification',
                                        'Challenge Report_Unedited Video Link',
                                        'Challenge Report_Unedited Transcript Link',
                                        'Challenge Report_Summary',
                                        'Podcast Report_Unedited Video Link',
                                        'Podcast Report_Unedited Transcript Link',
                                        'Podcast Report_Summary',
                                        'Post-Podcast Report_Unedited Video Link',
                                        'Post-Podcast Report_Unedited Transcript Link',
                                        'Post-Podcast Report_Summary',
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
                                        "file_link",
                                        "Avatar", "Guest Title", "Guest Company", "Guest Industry",
                                        'Guest', 'Prep_Call', 'Additional_Guest_Projects', 'Emails',
                                        'FULL_EPISODE_VIDEO', 'FULL_EPISODE_HIGHLIGHT_VIDEO',
                                        'FULL_EPISODE_INTRODUCTION_VIDEO', 'FULL_EPISODE_QA_VIDEOS',
                                        'FULL_EPISODE_PODBOOK', 'FULL_EPISODE_FULL_CASE_STUDY',
                                        'FULL_EPISODE_ONE_PAGE_CASE_STUDY', 'FULL_EPISODE_OTHER_CASE_STUDY',
                                        'FULL_EPISODE_ICP_ADVICE', 'FULL_EPISODE_CHALLENGE_QUESTIONS', 'Video_ID', 'DETAILS_FULL_EPISODES',
                                        'FULL_EPISODE_EXTENDED_CONTENT', 'ICP_Advice_Report', 'SQL_Analysis_Report', 'Challenge_Questions', 'eBook', 'Multi-Guest_Challenge_Report_Text'
                                    ].includes(field.key) ? (

                                        !(
                                            (field.key == "Mentioned_Quotes" && formik.values["Mentions"] !== "Yes") ||
                                            (field.key === "Case_Study_Transcript" && !formik.values["Case_Study"]) ||
                                            (
                                                field.key === "report_link" &&
                                                !(
                                                    Array.isArray(formik.values["Video Type"]) &&
                                                    formik.values["Video Type"].some(type =>
                                                        ["Challenge Video", "Post-Podcast Video"].includes(type)
                                                    )
                                                )
                                            )
                                        ) && (
                                            <>
                                                <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                    {field.label === "Video Type" ? "Content Type" : field.label}:
                                                    {(field.key == 'prompt_title' || field.key == 'dept_name' || field.key == 'doc_title' || field.key == 'department_id' || field.key == 'template_id') && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </label>

                                                {(field.key === 'file_type' || field.key === 'category' || field.key === 'content_categories' || field.key === 'market_categories') ? (
                                                    MULTISELECT_FIELDS.includes(field.key) ? (
                                                        <CustomSelect
                                                            key={`${field.key}-${JSON.stringify(formik.values[field.key])}`} // Force re-render
                                                            id={field.key}
                                                            options={OPTIONS[field.key] || []}
                                                            value={normalizeSelectOptions(formik.values[field.key], OPTIONS[field.key])}
                                                            isMulti={true}
                                                            onChange={(value) => formik.setFieldValue(field.key, value)}
                                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                                            className="w-full mb-2"
                                                        />
                                                    ) : SINGLESELECT_FIELDS.includes(field.key) ? (
                                                        <CustomSelect
                                                            key={`${field.key}-${JSON.stringify(formik.values[field.key])}`}
                                                            id={field.key}
                                                            options={field.options || OPTIONS[field.key] || []}
                                                            value={normalizeSelectOptions(formik.values[field.key], OPTIONS[field.key])[0] || null}
                                                            isMulti={false}
                                                            onChange={(value) => formik.setFieldValue(field.key, value ? [value] : [])}
                                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                                            className="w-full mb-2"
                                                        />
                                                    ) : null
                                                ) : (field.key == 'prompt_title' || field.key == 'dept_name' || field.key == 'dept_name' || field.key == 'doc_title') ? (
                                                    <CustomInput
                                                        type={field.type || "text"}
                                                        name={field.key}
                                                        value={formik.values[field.key] || ""}
                                                        onChange={formik.handleChange}
                                                        required={true}
                                                        onBlur={formik.handleBlur}
                                                        className="w-full p-2 border rounded"
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                    />
                                                ) : (field.key === 'template_id' || field.key === 'department_id') ? (
                                                    SINGLESELECT_FIELDS.includes(field.key) ? (
                                                        <>
                                                            {console.log('Final Debug:', {
                                                                field: field.key,
                                                                options: field.options || OPTIONS[field.key],
                                                                formikValue: formik.values[field.key],
                                                                resolvedValue: (field.options || OPTIONS[field.key] || []).find(
                                                                    opt => opt.value == formik.values[field.key]?.value ||
                                                                        opt.value == formik.values[field.key]
                                                                ),
                                                                isMatch: (field.options || OPTIONS[field.key] || []).some(
                                                                    opt => opt.value == formik.values[field.key]?.value ||
                                                                        opt.value == formik.values[field.key]
                                                                )
                                                            })}
                                                            <CustomSelect
                                                                key={`${field.key}-${formik.values[field.key]?.value || 'empty'}`}
                                                                id={field.key}
                                                                options={field.options || OPTIONS[field.key] || []}

                                                                value={
                                                                    formik.values[field.key] ?
                                                                        // Try to find matching option by value
                                                                        (field.options || OPTIONS[field.key] || []).find(
                                                                            opt => opt.value == formik.values[field.key]?.value ||
                                                                                opt.value == formik.values[field.key]
                                                                        ) ||
                                                                        // Fallback to creating basic object if value exists
                                                                        (formik.values[field.key] !== null && formik.values[field.key] !== undefined ?
                                                                            { value: formik.values[field.key], label: String(formik.values[field.key]) }
                                                                            : null)
                                                                        : null
                                                                }
                                                                isMulti={false}
                                                                required={true}
                                                                onChange={(selectedOption) => {
                                                                    // Always store the complete option object
                                                                    formik.setFieldValue(field.key, selectedOption || null);
                                                                }}
                                                                placeholder={field.placeholder || `Select ${field.label}...`}
                                                                className="w-full mb-2"

                                                            />
                                                        </>

                                                    ) : null
                                                ) : MULTISELECT_FIELDS.includes(field.key) ? (
                                                    <CustomSelect
                                                        id={field.key}
                                                        options={OPTIONS[field.key] || []}
                                                        value={formik.values[field.key] || []}
                                                        isMulti={true}
                                                        onChange={(value) => formik.setFieldValue(field.key, value)}
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                        className="w-full mb-2"
                                                    />
                                                ) : SINGLESELECT_FIELDS.includes(field.key) ? (
                                                    <CustomSelect
                                                        id={field.key}
                                                        options={OPTIONS[field.key] || []}
                                                        value={formik.values[field.key] || ""}
                                                        isMulti={false}
                                                        onChange={(value) => formik.setFieldValue(field.key, value)}
                                                        placeholder={field.placeholder || `Select ${field.label}...`}
                                                        className="w-full mb-2"
                                                    />
                                                ) : field.type === "textarea" ? (
                                                    <div>
                                                        {/* <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                            {field.label}:
                                                        </label> */}
                                                        <textarea
                                                            name={field.key}
                                                            value={formik.values[field.key] || ""}
                                                            onChange={(e) => {
                                                                formik.handleChange(e);
                                                                if (field.onChange) {
                                                                    field.onChange(e, formik.values, formik.setValues);
                                                                }
                                                            }}
                                                            onBlur={formik.handleBlur}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                                            focus:outline-none focus:ring-1 focus:ring-[#1a1b41] bg-[#1A1B41]
                                                            focus:border-gray-300  transition"
                                                            placeholder={field.placeholder}
                                                            rows={field.rows || 4}
                                                        />
                                                        {formik.errors[field.key] && (
                                                            <p className="text-red-500 text-sm">{formik.errors[field.key]}</p>
                                                        )}
                                                    </div>
                                                ) : field.type === "readonly" ? (
                                                    <div>
                                                        {/* <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                            {field.label}:
                                                        </label> */}
                                                        <div className="w-full p-2 border rounded bg-gray-100" style={{ backgroundColor: appColors.primaryColor }}>
                                                            {field.value(formik.values)}
                                                        </div>
                                                    </div>
                                                ) :
                                                    field.type == "mentioned_quotes_filed" ? (
                                                        <div className="mb-4" >

                                                            <div className="flex items-center gap-2 mb-2" >
                                                                <CustomInput
                                                                    type="text"
                                                                    value={currentMentionedQuote}
                                                                    onChange={(e) => setCurrentMentionedQuote(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && currentMentionedQuote.trim()) {
                                                                            handleAddMentionedQuote();
                                                                        }
                                                                    }}
                                                                    className="flex-1 p-2 border rounded text-white"
                                                                    placeholder={field.placeholder || "Enter quote..."}
                                                                />
                                                                {currentMentionedQuote && (
                                                                    <>
                                                                        <CustomButton
                                                                            type="button"
                                                                            title={"Add"}
                                                                            onClick={handleAddMentionedQuote}
                                                                            className="px-2 py-0 w-[50px] bg-blue-500 text-white rounded hover:bg-blue-600"
                                                                        />

                                                                        <CustomButton
                                                                            type="button"
                                                                            title={"Cancel"}
                                                                            onClick={() => setCurrentMentionedQuote("")}
                                                                            className="px-2 py-0 bg-gray-500 w-[100px] text-white rounded hover:bg-gray-600"
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>

                                                            {mentionedQuotes.length > 0 && (
                                                                <div
                                                                    className="max-w-full overflow-x-auto whitespace-nowrap border border-gray-300 rounded p-2"
                                                                    style={{
                                                                        backgroundColor: appColors.primaryColor,
                                                                        maxHeight: '160px'  // Adjust height as needed
                                                                    }}
                                                                >
                                                                    <label className="font-bold block mb-2">Added Mentioned Quotes:</label>
                                                                    <div className="flex space-x-2">
                                                                        {mentionedQuotes.map((quote, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className="flex items-center justify-between px-2  rounded border border-gray-400 min-w-[100px]"
                                                                                style={{
                                                                                    backgroundColor: appColors.primaryColor,
                                                                                    flex: '0 0 auto'  // Prevent flex items from shrinking
                                                                                }}
                                                                            >
                                                                                <span className="mr-2 overflow-hidden text-ellipsis">{quote}</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveMentionedQuote(index)}
                                                                                    className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                                                                                    style={{ fontSize: '1.2rem' }}
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : field.type === "image" ? (
                                                        <>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(event) => {
                                                                    const file = event.currentTarget.files[0];
                                                                    formik.setFieldValue(field.key, file);
                                                                }}
                                                            />
                                                            {formik.values[field.key] && typeof formik.values[field.key] === "string" && (
                                                                <img src={formik.values[field.key]} alt="Uploaded Avatar" className="mt-2 h-16 rounded" />
                                                            )}
                                                        </>
                                                    ) : field.type === "file" ? (
                                                        <div className="space-y-2">
                                                            {/* Upload file */}
                                                            <div>
                                                                {/* <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Upload File:
                                                            </label> */}
                                                                <CustomInput
                                                                    type="file"
                                                                    accept="*/*"
                                                                    onChange={(event) => {
                                                                        const file = event.currentTarget.files[0];
                                                                        formik.setFieldValue(field.key, file);
                                                                        formik.setFieldValue(`${field.key}_link`, ""); // clear link if file selected
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* OR enter link */}
                                                            <div>
                                                                <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                    Or Provide Google Doc / Link:
                                                                </label>
                                                                <CustomInput
                                                                    type="url"
                                                                    placeholder="https://docs.google.com/..."
                                                                    value={formik.values[`${field.key}_link`] || ""}
                                                                    onChange={(e) => {
                                                                        formik.setFieldValue(`${field.key}_link`, e.target.value);
                                                                        formik.setFieldValue(field.key, null); // clear file if link entered
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <CustomInput
                                                            type={field.type || "text"}
                                                            name={field.key}
                                                            value={formik.values[field.key] || ""}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            className="w-full p-2 border rounded"
                                                            placeholder={field.placeholder || `Select ${field.label}...`}
                                                        />
                                                    )}

                                                {formik.errors[field.key] && (
                                                    <p className="text-red-500 text-sm">{formik.errors[field.key]}</p>
                                                )}

                                            </>
                                        )) : field.key === 'Video Type' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Content Type
                                                </label>

                                                <div
                                                    className="border rounded-lg p-4 mb-4"
                                                    style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
                                                >
                                                    {/* Video Type Selection */}
                                                    <div className="mb-4">
                                                        <CustomSelect
                                                            id="video-type-select"
                                                            options={OPTIONS['Video Type'] || []}
                                                            value={currentVideoType}
                                                            isMulti={false}
                                                            onChange={(value) => setCurrentVideoType(value)}
                                                            placeholder="Select a content type..."
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    {/* Video Details Form */}
                                                    {currentVideoType && (
                                                        <div className="p-4 border rounded-lg mb-4 text-black" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                            <h4 className="font-medium border-b mb-4">Add New Video:</h4>

                                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Video Title"
                                                                    value={currentVideoTitle}
                                                                    onChange={(e) => setCurrentVideoTitle(e.target.value)}
                                                                    placeholder="Enter video title"
                                                                    required
                                                                />
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Video Length"
                                                                    value={currentVideoLength}
                                                                    onChange={(e) => setCurrentVideoLength(e.target.value)}
                                                                    placeholder="e.g. 3:45"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="mb-3">
                                                                <CustomInput
                                                                    type="url"
                                                                    label="Video Link"
                                                                    value={currentVideoLink}
                                                                    onChange={(e) => setCurrentVideoLink(e.target.value)}
                                                                    placeholder="Enter video URL"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="mb-4">
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Video Description"
                                                                    value={currentVideoDesc}
                                                                    onChange={(e) => setCurrentVideoDesc(e.target.value)}
                                                                    placeholder="Enter video description"
                                                                    as="textarea"
                                                                    rows={3}
                                                                />
                                                            </div>

                                                            <div className="flex justify-end">
                                                                <CustomButton
                                                                    type="button"
                                                                    onClick={handleAddVideo}
                                                                    disabled={!currentVideoTitle || !currentVideoLength || !currentVideoLink}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <PlusIcon className="h-4 w-4" />
                                                                    {editingVideoIndex !== null ? 'Update Video' : 'Add Video'}
                                                                </CustomButton>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Current Videos List */}
                                                    {currentVideos.length > 0 && (
                                                        <div className="border p-4 rounded-lg mb-4 text-black" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }} >
                                                            <h4 className="font-medium mb-3">Added Videos: {currentVideoType?.label}</h4>
                                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                                {currentVideos.map((video, idx) => (
                                                                    <div
                                                                        key={`${video.video_title}-${idx}`}
                                                                        className="border rounded p-3 shadow-sm hover:shadow-md transition"
                                                                    >
                                                                        <div className="flex justify-between items-start gap-4">
                                                                            <div className="space-y-1 text-sm text-gray-800" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                                                <p><strong>Title:</strong> {video.video_title}</p>
                                                                                <p><strong>Length:</strong> {video.video_length}</p>
                                                                                <p>
                                                                                    <strong>Link:</strong>{' '}
                                                                                    <a
                                                                                        href={video.video_link}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-blue-600 underline break-all"
                                                                                    >
                                                                                        {video.video_link}
                                                                                    </a>
                                                                                </p>
                                                                                {video.video_desc && (
                                                                                    <p><strong>Description:</strong> {video.video_desc}</p>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex space-x-2">
                                                                                <button
                                                                                    onClick={() => handleEditVideo(idx)}
                                                                                    className="text-blue-500 hover:text-blue-700"
                                                                                    title="Edit Video"
                                                                                >
                                                                                    <PencilIcon className="h-5 w-5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleRemoveVideo(idx)}
                                                                                    className="text-red-500 hover:text-red-700"
                                                                                    title="Remove Video"
                                                                                >
                                                                                    <TrashIcon className="h-5 w-5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Save/Update Button */}
                                                    {currentVideoType && currentVideos.length > 0 && (
                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleSaveVideoGroup}
                                                            >
                                                                {videoTypeEditIndex !== null ? 'Update Content Group' : 'Save Content Group'}
                                                            </CustomButton>
                                                        </div>
                                                    )}

                                                    {/* Saved Video Groups */}
                                                    {videoTypeEntries.length > 0 && (
                                                        <div className="mt-6">
                                                            <h4 className="font-medium mb-3">Saved Content Type:</h4>
                                                            <div className="space-y-4" >
                                                                {videoTypeEntries.map((group, index) => (
                                                                    <VideoTypeEntry
                                                                        key={index}
                                                                        index={index}
                                                                        videoType={group.videoType}
                                                                        videos={group.videos}
                                                                        onEdit={handleEditVideoGroup}
                                                                        onRemove={handleRemoveVideoGroup}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                        : field.key === 'Themes' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Themes:
                                                </label>

                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="theme-select"
                                                                options={OPTIONS['Themes'] || []}
                                                                value={currentTheme}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentTheme(value)}
                                                                placeholder="Select a theme..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentRanking}
                                                                    onChange={(e) => setCurrentRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>

                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentJustification}
                                                                    onChange={(e) => setCurrentJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentPerception}
                                                                onChange={(e) => setCurrentPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentWhyItMatters}
                                                                onChange={(e) => setCurrentWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentDeeperInsight}
                                                                onChange={(e) => setCurrentDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentSupportingQuotes}
                                                                onChange={(e) => setCurrentSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddTheme}
                                                                disabled={!currentTheme || !currentRanking || !currentJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {editIndex !== null ? "Update Theme" : "Add Theme"}
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                    {themeEntries.length > 0 && (
                                                        <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                            <h4 className="font-medium text-sm mb-2">Added Themes:</h4>
                                                            {themeEntries.map((entry, index) => (
                                                                <ThemeEntry
                                                                    key={index}
                                                                    index={index}
                                                                    theme={entry.theme}
                                                                    ranking={entry.ranking}
                                                                    justification={entry.justification}
                                                                    perception={entry.perception}
                                                                    whyItMatters={entry.whyItMatters}
                                                                    deeperInsight={entry.deeperInsight}
                                                                    supportingQuotes={entry.supportingQuotes}
                                                                    onEdit={handleEditTheme}
                                                                    onRemove={handleRemoveTheme}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {formik.errors['Themes'] && formik.touched['Themes'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Themes']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Objections' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Objections:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="objection-select"
                                                                options={OPTIONS['Objections'] || []}
                                                                value={currentObjection}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentObjection(value)}
                                                                placeholder="Select an objection..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentObjectionRanking}
                                                                    onChange={(e) => setCurrentObjectionRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentObjectionJustification}
                                                                    onChange={(e) => setCurrentObjectionJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentObjectionPerception}
                                                                onChange={(e) => setCurrentObjectionPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentObjectionWhyItMatters}
                                                                onChange={(e) => setCurrentObjectionWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentObjectionDeeperInsight}
                                                                onChange={(e) => setCurrentObjectionDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentObjectionSupportingQuotes}
                                                                onChange={(e) => setCurrentObjectionSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddObjection}
                                                                disabled={!currentObjection || !currentObjectionRanking || !currentObjectionJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {objectionEditIndex !== null ? "Update Objection" : "Add Objection"}
                                                            </CustomButton>
                                                        </div>
                                                        {objectionEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Objections:</h4>
                                                                {objectionEntries.map((entry, index) => (
                                                                    <ObjectionEntry
                                                                        key={index}
                                                                        index={index}
                                                                        objection={entry.objection}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditObjection}
                                                                        onRemove={handleRemoveObjection}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Objections'] && formik.touched['Objections'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Objections']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Validations' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Validations:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="validation-select"
                                                                options={OPTIONS['Validations'] || []}
                                                                value={currentValidation}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentValidation(value)}
                                                                placeholder="Select a validation..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentValidationRanking}
                                                                    onChange={(e) => setCurrentValidationRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>

                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentValidationJustification}
                                                                    onChange={(e) => setCurrentValidationJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentValidationPerception}
                                                                onChange={(e) => setCurrentValidationPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentValidationWhyItMatters}
                                                                onChange={(e) => setCurrentValidationWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentValidationDeeperInsight}
                                                                onChange={(e) => setCurrentValidationDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>
                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentValidationSupportingQuotes}
                                                                onChange={(e) => setCurrentValidationSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddValidation}
                                                                disabled={!currentValidation || !currentValidationRanking || !currentValidationJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {validationEditIndex !== null ? "Update Validation" : "Add Validation"}
                                                            </CustomButton>
                                                        </div>
                                                        {validationEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Validations:</h4>
                                                                {validationEntries.map((entry, index) => (
                                                                    <ValidationEntry
                                                                        key={index}
                                                                        index={index}
                                                                        validation={entry.validation}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditValidation}
                                                                        onRemove={handleRemoveValidation}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Validations'] && formik.touched['Validations'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Validations']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Challenges' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Challenges:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="challenges-select"
                                                                options={OPTIONS['Challenges'] || []}
                                                                value={currentChallenges}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentChallenges(value)}
                                                                placeholder="Select a challenge..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentChallengesRanking}
                                                                    onChange={(e) => setCurrentChallengesRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentChallengesJustification}
                                                                    onChange={(e) => setCurrentChallengesJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentChallengesPerception}
                                                                onChange={(e) => setCurrentChallengesPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception to address"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentChallengesWhyItMatters}
                                                                onChange={(e) => setCurrentChallengesWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentChallengesDeeperInsight}
                                                                onChange={(e) => setCurrentChallengesDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentChallengesSupportingQuotes}
                                                                onChange={(e) => setCurrentChallengesSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddChallenges}
                                                                disabled={!currentChallenges || !currentChallengesRanking || !currentChallengesJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {challengesEditIndex !== null ? "Update Challenge" : "Add Challenge"}
                                                            </CustomButton>
                                                        </div>
                                                        {challengesEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Challenges:</h4>
                                                                {challengesEntries.map((entry, index) => (
                                                                    <ChallengesEntry
                                                                        key={index}
                                                                        index={index}
                                                                        challenge={entry.challenges}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditChallenges}
                                                                        onRemove={handleRemoveChallenges}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Challenges'] && formik.touched['Challenges'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Challenges']}</p>
                                                )}
                                            </div>
                                        ) : field.key === 'Sales Insights' ? (
                                            <div>
                                                <label className="block font-semibold mb-2" style={{ color: appColors.textColor }}>
                                                    Sales Insights:
                                                </label>
                                                <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <CustomSelect
                                                                id="sales-insights-select"
                                                                options={OPTIONS['Sales Insights'] || []}
                                                                value={currentSalesInsight}
                                                                isMulti={false}
                                                                onChange={(value) => setCurrentSalesInsight(value)}
                                                                placeholder="Select a sales insight..."
                                                                className="w-full mb-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <CustomInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="10"
                                                                    label="Match Rating (1-10)"
                                                                    value={currentSalesInsightRanking}
                                                                    onChange={(e) => setCurrentSalesInsightRanking(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="1-10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CustomInput
                                                                    type="text"
                                                                    label="Rating Justification"
                                                                    value={currentSalesInsightJustification}
                                                                    onChange={(e) => setCurrentSalesInsightJustification(e.target.value)}
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Enter justification"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Perception to Address"
                                                                value={currentSalesInsightPerception}
                                                                onChange={(e) => setCurrentSalesInsightPerception(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter perception"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Why It Matters"
                                                                value={currentSalesInsightWhyItMatters}
                                                                onChange={(e) => setCurrentSalesInsightWhyItMatters(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter why it matters"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Deeper Insight"
                                                                value={currentSalesInsightDeeperInsight}
                                                                onChange={(e) => setCurrentSalesInsightDeeperInsight(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter deeper insight"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomInput
                                                                type="text"
                                                                label="Supporting Quotes"
                                                                value={currentSalesInsightSupportingQuotes}
                                                                onChange={(e) => setCurrentSalesInsightSupportingQuotes(e.target.value)}
                                                                className="w-full p-2 border rounded mb-2"
                                                                placeholder="Enter supporting quotes"
                                                            />
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddSalesInsight}
                                                                disabled={!currentSalesInsight || !currentSalesInsightRanking || !currentSalesInsightJustification}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {salesInsightsEditIndex !== null ? "Update Insight" : "Add Insight"}
                                                            </CustomButton>
                                                        </div>

                                                        {salesInsightsEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">Added Sales Insights:</h4>
                                                                {salesInsightsEntries.map((entry, index) => (
                                                                    <SalesInsightsEntry // You may want to create a `SalesInsightEntry` component
                                                                        key={index}
                                                                        index={index}
                                                                        insight={entry.insight}
                                                                        ranking={entry.ranking}
                                                                        justification={entry.justification}
                                                                        perception={entry.perception}
                                                                        whyItMatters={entry.whyItMatters}
                                                                        deeperInsight={entry.deeperInsight}
                                                                        supportingQuotes={entry.supportingQuotes}
                                                                        onEdit={handleEditSalesInsight}
                                                                        onRemove={handleRemoveSalesInsight}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {formik.errors['Sales Insights'] && formik.touched['Sales Insights'] && (
                                                    <p className="text-red-500 text-sm mb-2">{formik.errors['Sales Insights']}</p>
                                                )}
                                            </div>

                                        ) : field.key == 'Case_Study_Other_Video' ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Case Study Other Video:</h3>

                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Video Title</label>
                                                            {/* Video Title */}
                                                            <CustomInput
                                                                type="text"
                                                                value={currentVideoTitle}
                                                                onChange={(e) => setCurrentVideoTitle(e.target.value)}
                                                                placeholder="Enter Video Title…"
                                                                className="w-full p-2 border rounded"

                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Video Link</label>

                                                            {/* Video Link */}
                                                            <CustomInput
                                                                type="url"
                                                                value={currentVideoLink}
                                                                onChange={(e) => setCurrentVideoLink(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Copy & Paste Text</label>

                                                            {/* Copy-and-Paste Text */}
                                                            <CustomInput
                                                                as="textarea"
                                                                rows={3}
                                                                value={currentCopyAndPasteText}
                                                                onChange={(e) => setCurrentCopyAndPasteText(e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy & Paste Text"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>Link to Document</label>
                                                            {/* Link to Document */}
                                                            <CustomInput
                                                                type="text"
                                                                value={currentLinkToDocument}
                                                                onChange={(e) => setCurrentLinkToDocument(e.target.value)}
                                                                className="w-full p-2 border rounded font-semibold"
                                                                placeholder="Enter Link to Document"
                                                            />
                                                        </div>
                                                        {/* Add / Update button */}
                                                        <div className="flex justify-end">
                                                            <CustomButton
                                                                type="button"
                                                                onClick={handleAddCaseStudyVideo}
                                                                disabled={!currentVideoTitle || !currentVideoLink}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                                {caseStudyVideoEditIndex !== null ? 'Update Other Video' : 'Add Other Video'}
                                                            </CustomButton>
                                                        </div>

                                                        {/* List of added videos */}
                                                        {caseStudyVideoEntries.length > 0 && (
                                                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                                                                <h4 className="font-medium text-sm mb-2">
                                                                    Added Case Study Other Videos:
                                                                </h4>

                                                                {caseStudyVideoEntries.map((entry, index) => (
                                                                    <CaseStudyVideoEntry          /* create a tiny component like SalesInsightsEntry */
                                                                        key={index}
                                                                        index={index}
                                                                        video_title={entry.video_title}
                                                                        video_link={entry.video_link}
                                                                        copy_and_paste_text={entry.copy_and_paste_text}
                                                                        link_to_document={entry.link_to_document}
                                                                        onEdit={handleEditCaseStudyVideo}
                                                                        onRemove={handleRemoveCaseStudyVideo}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {formik.errors['Case Study Other Video'] &&
                                                    formik.touched['Case Study Other Video'] && (
                                                        <p className="text-red-500 text-sm mb-2">
                                                            {formik.errors['Case Study Other Video']}
                                                        </p>
                                                    )}
                                            </>
                                        ) : field.key === "Full Case Study_Interactive Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Full Case Study:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Interactive Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Full Case Study_Interactive Link"
                                                                value={formik.values["Full Case Study_Interactive Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Interactive Link"
                                                            />
                                                            {formik.errors["Full Case Study_Interactive Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Full Case Study_Interactive Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Full Case Study_Copy and Paste Text"
                                                                value={formik.values["Full Case Study_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Full Case Study_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Full Case Study_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Full Case Study_Link To Document"
                                                                value={formik.values["Full Case Study_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Full Case Study_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Full Case Study_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Problem Section_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Problem Section:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Problem Section_Video Link"
                                                                value={formik.values["Problem Section_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Problem Section_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Problem Section_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Problem Section_Copy and Paste Text"
                                                                value={formik.values["Problem Section_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Problem Section_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Problem Section_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Problem Section_Link To Document"
                                                                value={formik.values["Problem Section_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Problem Section_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Problem Section_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Solution Section_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Solution Section:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Solution Section_Video Link"
                                                                value={formik.values["Solution Section_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Solution Section_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Solution Section_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Solution Section_Copy and Paste Text"
                                                                value={formik.values["Solution Section_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Solution Section_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Solution Section_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Solution Section_Link To Document"
                                                                value={formik.values["Solution Section_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Solution Section_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Solution Section_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Results Section_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Results Section:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Results Section_Video Link"
                                                                value={formik.values["Results Section_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Results Section_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Results Section_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Results Section_Copy and Paste Text"
                                                                value={formik.values["Results Section_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Results Section_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Results Section_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Results Section_Link To Document"
                                                                value={formik.values["Results Section_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Results Section_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Results Section_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Case Study Video Short_Video Link" ? (
                                            <>
                                                <h3 className="text-lg font-semibold mb-2" style={{ color: appColors.textColor }}>Case Study Video Short:</h3>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Video Link:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Case Study Video Short_Video Link"
                                                                value={formik.values["Case Study Video Short_Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Video Link"
                                                            />
                                                            {formik.errors["Case Study Video Short_Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Case Study Video Short_Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Copy and Paste Text:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Case Study Video Short_Copy and Paste Text"
                                                                value={formik.values["Case Study Video Short_Copy and Paste Text"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Copy and Paste Text"
                                                            />
                                                            {formik.errors["Case Study Video Short_Copy and Paste Text"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Case Study Video Short_Copy and Paste Text"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Link To Document:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Case Study Video Short_Link To Document"
                                                                value={formik.values["Case Study Video Short_Link To Document"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Link To Document"
                                                            />
                                                            {formik.errors["Case Study Video Short_Link To Document"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Case Study Video Short_Link To Document"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : field.key === "Challenge Report_Unedited Video Link" ? (
                                            <>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>

                                                    <div className="space-y-4">
                                                        {/* Challenge Report fields */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Challenge Video:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Challenge Report_Unedited Video Link"
                                                                value={formik.values["Challenge Report_Unedited Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Challenge Video Link"
                                                            />
                                                            {formik.errors["Challenge Report_Unedited Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Challenge Report_Unedited Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Challenge Transcript:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Challenge Report_Unedited Transcript Link"
                                                                value={formik.values["Challenge Report_Unedited Transcript Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Challenge Transcript"
                                                            />
                                                            {formik.errors["Challenge Report_Unedited Transcript Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Challenge Report_Unedited Transcript Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Challenge Report:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Challenge Report_Summary"
                                                                value={formik.values["Challenge Report_Summary"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Challenge Report"
                                                            />
                                                            {formik.errors["Challenge Report_Summary"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Challenge Report_Summary"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>

                                        ) : field.key === "Podcast Report_Unedited Video Link" ? (
                                            <>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>
                                                    <div className="space-y-4">
                                                        {/* Podcast Report fields */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Podcast Video (Unedited):
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Podcast Report_Unedited Video Link"
                                                                value={formik.values["Podcast Report_Unedited Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Podcast Video (Unedited) Link"
                                                            />
                                                            {formik.errors["Podcast Report_Unedited Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Podcast Report_Unedited Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Podcast Transcript:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Podcast Report_Unedited Transcript Link"
                                                                value={formik.values["Podcast Report_Unedited Transcript Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Podcast Transcript"
                                                            />
                                                            {formik.errors["Podcast Report_Unedited Transcript Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Podcast Report_Unedited Transcript Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Podcast Summary:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Podcast Report_Summary"
                                                                value={formik.values["Podcast Report_Summary"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Podcast Summary"
                                                            />
                                                            {formik.errors["Podcast Report_Summary"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Podcast Report_Summary"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>

                                        ) : field.key === "Post-Podcast Report_Unedited Video Link" && (
                                            <>
                                                <div className="border rounded-lg p-4 mb-4" style={{ borderColor: appColors.borderColor }}>

                                                    <div className="space-y-4">
                                                        {/* Post-Podcast Report fields */}
                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Post-Podcast Video:
                                                            </label>
                                                            <CustomInput
                                                                type="url"
                                                                name="Post-Podcast Report_Unedited Video Link"
                                                                value={formik.values["Post-Podcast Report_Unedited Video Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Post-Podcast Video Link"
                                                            />
                                                            {formik.errors["Post-Podcast Report_Unedited Video Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Post-Podcast Report_Unedited Video Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Post-Podcast Transcript:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Post-Podcast Report_Unedited Transcript Link"
                                                                value={formik.values["Post-Podcast Report_Unedited Transcript Link"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Post-Podcast Transcript"
                                                            />
                                                            {formik.errors["Post-Podcast Report_Unedited Transcript Link"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Post-Podcast Report_Unedited Transcript Link"]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block font-semibold" style={{ color: appColors.textColor }}>
                                                                Post-Podcast Report:
                                                            </label>
                                                            <CustomInput
                                                                type="text"
                                                                name="Post-Podcast Report_Summary"
                                                                value={formik.values["Post-Podcast Report_Summary"] || ""}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className="w-full p-2 border rounded"
                                                                placeholder="Enter Post-Podcast Report"
                                                            />
                                                            {formik.errors["Post-Podcast Report_Summary"] && (
                                                                <p className="text-red-500 text-sm">{formik.errors["Post-Podcast Report_Summary"]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                </div>
                            ))}
                        </div>
                        <hr className="border-t border-gray-300 mb-6 mt-[10px] -mx-8" />
                        <div className="flex justify-end space-x-3 -mt-2 -mb-6 p-1">
                            <CustomButton
                                type="button"
                                title="Cancel"
                                onClick={onClose}
                                className="mb-0 w-[100px] -mt-2"
                            />
                            <CustomButton
                                type="button"
                                title={isEditMode ? "Update" : "Save"}
                                loading={formik.isSubmitting}
                                disabled={formik.isSubmitting}
                                onClick={handleFormSubmit}
                                className="mb-0 w-[100px] -mt-2"
                            />

                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CustomCrudForm;