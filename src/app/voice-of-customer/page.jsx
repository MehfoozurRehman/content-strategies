"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaClock, FaLink, FaTimes, FaPlus } from "react-icons/fa";
import CustomCrudForm from "../customComponents/CustomCrud";
import Alert from "../customComponents/Alert";
import SearchByDateModal from "../customComponents/SearchByDateModal";
import CustomInput from "../customComponents/CustomInput";
import { debounce } from "@/lib/utils";
import MultiSelectDropdown from "../customComponents/FiltersMultiSelect";
import DynamicBranding from "../customComponents/DynamicLabelAndLogo";
import { fetchUserCompanySlug } from "@/lib/services/companySlugServices";
import { ShowCustomToast } from "../customComponents/CustomToastify";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 20;
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateSearchApplied, setDateSearchApplied] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showEditDashboardModal, setShowEditDashboardModal] = useState(false);
  const [currentEditingDashboard, setCurrentEditingDashboard] = useState(null);
  const [showCreateDashboardModal, setShowCreateDashboardModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [themesRank, setThemesRank] = useState([]);

  const [showCreateFromRowModal, setShowCreateFromRowModal] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);

  const [isEndUser, setIsEndUser] = useState(false);

  const handleAddFromRow = (rowData) => {
    setPrefilledData({
      "Video_ID": rowData["Video_ID"] || "",
      "Guest": rowData["Guest"] || "",
      "Avatar": rowData["Avatar"] || "",
      "Guest Title": rowData["Guest Title"] || "",
      "Guest Company": rowData["Guest Company"] || "",
      "Guest Industry": rowData["Guest Industry"] || "",
      "Date Recorded": rowData["Date Recorded"] || "",
      "Episode_Number": rowData["Episode_Number"] || "",
      "Episode Title": rowData["Episode Title"] || ""
    });
    setShowCreateFromRowModal(true);
  };

  const parseEpisodeDetails = (row) => {
    try {
      return Array.isArray(row.DETAILS_FULL_EPISODES)
        ? row.DETAILS_FULL_EPISODES
        : JSON.parse(row.DETAILS_FULL_EPISODES || '[]');
    } catch (e) {
      return [];
    }
  };


  const columns = [
    { label: "Avatar", id: "Avatar" },
    {label: "Guest Name",id: "Guest"},
     {
      label: "Format",
      id: "Formate",
      render: (row) => {
        const detailsData = parseEpisodeDetails(row);
        return detailsData.length > 0 ? detailsData[0]["Formate"] || "-" : "-";
      }
    },
  
    // { label: "Category", id: "category" },
    //     { label: "Description", id: "description" },

    {
      label: "Category",
      id: "Category",
      render: (row) => {
        const detailsData = parseEpisodeDetails(row);
        return detailsData.length > 0 ? detailsData[0]["Category"] || "-" : "-";
      }
    },
   
    {
      label: "Description",
      id: "Description",
      render: (row) => {
        const detailsData = parseEpisodeDetails(row);
        return detailsData.length > 0 ? detailsData[0]["Description"] || "-" : "-";
      }
    },
    { label: "Likes", id: "Likes" },
    { label: "Comments", id: "Comments" },
    // {
    //   label: "Episode Title",
    //   id: "episode_title",
    //   render: (row) => {
    //     const detailsData = parseEpisodeDetails(row);
    //     return detailsData.length > 0 ? detailsData[0]["Episode Title"] || "-" : "-";
    //   }
    // },
    // {
    //   label: "Date Recorded",
    //   id: "date_recorded",
    //   render: (row) => {
    //     const detailsData = parseEpisodeDetails(row);
    //     const dateRecorded = detailsData.length > 0
    //       ? detailsData[0]["Date Recorded"]
    //       : null;
    //     return dateRecorded
    //       ? new Date(dateRecorded).toLocaleDateString()
    //       : "-";
    //   }
    // },
    // { label: "Guest", id: "Guest" },
    // { label: "Content Type", id: "Video Type" },
    // { label: "Date Recorded", id: "Date_Recorded" },
    // { label: "Prep Call", id: "Prep_Call" },
    // { label: "Additional Guest Projects", id: "Additional_Guest_Projects" },
    // { label: "Emails", id: "Emails" },

    // { label: "Episode Title", id: "FULL_EPISODE_VIDEO", render: (row) => {
    //   // These fields exist in the row directly
    //   const episodeTitle = row["Episode Title"];


    //   return (
    //     <div>
    //       <div> {episodeTitle || "-"}</div>

    //     </div>
    //   );
    // } },
    // { label: "Full Episodes Extented Videos", id: "FULL_EPISODE_EXTENDED_CONTENT" },
    // { label: "Full Episodes Highlight Videos", id: "FULL_EPISODE_HIGHLIGHT_VIDEO" },
    // { label: "Full Episodes Introduction Videos", id: "FULL_EPISODE_INTRODUCTION_VIDEO" },
    // { label: "Full Episodes Q/A Videos", id: "FULL_EPISODE_QA_VIDEOS" },
    // { label: "Full Episodes Podbook", id: "FULL_EPISODE_PODBOOK" },
    // { label: "Full Episodes Full Case Study", id: "FULL_EPISODE_FULL_CASE_STUDY" },
    // { label: "Full Episodes One Case Study", id: "FULL_EPISODE_ONE_PAGE_CASE_STUDY" },
    // { label: "Full Episodes Other Case Study", id: "FULL_EPISODE_OTHER_CASE_STUDY" },
    // { label: "Full Episodes ICP Advice", id: "FULL_EPISODE_ICP_ADVICE" },
    // { label: "Full Episodes Challenge Questions", id: "FULL_EPISODE_CHALLENGE_QUESTIONS" },

    // { label: "Guest Title", id: "Guest Title" },
    // { label: "Guest Company", id: "Guest Company" },
    // { label: "Guest Industry", id: "Guest Industry" },
    // { label: "Guest Role", id: "Guest Role" },
    // { label: "Date Recorded", id: "Date Recorded" },
    // { label: "Episode #", id: "Episode_Number" },
    // { label: "Full Episode Title", id: "Episode Title" },

    // { label: "Video Title", id: "Video Title" },
    // { label: "Video Length", id: "Video Length" },
    // { label: "Videos", id: "Videos" },
    // { label: "Video Link", id: "Videos Link", type: 'url' },
    // { label: "Video Description", id: "Video Description" },
    // { label: "Top Three Takeaways", id: "Text comments for the rating (OPTIONAL input from the user)" },
    // { label: "Key Quote", id: "Quote" },
    // { label: "Mentions", id: "Mentions" },
    // { label: "Mentioned Quotes", id: "Mentioned_Quotes" },
    // { label: "Case Study", id: "Case_Study", type: 'url' },
    // { label: "Case Study Transcript", id: "Case_Study_Transcript" },
    // { label: "Public vs. Private", id: "Public_vs_Private" },
    // { label: "Discussion Guide", id: "Discussion Guide", type: 'url' },
    // { label: "Report Link", id: "report_link", type: 'url' },
    // { label: "Transcript", id: "Transcript", type: "url" },
    // { label: "Client", id: "Client" },
    // { label: "Employee", id: "Employee" },
    // { label: "Tags", id: "Tags" },
    // { label: "Themes", id: "Themes" },
    // { label: "Validations", id: "Validations" },
    // { label: "Objections", id: "Objections" },
    // { label: "Challenges", id: "Challenges" },
    // { label: "Sales Insights", id: "Sales Insights" },
    // { label: "Case Study Other Video", id: "Case_Study_Other_Video" },
    // { label: "Challenge Video", id: "Challenge Report_Unedited Video Link", type: 'url' },
    // { label: "Challenge Transcript", id: "Challenge Report_Unedited Transcript Link", type: "url" },
    // { label: "Challenge Report", id: "Challenge Report_Summary", type: "url" },
    // { label: "Podcast Video (Unedited)", id: "Podcast Report_Unedited Video Link", type: 'url' },
    // { label: "Podcast Transcript", id: "Podcast Report_Unedited Transcript Link" },
    // { label: "Podcast Summary", id: "Podcast Report_Summary" },
    // { label: "Post-Podcast Video", id: "Post-Podcast Report_Unedited Video Link", type: 'url' },
    // { label: "Post-Podcast Transcript", id: "Post-Podcast Report_Unedited Transcript Link" },
    // { label: "Post-Podcast Report", id: "Post-Podcast Report_Summary" },

    //................................

    // { label: "Full Case Study_Interactive Link", id: "Full Case Study_Interactive Link", type: 'url' },
    // { label: "Full Case Study_Copy and Paste Text", id: "Full Case Study_Copy and Paste Text" },
    // { label: "Full Case Study_Link To Document", id: "Full Case Study_Link To Document" },

    // { label: "Problem Section_Video Link", id: "Problem Section_Video Link", type: 'url' },
    // { label: "Problem Section_Copy and Paste Text", id: "Problem Section_Copy and Paste Text" },
    // { label: "Problem Section_Link To Document", id: "Problem Section_Link To Document" },

    // { label: "Solution Section_Video Link", id: "Solution Section_Video Link", type: 'url' },
    // { label: "Solution Section_Copy and Paste Text", id: "Solution Section_Copy and Paste Text" },
    // { label: "Solution Section_Link To Document", id: "Solution Section_Link To Document" },

    // { label: "Results Section_Video Link", id: "Results Section_Video Link", type: 'url' },
    // { label: "Results Section_Copy and Paste Text", id: "Results Section_Copy and Paste Text" },
    // { label: "Results Section_Link To Document", id: "Results Section_Link To Document" },

    // { label: "Case Study Video Short_Video Link", id: "Case Study Video Short_Video Link", type: 'url' },
    // { label: "Case Study Video Short_Copy and Paste Text", id: "Case Study Video Short_Copy and Paste Text" },
    // { label: "Case Study Video Short_Link To Document", id: "Case Study Video Short_Link To Document" },

    //.........................
    // { label: "Podbook Link", id: "Podbook Link", type: 'url' },
    // { label: "Article", id: "Article - Extended Media" },
    // { label: "Article Text", id: "Article_Transcript" },
    // { label: "Quote Card", id: "Quote Card - Extended Media", type: 'url' },
    // { label: "YouTube Short", id: "YouTube Short - Extended Media", type: 'url' },
    // { label: "YouTube Short Transcript", id: "YouTube_Short_Transcript" },
    // { label: "LinkedIn Video", id: "LinkedIn Video - Extended Media", type: 'url' },
    // { label: "LinkedIn Video Transcript", id: "LinkedIn_Video_Transcript" },
    // { label: "Post-Podcast Insights", id: "Post_Podcast_Insights" },
    // { label: "Actions", id: "action" },
  ];

  const arrayFields = [
    // "Guest Industry",
    "Objections",
    // "Tags",
    "Themes",
    "Validations",
    "Challenges",
    "Sales Insights",
    "Case_Study_Other_Video",
    "Video Type",
  ];

  const dashboardCrudDetails = [
    { label: "Video ID", key: "Video_ID", placeholder: "Enter Video ID" },
    { label: "Avatar", key: "Avatar", placeholder: "Upload Avatar", type: "image" },
    { label: "Guest", key: "Guest", placeholder: "Enter Guest Name" },
    { label: "Prep Call", key: "Prep_Call", placeholder: "Enter Prep Call" },
    { label: "Additional Guest Projects", key: "Additional_Guest_Projects", placeholder: "Enter Additional Guest Projects" },
    { label: "Emails", key: "Emails", placeholder: "Enter Emails" },
    { label: "Full Episodes Details", key: "DETAILS_FULL_EPISODES", placeholder: "Enter Full Episodes Details" },
    { label: "Full Episodes Videos", key: "FULL_EPISODE_VIDEO", placeholder: "Enter Full Episodes Videos" },
    { label: "Full Episodes Extented Videos", key: "FULL_EPISODE_EXTENDED_CONTENT", placeholder: "Enter Full Episodes Extended Videos" },
    { label: "Full Episodes Highlight Videos", key: "FULL_EPISODE_HIGHLIGHT_VIDEO", placeholder: "Enter Full Episodes Highlight Videos" },
    { label: "Full Episodes Introduction Videos", key: "FULL_EPISODE_INTRODUCTION_VIDEO", placeholder: "Enter Full Episodes Introduction Videos" },
    { label: "Full Episodes Q/A Videos", key: "FULL_EPISODE_QA_VIDEOS", placeholder: "Enter Full Episodes Q/A Videos" },
    { label: "Full Episodes Podbook", key: "FULL_EPISODE_PODBOOK", placeholder: "Enter Full Episodes Podbook" },
    { label: "Full Episodes Full Case Study", key: "FULL_EPISODE_FULL_CASE_STUDY", placeholder: "Enter Full Episodes Full Case Study" },
    { label: "Full Episodes One Case Study", key: "FULL_EPISODE_ONE_PAGE_CASE_STUDY", placeholder: "Enter Full Episodes One Case Study" },
    { label: "Full Episodes Other Case Study", key: "FULL_EPISODE_OTHER_CASE_STUDY", placeholder: "Enter Full Episodes Other Case Study" },
    { label: "Full Episodes ICP Advice", key: "FULL_EPISODE_ICP_ADVICE", placeholder: "Enter Full Episodes ICP Advice" },
    { label: "Full Episodes Challenge Questions", key: "FULL_EPISODE_CHALLENGE_QUESTIONS", placeholder: "Enter Full Episodes Challenge Questions" },
    { label: "ICP Advice Report", key: "ICP_Advice_Report", placeholder: "Enter ICP Advice Report" },
    { label: "SQL Analysis Report", key: "SQL_Analysis_Report", placeholder: "Enter SQL Analysis Report" },
    { label: "Challenge Questions", key: "Challenge_Questions", placeholder: "Enter Challenge Questions" },
    { label: "eBook", key: "eBook", placeholder: "Enter eBook" },
    { label: "Multi-Guest Challenge Report Text", key: "Multi-Guest_Challenge_Report_Text", placeholder: "Enter Multi-Guest Challenge Report Text" },

    // { label: "Guest Title", key: "Guest Title", placeholder: "Enter Guest Title" },
    // { label: "Guest Company", key: "Guest Company", placeholder: "Enter Guest Company" },
    // { label: "Guest Industry", key: "Guest Industry", placeholder: "Enter Guest Industry" },
    // { label: "Guest Role", key: "Guest Role", placeholder: "Enter Guest Role" },
    // { label: "Date Recorded", key: "Date Recorded", placeholder: "Select Date", type: "date" },
    // { label: "Episode #", key: "Episode_Number", placeholder: "Enter Episode Number", type: "number" },
    // { label: "Full Episode Title", key: "Episode Title", placeholder: "Enter Episode Title" },
    // { label: "Video Type", key: "Video Type", placeholder: "Select Content Type", type: "multiselect" },
    // { label: "Report Link", key: "report_link", placeholder: "Enter Report Link", type: "url" },
    // { label: "Video Title", key: "Video Title", placeholder: "Enter Video Title" },
    // { label: "Video Length", key: "Video Length", placeholder: "Enter Video Length" },
    // { label: "Videos", key: "Videos", placeholder: "Select Videos" },
    // { label: "Video Link", key: "Videos Link", placeholder: "Enter Video Link", type: 'url' },
    // { label: "Video Description", key: "Video Description", placeholder: "Enter Video Description" },
    // { label: "Top Three Takeaways", key: "Text comments for the rating (OPTIONAL input from the user)", placeholder: "Enter Comments", type: "textarea" },
    // { label: "Key Quote", key: "Quote", placeholder: "Enter Quote" },
    // { label: "Mentions", key: "Mentions", placeholder: "Select Mention", type: "select" },
    // { label: "Mentioned Quotes", key: "Mentioned_Quotes", placeholder: "Enter Mentioned Quotes", type: "mentioned_quotes_filed" },
    // { label: "Public vs. Private", key: "Public_vs_Private", placeholder: "Select Visibility", type: "select" },
    // { label: "Discussion Guide", key: "Discussion Guide", placeholder: "Enter Discussion Guide Link", type: "url" },
    // { label: "Transcript", key: "Transcript", placeholder: "Enter Transcript", type: "url" },
    // { label: "Client", key: "Client", placeholder: "Select Client", type: "select" },
    // { label: "Employee", key: "Employee", placeholder: "Enter Employee" },
    // { label: "Tags", key: "Tags", placeholder: "Select Tags", type: "multiselect" },
    // { label: "Themes", key: "Themes", placeholder: "Select Themes", type: "multiselect" },
    // { label: "Validations", key: "Validations", placeholder: "Select Validations", type: "multiselect" },
    // { label: "Objections", key: "Objections", placeholder: "Select Objections", type: "multiselect" },
    // { label: "Challenges", key: "Challenges", placeholder: "Select an ICP Challenge", type: "multiselect" },
    // { label: "Sales Insights", key: "Sales Insights", placeholder: "Select Sales Insights", type: "multiselect" },
    // { label: "Challenge Video", key: "Challenge Report_Unedited Video Link", type: "url" },
    // { label: "Challenge Transcript", key: "Challenge Report_Unedited Transcript Link", type: "url" },
    // { label: "Challenge Report", key: "Challenge Report_Summary", type: "url" },
    // { label: "Podcast Video (Unedited)", key: "Podcast Report_Unedited Video Link", type: "url" },
    // { label: "Podcast Transcript", key: "Podcast Report_Unedited Transcript Link" },
    // { label: "Podcast Summary", key: "Podcast Report_Summary" },
    // { label: "Post-Podcast Video", key: "Post-Podcast Report_Unedited Video Link", type: "url" },
    // { label: "Post-Podcast Transcript", key: "Post-Podcast Report_Unedited Transcript Link" },
    // { label: "Post-Podcast Report", key: "Post-Podcast Report_Summary" },

    //................................

    // { label: "Full Case Study_Interactive Link", key: "Full Case Study_Interactive Link", type: 'url' },
    // { label: "Full Case Study_Copy and Paste Text", key: "Full Case Study_Copy and Paste Text" },
    // { label: "Full Case Study_Link To Document", key: "Full Case Study_Link To Document" },

    // { label: "Problem Section_Video Link", key: "Problem Section_Video Link", type: 'url' },
    // { label: "Problem Section_Copy and Paste Text", key: "Problem Section_Copy and Paste Text" },
    // { label: "Problem Section_Link To Document", key: "Problem Section_Link To Document" },

    // { label: "Solution Section_Video Link", key: "Solution Section_Video Link", type: 'url' },
    // { label: "Solution Section_Copy and Paste Text", key: "Solution Section_Copy and Paste Text" },
    // { label: "Solution Section_Link To Document", key: "Solution Section_Link To Document" },

    // { label: "Results Section_Video Link", key: "Results Section_Video Link", type: 'url' },
    // { label: "Results Section_Copy and Paste Text", key: "Results Section_Copy and Paste Text" },
    // { label: "Results Section_Link To Document", key: "Results Section_Link To Document" },

    // { label: "Case Study Video Short_Video Link", key: "Case Study Video Short_Video Link", type: 'url' },
    // { label: "Case Study Video Short_Copy and Paste Text", key: "Case Study Video Short_Copy and Paste Text" },
    // { label: "Case Study Video Short_Link To Document", key: "Case Study Video Short_Link To Document" },

    // { label: "Case Study Other Video", key: "Case_Study_Other_Video", placeholder: "Select Case Study Other Video" },

    //.........................
    // { label: "Podbook Link", key: "Podbook Link", placeholder: "Enter Podbook Link", type: "url" },
    // { label: "Article", key: "Article - Extended Media", placeholder: "Enter Article Link", type: "url" },
    // { label: "Article Text", key: "Article_Transcript", placeholder: "Enter Article Transcript" },
    // { label: "Quote Card", key: "Quote Card - Extended Media", placeholder: "Enter Quote Card" },
    // { label: "YouTube Short", key: "YouTube Short - Extended Media", placeholder: "Enter YouTube Short Link ", type: "url" },
    // { label: "YouTube Short Transcript", key: "YouTube_Short_Transcript", placeholder: "Enter YouTube Short Transcript " },
    // { label: "LinkedIn Video", key: "LinkedIn Video - Extended Media", placeholder: "Enter LinkedIn Video Link ", type: "url" },
    // { label: "LinkedIn Video Transcript", key: "LinkedIn_Video_Transcript", placeholder: "Enter LinkedIn Video Transcript" },
    // { label: "Post Podcast Insights", key: "Post_Podcast_Insights", placeholder: "Select Post Podcast Insights" },
    // { label: "Case Study", key: "Case_Study", placeholder: "Enter Case Study Link", type: 'url' },
    // { label: "Case Study Transcript", key: "Case_Study_Transcript", placeholder: "Enter Case Study Transcript" },
  ];

  const [selectedFilters, setSelectedFilters] = useState({
    "Video Type": [],
    "Classifications": [],
    "Themes": [],
    "Objections": [],
    "Validations": [],
    "Challenges": [],
    "Sales Insights": []
  });

  const filterOptions = {

    "Video Type": [
      // Boolean filters (these will show the specific columns data when selected)
      // Use original column names instead of filter parameter names
      { value: "DETAILS_FULL_EPISODES", label: "Details Full Episodes", count: 0 },
      { value: "FULL_EPISODE_EXTENDED_CONTENT", label: "Full Episode Extended Content", count: 0 },
      { value: "FULL_EPISODE_HIGHLIGHT_VIDEO", label: "Full Episode Highlight Video", count: 0 },
      { value: "FULL_EPISODE_INTRODUCTION_VIDEO", label: "Full Episode Introduction Video", count: 0 },
      { value: "FULL_EPISODE_QA_VIDEOS", label: "Full Episode QA Videos", count: 0 },
      { value: "FULL_EPISODE_PODBOOK", label: "Full Episode Podbook", count: 0 },
      { value: "FULL_EPISODE_FULL_CASE_STUDY", label: "Full Episode Full Case Study", count: 0 },
      { value: "FULL_EPISODE_ONE_PAGE_CASE_STUDY", label: "Full Episode One Page Case Study", count: 0 },
      { value: "FULL_EPISODE_OTHER_CASE_STUDY", label: "Full Episode Other Case Study", count: 0 },
      { value: "FULL_EPISODE_ICP_ADVICE", label: "Full Episode ICP Advice", count: 0 },
      { value: "FULL_EPISODE_CHALLENGE_QUESTIONS", label: "Full Episode Challenge Questions", count: 0 },
      { value: "FULL_EPISODE_VIDEO", label: "Full Episode Video", count: 0 },

      // Regular video types
      { value: "My Liked", label: "My Liked", count: 0 },
      { value: "All Liked", label: "All Liked", count: 0 },
      // Add other actual video types here if you have them
    ],
    // ... other filter categories

    "Classifications": [
      // { value: "Mentioned", label: "Mentioned", count: 0 },
      { value: "Client", label: "Client", count: 0 },
      { value: "Employee", label: "Employee", count: 0 },
      // { value: "Public", label: "Public", count: 0 },
      // { value: "Private", label: "Private", count: 0 },
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
      { value: "Ability to Integrate into the Company’s Brand and Culture", label: "Ability to Integrate into the Company’s Brand and Culture" },
      { value: "Cost Sensitivity in Contract Negotiations", label: "Cost Sensitivity in Contract Negotiations" },
      { value: "Resistance to Outsourcing Critical Customer Functions", label: "Resistance to Outsourcing Critical Customer Functions" },
    ],
  };

  const [filterOptionsWithCounts, setFilterOptionsWithCounts] = useState(filterOptions);
  const [filterCounts, setFilterCounts] = useState({});

  const totalPages = useMemo(() => Math.ceil(totalRecords / ITEMS_PER_PAGE), [totalRecords]);

  useEffect(() => {
    const storedRole = localStorage.getItem("system_roles");
    setIsEndUser(storedRole === "end-user");
  }, []);


  const fetchUsers = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const fromDateISO = fromDate ? new Date(fromDate).toISOString() : null;
      const toDateISO = toDate ? new Date(toDate).toISOString() : null;

      const videoTypes = selectedFilters["Video Type"] || [];

      // Separate boolean filters from regular video types
      const booleanFilterMap = {
        "DETAILS_FULL_EPISODES": "details_full_episodes_filter",
        "FULL_EPISODE_VIDEO": "full_episode_video_filter",
        "FULL_EPISODE_EXTENDED_CONTENT": "full_episode_extended_content_filter",
        "FULL_EPISODE_HIGHLIGHT_VIDEO": "full_episode_highlight_video_filter",
        "FULL_EPISODE_INTRODUCTION_VIDEO": "full_episode_introduction_video_filter",
        "FULL_EPISODE_QA_VIDEOS": "full_episode_qa_videos_filter",
        "FULL_EPISODE_PODBOOK": "full_episode_podbook_filter",
        "FULL_EPISODE_FULL_CASE_STUDY": "full_episode_full_case_study_filter",
        "FULL_EPISODE_ONE_PAGE_CASE_STUDY": "full_episode_one_page_case_study_filter",
        "FULL_EPISODE_OTHER_CASE_STUDY": "full_episode_other_case_study_filter",
        "FULL_EPISODE_ICP_ADVICE": "full_episode_icp_advice_filter",
        "FULL_EPISODE_CHALLENGE_QUESTIONS": "full_episode_challenge_questions_filter"
      };


      const booleanFilters = {};
      Object.keys(booleanFilterMap).forEach(key => {
        booleanFilters[booleanFilterMap[key]] = videoTypes.includes(key);
      });

      // Get regular video types (excluding boolean filters)
      const regularVideoTypes = videoTypes.filter(type =>
        !Object.keys(booleanFilterMap).includes(type)
      );

      const { data, error } = await supabase.rpc('combined_search_duplicate', {
        search_term: searchText.trim() || null,
        video_types_json: regularVideoTypes.length ? regularVideoTypes : null,
        themes_json: selectedFilters["Themes"]?.length ? selectedFilters["Themes"] : null,
        objections_json: selectedFilters["Objections"]?.length ? selectedFilters["Objections"] : null,
        validations_json: selectedFilters["Validations"]?.length ? selectedFilters["Validations"] : null,
        classifications_json: selectedFilters["Classifications"]?.length ? selectedFilters["Classifications"] : null,
        challenges_json: selectedFilters["Challenges"]?.length ? selectedFilters["Challenges"] : null,
        sales_insights_json: selectedFilters["Sales Insights"]?.length ? selectedFilters["Sales Insights"] : null,
        from_date: fromDateISO ? fromDateISO : null,
        to_date: toDateISO ? toDateISO : null,
        current_user_id: localStorage.getItem('current_user_id'),
        current_company_id: localStorage.getItem('company_id'),
        page_num: page,
        page_size: ITEMS_PER_PAGE,
        // Boolean filters
        details_full_episodes_filter: booleanFilters.details_full_episodes_filter || null,
        full_episode_extended_content_filter: booleanFilters.full_episode_extended_content_filter || null,
        full_episode_highlight_video_filter: booleanFilters.full_episode_highlight_video_filter || null,
        full_episode_introduction_video_filter: booleanFilters.full_episode_introduction_video_filter || null,
        full_episode_qa_videos_filter: booleanFilters.full_episode_qa_videos_filter || null,
        full_episode_podbook_filter: booleanFilters.full_episode_podbook_filter || null,
        full_episode_full_case_study_filter: booleanFilters.full_episode_full_case_study_filter || null,
        full_episode_one_page_case_study_filter: booleanFilters.full_episode_one_page_case_study_filter || null,
        full_episode_other_case_study_filter: booleanFilters.full_episode_other_case_study_filter || null,
        full_episode_icp_advice_filter: booleanFilters.full_episode_icp_advice_filter || null,
        full_episode_challenge_questions_filter: booleanFilters.full_episode_challenge_questions_filter || null,
        full_episode_video_filter: booleanFilters.full_episode_video_filter || null
      });

      if (error) throw error;
      console.log("datattatbEFORE", data);
      // Ensure data is properly formatted before setting state
      const formattedData = data.map(item => {
        // Convert any object fields to strings if needed
        const formattedItem = { ...item };
        // Helper function to format array data consistently
        const formatArrayField = (fieldValue) => {
          if (!fieldValue) return '';

          try {
            // Parse if it's JSON string
            const items = typeof fieldValue === 'string'
              ? JSON.parse(fieldValue)
              : fieldValue;

            // Convert to display format
            if (Array.isArray(items)) {
              return items.map(item => {
                // If it's an object, extract just the name property
                if (item && typeof item === 'object') {
                  return item.challenge || item.challenges || item.Challenges || item.validation || item.objection || item.theme || item.insight || '';
                }
                // Otherwise use as-is (string)
                return item;
              }).filter(Boolean).join(', ');
            }
            return '';
          } catch (e) {
            console.log('Error formatting field:', e);
            return ''; // Fallback
          }
        };

        // Apply formatting to all three fields
        if (formattedItem.Themes) {
          formattedItem.Themes = formatArrayField(formattedItem.Themes);
        }

        if (formattedItem.Validations) {
          formattedItem.Validations = formatArrayField(formattedItem.Validations);
        }

        if (formattedItem.Objections) {
          formattedItem.Objections = formatArrayField(formattedItem.Objections);
        }
        if (formattedItem.Challenges) {
          formattedItem.Challenges = formatArrayField(formattedItem.Challenges);
        }
        if (formattedItem["Sales Insights"]) {
          formattedItem["Sales Insights"] = formatArrayField(formattedItem["Sales Insights"]);
        }
        if (formattedItem["Video Type"]) {
          formattedItem["Video Type"] = formatArrayField(formattedItem["Video Type"]);
        }

        // Handle other array fields
        arrayFields.forEach(field => {
          if (
            field !== 'Themes' &&
            field !== 'Objections' &&
            field !== 'Validations' &&
            field !== 'Challenges' &&
            field !== 'Sales Insights' &&
            field !== 'Case_Study_Other_Video' &&
            field !== 'Video Type' &&
            formattedItem[field]
          ) {
            if (typeof formattedItem[field] === 'string') {
              formattedItem[field] = formattedItem[field]
                .split(',')
                .map(v => v.trim())
                .filter(v => v && v.toLowerCase() !== 'nan' && v !== '[]');
            }
          }
        });



        return formattedItem;
      });

      console.log("formattedData", formattedData);
      console.log("datattataFTT", data);
      setThemesRank(data);
      if (isLoadMore) {
        setUsers(prev => [...prev, ...formattedData]);
        setFilteredUsers(prev => [...prev, ...formattedData]);
      } else {
        setUsers(formattedData || []);
        setFilteredUsers(formattedData || []);
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
    // Reset to first page when search/filter changes
    setCurrentPage(1);
    fetchUsers(1, false);
  }, [selectedFilters, searchText, fromDate, toDate]);

  const loadMoreData = async () => {
    if (!loadingMore && users.length < totalRecords) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setLoadingMore(true);

      try {
        const fromDateISO = fromDate ? new Date(fromDate).toISOString() : null;
        const toDateISO = toDate ? new Date(toDate).toISOString() : null;
        // Extract boolean filters from Video Type selection (same logic as above)
        const videoTypes = selectedFilters["Video Type"] || [];
        const booleanFilters = {};

        const booleanFilterMap = {
          "DETAILS_FULL_EPISODES": "details_full_episodes_filter",
          "FULL_EPISODE_VIDEO": "full_episode_video_filter",
          "FULL_EPISODE_EXTENDED_CONTENT": "full_episode_extended_content_filter",
          "FULL_EPISODE_HIGHLIGHT_VIDEO": "full_episode_highlight_video_filter",
          "FULL_EPISODE_INTRODUCTION_VIDEO": "full_episode_introduction_video_filter",
          "FULL_EPISODE_QA_VIDEOS": "full_episode_qa_videos_filter",
          "FULL_EPISODE_PODBOOK": "full_episode_podbook_filter",
          "FULL_EPISODE_FULL_CASE_STUDY": "full_episode_full_case_study_filter",
          "FULL_EPISODE_ONE_PAGE_CASE_STUDY": "full_episode_one_page_case_study_filter",
          "FULL_EPISODE_OTHER_CASE_STUDY": "full_episode_other_case_study_filter",
          "FULL_EPISODE_ICP_ADVICE": "full_episode_icp_advice_filter",
          "FULL_EPISODE_CHALLENGE_QUESTIONS": "full_episode_challenge_questions_filter"
        };


        Object.keys(booleanFilterMap).forEach(key => {
          booleanFilters[booleanFilterMap[key]] = videoTypes.includes(key);
        });

        const regularVideoTypes = videoTypes.filter(type =>
          !Object.keys(booleanFilterMap).includes(type)
        );
        const { data, error } = await supabase.rpc('combined_search_duplicate', {
          search_term: searchText.trim() || null,
          video_types_json: selectedFilters["Video Type"]?.length ? selectedFilters["Video Type"] : null,
          themes_json: selectedFilters["Themes"]?.length ? selectedFilters["Themes"] : null,
          objections_json: selectedFilters["Objections"]?.length ? selectedFilters["Objections"] : null,
          validations_json: selectedFilters["Validations"]?.length ? selectedFilters["Validations"] : null,
          classifications_json: selectedFilters["Classifications"]?.length ? selectedFilters["Classifications"] : null,
          challenges_json: selectedFilters["Challenges"]?.length ? selectedFilters["Challenges"] : null,
          sales_insights_json: selectedFilters["Sales Insights"]?.length ? selectedFilters["Sales Insights"] : null,
          from_date: fromDateISO ? fromDateISO : null,
          to_date: toDateISO ? toDateISO : null,
          current_user_id: localStorage.getItem('current_user_id'),
          current_company_id: localStorage.getItem('company_id'),
          page_num: nextPage,
          page_size: ITEMS_PER_PAGE,
          // Add the boolean filters
          details_full_episodes_filter: booleanFilters.details_full_episodes_filter || null,
          full_episode_extended_content_filter: booleanFilters.full_episode_extended_content_filter || null,
          full_episode_highlight_video_filter: booleanFilters.full_episode_highlight_video_filter || null,
          full_episode_introduction_video_filter: booleanFilters.full_episode_introduction_video_filter || null,
          full_episode_qa_videos_filter: booleanFilters.full_episode_qa_videos_filter || null,
          full_episode_podbook_filter: booleanFilters.full_episode_podbook_filter || null,
          full_episode_full_case_study_filter: booleanFilters.full_episode_full_case_study_filter || null,
          full_episode_one_page_case_study_filter: booleanFilters.full_episode_one_page_case_study_filter || null,
          full_episode_other_case_study_filter: booleanFilters.full_episode_other_case_study_filter || null,
          full_episode_icp_advice_filter: booleanFilters.full_episode_icp_advice_filter || null,
          full_episode_challenge_questions_filter: booleanFilters.full_episode_challenge_questions_filter || null,
          full_episode_video_filter: booleanFilters.full_episode_video_filter || null
        });

        if (error) throw error;

        // Normalize the new data to match existing structure
        // Process new data to ensure proper rendering
        const formattedNewData = data.map(item => {
          const processedItem = { ...item };

          // Handle array fields to ensure they render properly
          arrayFields.forEach(field => {
            if (processedItem[field]) {
              try {
                // Parse if stringified
                const parsed = typeof processedItem[field] === 'string'
                  ? JSON.parse(processedItem[field])
                  : processedItem[field];

                // Convert to array of strings (extract just the names)
                processedItem[field] = Array.isArray(parsed)
                  ? parsed.map(obj => {
                    if (typeof obj === 'object') {
                      return obj.theme || obj.objection || obj.validation || obj.insight || '';
                    }
                    return obj;
                  })
                  : [];
              } catch (e) {
                console.error(`Error processing ${field}:`, e);
                processedItem[field] = [];
              }
            } else {
              processedItem[field] = [];
            }
          });

          return processedItem;
        });

        // Merge with existing data
        setUsers(prev => [...prev, ...formattedNewData]);
        setFilteredUsers(prev => [...prev, ...formattedNewData]);
        setThemesRank(prev => [...prev, ...data]); // Keep raw data for themesRank

      } catch (err) {
        console.error("Error loading more data:", err);
      } finally {
        setLoadingMore(false);
      }
    }
  };
  const fetchAllFilterCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_filter_counts_duplicate', {
        current_user_id: localStorage.getItem('current_user_id'),
        input_company_id: localStorage.getItem('company_id'),
      });

      if (error) {
        console.log("Error fetching filter counts:", error);
        return;
      }

      // Initialize counts object
      const counts = {
        "Video Type": {},
        "Classifications": {},
        "Themes": {},
        "Objections": {},
        "Validations": {},
        "Challenges": {},
        "Sales Insights": {}
      };

      // Process the counts data
      data.forEach(({ category, value, count, avg_ranking }) => {
        if (counts[category]) {
          counts[category][value] = {
            count,
            avg_ranking: ['Themes', 'Objections', 'Validations', 'Challenges', 'Sales Insights'].includes(category) ? avg_ranking : null
          };
        }
      });

      setFilterCounts(counts);

      // Update the filter options with counts
      const updatedOptions = { ...filterOptions };
      for (const filterType in updatedOptions) {
        updatedOptions[filterType] = updatedOptions[filterType].map(option => {
          const countData = counts[filterType]?.[option.value] || { count: 0 };

          // For Video Type, only show counts for "My Liked" and "All Liked"
          // For other options, set count to null so it won't display
          let displayCount = countData.count;
          if (filterType === "Video Type" && !["My Liked", "All Liked"].includes(option.value)) {
            displayCount = null; // This will prevent the count from being displayed
          }

          return {
            ...option,
            count: displayCount,
            avg_ranking: ['Themes', 'Objections', 'Validations', 'Challenges', 'Sales Insights'].includes(filterType) ? countData.avg_ranking : null
          };
        });
      }

      setFilterOptionsWithCounts(updatedOptions);
    } catch (err) {
      console.log("Error calculating filter counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllFilterCounts();
  }, [fetchAllFilterCounts, users]);

  const handleFilterSelect = (filterType, values) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
    setIsSearchActive(true);
    setCurrentPage(1);
  };

  const handleCreateDashboardSubmit = () => {
    setShowCreateDashboardModal(false);
  };

  const handleEditDashboardSubmit = () => {
    setShowEditDashboardModal(false);
  };

  const handleEditClick = (fund) => {
    setCurrentEditingDashboard(fund);
    setShowEditDashboardModal(true);
  };

  const handleDeleteClick = async (Id) => {
    Alert.show('Delete Confirmation', 'Are you sure you want to delete this record?', [
      {
        text: 'Yes',
        primary: true,
        onPress: async () => {
          try {
            const response = await supabase
              .from("voice_of_customer")
              .delete()
              .eq("id", Id);

            if (response.error) {
              throw new Error(response.error.message);
            }
            const { count, error: countError } = await supabase
              .from("voice_of_customer")
              .select("*", { count: "exact", head: true });

            if (countError) throw countError;
            setTotalRecords(count || 0);

            if ((currentPage - 1) * ITEMS_PER_PAGE >= count) {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
            }

            const { data, error } = await supabase
              .from("voice_of_customer")
              .select("*")
              .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
              .order('id_order', { ascending: false });

            if (error) {
              throw error;
            }

            setUsers(data);

            Alert.show('Success', 'Record deleted successfully.', [
              {
                text: 'OK',
                primary: true,
                onPress: () => {
                  console.log('Record deleted and user clicked OK.');
                },
              },
            ]);
            fetchUsers();
          } catch (err) {
            Alert.show('Error', `Failed to delete the record: ${err.message}`);
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
    fetchUsers();
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
      "Video Type": [],
      "Classifications": [],
      "Themes": [],
      "Objections": [],
      "Validations": [],
      "Challenges": [],
      "Sales Insights": []
    });
    setFromDate("");
    setToDate("");
    setDateSearchApplied(false);
    setCurrentPage(1);
    setOpenDropdown(false);
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
            {/* <h1 className="text-2xl font-bold mt-4 mb-2">The Contact Center Perspectives Podcast</h1> */}
            <DynamicBranding showLogo={false} showTitle={true} />
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
                    placeholder="Search episodes keywords..."
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
                {["Search By Date", "Share Signup Url", "Add Record"].map((text, i) => {
                  const getIcon = (label) => {
                    switch (label) {
                      case "Search By Date": return <FaClock className="w-4 h-4" />;
                      case "Share Signup Url": return <FaLink className="w-3 h-3" />;
                      case "Add Record": return <FaPlus className="w-3 h-3" />;
                      default: return null;
                    }
                  };
                  const isAddRecord = text === "Add Record";
                  const isSearchByDate = text === "Search By Date";

                  // Skip rendering the "Add Record" button if user is an end-user
                  if (isAddRecord && isEndUser) {
                    return null;
                  }

                  return (
                    <button
                      key={i}
                      className={`px-4 py-2 text-sm ${isAddRecord ? "bg-[#3a86ff] hover:bg-[#2f6fcb]" :
                        isSearchByDate && dateSearchApplied ? "bg-white/20 hover:bg-white/20" : "bg-white/10 hover:bg-white/20"
                        } transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer`}
                      onClick={() => {
                        if (text === "Add Record") setShowCreateDashboardModal(true);
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
                const displayFilter = filterType === 'Video Type' ? 'Content Type' : filterType;

                return values.length > 0 && (
                  <div key={filterType} className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                    <span className="text-white text-sm whitespace-nowrap capitalize">
                      {displayFilter}: {values.join(", ")}
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
            const displayField = field === 'Video Type' ? 'Content Type' : field;
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

          {/* Logo and Text */}
          <div className="mt-6 flex items-center gap-3 py-4 fixed bottom-0">
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

        </aside>


        <div className="hidden md:block h-auto overflow-y-hidden w-px bg-gray-600 mx-4 ml-6 -mt-6"></div>
        {/* Table */}
        <main className="flex-1 px-6 overflow-x-auto">
          <div className="overflow-x-auto">
            <DraggableTable
              columns={columns}
              data={filteredUsers.length > 0 ? filteredUsers : users}
              arrayFields={arrayFields}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              showActions={true}
              hasMoreRecords={users.length < totalRecords}
              onLoadMore={loadMoreData}
              loadingMore={loadingMore}
              alignRecord={false}
              themesRank={themesRank}
              loadingRecord={true}
              handleAddFromRow={handleAddFromRow}
              appliedFilters={selectedFilters} // Pass the applied filters
              likesTableName={'user_likes'}
              commentsTableName={'record_comments'}
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

      {/* Dashboard Normal Crud Modal */}
      {(showCreateDashboardModal || showEditDashboardModal) && (
        <CustomCrudForm
          isEditMode={showEditDashboardModal}
          entityData={showEditDashboardModal ? currentEditingDashboard : {}}
          onClose={() => {
            setShowCreateDashboardModal(false);
            setShowEditDashboardModal(false);
          }}
          onSubmit={showEditDashboardModal ? handleEditDashboardSubmit : handleCreateDashboardSubmit}
          displayFields={dashboardCrudDetails}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          setUsers={setUsers}
          setTotalRecords={setTotalRecords}
          setCurrentPage={setCurrentPage}
          fetchUsers={fetchUsers}
          themesRank={themesRank}
          tableName="voice_of_customer"
          createRecord="Create Record"
          updateRecord="Edit Record"
          formatedValueDashboard={true}
          formatedValueFiles={false}
          isFilesData={false}
        />
      )}

      {/* Create from row modal */}
      {(showCreateFromRowModal) && (
        <CustomCrudForm
          isEditMode={showEditDashboardModal}
          entityData={showEditDashboardModal ? currentEditingDashboard : {}}
          onClose={() => setShowCreateFromRowModal(false)}
          onSubmit={showEditDashboardModal ? handleEditDashboardSubmit : handleCreateDashboardSubmit}
          displayFields={dashboardCrudDetails}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          setUsers={setUsers}
          setTotalRecords={setTotalRecords}
          setCurrentPage={setCurrentPage}
          fetchUsers={fetchUsers}
          themesRank={themesRank}
          prefilledData={prefilledData}
          isDashboardForm={true}
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

export default Dashboard;
