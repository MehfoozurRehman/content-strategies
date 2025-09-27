import { appColors } from "@/lib/theme";
import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { getRandomColor } from "../constants/constant";
import { CustomSpinner } from "./Spinner";
import { FaCommentDots, FaEye, FaDownload, FaCopy, FaTimes, FaEdit, FaExpandAlt, FaExternalLinkAlt, FaPlus, FaSortDown, FaTrash } from "react-icons/fa";
import Modal from "./DetailModal";
import CommentModal from "./CommentsModal"
import LikeButton from "./LikeUnlikeButton";
import RankingModal from "./CustomRankingModal";
import { formatUrl } from "@/lib/utils";
import FileContentViewer from "./FilePreview";
import GenericModal from "./GenericExpandablModal";
import { Tooltip } from "./CustomTooltip";


const ItemType = "COLUMN";
const GuestDetailsModal = ({ guests, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

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

    const getPersonas = (personaString) => {
        if (!personaString) return [];
        if (typeof personaString !== 'string') {
            if (typeof personaString.toString === 'function') {
                personaString = personaString.toString();
            } else {
                return [];
            }
        }

        const personaTypes = [
            "Client", "Prospect", "Partner",
            "Thought Leader", "VIP", "In-Pipeline", "Employee"
        ];

        if (personaString.includes(',')) {
            return personaString.split(',').map(p => p.trim()).filter(Boolean);
        } else if (personaString.includes(' ')) {
            return personaString.split(' ').map(p => p.trim()).filter(Boolean);
        }

        const splitCamelCase = personaString.replace(/([A-Z])/g, ' $1').trim();
        if (splitCamelCase !== personaString) {
            return splitCamelCase.split(' ').map(p => p.trim()).filter(Boolean);
        }

        const matchedPersona = personaTypes.find(p =>
            personaString.toLowerCase().includes(p.toLowerCase())
        );

        return matchedPersona ? [matchedPersona] : [personaString];
    };

    const normalizedGuests = React.useMemo(() => {
        if (!guests) return [];

        if (Array.isArray(guests)) return guests;

        if (typeof guests === 'object') return [guests];

        if (typeof guests === 'string') {
            try {
                const parsed = JSON.parse(guests);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return [{ Guest: guests }];
            }
        }

        return [];
    }, [guests]);

    const handleCopy = (url, index) => {
        navigator.clipboard.writeText(url);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handlePreview = async (url) => {
        setErrorMessage(null);
          // Special case: LinkedIn
          if (url.includes("linkedin.com")) {
            window.open(url, "_blank", "noopener,noreferrer");
            return;
        }
        try {
            // Test if the URL is valid and reachable
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Guest Details Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-[#1a1b41] rounded-lg w-auto max-w-4xl mx-4 max-h-[90vh] overflow-y-auto p-6"
                    style={{
                        width: `${Math.min(
                            Math.max(
                                normalizedGuests.length > 0 ?
                                    (normalizedGuests.length === 1 ? 400 :
                                        normalizedGuests.length === 2 ? 650 :
                                            800) :
                                    400,
                                400
                            ),
                            800
                        )}px`
                    }}
                >
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Guest Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    {normalizedGuests.length > 0 ? (
                        <div className={`bg-whitw/20 grid gap-2 ${normalizedGuests.length === 1 ? 'grid-cols-1' : normalizedGuests.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {normalizedGuests.map((guest, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 flex flex-col items-center"
                                    style={{ backgroundColor: appColors.primaryColor }}
                                >
                                    <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden mb-4">
                                        {guest.Avatar ? (
                                            <img
                                                src={guest.Avatar}
                                                alt="Guest Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white">No Image</span>
                                        )}
                                    </div>
                                    <div className="text-left text-sm space-y-1 w-full">
                                        <div className="flex items-start gap-2 mb-1">
                                            <span className="font-semibold text-gray-200">Persona:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {guest["Persona"] !== undefined && guest["Persona"] !== null ? (
                                                    getPersonas(guest["Persona"]).map((persona, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${personaColors[persona] || 'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {persona}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm">N/A</span>
                                                )}
                                            </div>
                                        </div>

                                        <p>
                                            <span className="font-semibold text-gray-200">Industry Vertical:</span>{" "}
                                            <span className="text-[13px] text-gray-400">{guest["Industry Vertical"] || "N/A"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-200">Guest Name:</span>{" "}
                                            <span className="text-[13px] text-gray-400">{guest.Guest || "N/A"}</span>
                                        </p>

                                        {guest["Guest Title"] && (
                                            <p>
                                                <span className="font-semibold text-gray-200">Guest Title:</span>{" "}
                                                <span className="text-[13px] text-gray-400">{guest["Guest Title"]}</span>
                                            </p>
                                        )}

                                        {guest["Guest Company"] && (
                                            <p>
                                                <span className="font-semibold text-gray-200">Guest Company:</span>{" "}
                                                <span className="text-[13px] text-gray-400">{guest["Guest Company"]}</span>
                                            </p>
                                        )}

                                        {guest["Guest Industry"] && (
                                            <p>
                                                <span className="font-semibold text-gray-200">Guest Industry:</span>{" "}
                                                <span className="text-[13px] text-gray-400">{guest["Guest Industry"]}</span>
                                            </p>
                                        )}

                                        {guest["LinkedIn Profile"] && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-200">Guest LinkedIn Profile:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(guest["LinkedIn Profile"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>

                                                        {copiedIndex === index && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {guest["Industry Vertical"] && (
                                            <p>
                                                <span className="font-semibold text-gray-200">Industry Vertical:</span>{" "}
                                                <span className="text-[13px] text-gray-400">{guest["Industry Vertical"]}</span>
                                            </p>
                                        )}

                                        {guest["Tracker"] && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-200">Guest Tracker:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(guest["Tracker"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>

                                                        {copiedIndex === index && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {guest["Dossier"] && (
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-200">Guest Dossier:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(guest["Dossier"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleCopy(guest["Dossier"], index)}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Link"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>

                                                        {copiedIndex === index && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">No guest data available</p>
                    )}
                </div>
            </div>
        </>
    );
};

const PrepCallDetailsModal = ({ prepCalls, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (url, index) => {
        navigator.clipboard.writeText(url);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handlePreview = async (url) => {
        setErrorMessage(null);
        try {
            // Test if the URL is valid and reachable
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    const normalizedPrepCalls = React.useMemo(() => {
        if (!prepCalls) return [];

        if (Array.isArray(prepCalls)) return prepCalls;

        if (typeof prepCalls === 'object') return [prepCalls];

        if (typeof prepCalls === 'string') {
            try {
                const parsed = JSON.parse(prepCalls);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return [{
                    "Unedited Prep Call Transcript": prepCalls,
                    "Discussion Guide": ""
                }];
            }
        }

        return [];
    }, [prepCalls]);

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Prep Call Details Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Prep Call Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    {normalizedPrepCalls.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {normalizedPrepCalls.map((prepCall, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4"
                                    style={{ backgroundColor: appColors.primaryColor }}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-2 flex-col">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="font-semibold text-gray-200">Unedited Prep Call Video:</span>
                                            </div>
                                            {prepCall["Unedited Prep Call Video"] && (
                                                <a
                                                    href={prepCall["Unedited Prep Call Video"]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                                >
                                                    {prepCall["Unedited Prep Call Video"].length > 50
                                                        ? `${prepCall["Unedited Prep Call Video"].substring(0, 50)}...`
                                                        : prepCall["Unedited Prep Call Video"]}
                                                </a>
                                            )}
                                        </div>
                                        {prepCall["Unedited Prep Call Transcript"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">Unedited Prep Call Transcript:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(prepCall["Unedited Prep Call Transcript"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopy(prepCall["Unedited Prep Call Transcript"], index)}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Link"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                        {copiedIndex === index && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {prepCall["Discussion Guide"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">Discussion Guide:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(prepCall["Discussion Guide"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopy(prepCall["Discussion Guide"], index)}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Link"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">No prep call data available</p>
                    )}
                </div>
            </div>
        </>
    );
};


const AdditionalGuestProjectsModal = ({ projects, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ index: null, field: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const appColors = {
        primaryColor: '#1a1b41'
    };

    const handleCopy = (url, index, field) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopiedState({ index, field });
        setTimeout(() => setCopiedState({ index: null, field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    const normalizedProjects = React.useMemo(() => {
        if (!projects) return [];

        if (Array.isArray(projects)) return projects;

        if (typeof projects === 'object') return [projects];

        if (typeof projects === 'string') {
            try {
                const parsed = JSON.parse(projects);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return [{
                    "Podcast": projects,
                    "eBooks": "",
                    "Articles": "",
                    "Other": ""
                }];
            }
        }

        return [];
    }, [projects]);

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Guest Projects Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Additional Guest Projects Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    {normalizedProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {normalizedProjects.map((project, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4"
                                    style={{ backgroundColor: appColors.primaryColor }}
                                >
                                    <div className="space-y-4">
                                        {/* Podcast - no icons */}
                                        <div className="flex items-start gap-2 flex-col">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="font-semibold text-gray-200">Podcast:</span>
                                            </div>
                                            {project["Podcast"] ? (

                                                <a
                                                    href={project["Podcast"]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                                >
                                                    {project["Podcast"].length > 50
                                                        ? `${project["Podcast"].substring(0, 50)}...`
                                                        : project["Podcast"]}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">N/A</span>
                                            )}
                                        </div>

                                        {/* eBooks - with eye and copy icons */}
                                        {project["eBooks"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">eBooks:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(project["eBooks"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopy(project["eBooks"], index, "eBooks")}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Link"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                        {copiedState.index === index && copiedState.field === "eBooks" && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Articles - with eye and copy icons */}
                                        {project["Articles"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">Articles:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handlePreview(project["Articles"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopy(project["Articles"], index, "Articles")}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Link"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                        {copiedState.index === index && copiedState.field === "Articles" && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Other - no icons */}
                                        <div className="flex items-start gap-2 flex-col">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="font-semibold text-gray-200">Other:</span>
                                            </div>
                                            {project["Other"] ? (

                                                <a
                                                    href={project["Other"]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                                >
                                                    {project["Other"].length > 50
                                                        ? `${project["Other"].substring(0, 50)}...`
                                                        : project["Other"]}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">N/A</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">No guest projects available</p>
                    )}
                </div>
            </div>
        </>
    );
};


const EmailDetailsModal = ({ emails, onClose }) => {
    const [copiedState, setCopiedState] = useState({ index: null, field: null });
    const [showEmailContent, setShowEmailContent] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (email, index, field) => {
        navigator.clipboard.writeText(email);
        setCopiedState({ index, field });
        setTimeout(() => setCopiedState({ index: null, field: null }), 2000);
    };

    const handleShowEmail = (email) => {
        setShowEmailContent(email);
    };

    const normalizeEmails = React.useMemo(() => {
        if (!emails) return [];

        if (Array.isArray(emails)) return emails;

        if (typeof emails === 'object') return [emails];

        if (typeof emails === 'string') {
            try {
                const parsed = JSON.parse(emails);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return [{
                    "Guest": emails,
                    "Cold": "",
                    "Warm": "",
                    "category": {
                        "Guest": "Delivery",
                        "Cold": "Sales",
                        "Warm": "Sales"
                    }
                }];
            }
        }

        return [];
    }, [emails]);

    return (
        <>
            {/* Email Content Modal */}
            {showEmailContent && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Email Content</h2>
                            <button
                                onClick={() => setShowEmailContent(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-auto">
                            <p className="text-gray-800 break-all">{showEmailContent}</p>
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

            {/* Email Details Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Email Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    {normalizeEmails.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {normalizeEmails.map((email, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4"
                                    style={{ backgroundColor: appColors.primaryColor }}
                                >
                                    <div className="space-y-4">
                                        {/* Guest Email */}
                                        {email["Guest"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">Guest Email:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        {/* <button
                                                            onClick={() => handleShowEmail(email["Guest"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View Email"
                                                        >
                                                            <FaEye size={16} />
                                                        </button> */}
                                                        <button
                                                            onClick={() => handleCopy(email["Guest"], index, "Guest")}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Email"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                        {copiedState.index === index && copiedState.field === "Guest" && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={`mailto:${email["Guest"]}`}
                                                    className="text-blue-400 break-all text-sm"
                                                >
                                                    {email["Guest"]}
                                                </a>
                                                {email.category && (
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        Category: {email.category["Guest"]}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Cold Email */}
                                        {email["Cold"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">Cold Email:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        {/* <button
                                                            onClick={() => handleShowEmail(email["Cold"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View Email"
                                                        >
                                                            <FaEye size={16} />
                                                        </button> */}
                                                        <button
                                                            onClick={() => handleCopy(email["Cold"], index, "Cold")}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Email"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                        {copiedState.index === index && copiedState.field === "Cold" && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={`mailto:${email["Cold"]}`}
                                                    className="text-blue-400 break-all text-sm"
                                                >
                                                    {email["Cold"]}
                                                </a>
                                                {email.category && (
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        Category: {email.category["Cold"]}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Warm Email */}
                                        {email["Warm"] && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-200">Warm Email:</span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        {/* <button
                                                            onClick={() => handleShowEmail(email["Warm"])}
                                                            className="text-blue-300 hover:text-white p-1"
                                                            title="View Email"
                                                        >
                                                            <FaEye size={16} />
                                                        </button> */}
                                                        <button
                                                            onClick={() => handleCopy(email["Warm"], index, "Warm")}
                                                            className="text-yellow-300 hover:text-white p-1"
                                                            title="Copy Email"
                                                        >
                                                            <FaCopy size={16} />
                                                        </button>
                                                        {copiedState.index === index && copiedState.field === "Warm" && (
                                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={`mailto:${email["Warm"]}`}
                                                    className="text-blue-400 break-all text-sm"
                                                >
                                                    {email["Warm"]}
                                                </a>
                                                {email.category && (
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        Category: {email.category["Warm"]}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">No email data available</p>
                    )}
                </div>
            </div>
        </>
    );
};
const FullEpisodeQAVideosModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ index: null, field: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const appColors = {
        primaryColor: '#1a1b41'
    };

    const handleCopy = (text, index, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ index, field });
        setTimeout(() => setCopiedState({ index: null, field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    const normalizedQAVideos = React.useMemo(() => {
        if (!data) return [];

        if (Array.isArray(data)) return data;

        if (typeof data === 'object') return [data];

        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return [{
                    "QAV1 Video File": data,
                    "QAV1 YouTube URL": "",
                    "QAV1 Transcript": "",
                    "QAV1 QA Video Details": "",
                    "Extended Content Article URL": "",
                    "Extended Content Article Text": "",
                    "Extended Content YouTube Short Video File": "",
                    "Extended Content YouTube Short URL": "",
                    "Extended Content LinkedIn Video File": "",
                    "Quote Card": ""
                }];
            }
        }

        return [];
    }, [data]);

    const renderQAVideo = (qaVideo, index) => (
        <div
            key={index}
            className="border rounded-lg p-4"
            style={{ backgroundColor: appColors.primaryColor }}
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-blue-300">QA Video #{index + 1}</h3>
            </div>

            <div className="space-y-4">
                {/* Video File */}
                {qaVideo["QAV1 Video File"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">Video File:</span>
                        </div>
                        <a
                            href={qaVideo["QAV1 Video File"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["QAV1 Video File"].length > 50
                                ? `${qaVideo["QAV1 Video File"].substring(0, 50)}...`
                                : qaVideo["QAV1 Video File"]}
                        </a>
                    </div>
                )}

                {/* YouTube URL */}
                {qaVideo["QAV1 YouTube URL"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">YouTube URL:</span>
                        </div>
                        <a
                            href={qaVideo["QAV1 YouTube URL"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["QAV1 YouTube URL"].length > 50
                                ? `${qaVideo["QAV1 YouTube URL"].substring(0, 50)}...`
                                : qaVideo["QAV1 YouTube URL"]}
                        </a>
                    </div>
                )}

                {/* Transcript - with eye and copy icons */}
                {qaVideo["QAV1 Transcript"] && (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-200">Transcript:</span>
                            <div className="flex items-center gap-1 ml-1">
                                <button
                                    onClick={() => handlePreview(qaVideo["QAV1 Transcript"])}
                                    className="text-blue-300 hover:text-white p-1"
                                    title="View"
                                >
                                    <FaEye size={16} />
                                </button>
                                <button
                                    onClick={() => handleCopy(qaVideo["QAV1 Transcript"], index, "Transcript")}
                                    className="text-yellow-300 hover:text-white p-1"
                                    title="Copy Transcript"
                                >
                                    <FaCopy size={16} />
                                </button>
                                {copiedState.index === index && copiedState.field === "Transcript" && (
                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                            {qaVideo["QAV1 Transcript"]}
                        </p>
                    </div>
                )}

                {/* QA Video Details - with eye and copy icons */}
                {qaVideo["QAV1 QA Video Details"] && (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-200">Video Details:</span>
                            <div className="flex items-center gap-1 ml-1">
                                <button
                                    onClick={() => handlePreview(qaVideo["QAV1 QA Video Details"])}
                                    className="text-blue-300 hover:text-white p-1"
                                    title="View"
                                >
                                    <FaEye size={16} />
                                </button>
                                <button
                                    onClick={() => handleCopy(qaVideo["QAV1 QA Video Details"], index, "Details")}
                                    className="text-yellow-300 hover:text-white p-1"
                                    title="Copy Details"
                                >
                                    <FaCopy size={16} />
                                </button>
                                {copiedState.index === index && copiedState.field === "Details" && (
                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                            {qaVideo["QAV1 QA Video Details"]}
                        </p>
                    </div>
                )}

                {/* Article URL */}
                {qaVideo["Extended Content Article URL"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">Article URL:</span>
                        </div>
                        <a
                            href={qaVideo["Extended Content Article URL"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["Extended Content Article URL"].length > 50
                                ? `${qaVideo["Extended Content Article URL"].substring(0, 50)}...`
                                : qaVideo["Extended Content Article URL"]}
                        </a>
                    </div>
                )}

                {/* Article Text - with eye and copy icons */}
                {qaVideo["Extended Content Article Text"] && (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-200">Article Text:</span>
                            <div className="flex items-center gap-1 ml-1">
                                <button
                                    onClick={() => handlePreview(qaVideo["Extended Content Article Text"])}
                                    className="text-blue-300 hover:text-white p-1"
                                    title="View"
                                >
                                    <FaEye size={16} />
                                </button>
                                <button
                                    onClick={() => handleCopy(qaVideo["Extended Content Article Text"], index, "ArticleText")}
                                    className="text-yellow-300 hover:text-white p-1"
                                    title="Copy Text"
                                >
                                    <FaCopy size={16} />
                                </button>
                                {copiedState.index === index && copiedState.field === "ArticleText" && (
                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                            {qaVideo["Extended Content Article Text"]}
                        </p>
                    </div>
                )}

                {/* YouTube Short Video */}
                {qaVideo["Extended Content YouTube Short Video File"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">YouTube Short Video:</span>
                        </div>
                        <a
                            href={qaVideo["Extended Content YouTube Short Video File"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["Extended Content YouTube Short Video File"].length > 50
                                ? `${qaVideo["Extended Content YouTube Short Video File"].substring(0, 50)}...`
                                : qaVideo["Extended Content YouTube Short Video File"]}
                        </a>
                    </div>
                )}

                {/* YouTube Short URL */}
                {qaVideo["Extended Content YouTube Short URL"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">YouTube Short URL:</span>
                        </div>
                        <a
                            href={qaVideo["Extended Content YouTube Short URL"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["Extended Content YouTube Short URL"].length > 50
                                ? `${qaVideo["Extended Content YouTube Short URL"].substring(0, 50)}...`
                                : qaVideo["Extended Content YouTube Short URL"]}
                        </a>
                    </div>
                )}

                {/* LinkedIn Video File */}
                {qaVideo["Extended Content LinkedIn Video File"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">LinkedIn Video File:</span>
                        </div>
                        <a
                            href={qaVideo["Extended Content LinkedIn Video File"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["Extended Content LinkedIn Video File"].length > 50
                                ? `${qaVideo["Extended Content LinkedIn Video File"].substring(0, 50)}...`
                                : qaVideo["Extended Content LinkedIn Video File"]}
                        </a>
                    </div>
                )}

                {/* Quote Card */}
                {qaVideo["Quote Card"] && (
                    <div className="flex items-start gap-2 flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-gray-200">Quote Card:</span>
                        </div>
                        <a
                            href={qaVideo["Quote Card"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                        >
                            {qaVideo["Quote Card"].length > 50
                                ? `${qaVideo["Quote Card"].substring(0, 50)}...`
                                : qaVideo["Quote Card"]}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* QA Videos Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">QA Video Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    {normalizedQAVideos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {normalizedQAVideos.map((qaVideo, index) => renderQAVideo(qaVideo, index))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">No QA videos available</p>
                    )}
                </div>
            </div>
        </>
    );
};

// FullEpisode Details Modal 
const FullEpisodeDetailsModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ index: null, field: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const appColors = {
        primaryColor: '#1a1b41'
    };

    const handleCopy = (text, index, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ index, field });
        setTimeout(() => setCopiedState({ index: null, field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Details Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Full Episode Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data["Episode ID"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Episode ID:</span>
                                        <p className="text-gray-400">{data["Episode ID"]}</p>
                                    </div>
                                )}

                                {data["Episode Number"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Episode Number:</span>
                                        <p className="text-gray-400">{data["Episode Number"]}</p>
                                    </div>
                                )}

                                {data["Episode Title"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Episode Title:</span>
                                        <p className="text-gray-400">{data["Episode Title"]}</p>
                                    </div>
                                )}

                                {data["Date Recorded"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Date Recorded:</span>
                                        <p className="text-gray-400">{data["Date Recorded"]}</p>
                                    </div>
                                )}

                                {data["Short and Long-Tail SEO Keywords"] && (
                                    <div className="col-span-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200">SEO Keywords:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopy(data["Short and Long-Tail SEO Keywords"], 0, "SEO Keywords")}
                                                    className="text-yellow-300 hover:text-white p-1"
                                                    title="Copy Keywords"
                                                >
                                                    <FaCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(data["Short and Long-Tail SEO Keywords"])}
                                                    className="text-blue-300 hover:text-white p-1"
                                                    title="View Keywords"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                {copiedState.index === 0 && copiedState.field === "SEO Keywords" && (
                                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                                            {data["Short and Long-Tail SEO Keywords"]}
                                        </p>
                                    </div>
                                )}

                                {data["All Asset Folder"] && (
                                    <div className="col-span-2 space-y-1">
                                        <span className="font-semibold text-gray-200">All Asset Folder:</span>
                                        <a
                                            href={data["All Asset Folder"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["All Asset Folder"].length > 50
                                                ? `${data["All Asset Folder"].substring(0, 50)}...`
                                                : data["All Asset Folder"]}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const FullEpisodeVideoModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ index: null, field: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const appColors = {
        primaryColor: '#1a1b41'
    };

    const handleCopy = (text, index, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ index, field });
        setTimeout(() => setCopiedState({ index: null, field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Video Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Full Episode Video Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data["Video File"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Video File:</span>
                                        <a
                                            href={data["Video File"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["Video File"].length > 50
                                                ? `${data["Video File"].substring(0, 50)}...`
                                                : data["Video File"]}
                                        </a>
                                    </div>
                                )}

                                {data["Audio File"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Audio File:</span>
                                        <a
                                            href={data["Audio File"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["Audio File"].length > 50
                                                ? `${data["Audio File"].substring(0, 50)}...`
                                                : data["Audio File"]}
                                        </a>
                                    </div>
                                )}

                                {data["YouTube URL"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">YouTube URL:</span>
                                        <a
                                            href={data["YouTube URL"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["YouTube URL"].length > 50
                                                ? `${data["YouTube URL"].substring(0, 50)}...`
                                                : data["YouTube URL"]}
                                        </a>
                                    </div>
                                )}

                                {data["Full Episode Details"] && (
                                    <div className="col-span-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200">Full Episode Details:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopy(data["Full Episode Details"], 0, "Details")}
                                                    className="text-yellow-300 hover:text-white p-1"
                                                    title="Copy Details"
                                                >
                                                    <FaCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(data["Full Episode Details"])}
                                                    className="text-blue-300 hover:text-white p-1"
                                                    title="View Details"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                {copiedState.index === 0 && copiedState.field === "Details" && (
                                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                                            {data["Full Episode Details"]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const FullEpisodeExtendedContentModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ index: null, field: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const appColors = {
        primaryColor: '#1a1b41'
    };

    const handleCopy = (text, index, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ index, field });
        setTimeout(() => setCopiedState({ index: null, field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Extended Content Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Extended Content Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data["Article URL"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Article URL:</span>
                                        <a
                                            href={data["Article URL"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["Article URL"].length > 50
                                                ? `${data["Article URL"].substring(0, 50)}...`
                                                : data["Article URL"]}
                                        </a>
                                    </div>
                                )}

                                {data["Article Text"] && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200">Article Text:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopy(data["Article Text"], 0, "ArticleText")}
                                                    className="text-yellow-300 hover:text-white p-1"
                                                    title="Copy Text"
                                                >
                                                    <FaCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(data["Article Text"])}
                                                    className="text-blue-300 hover:text-white p-1"
                                                    title="View Text"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                {copiedState.index === 0 && copiedState.field === "ArticleText" && (
                                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                                            {data["Article Text"]}
                                        </p>
                                    </div>
                                )}

                                {data["YouTube Short Video File"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">YouTube Short Video File:</span>
                                        <a
                                            href={data["YouTube Short Video File"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["YouTube Short Video File"].length > 50
                                                ? `${data["YouTube Short Video File"].substring(0, 50)}...`
                                                : data["YouTube Short Video File"]}
                                        </a>
                                    </div>
                                )}

                                {data["YouTube Short URL"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">YouTube Short URL:</span>
                                        <a
                                            href={data["YouTube Short URL"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["YouTube Short URL"].length > 50
                                                ? `${data["YouTube Short URL"].substring(0, 50)}...`
                                                : data["YouTube Short URL"]}
                                        </a>
                                    </div>
                                )}

                                {data["YouTube Short Transcript"] && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200">YouTube Short Transcript:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopy(data["YouTube Short Transcript"], 0, "ShortTranscript")}
                                                    className="text-yellow-300 hover:text-white p-1"
                                                    title="Copy Transcript"
                                                >
                                                    <FaCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(data["YouTube Short Transcript"])}
                                                    className="text-blue-300 hover:text-white p-1"
                                                    title="View Transcript"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                {copiedState.index === 0 && copiedState.field === "ShortTranscript" && (
                                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                                            {data["YouTube Short Transcript"]}
                                        </p>
                                    </div>
                                )}

                                {data["LinkedIn Video File"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">LinkedIn Video File:</span>
                                        <a
                                            href={data["LinkedIn Video File"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["LinkedIn Video File"].length > 50
                                                ? `${data["LinkedIn Video File"].substring(0, 50)}...`
                                                : data["LinkedIn Video File"]}
                                        </a>
                                    </div>
                                )}

                                {data["LinkedIn Video Transcript"] && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200">LinkedIn Video Transcript:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopy(data["LinkedIn Video Transcript"], 0, "LinkedInTranscript")}
                                                    className="text-yellow-300 hover:text-white p-1"
                                                    title="Copy Transcript"
                                                >
                                                    <FaCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(data["LinkedIn Video Transcript"])}
                                                    className="text-blue-300 hover:text-white p-1"
                                                    title="View Transcript"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                {copiedState.index === 0 && copiedState.field === "LinkedInTranscript" && (
                                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                                            {data["LinkedIn Video Transcript"]}
                                        </p>
                                    </div>
                                )}

                                {data["Extended Content LinkedIn Comments & Hashtags"] && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-200">LinkedIn Comments & Hashtags:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopy(data["Extended Content LinkedIn Comments & Hashtags"], 0, "Comments")}
                                                    className="text-yellow-300 hover:text-white p-1"
                                                    title="Copy Comments"
                                                >
                                                    <FaCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(data["Extended Content LinkedIn Comments & Hashtags"])}
                                                    className="text-blue-300 hover:text-white p-1"
                                                    title="View Comments"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                {copiedState.index === 0 && copiedState.field === "Comments" && (
                                                    <span className="text-green-400 text-xs ml-1">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 whitespace-pre-wrap line-clamp-3 text-sm">
                                            {data["Extended Content LinkedIn Comments & Hashtags"]}
                                        </p>
                                    </div>
                                )}

                                {data["Quote Card"] && (
                                    <div className="space-y-1">
                                        <span className="font-semibold text-gray-200">Quote Card:</span>
                                        <a
                                            href={data["Quote Card"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                                        >
                                            {data["Quote Card"].length > 50
                                                ? `${data["Quote Card"].substring(0, 50)}...`
                                                : data["Quote Card"]}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
const FullEpisodeHighlightVideoModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Highlight Video Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Highlight Video Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Video File"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Video File:</span>
                                    <a
                                        href={data["Video File"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Video File"]}
                                    </a>
                                </div>
                            )}

                            {data["YouTube URL"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">YouTube URL:</span>
                                    <a
                                        href={data["YouTube URL"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["YouTube URL"]}
                                    </a>
                                </div>
                            )}

                            {data["Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Transcript"], "Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Transcript"]}</p>
                                </div>
                            )}

                            {data["Highlights Video Details"] && (
                                <div className="col-span-2 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Highlights Video Details:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Highlights Video Details"], "Highlights Video Details")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Details"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Highlights Video Details"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Details"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Highlights Video Details" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Highlights Video Details"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
const FullEpisodeIntroductionVideoModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Introduction Video Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Introduction Video Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Video File"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Video File:</span>
                                    <a
                                        href={data["Video File"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Video File"]}
                                    </a>
                                </div>
                            )}

                            {data["YouTube URL"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">YouTube URL:</span>
                                    <a
                                        href={data["YouTube URL"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["YouTube URL"]}
                                    </a>
                                </div>
                            )}

                            {data["Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Transcript"], "Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Transcript"]}</p>
                                </div>
                            )}

                            {data["Instruction Video Details"] && (
                                <div className="col-span-2 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Instruction Video Details:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Instruction Video Details"], "Instruction Video Details")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Details"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Instruction Video Details"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Details"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Instruction Video Details" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Instruction Video Details"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const FullEpisodePodbookModal = ({ data, onClose }) => {
    const [copiedState, setCopiedState] = useState({ field: null });

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6 -mt-2">
                    <h2 className="text-xl font-bold -mt-1">Podbook Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 -mt-1 hover:text-white"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>
                <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data["Interactive Experience"] && (
                            <div className="space-y-1">
                                <span className="font-semibold text-gray-200">Interactive Experience:</span>
                                <a
                                    href={data["Interactive Experience"]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 break-all underline"
                                >
                                    {data["Interactive Experience"]}
                                </a>
                            </div>
                        )}

                        {data["Website URL"] && (
                            <div className="space-y-1">
                                <span className="font-semibold text-gray-200">Website URL:</span>
                                <a
                                    href={data["Website URL"]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 break-all underline"
                                >
                                    {data["Website URL"]}
                                </a>
                            </div>
                        )}

                        {data["Embed Code"] && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-200">Embed Code:</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleCopy(data["Embed Code"], "Embed Code")}
                                            className="text-yellow-300 hover:text-white p-1"
                                            title="Copy Code"
                                        >
                                            <FaCopy size={16} />
                                        </button>
                                        {copiedState.field === "Embed Code" && (
                                            <span className="text-green-400 text-xs ml-1">Copied!</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-400 whitespace-pre-wrap">{data["Embed Code"]}</p>
                            </div>
                        )}

                        {data["Loom Folder"] && (
                            <div className="space-y-1">
                                <span className="font-semibold text-gray-200">Loom Folder:</span>
                                <a
                                    href={data["Loom Folder"]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 break-all underline"
                                >
                                    {data["Loom Folder"]}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const FullEpisodeFullCaseStudyModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Full Case Study Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Full Case Study Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Interactive Experience"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Interactive Experience:</span>
                                    <a
                                        href={data["Interactive Experience"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Interactive Experience"]}
                                    </a>
                                </div>
                            )}

                            {data["Case Study Text"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Case Study Text:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Case Study Text"], "Case Study Text")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Text"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Case Study Text"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Text"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Case Study Text" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Case Study Text"]}</p>
                                </div>
                            )}

                            {data["Sales Email"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Sales Email:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Sales Email"], "Sales Email")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Email"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Sales Email"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Email"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Sales Email" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Sales Email"]}</p>
                                </div>
                            )}

                            {data["Problem Section Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Problem Section Video:</span>
                                    <a
                                        href={data["Problem Section Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Problem Section Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Problem Section Video Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Problem Section Video Length:</span>
                                    <p className="text-gray-400">{data["Problem Section Video Length"]}</p>
                                </div>
                            )}

                            {data["Problem Section Video Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Problem Section Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Problem Section Video Transcript"], "Problem Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Problem Section Video Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Problem Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Problem Section Video Transcript"]}</p>
                                </div>
                            )}

                            {data["Solutions Section Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Solutions Section Video:</span>
                                    <a
                                        href={data["Solutions Section Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Solutions Section Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Solutions Section Video Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Solutions Section Video Length:</span>
                                    <p className="text-gray-400">{data["Solutions Section Video Length"]}</p>
                                </div>
                            )}

                            {data["Solutions Section Video Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Solutions Section Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Solutions Section Video Transcript"], "Solutions Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Solutions Section Video Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Solutions Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Solutions Section Video Transcript"]}</p>
                                </div>
                            )}

                            {data["Results Section Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Results Section Video:</span>
                                    <a
                                        href={data["Results Section Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Results Section Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Results Section Video Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Results Section Video Length:</span>
                                    <p className="text-gray-400">{data["Results Section Video Length"]}</p>
                                </div>
                            )}

                            {data["Results Section Video Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Results Section Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Results Section Video Transcript"], "Results Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Results Section Video Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Results Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Results Section Video Transcript"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
const FullEpisodeOnePageCaseStudyModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode One Page Case Study Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">One Page Case Study Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Interactive Experience"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Interactive Experience:</span>
                                    <a
                                        href={data["Interactive Experience"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Interactive Experience"]}
                                    </a>
                                </div>
                            )}

                            {data["One Page Text"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">One Page Text:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["One Page Text"], "One Page Text")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Text"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["One Page Text"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Text"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "One Page Text" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["One Page Text"]}</p>
                                </div>
                            )}

                            {data["Sales Email"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Sales Email:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Sales Email"], "Sales Email")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Email"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Sales Email"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Email"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Sales Email" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Sales Email"]}</p>
                                </div>
                            )}

                            {data["One Page Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">One Page Video:</span>
                                    <a
                                        href={data["One Page Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["One Page Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Video Length:</span>
                                    <p className="text-gray-400">{data["Length"]}</p>
                                </div>
                            )}

                            {data["Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Transcript"], "Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Transcript"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
const FullEpisodeOtherCaseStudyModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Other Case Study Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Other Case Study Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Other Case Study Interactive Experience"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Interactive Experience:</span>
                                    <a
                                        href={data["Other Case Study Interactive Experience"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Other Case Study Interactive Experience"]}
                                    </a>
                                </div>
                            )}

                            {data["Case Study Text"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Case Study Text:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Case Study Text"], "Case Study Text")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Text"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Case Study Text"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Text"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Case Study Text" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Case Study Text"]}</p>
                                </div>
                            )}

                            {data["Sales Email"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Sales Email:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Sales Email"], "Sales Email")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Email"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Sales Email"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Email"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Sales Email" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Sales Email"]}</p>
                                </div>
                            )}

                            {data["Other Case Study Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Case Study Video:</span>
                                    <a
                                        href={data["Other Case Study Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Other Case Study Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Other Case Study Video Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Video Length:</span>
                                    <p className="text-gray-400">{data["Other Case Study Video Length"]}</p>
                                </div>
                            )}

                            {data["Other Case Study Video Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Other Case Study Video Transcript"], "Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Other Case Study Video Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Other Case Study Video Transcript"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
const FullEpisodeICPAdviceModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode ICP Advice Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">ICP Advice Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Post-Podcast Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Post-Podcast Video:</span>
                                    <a
                                        href={data["Post-Podcast Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Post-Podcast Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Unedited Post-Podcast Video Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Video Length:</span>
                                    <p className="text-gray-400">{data["Unedited Post-Podcast Video Length"]}</p>
                                </div>
                            )}

                            {data["Unedited Post-Podcast Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Unedited Post-Podcast Transcript"], "Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Unedited Post-Podcast Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Unedited Post-Podcast Transcript"]}</p>
                                </div>
                            )}

                            {data["Post-Podcast Insights Report"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Insights Report:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Post-Podcast Insights Report"], "Insights Report")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Report"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Post-Podcast Insights Report"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Report"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Insights Report" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Post-Podcast Insights Report"]}</p>
                                </div>
                            )}

                            {data["Post-Podcast Vision Report"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Vision Report:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Post-Podcast Vision Report"], "Vision Report")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Report"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Post-Podcast Vision Report"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Report"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Vision Report" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Post-Podcast Vision Report"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
const FullEpisodeChallengeQuestionsModal = ({ data, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copiedState, setCopiedState] = useState({ field: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedState({ field });
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
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
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
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

            {/* Full Episode Challenge Questions Modal */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1b41] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 -mt-2">
                        <h2 className="text-xl font-bold -mt-1">Challenge Questions Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 -mt-1 hover:text-white"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-300 mb-4 -mt-[15px] -mx-6" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data["Unedited Challenge Question Video"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Challenge Question Video:</span>
                                    <a
                                        href={data["Unedited Challenge Question Video"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 break-all underline"
                                    >
                                        {data["Unedited Challenge Question Video"]}
                                    </a>
                                </div>
                            )}

                            {data["Unedited Challenge Question Video Length"] && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-200">Video Length:</span>
                                    <p className="text-gray-400">{data["Unedited Challenge Question Video Length"]}</p>
                                </div>
                            )}

                            {data["Unedited Challenge Question Transcript"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Transcript:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Unedited Challenge Question Transcript"], "Transcript")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Transcript"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Unedited Challenge Question Transcript"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Transcript"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Transcript" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Unedited Challenge Question Transcript"]}</p>
                                </div>
                            )}

                            {data["Challenge Report"] && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-200">Challenge Report:</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(data["Challenge Report"], "Challenge Report")}
                                                className="text-yellow-300 hover:text-white p-1"
                                                title="Copy Report"
                                            >
                                                <FaCopy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePreview(data["Challenge Report"])}
                                                className="text-blue-300 hover:text-white p-1"
                                                title="View Report"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            {copiedState.field === "Challenge Report" && (
                                                <span className="text-green-400 text-xs ml-1">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 whitespace-pre-wrap">{data["Challenge Report"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const DraggableHeader = ({ column, index, moveColumn }) => {
    const [isResizing, setIsResizing] = useState(false);


    const [{ isDragging }, ref, drag] = useDrag({
        type: ItemType,
        item: { id: column.id, index },
        canDrag: () => !isResizing,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedItem) => {
            if (draggedItem.index !== index && !isResizing) {
                moveColumn(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    const shouldResizeColumn = (columnId) => {
        // Disable separator for these specific columns
        return !['Objections', 'Challenges', 'Sales Insights', 'Tags', 'Themes', 'Validations', 'Video Type'].includes(columnId);
    };

    return (
        <th
            ref={(node) => ref(drop(node))}
            className={`
    px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white
    ${(column.id === 'Avatar') ? 'sticky left-0 px-6 z-25 bg-[#1a1b41]' : ''}
    ${(column.id === 'file_type_icon') ? 'sticky left-0 px-6 z-25 bg-[#1a1b41]' : ''}
    ${(column.id === 'company_specific') ? 'left-0 px-6 z-25' : ''}
    ${(column.id === 'thumbnail') ? 'sticky left-0 px-6 z-25 bg-[#1a1b41]' : ''}
    ${column.id === 'file_name' ? 'sticky left-[130px] -px-[60px] z-20 bg-[#1a1b41] w-[125px]' : ''}
    ${column.id === 'Guest' ? 'sticky left-[130px] -px-[60px] z-20 bg-[#1a1b41]' : ''}
    ${column.id == 'email' ? 'px-[25px] z-20 bg-[#1a1b41] w-[200px]' : ''}
    border-r border-gray-600
  `}
            style={{
                overflow: 'visible',
                cursor: isResizing ? 'col-resize' : '',
                opacity: isDragging ? 0.5 : 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                borderBottom: '2px solid #4B5563',
                zIndex: 50,
            }}
        >
            <ResizableBox
                width={
                    (column.id === 'Avatar' ||
                        column.id === 'Likes' ||
                        column.id === 'file_type_icon' ||
                        column.id === 'Comments' ||
                        column.id === 'action' ||
                        column.id === 'thumbnail')
                        ? 120
                        : 200
                }
                height={20}
                minConstraints={[50]}
                maxConstraints={[1000]}
                resizeHandles={shouldResizeColumn(column.id) ? ['e'] : []}
                axis="x"
                onResizeStart={() => setIsResizing(true)}
                onResizeStop={() => setIsResizing(false)}
                handle={
                    <span
                        className="absolute top-0 right-0 h-[50px] -mt-4 w-[8px] cursor-col-resize z-10 bg-transparent"
                        style={{ marginRight: '-28px' }}
                    />
                }
            >
                <div className="group relative flex items-center h-full w-full">
                    <span className="truncate w-full">{column.label}</span>

                    {/* Tooltip */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max max-w-xs 
          bg-black text-white text-xs rounded px-2 py-1 
          opacity-0 group-hover:opacity-100 
          whitespace-normal break-words shadow-lg pointer-events-none z-50"
                    >
                        {column.label}
                    </div>
                </div>
            </ResizableBox>
        </th>

    );
};

const DraggableTable = ({
    columns: initialColumns,
    data,
    arrayFields,
    showActions = true,
    loading,
    onEdit,
    onDelete,
    hasMoreRecords,
    onLoadMore,
    loadingMore,
    alignRecord,
    loadingRecord,
    themesRank,
    handleAddFromRow,
    appliedFilters,
    likesTableName,
    commentsTableName
}) => {
    const [columns, setColumns] = useState(initialColumns);
    const [selectedRow, setSelectedRow] = useState(null);
    const [fileRow, setFileRow] = useState(null);
    const [commentRow, setCommentRow] = useState(null);
    const [selectedThemes, setSelectedThemes] = useState(null);
    const [selectedObjections, setSelectedObjections] = useState(null);
    const [selectedValidations, setSelectedValidations] = useState(null);
    const [selectedChallenges, setSelectedChallenges] = useState(null);
    const [selectedSalesInsights, setSelectedSalesInsights] = useState(null);
    const [selectedCaseStudyVideos, setSelectedCaseStudyVideos] = useState(null);
    const [selectedVideoType, setSelectedVideoType] = useState(null);
    const [isEndUser, setIsEndUser] = useState(false);
    const [isSuperEditor, setIsSuperEditor] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState(null);
    console.log("Selected Row:", selectedRow);
    console.log("Selected Row ID:", selectedRow?.id);

    const [selectedPrepCalls, setSelectedPrepCalls] = useState(null);
    const [selectedGuestProjects, setSelectedGuestProjects] = useState(null);
    const [selectedEmails, setSelectedEmails] = useState(null);
    const [selectedFullEpisodeDetails, setSelectedFullEpisodeDetails] = useState(null);
    const [selectedFullEpisodeVideo, setSelectedFullEpisodeVideo] = useState(null);
    const [selectedFullEpisodeExtendedContent, setSelectedFullEpisodeExtendedContent] = useState(null);
    const [selectedFullEpisodeHighlightVideo, setSelectedFullEpisodeHighlightVideo] = useState(null);
    const [selectedFullEpisodeIntroductionVideo, setSelectedFullEpisodeIntroductionVideo] = useState(null);
    const [selectedFullEpisodeQAVideos, setSelectedFullEpisodeQAVideos] = useState(null);
    const [selectedFullEpisodePodbook, setSelectedFullEpisodePodbook] = useState(null);
    const [selectedFullEpisodeFullCaseStudy, setSelectedFullEpisodeFullCaseStudy] = useState(null);
    const [selectedFullEpisodeOnePageCaseStudy, setSelectedFullEpisodeOnePageCaseStudy] = useState(null);
    const [selectedFullEpisodeOtherCaseStudy, setSelectedFullEpisodeOtherCaseStudy] = useState(null);
    const [selectedFullEpisodeICPAdvice, setSelectedFullEpisodeICPAdvice] = useState(null);
    const [selectedFullEpisodeChallengeQuestions, setSelectedFullEpisodeChallengeQuestions] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("system_roles");
        setIsEndUser(storedRole === "end-user");
        setIsSuperEditor(storedRole === "super-editor");
    }, []);

    const moveColumn = (fromIndex, toIndex) => {
        const updatedColumns = [...columns];
        const [movedColumn] = updatedColumns.splice(fromIndex, 1);
        updatedColumns.splice(toIndex, 0, movedColumn);
        setColumns(updatedColumns);
    };

    const normalizeThemes = (rowId) => {
        const themeData = themesRank?.find(item => item.id === rowId)?.Themes;
        if (!themeData) return [];

        if (Array.isArray(themeData)) {
            return themeData.map(theme => {
                if (typeof theme === 'object') {
                    return {
                        theme: theme.theme || '',
                        ranking: theme.ranking || 0,
                        justification: theme.justification || '',
                        perceptionToAddress: theme.perception || '',
                        whyItMatters: theme.whyItMatters || '',
                        deeperInsight: theme.deeperInsight || '',
                        supportingQuotes: theme.supportingQuotes || ''
                    };
                }
                return {
                    theme: theme || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeObjections = (rowId) => {
        const ObjectionData = themesRank?.find(item => item.id === rowId)?.Objections;
        if (!ObjectionData) return [];

        if (Array.isArray(ObjectionData)) {
            return ObjectionData.map(objection => {
                if (typeof objection === 'object') {
                    return {
                        objection: objection.objection || '',
                        ranking: objection.ranking || 0,
                        justification: objection.justification || '',
                        perceptionToAddress: objection.perception || '',
                        whyItMatters: objection.whyItMatters || '',
                        deeperInsight: objection.deeperInsight || '',
                        supportingQuotes: objection.supportingQuotes || ''
                    };
                }
                return {
                    objection: objection || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeValidations = (rowId) => {
        const ValidationData = themesRank?.find(item => item.id === rowId)?.Validations;
        if (!ValidationData) return [];

        if (Array.isArray(ValidationData)) {
            return ValidationData.map(validation => {
                if (typeof validation === 'object') {
                    return {
                        validation: validation.validation || '',
                        ranking: validation.ranking || 0,
                        justification: validation.justification || '',
                        perceptionToAddress: validation.perception || '',
                        whyItMatters: validation.whyItMatters || '',
                        deeperInsight: validation.deeperInsight || '',
                        supportingQuotes: validation.supportingQuotes || ''
                    };
                }
                return {
                    validation: validation || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeChallenges = (rowId) => {
        const ChallengesData = themesRank?.find(item => item.id === rowId)?.Challenges;
        if (!ChallengesData) return [];

        if (Array.isArray(ChallengesData)) {
            return ChallengesData.map(challenge => {
                if (typeof challenge === 'object') {
                    return {
                        challenges: challenge.challenges || '',
                        ranking: challenge.ranking || 0,
                        justification: challenge.justification || '',
                        perceptionToAddress: challenge.perception || '',
                        whyItMatters: challenge.whyItMatters || '',
                        deeperInsight: challenge.deeperInsight || '',
                        supportingQuotes: challenge.supportingQuotes || ''
                    };
                }
                return {
                    challenges: challenge || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }
        return [];
    };

    const normalizeSalesInsights = (rowId) => {
        const salesInsightsData = themesRank?.find(item => item.id === rowId)?.['Sales Insights'];
        if (!salesInsightsData) return [];

        if (Array.isArray(salesInsightsData)) {
            return salesInsightsData.map(insight => {
                if (typeof insight === 'object') {
                    return {
                        insight: insight.insight || '',
                        ranking: insight.ranking || 0,
                        justification: insight.justification || '',
                        perceptionToAddress: insight.perception || '',
                        whyItMatters: insight.whyItMatters || '',
                        deeperInsight: insight.deeperInsight || '',
                        supportingQuotes: insight.supportingQuotes || ''
                    };
                }
                return {
                    insight: insight || '',
                    ranking: 0,
                    justification: '',
                    perceptionToAddress: '',
                    whyItMatters: '',
                    deeperInsight: '',
                    supportingQuotes: ''
                };
            });
        }

        return [];
    };
    const normalizeCaseStudyOtherVideo = (rowId) => {
        const CaseStudyOtherVideo = themesRank?.find(item => item.id === rowId)?.Case_Study_Other_Video;
        if (!CaseStudyOtherVideo) return [];

        if (Array.isArray(CaseStudyOtherVideo)) {
            return CaseStudyOtherVideo.map(othervideo => {
                if (typeof othervideo === 'object') {
                    return {
                        video_title: othervideo.video_title || '',
                        video_link: othervideo.video_link || '',
                        copy_and_paste_text: othervideo.copy_and_paste_text || '',
                        link_to_document: othervideo.link_to_document || ''
                    };
                }
                return {
                    video_title: othervideo || '',
                    video_link: '',
                    copy_and_paste_text: '',
                    link_to_document: ''
                };
            });
        }

        return [];
    };
    const normalizeVideoType = (rowId) => {
        const videoTypeData = themesRank?.find(item => item.id === rowId)?.["Video Type"];
        if (!videoTypeData) return [];

        // Parse if it's a string (JSONB might store as string)
        const parsedData = typeof videoTypeData === 'string'
            ? JSON.parse(videoTypeData)
            : videoTypeData;

        // Normalize to always work with an array
        const items = Array.isArray(parsedData) ? parsedData : [parsedData];

        return items.map(item => {
            // Case 1: Simple string value (like "Highlights Video")
            if (typeof item === 'string') {
                return {
                    videoType: item,
                    video_title: '',
                    video_length: '',
                    video_link: '',
                    video_desc: ''
                };
            }

            // Case 2: Object with videoType property (your current structure)
            if (item?.videoType) {
                return {
                    videoType: item.videoType,
                    video_title: '',
                    video_length: '',
                    video_link: '',
                    video_desc: '',
                    // Include nested videos if needed
                    videos: item.videos || []
                };
            }

            // Case 3: Object with different structure (fallback)
            return {
                videoType: item.video_type || '',
                video_title: item.video_title || '',
                video_length: item.video_length || '',
                video_link: item.video_link || '',
                video_desc: item.video_desc || '',
                videos: item.videos || []
            };
        }).filter(item => item.videoType); // Filter out empty videoTypes
    };

    // Add this function to normalize prep call data
    const normalizePrepCalls = (rowId) => {
        const prepCallData = themesRank?.find(item => item.id === rowId)?.Prep_Call;

        console.log("prepCallData", prepCallData);
        if (!prepCallData) return [];

        try {
            // Handle string cases first
            if (typeof prepCallData === 'string') {
                // Check for malformed strings
                if (prepCallData.toLowerCase().trim() === 'nan' ||
                    prepCallData.trim() === '[]' ||
                    prepCallData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON if it looks like JSON
                if (prepCallData.trim().startsWith('{') || prepCallData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(prepCallData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If it's just a plain string, treat it as a video URL
                return [{
                    "Unedited Prep Call Video": prepCallData,
                    "Unedited Prep Call Transcript": '',
                    "Discussion Guide": ''
                }];
            }

            // Handle array case
            if (Array.isArray(prepCallData)) {
                return prepCallData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Unedited Prep Call Video": item["Unedited Prep Call Video"] || '',
                            "Unedited Prep Call Transcript": item["Unedited Prep Call Transcript"] || '',
                            "Discussion Guide": item["Discussion Guide"] || ''
                        };
                    }
                    return {
                        "Unedited Prep Call Video": String(item || ''),
                        "Unedited Prep Call Transcript": '',
                        "Discussion Guide": ''
                    };
                }).filter(Boolean);
            }

            // Handle single object case
            if (typeof prepCallData === 'object' && prepCallData !== null) {
                return [{
                    "Unedited Prep Call Video": prepCallData["Unedited Prep Call Video"] || '',
                    "Unedited Prep Call Transcript": prepCallData["Unedited Prep Call Transcript"] || '',
                    "Discussion Guide": prepCallData["Discussion Guide"] || ''
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing prep call data:', error);
            return [];
        }
    };
    const normalizeGuestProjects = (rowId) => {

        console.log("ThemeRankkk", themesRank);
        const additionalGuestProject = themesRank?.find(item => item.id == rowId)?.Additional_Guest_Projects;
        console.log("additionalGuestProjects", additionalGuestProject);
        if (!additionalGuestProject) return [];

        try {
            // Handle string cases first
            if (typeof additionalGuestProject === 'string') {
                // Check for malformed strings
                if (additionalGuestProject.toLowerCase().trim() === 'nan' ||
                    additionalGuestProject.trim() === '[]' ||
                    additionalGuestProject.trim() === '') {
                    return [];
                }

                // Try to parse as JSON if it looks like JSON
                if (additionalGuestProject.trim().startsWith('{') || additionalGuestProject.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(additionalGuestProject);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If it's just a plain string, treat it as a video URL
                return [{
                    "Podcast": additionalGuestProject,
                    "eBooks": '',
                    "Articles": '',
                    "Other": '',
                }];
            }

            // Handle array case
            if (Array.isArray(additionalGuestProject)) {
                return additionalGuestProject.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Podcast": item["Podcast"] || '',
                            "eBooks": item["eBooks"] || '',
                            "Articles": item["Articles"] || '',
                            "Other": item["Other"] || '',
                        };
                    }
                    return {
                        "Podcast": String(item || ''),
                        "eBooks": '',
                        "Articles": '',
                        "Other": '',
                    };
                }).filter(Boolean);
            }

            // Handle single object case
            if (typeof additionalGuestProject === 'object' && additionalGuestProject !== null) {
                return [{
                    "Podcast": additionalGuestProject["Podcast"] || '',
                    "eBooks": additionalGuestProject["eBooks"] || '',
                    "Articles": additionalGuestProject["Articles"] || ''
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing prep call data:', error);
            return [];
        }
    };
    const normalizeEmails = (rowId) => {
        const emailData = themesRank?.find(item => item.id === rowId)?.Emails;

        console.log("emailData", emailData);
        if (!emailData) return [];

        try {
            // Handle string cases first
            if (typeof emailData === 'string') {
                // Check for malformed strings
                if (emailData.toLowerCase().trim() === 'nan' ||
                    emailData.trim() === '[]' ||
                    emailData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON if it looks like JSON
                if (emailData.trim().startsWith('{') || emailData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(emailData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If it's just a plain string, treat it as a guest email
                return [{
                    "Guest": emailData,
                    "Cold": '',
                    "Warm": ''
                }];
            }

            // Handle array case
            if (Array.isArray(emailData)) {
                return emailData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Guest": item["Guest"] || '',
                            "Cold": item["Cold"] || '',
                            "Warm": item["Warm"] || ''
                        };
                    }
                    return {
                        "Guest": String(item || ''),
                        "Cold": '',
                        "Warm": ''
                    };
                }).filter(Boolean);
            }

            // Handle single object case
            if (typeof emailData === 'object' && emailData !== null) {
                return [{
                    "Guest": emailData["Guest"] || '',
                    "Cold": emailData["Cold"] || '',
                    "Warm": emailData["Warm"] || ''
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing email data:', error);
            return [];
        }
    };
    const normalizeFullEpisodeDetails = (rowId) => {
        const detailsData = themesRank?.find(item => item.id === rowId)?.DETAILS_FULL_EPISODES;

        console.log("detailsData", detailsData);
        if (!detailsData) return [];

        try {
            // Handle string case
            if (typeof detailsData === 'string') {
                if (detailsData.toLowerCase().trim() === 'nan' ||
                    detailsData.trim() === '{}' ||
                    detailsData.trim() === '[]' ||
                    detailsData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (detailsData.trim().startsWith('{') || detailsData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(detailsData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Episode Title
                return [{
                    "Episode Title": String(detailsData || ''),
                    "Episode ID": "",
                    "Episode Number": "",
                    "Date Recorded": "",
                    "Short and Long-Tail SEO Keywords": "",
                    "All Asset Folder": ""
                }];
            }

            // Handle array case
            if (Array.isArray(detailsData)) {
                return detailsData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Episode Title": String(item["Episode Title"] || ''),
                            "Episode ID": String(item["Episode ID"] || ''),
                            "Episode Number": String(item["Episode Number"] || ''),
                            "Date Recorded": String(item["Date Recorded"] || ''),
                            "Short and Long-Tail SEO Keywords": String(item["Short and Long-Tail SEO Keywords"] || ''),
                            "All Asset Folder": String(item["All Asset Folder"] || '')
                        };
                    }
                    return {
                        "Episode Title": String(item || ''),
                        "Episode ID": "",
                        "Episode Number": "",
                        "Date Recorded": "",
                        "Short and Long-Tail SEO Keywords": "",
                        "All Asset Folder": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof detailsData === 'object' && detailsData !== null) {
                return [{
                    "Episode Title": String(detailsData["Episode Title"] || ''),
                    "Episode ID": String(detailsData["Episode ID"] || ''),
                    "Episode Number": String(detailsData["Episode Number"] || ''),
                    "Date Recorded": String(detailsData["Date Recorded"] || ''),
                    "Short and Long-Tail SEO Keywords": String(detailsData["Short and Long-Tail SEO Keywords"] || ''),
                    "All Asset Folder": String(detailsData["All Asset Folder"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing full episode details:', error);
            return [];
        }
    };

    const normalizeFullEpisodeVideo = (rowId) => {
        const videoData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_VIDEO;
        console.log("videoData", videoData);
        if (!videoData) return [];

        try {
            // Handle string case
            if (typeof videoData === 'string') {
                if (videoData.toLowerCase().trim() === 'nan' ||
                    videoData.trim() === '{}' ||
                    videoData.trim() === '[]' ||
                    videoData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (videoData.trim().startsWith('{') || videoData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(videoData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as YouTube URL
                return [{
                    "YouTube URL": String(videoData || ''),
                    "Video File": "",
                    "Audio File": "",
                    "Full Episode Details": ""
                }];
            }

            // Handle array case
            if (Array.isArray(videoData)) {
                return videoData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "YouTube URL": String(item["YouTube URL"] || ''),
                            "Video File": String(item["Video File"] || ''),
                            "Audio File": String(item["Audio File"] || ''),
                            "Full Episode Details": String(item["Full Episode Details"] || '')
                        };
                    }
                    return {
                        "YouTube URL": String(item || ''),
                        "Video File": "",
                        "Audio File": "",
                        "Full Episode Details": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof videoData === 'object' && videoData !== null) {
                return [{
                    "YouTube URL": String(videoData["YouTube URL"] || ''),
                    "Video File": String(videoData["Video File"] || ''),
                    "Audio File": String(videoData["Audio File"] || ''),
                    "Full Episode Details": String(videoData["Full Episode Details"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing full episode video:', error);
            return [];
        }
    };

    const normalizeFullEpisodeExtendedContent = (rowId) => {
        const contentData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_EXTENDED_CONTENT;
        console.log("contentData", contentData);
        if (!contentData) return [];

        try {
            // Handle string case
            if (typeof contentData === 'string') {
                if (contentData.toLowerCase().trim() === 'nan' ||
                    contentData.trim() === '{}' ||
                    contentData.trim() === '[]' ||
                    contentData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (contentData.trim().startsWith('{') || contentData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(contentData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Article URL
                return [{
                    "Article URL": String(contentData || ''),
                    "Article Text": "",
                    "YouTube Short Video File": "",
                    "YouTube Short URL": "",
                    "YouTube Short Transcript": "",
                    "LinkedIn Video File": "",
                    "LinkedIn Video Transcript": "",
                    "Extended Content LinkedIn Comments & Hashtags": "",
                    "Quote Card": ""
                }];
            }

            // Handle array case
            if (Array.isArray(contentData)) {
                return contentData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Article URL": String(item["Article URL"] || ''),
                            "Article Text": String(item["Article Text"] || ''),
                            "YouTube Short Video File": String(item["YouTube Short Video File"] || ''),
                            "YouTube Short URL": String(item["YouTube Short URL"] || ''),
                            "YouTube Short Transcript": String(item["YouTube Short Transcript"] || ''),
                            "LinkedIn Video File": String(item["LinkedIn Video File"] || ''),
                            "LinkedIn Video Transcript": String(item["LinkedIn Video Transcript"] || ''),
                            "Extended Content LinkedIn Comments & Hashtags": String(item["Extended Content LinkedIn Comments & Hashtags"] || ''),
                            "Quote Card": String(item["Quote Card"] || '')
                        };
                    }
                    return {
                        "Article URL": String(item || ''),
                        "Article Text": "",
                        "YouTube Short Video File": "",
                        "YouTube Short URL": "",
                        "YouTube Short Transcript": "",
                        "LinkedIn Video File": "",
                        "LinkedIn Video Transcript": "",
                        "Extended Content LinkedIn Comments & Hashtags": "",
                        "Quote Card": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof contentData === 'object' && contentData !== null) {
                return [{
                    "Article URL": String(contentData["Article URL"] || ''),
                    "Article Text": String(contentData["Article Text"] || ''),
                    "YouTube Short Video File": String(contentData["YouTube Short Video File"] || ''),
                    "YouTube Short URL": String(contentData["YouTube Short URL"] || ''),
                    "YouTube Short Transcript": String(contentData["YouTube Short Transcript"] || ''),
                    "LinkedIn Video File": String(contentData["LinkedIn Video File"] || ''),
                    "LinkedIn Video Transcript": String(contentData["LinkedIn Video Transcript"] || ''),
                    "Extended Content LinkedIn Comments & Hashtags": String(contentData["Extended Content LinkedIn Comments & Hashtags"] || ''),
                    "Quote Card": String(contentData["Quote Card"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing extended content:', error);
            return [];
        }
    };

    const normalizeFullEpisodeHighlightVideo = (rowId) => {
        const highlightData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_HIGHLIGHT_VIDEO;
        console.log("highlightData", highlightData);
        if (!highlightData) return [];

        try {
            // Handle string case
            if (typeof highlightData === 'string') {
                if (highlightData.toLowerCase().trim() === 'nan' ||
                    highlightData.trim() === '{}' ||
                    highlightData.trim() === '[]' ||
                    highlightData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (highlightData.trim().startsWith('{') || highlightData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(highlightData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as YouTube URL
                return [{
                    "YouTube URL": String(highlightData || ''),
                    "Video File": "",
                    "Transcript": "",
                    "Highlights Video Details": ""
                }];
            }

            // Handle array case
            if (Array.isArray(highlightData)) {
                return highlightData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "YouTube URL": String(item["YouTube URL"] || ''),
                            "Video File": String(item["Video File"] || ''),
                            "Transcript": String(item["Transcript"] || ''),
                            "Highlights Video Details": String(item["Highlights Video Details"] || '')
                        };
                    }
                    return {
                        "YouTube URL": String(item || ''),
                        "Video File": "",
                        "Transcript": "",
                        "Highlights Video Details": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof highlightData === 'object' && highlightData !== null) {
                return [{
                    "YouTube URL": String(highlightData["YouTube URL"] || ''),
                    "Video File": String(highlightData["Video File"] || ''),
                    "Transcript": String(highlightData["Transcript"] || ''),
                    "Highlights Video Details": String(highlightData["Highlights Video Details"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing highlight video:', error);
            return [];
        }
    };

    const normalizeFullEpisodeIntroductionVideo = (rowId) => {
        const introData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_INTRODUCTION_VIDEO;
        console.log("introData", introData);
        if (!introData) return [];

        try {
            // Handle string case
            if (typeof introData === 'string') {
                if (introData.toLowerCase().trim() === 'nan' ||
                    introData.trim() === '{}' ||
                    introData.trim() === '[]' ||
                    introData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (introData.trim().startsWith('{') || introData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(introData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as YouTube URL
                return [{
                    "YouTube URL": String(introData || ''),
                    "Video File": "",
                    "Transcript": "",
                    "Instruction Video Details": ""
                }];
            }

            // Handle array case
            if (Array.isArray(introData)) {
                return introData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "YouTube URL": String(item["YouTube URL"] || ''),
                            "Video File": String(item["Video File"] || ''),
                            "Transcript": String(item["Transcript"] || ''),
                            "Instruction Video Details": String(item["Instruction Video Details"] || '')
                        };
                    }
                    return {
                        "YouTube URL": String(item || ''),
                        "Video File": "",
                        "Transcript": "",
                        "Instruction Video Details": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof introData === 'object' && introData !== null) {
                return [{
                    "YouTube URL": String(introData["YouTube URL"] || ''),
                    "Video File": String(introData["Video File"] || ''),
                    "Transcript": String(introData["Transcript"] || ''),
                    "Instruction Video Details": String(introData["Instruction Video Details"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing introduction video:', error);
            return [];
        }
    };

    const normalizeFullEpisodeQAVideos = (rowId) => {
        const qaData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_QA_VIDEOS;
        console.log("qaData", qaData);
        if (!qaData) return [];

        try {
            // Handle string case
            if (typeof qaData === 'string') {
                if (qaData.toLowerCase().trim() === 'nan' ||
                    qaData.trim() === '{}' ||
                    qaData.trim() === '[]' ||
                    qaData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (qaData.trim().startsWith('{') || qaData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(qaData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as QAV1 YouTube URL
                return [{
                    "QAV1 YouTube URL": String(qaData || ''),
                    "QAV1 Video File": "",
                    "QAV1 Transcript": "",
                    "QAV1 QA Video Details": "",
                    "Extended Content Article URL": "",
                    "Extended Content Article Text": "",
                    "Extended Content YouTube Short Video File": "",
                    "Extended Content YouTube Short URL": "",
                    "Extended Content YouTube Short Transcript": "",
                    "Extended Content LinkedIn Video File": "",
                    "Extended Content LinkedIn Video Transcript": "",
                    "QA Video LinkedIn Comments & Hashtags": "",
                    "Quote Card": ""
                }];
            }

            // Handle array case
            if (Array.isArray(qaData)) {
                return qaData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "QAV1 YouTube URL": String(item["QAV1 YouTube URL"] || ''),
                            "QAV1 Video File": String(item["QAV1 Video File"] || ''),
                            "QAV1 Transcript": String(item["QAV1 Transcript"] || ''),
                            "QAV1 QA Video Details": String(item["QAV1 QA Video Details"] || ''),
                            "Extended Content Article URL": String(item["Extended Content Article URL"] || ''),
                            "Extended Content Article Text": String(item["Extended Content Article Text"] || ''),
                            "Extended Content YouTube Short Video File": String(item["Extended Content YouTube Short Video File"] || ''),
                            "Extended Content YouTube Short URL": String(item["Extended Content YouTube Short URL"] || ''),
                            "Extended Content YouTube Short Transcript": String(item["Extended Content YouTube Short Transcript"] || ''),
                            "Extended Content LinkedIn Video File": String(item["Extended Content LinkedIn Video File"] || ''),
                            "Extended Content LinkedIn Video Transcript": String(item["Extended Content LinkedIn Video Transcript"] || ''),
                            "QA Video LinkedIn Comments & Hashtags": String(item["QA Video LinkedIn Comments & Hashtags"] || ''),
                            "Quote Card": String(item["Quote Card"] || '')
                        };
                    }
                    return {
                        "QAV1 YouTube URL": String(item || ''),
                        "QAV1 Video File": "",
                        "QAV1 Transcript": "",
                        "QAV1 QA Video Details": "",
                        "Extended Content Article URL": "",
                        "Extended Content Article Text": "",
                        "Extended Content YouTube Short Video File": "",
                        "Extended Content YouTube Short URL": "",
                        "Extended Content YouTube Short Transcript": "",
                        "Extended Content LinkedIn Video File": "",
                        "Extended Content LinkedIn Video Transcript": "",
                        "QA Video LinkedIn Comments & Hashtags": "",
                        "Quote Card": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof qaData === 'object' && qaData !== null) {
                return [{
                    "QAV1 YouTube URL": String(qaData["QAV1 YouTube URL"] || ''),
                    "QAV1 Video File": String(qaData["QAV1 Video File"] || ''),
                    "QAV1 Transcript": String(qaData["QAV1 Transcript"] || ''),
                    "QAV1 QA Video Details": String(qaData["QAV1 QA Video Details"] || ''),
                    "Extended Content Article URL": String(qaData["Extended Content Article URL"] || ''),
                    "Extended Content Article Text": String(qaData["Extended Content Article Text"] || ''),
                    "Extended Content YouTube Short Video File": String(qaData["Extended Content YouTube Short Video File"] || ''),
                    "Extended Content YouTube Short URL": String(qaData["Extended Content YouTube Short URL"] || ''),
                    "Extended Content YouTube Short Transcript": String(qaData["Extended Content YouTube Short Transcript"] || ''),
                    "Extended Content LinkedIn Video File": String(qaData["Extended Content LinkedIn Video File"] || ''),
                    "Extended Content LinkedIn Video Transcript": String(qaData["Extended Content LinkedIn Video Transcript"] || ''),
                    "QA Video LinkedIn Comments & Hashtags": String(qaData["QA Video LinkedIn Comments & Hashtags"] || ''),
                    "Quote Card": String(qaData["Quote Card"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing QA videos:', error);
            return [];
        }
    };

    const normalizeFullEpisodePodbook = (rowId) => {
        const podbookData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_PODBOOK;
        console.log("podbookData", podbookData);
        if (!podbookData) return [];

        try {
            // Handle string case
            if (typeof podbookData === 'string') {
                if (podbookData.toLowerCase().trim() === 'nan' ||
                    podbookData.trim() === '{}' ||
                    podbookData.trim() === '[]' ||
                    podbookData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (podbookData.trim().startsWith('{') || podbookData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(podbookData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Website URL
                return [{
                    "Website URL": String(podbookData || ''),
                    "Interactive Experience": "",
                    "Embed Code": "",
                    "Loom Folder": ""
                }];
            }

            // Handle array case
            if (Array.isArray(podbookData)) {
                return podbookData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Website URL": String(item["Website URL"] || ''),
                            "Interactive Experience": String(item["Interactive Experience"] || ''),
                            "Embed Code": String(item["Embed Code"] || ''),
                            "Loom Folder": String(item["Loom Folder"] || '')
                        };
                    }
                    return {
                        "Website URL": String(item || ''),
                        "Interactive Experience": "",
                        "Embed Code": "",
                        "Loom Folder": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof podbookData === 'object' && podbookData !== null) {
                return [{
                    "Website URL": String(podbookData["Website URL"] || ''),
                    "Interactive Experience": String(podbookData["Interactive Experience"] || ''),
                    "Embed Code": String(podbookData["Embed Code"] || ''),
                    "Loom Folder": String(podbookData["Loom Folder"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing podbook:', error);
            return [];
        }
    };

    const normalizeFullEpisodeFullCaseStudy = (rowId) => {
        const caseStudyData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_FULL_CASE_STUDY;
        console.log("caseStudyData", caseStudyData);
        if (!caseStudyData) return [];

        try {
            // Handle string case
            if (typeof caseStudyData === 'string') {
                if (caseStudyData.toLowerCase().trim() === 'nan' ||
                    caseStudyData.trim() === '{}' ||
                    caseStudyData.trim() === '[]' ||
                    caseStudyData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (caseStudyData.trim().startsWith('{') || caseStudyData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(caseStudyData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Case Study Text
                return [{
                    "Case Study Text": String(caseStudyData || ''),
                    "Interactive Experience": "",
                    "Sales Email": "",
                    "Problem Section Video": "",
                    "Problem Section Video Length": "",
                    "Problem Section Video Transcript": "",
                    "Solutions Section Video": "",
                    "Solutions Section Video Length": "",
                    "Solutions Section Video Transcript": "",
                    "Results Section Video": "",
                    "Results Section Video Length": "",
                    "Results Section Video Transcript": ""
                }];
            }

            // Handle array case
            if (Array.isArray(caseStudyData)) {
                return caseStudyData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Case Study Text": String(item["Case Study Text"] || ''),
                            "Interactive Experience": String(item["Interactive Experience"] || ''),
                            "Sales Email": String(item["Sales Email"] || ''),
                            "Problem Section Video": String(item["Problem Section Video"] || ''),
                            "Problem Section Video Length": String(item["Problem Section Video Length"] || ''),
                            "Problem Section Video Transcript": String(item["Problem Section Video Transcript"] || ''),
                            "Solutions Section Video": String(item["Solutions Section Video"] || ''),
                            "Solutions Section Video Length": String(item["Solutions Section Video Length"] || ''),
                            "Solutions Section Video Transcript": String(item["Solutions Section Video Transcript"] || ''),
                            "Results Section Video": String(item["Results Section Video"] || ''),
                            "Results Section Video Length": String(item["Results Section Video Length"] || ''),
                            "Results Section Video Transcript": String(item["Results Section Video Transcript"] || '')
                        };
                    }
                    return {
                        "Case Study Text": String(item || ''),
                        "Interactive Experience": "",
                        "Sales Email": "",
                        "Problem Section Video": "",
                        "Problem Section Video Length": "",
                        "Problem Section Video Transcript": "",
                        "Solutions Section Video": "",
                        "Solutions Section Video Length": "",
                        "Solutions Section Video Transcript": "",
                        "Results Section Video": "",
                        "Results Section Video Length": "",
                        "Results Section Video Transcript": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof caseStudyData === 'object' && caseStudyData !== null) {
                return [{
                    "Case Study Text": String(caseStudyData["Case Study Text"] || ''),
                    "Interactive Experience": String(caseStudyData["Interactive Experience"] || ''),
                    "Sales Email": String(caseStudyData["Sales Email"] || ''),
                    "Problem Section Video": String(caseStudyData["Problem Section Video"] || ''),
                    "Problem Section Video Length": String(caseStudyData["Problem Section Video Length"] || ''),
                    "Problem Section Video Transcript": String(caseStudyData["Problem Section Video Transcript"] || ''),
                    "Solutions Section Video": String(caseStudyData["Solutions Section Video"] || ''),
                    "Solutions Section Video Length": String(caseStudyData["Solutions Section Video Length"] || ''),
                    "Solutions Section Video Transcript": String(caseStudyData["Solutions Section Video Transcript"] || ''),
                    "Results Section Video": String(caseStudyData["Results Section Video"] || ''),
                    "Results Section Video Length": String(caseStudyData["Results Section Video Length"] || ''),
                    "Results Section Video Transcript": String(caseStudyData["Results Section Video Transcript"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing full case study:', error);
            return [];
        }
    };

    const normalizeFullEpisodeOnePageCaseStudy = (rowId) => {
        const caseStudyData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_ONE_PAGE_CASE_STUDY;
        console.log("caseStudyData", caseStudyData);
        if (!caseStudyData) return [];

        try {
            // Handle string case
            if (typeof caseStudyData === 'string') {
                if (caseStudyData.toLowerCase().trim() === 'nan' ||
                    caseStudyData.trim() === '{}' ||
                    caseStudyData.trim() === '[]' ||
                    caseStudyData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (caseStudyData.trim().startsWith('{') || caseStudyData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(caseStudyData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as One Page Text
                return [{
                    "One Page Text": String(caseStudyData || ''),
                    "Interactive Experience": "",
                    "Sales Email": "",
                    "One Page Video": "",
                    "Length": "",
                    "Transcript": ""
                }];
            }

            // Handle array case
            if (Array.isArray(caseStudyData)) {
                return caseStudyData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "One Page Text": String(item["One Page Text"] || ''),
                            "Interactive Experience": String(item["Interactive Experience"] || ''),
                            "Sales Email": String(item["Sales Email"] || ''),
                            "One Page Video": String(item["One Page Video"] || ''),
                            "Length": String(item["Length"] || ''),
                            "Transcript": String(item["Transcript"] || '')
                        };
                    }
                    return {
                        "One Page Text": String(item || ''),
                        "Interactive Experience": "",
                        "Sales Email": "",
                        "One Page Video": "",
                        "Length": "",
                        "Transcript": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof caseStudyData === 'object' && caseStudyData !== null) {
                return [{
                    "One Page Text": String(caseStudyData["One Page Text"] || ''),
                    "Interactive Experience": String(caseStudyData["Interactive Experience"] || ''),
                    "Sales Email": String(caseStudyData["Sales Email"] || ''),
                    "One Page Video": String(caseStudyData["One Page Video"] || ''),
                    "Length": String(caseStudyData["Length"] || ''),
                    "Transcript": String(caseStudyData["Transcript"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing one page case study:', error);
            return [];
        }
    };

    const normalizeFullEpisodeOtherCaseStudy = (rowId) => {
        const caseStudyData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_OTHER_CASE_STUDY;
        console.log("caseStudyData", caseStudyData);
        if (!caseStudyData) return [];

        try {
            // Handle string case
            if (typeof caseStudyData === 'string') {
                if (caseStudyData.toLowerCase().trim() === 'nan' ||
                    caseStudyData.trim() === '{}' ||
                    caseStudyData.trim() === '[]' ||
                    caseStudyData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (caseStudyData.trim().startsWith('{') || caseStudyData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(caseStudyData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Case Study Text
                return [{
                    "Case Study Text": String(caseStudyData || ''),
                    "Other Case Study Interactive Experience": "",
                    "Sales Email": "",
                    "Other Case Study Video": "",
                    "Other Case Study Video Length": "",
                    "Other Case Study Video Transcript": ""
                }];
            }

            // Handle array case
            if (Array.isArray(caseStudyData)) {
                return caseStudyData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Case Study Text": String(item["Case Study Text"] || ''),
                            "Other Case Study Interactive Experience": String(item["Other Case Study Interactive Experience"] || ''),
                            "Sales Email": String(item["Sales Email"] || ''),
                            "Other Case Study Video": String(item["Other Case Study Video"] || ''),
                            "Other Case Study Video Length": String(item["Other Case Study Video Length"] || ''),
                            "Other Case Study Video Transcript": String(item["Other Case Study Video Transcript"] || '')
                        };
                    }
                    return {
                        "Case Study Text": String(item || ''),
                        "Other Case Study Interactive Experience": "",
                        "Sales Email": "",
                        "Other Case Study Video": "",
                        "Other Case Study Video Length": "",
                        "Other Case Study Video Transcript": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof caseStudyData === 'object' && caseStudyData !== null) {
                return [{
                    "Case Study Text": String(caseStudyData["Case Study Text"] || ''),
                    "Other Case Study Interactive Experience": String(caseStudyData["Other Case Study Interactive Experience"] || ''),
                    "Sales Email": String(caseStudyData["Sales Email"] || ''),
                    "Other Case Study Video": String(caseStudyData["Other Case Study Video"] || ''),
                    "Other Case Study Video Length": String(caseStudyData["Other Case Study Video Length"] || ''),
                    "Other Case Study Video Transcript": String(caseStudyData["Other Case Study Video Transcript"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing other case study:', error);
            return [];
        }
    };

    const normalizeFullEpisodeICPAdvice = (rowId) => {
        const adviceData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_ICP_ADVICE;
        console.log("adviceData", adviceData);
        if (!adviceData) return [];

        try {
            // Handle string case
            if (typeof adviceData === 'string') {
                if (adviceData.toLowerCase().trim() === 'nan' ||
                    adviceData.trim() === '{}' ||
                    adviceData.trim() === '[]' ||
                    adviceData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (adviceData.trim().startsWith('{') || adviceData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(adviceData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Post-Podcast Video
                return [{
                    "Post-Podcast Video": String(adviceData || ''),
                    "Unedited Post-Podcast Video Length": "",
                    "Unedited Post-Podcast Transcript": "",
                    "Post-Podcast Insights Report": "",
                    "Post-Podcast Vision Report": ""
                }];
            }

            // Handle array case
            if (Array.isArray(adviceData)) {
                return adviceData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Post-Podcast Video": String(item["Post-Podcast Video"] || ''),
                            "Unedited Post-Podcast Video Length": String(item["Unedited Post-Podcast Video Length"] || ''),
                            "Unedited Post-Podcast Transcript": String(item["Unedited Post-Podcast Transcript"] || ''),
                            "Post-Podcast Insights Report": String(item["Post-Podcast Insights Report"] || ''),
                            "Post-Podcast Vision Report": String(item["Post-Podcast Vision Report"] || '')
                        };
                    }
                    return {
                        "Post-Podcast Video": String(item || ''),
                        "Unedited Post-Podcast Video Length": "",
                        "Unedited Post-Podcast Transcript": "",
                        "Post-Podcast Insights Report": "",
                        "Post-Podcast Vision Report": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof adviceData === 'object' && adviceData !== null) {
                return [{
                    "Post-Podcast Video": String(adviceData["Post-Podcast Video"] || ''),
                    "Unedited Post-Podcast Video Length": String(adviceData["Unedited Post-Podcast Video Length"] || ''),
                    "Unedited Post-Podcast Transcript": String(adviceData["Unedited Post-Podcast Transcript"] || ''),
                    "Post-Podcast Insights Report": String(adviceData["Post-Podcast Insights Report"] || ''),
                    "Post-Podcast Vision Report": String(adviceData["Post-Podcast Vision Report"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing ICP advice:', error);
            return [];
        }
    };


    const normalizeFullEpisodeChallengeQuestions = (rowId) => {
        const challengeData = themesRank?.find(item => item.id === rowId)?.FULL_EPISODE_CHALLENGE_QUESTIONS;
        console.log("challengeData", challengeData);
        if (!challengeData) return [];

        try {
            // Handle string case
            if (typeof challengeData === 'string') {
                if (challengeData.toLowerCase().trim() === 'nan' ||
                    challengeData.trim() === '{}' ||
                    challengeData.trim() === '[]' ||
                    challengeData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (challengeData.trim().startsWith('{') || challengeData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(challengeData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Unedited Challenge Question Video
                return [{
                    "Unedited Challenge Question Video": String(challengeData || ''),
                    "Unedited Challenge Question Video Length": "",
                    "Unedited Challenge Question Transcript": "",
                    "Challenge Report": ""
                }];
            }

            // Handle array case
            if (Array.isArray(challengeData)) {
                return challengeData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Unedited Challenge Question Video": String(item["Unedited Challenge Question Video"] || ''),
                            "Unedited Challenge Question Video Length": String(item["Unedited Challenge Question Video Length"] || ''),
                            "Unedited Challenge Question Transcript": String(item["Unedited Challenge Question Transcript"] || ''),
                            "Challenge Report": String(item["Challenge Report"] || '')
                        };
                    }
                    return {
                        "Unedited Challenge Question Video": String(item || ''),
                        "Unedited Challenge Question Video Length": "",
                        "Unedited Challenge Question Transcript": "",
                        "Challenge Report": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof challengeData === 'object' && challengeData !== null) {
                return [{
                    "Unedited Challenge Question Video": String(challengeData["Unedited Challenge Question Video"] || ''),
                    "Unedited Challenge Question Video Length": String(challengeData["Unedited Challenge Question Video Length"] || ''),
                    "Unedited Challenge Question Transcript": String(challengeData["Unedited Challenge Question Transcript"] || ''),
                    "Challenge Report": String(challengeData["Challenge Report"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing challenge questions:', error);
            return [];
        }
    };

    const normalizeIcpAdviceReport = (rowId) => {
        const icpData = themesRank?.find(item => item.id === rowId)?.ICP_Advice_Report;
        console.log("icpData", icpData);
        if (!icpData) return [];

        try {
            // Handle string case
            if (typeof icpData === 'string') {
                if (icpData.toLowerCase().trim() === 'nan' ||
                    icpData.trim() === '{}' ||
                    icpData.trim() === '[]' ||
                    icpData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (icpData.trim().startsWith('{') || icpData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(icpData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Report URL
                return [{
                    "ICP Advice Post-Podcast Video File": "",
                    "ICP Advice Post-Podcast Video Length": "",
                    "ICP Advice Post-Podcast Video Transcript": "",
                    "ICP Advice Report": String(icpData || ''),
                    "VoC FILE": ""
                }];
            }

            // Handle array case
            if (Array.isArray(icpData)) {
                return icpData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "ICP Advice Post-Podcast Video File": String(item["ICP Advice Post-Podcast Video File"] || ''),
                            "ICP Advice Post-Podcast Video Length": String(item["ICP Advice Post-Podcast Video Length"] || ''),
                            "ICP Advice Post-Podcast Video Transcript": String(item["ICP Advice Post-Podcast Video Transcript"] || ''),
                            "ICP Advice Report": String(item["ICP Advice Report"] || ''),
                            "VoC FILE": String(item["VoC FILE"] || '')
                        };
                    }
                    return {
                        "ICP Advice Post-Podcast Video File": "",
                        "ICP Advice Post-Podcast Video Length": "",
                        "ICP Advice Post-Podcast Video Transcript": "",
                        "ICP Advice Report": String(item || ''),
                        "VoC FILE": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof icpData === 'object' && icpData !== null) {
                return [{
                    "ICP Advice Post-Podcast Video File": String(icpData["ICP Advice Post-Podcast Video File"] || ''),
                    "ICP Advice Post-Podcast Video Length": String(icpData["ICP Advice Post-Podcast Video Length"] || ''),
                    "ICP Advice Post-Podcast Video Transcript": String(icpData["ICP Advice Post-Podcast Video Transcript"] || ''),
                    "ICP Advice Report": String(icpData["ICP Advice Report"] || ''),
                    "VoC FILE": String(icpData["VoC FILE"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing ICP advice report:', error);
            return [];
        }
    };

    const normalizeSqlAnalysisReport = (rowId) => {
        const sqlData = themesRank?.find(item => item.id === rowId)?.SQL_Analysis_Report;
        console.log("sqlData", sqlData);
        if (!sqlData) return [];

        try {
            // Handle string case
            if (typeof sqlData === 'string') {
                if (sqlData.toLowerCase().trim() === 'nan' ||
                    sqlData.trim() === '{}' ||
                    sqlData.trim() === '[]' ||
                    sqlData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (sqlData.trim().startsWith('{') || sqlData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(sqlData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Report URL
                return [{
                    "SQL Analysis Post-Podcast Video File": "",
                    "SQL Analysis Post-Podcast Video Length": "",
                    "SQL Analysis Post-Podcast Video Transcript": "",
                    "SQL Analysis Report": String(sqlData || ''),
                    "VoC FILE": ""
                }];
            }

            // Handle array case
            if (Array.isArray(sqlData)) {
                return sqlData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "SQL Analysis Post-Podcast Video File": String(item["SQL Analysis Post-Podcast Video File"] || ''),
                            "SQL Analysis Post-Podcast Video Length": String(item["SQL Analysis Post-Podcast Video Length"] || ''),
                            "SQL Analysis Post-Podcast Video Transcript": String(item["SQL Analysis Post-Podcast Video Transcript"] || ''),
                            "SQL Analysis Report": String(item["SQL Analysis Report"] || ''),
                            "VoC FILE": String(item["VoC FILE"] || '')
                        };
                    }
                    return {
                        "SQL Analysis Post-Podcast Video File": "",
                        "SQL Analysis Post-Podcast Video Length": "",
                        "SQL Analysis Post-Podcast Video Transcript": "",
                        "SQL Analysis Report": String(item || ''),
                        "VoC FILE": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof sqlData === 'object' && sqlData !== null) {
                return [{
                    "SQL Analysis Post-Podcast Video File": String(sqlData["SQL Analysis Post-Podcast Video File"] || ''),
                    "SQL Analysis Post-Podcast Video Length": String(sqlData["SQL Analysis Post-Podcast Video Length"] || ''),
                    "SQL Analysis Post-Podcast Video Transcript": String(sqlData["SQL Analysis Post-Podcast Video Transcript"] || ''),
                    "SQL Analysis Report": String(sqlData["SQL Analysis Report"] || ''),
                    "VoC FILE": String(sqlData["VoC FILE"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing SQL analysis report:', error);
            return [];
        }
    };

    const normalizeChallengeQuestions = (rowId) => {
        const challengeData = themesRank?.find(item => item.id === rowId)?.Challenge_Questions;
        console.log("challengeData", challengeData);
        if (!challengeData) return [];

        try {
            // Handle string case
            if (typeof challengeData === 'string') {
                if (challengeData.toLowerCase().trim() === 'nan' ||
                    challengeData.trim() === '{}' ||
                    challengeData.trim() === '[]' ||
                    challengeData.trim() === '') {
                    return [];
                }

                // Try to parse as JSON
                if (challengeData.trim().startsWith('{') || challengeData.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(challengeData);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        return [];
                    }
                }

                // If plain string, treat as Report URL
                return [{
                    "Challenge Questions Prep Call Video File": "",
                    "Challenge Questions Prep Call Video Length": "",
                    "Challenge Questions Prep Call Video Transcript": "",
                    "Challenge Questions Report": String(challengeData || ''),
                    "VoC FILE": ""
                }];
            }

            // Handle array case
            if (Array.isArray(challengeData)) {
                return challengeData.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            "Challenge Questions Prep Call Video File": String(item["Challenge Questions Prep Call Video File"] || ''),
                            "Challenge Questions Prep Call Video Length": String(item["Challenge Questions Prep Call Video Length"] || ''),
                            "Challenge Questions Prep Call Video Transcript": String(item["Challenge Questions Prep Call Video Transcript"] || ''),
                            "Challenge Questions Report": String(item["Challenge Questions Report"] || ''),
                            "VoC FILE": String(item["VoC FILE"] || '')
                        };
                    }
                    return {
                        "Challenge Questions Prep Call Video File": "",
                        "Challenge Questions Prep Call Video Length": "",
                        "Challenge Questions Prep Call Video Transcript": "",
                        "Challenge Questions Report": String(item || ''),
                        "VoC FILE": ""
                    };
                }).filter(Boolean);
            }

            // Handle object case
            if (typeof challengeData === 'object' && challengeData !== null) {
                return [{
                    "Challenge Questions Prep Call Video File": String(challengeData["Challenge Questions Prep Call Video File"] || ''),
                    "Challenge Questions Prep Call Video Length": String(challengeData["Challenge Questions Prep Call Video Length"] || ''),
                    "Challenge Questions Prep Call Video Transcript": String(challengeData["Challenge Questions Prep Call Video Transcript"] || ''),
                    "Challenge Questions Report": String(challengeData["Challenge Questions Report"] || ''),
                    "VoC FILE": String(challengeData["VoC FILE"] || '')
                }];
            }

            return [];
        } catch (error) {
            console.error('Error normalizing challenge questions:', error);
            return [];
        }
    };
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="overflow-x-auto  relative no-scrollbar"
                style={{
                    height: 'calc(100vh - 18rem)',
                    minHeight: '490px',
                    maxHeight: '750px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #4B5563',
                    borderRadius: '10px'
                }}
            >
                <table className="min-w-full divide-y  divide-gray-300">

                    <thead className="bg-[#1a1b41] sticky top-0 z-10">
                        <tr>
                            {columns.map((column, index) => (
                                <DraggableHeader key={column.id} column={column} index={index} moveColumn={moveColumn} />
                            ))}
                        </tr>

                    </thead>

                    <tbody className=" text-white divide-y divide-gray-600">

                        {!loading && data?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showActions ? 1 : 0)}
                                    className="py-6 text-center"
                                >
                                    <div
                                        className={` ${alignRecord ? 'fixed top-3/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50' : 'fixed top-3/2 left-1/2 transform translate-x-1/2 -translate-y-1/2 z-50'
                                            }`}
                                    >
                                        <p className="text-gray-500 text-center">No record found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            !loading && data?.length > 0 && data?.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`h-12 bg-white/10 group cursor-pointer px-6 py-4 divide-y divide-gray-600 text-sm hover:bg-white/10 relative
                                
                                    `}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.id}
                                            className={`
                                       px-6 py-1 text-sm divide-y divide-gray-600 whitespace-nowrap
                                       ${['Objections', 'Tags', 'Themes', 'Guest', 'Validations', 'Challenges', 'Sales Insights', 'Case_Study_Other_Video', 'Video Type'].includes(column.label)
                                                    ? `w-auto max-w-max`
                                                    : 'max-w-[250px] overflow-hidden text-ellipsis'
                                                }
                                                ${(column.id === 'Avatar') ? 'sticky left-0 px-4 z-25 bg-[#1a1b41]' : ''}
                                                ${(column.id === 'file_type_icon') ? 'sticky left-0 px-4 z-25 bg-[#1a1b41]' : ''}
                                                ${(column.id === 'company_specific') ? 'left-0  px-6 z-25' : ''}
                                                ${(column.id === 'thumbnail') ? 'sticky left-0  px-6  z-25 bg-[#1a1b41]' : ''}
                                                ${column.id === 'file_name' ? 'sticky left-[130px] w-[200px]  px-6 bg-[#1a1b41]' : ''}
                                                ${column.id === 'Guest' ? 'sticky left-[125px]  px-6  bg-[#1a1b41]' : ''}
                                                
                                     `}>

                                            {/* Show avatar overlapping in table */}
                                            {column.id === "Avatar" ? (
                                                <div className="flex items-center">
                                                    {/* Add new content from this row */}
                                                    {/* {!isEndUser && (
                                                        <button
                                                            onClick={() => handleAddFromRow(row)}
                                                            className="text-blue-500 mr-2"
                                                            title="Create new content from this row"
                                                        >
                                                            <FaPlus size={18} />
                                                        </button>
                                                    )} */}

                                                    {/* Expand Icon Before Avatar */}
                                                    <button
                                                        onClick={() => setSelectedRow(row)}
                                                        className="text-blue-500 mr-2"
                                                    >
                                                        <FaExpandAlt size={18} />
                                                    </button>

                                                    {/* Handle both formats */}
                                                    {(Array.isArray(row.Guest) || (typeof row.Guest === 'string' && row.Guest.startsWith('['))) ? (
                                                        // JSON array format
                                                        (() => {
                                                            let avatars = [];
                                                            try {
                                                                avatars = Array.isArray(row.Avatar)
                                                                    ? row.Avatar
                                                                    : (typeof row.Avatar === 'string' && row.Avatar.startsWith('['))
                                                                        ? JSON.parse(row.Avatar || '[]')
                                                                        : row.Avatar
                                                                            ? [row.Avatar]
                                                                            : [];
                                                            } catch (e) {
                                                                console.error("Error parsing avatars:", e);
                                                            }

                                                            return (
                                                                <div
                                                                    className="flex items-center cursor-pointer"
                                                                    onClick={() => {
                                                                        try {
                                                                            const guests = Array.isArray(row.Guest)
                                                                                ? row.Guest
                                                                                : JSON.parse(row.Guest || '[]');
                                                                            const parsedAvatars = avatars;

                                                                            const guestData = guests.map((guest, index) => ({
                                                                                ...(typeof guest === 'string' ? { Guest: guest } : guest),
                                                                                Avatar: parsedAvatars[index] || null
                                                                            }));

                                                                            setSelectedGuests(guestData);
                                                                        } catch (e) {
                                                                            console.error("Error parsing guest data:", e);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex -space-x-3">
                                                                        {avatars.slice(0, 2).map((avatar, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="relative"
                                                                                style={{ zIndex: 10 - idx }}
                                                                            >
                                                                                <img
                                                                                    src={avatar || "/default-avatar.png"}
                                                                                    alt="Guest Avatar"
                                                                                    className="w-10 h-10 rounded-full object-cover border-[1px] border-white"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                        {avatars.length > 2 && (
                                                                            <div
                                                                                className="relative"
                                                                                style={{ zIndex: 0 }}
                                                                            >
                                                                                <div className="ml-2">
                                                                                    <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#1a1b41] flex items-center justify-center text-[10px] font-bold">
                                                                                        +{avatars.length - 2}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        // Separate columns format
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                const guestData = {
                                                                    Avatar: row.Avatar,
                                                                    Persona: row.Persona,
                                                                    Guest: row.Guest,
                                                                    "Guest Title": row["Guest Title"],
                                                                    "Guest Company": row["Guest Company"],
                                                                    "Guest Company": row["Guest Company"],
                                                                    "Guest Industry": row["Guest Industry"]
                                                                };
                                                                setSelectedGuests([guestData]);
                                                            }}
                                                        >
                                                            <img
                                                                src={row[column.id] || "/default-avatar.png"}
                                                                alt="User Avatar"
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : column.id === "Guest" ? (
                                                <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar whitespace-nowrap max-w-xs">
                                                    {(Array.isArray(row.Guest) || (typeof row.Guest === "string" && row.Guest.startsWith("[")))
                                                        ? (Array.isArray(row.Guest) ? row.Guest : JSON.parse(row.Guest || "[]")).map((guest, idx) => {
                                                            const guestName = typeof guest === "object" ? guest.Guest : guest; // ✅ Extract "Guest"
                                                            return (
                                                                guestName && (
                                                                    <span
                                                                        key={idx}
                                                                        className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getRandomColor()}`}
                                                                    >
                                                                        {guestName ? guestName : "-"}
                                                                    </span>
                                                                )
                                                            );
                                                        })
                                                        : row.Guest && (
                                                            <span
                                                                className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getRandomColor()}`}
                                                            >
                                                                {row.Guest ? row.Guest : "-"}
                                                            </span>
                                                        )}
                                                </div>
                                            ) : column.id === "Prep_Call" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const prepCallData = normalizePrepCalls(row.id);
                                                        const hasPrepCalls = prepCallData.some(prepCall => {
                                                            if (!prepCall) return false;
                                                            const hasVideo = prepCall["Unedited Prep Call Video"]?.trim();
                                                            const hasTranscript = prepCall["Unedited Prep Call Transcript"]?.trim();
                                                            const hasGuide = prepCall["Discussion Guide"]?.trim();
                                                            return hasVideo || hasTranscript || hasGuide;
                                                        });

                                                        return hasPrepCalls ? (
                                                            <span
                                                                onClick={() => setSelectedPrepCalls(prepCallData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                                                            >
                                                                View Prep Call
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "Additional_Guest_Projects" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const projectsData = normalizeGuestProjects(row.id);
                                                        const hasAdditionalGuestProjects = projectsData.some(project => {
                                                            if (!project) return false;
                                                            const hasPodcast = project["Podcast"]?.trim();
                                                            const hasEBook = project["eBooks"]?.trim();
                                                            const hasArticle = project["Articles"]?.trim();
                                                            const hasOther = project["Other"]?.trim();
                                                            return hasPodcast || hasEBook || hasArticle || hasOther;
                                                        });

                                                        return hasAdditionalGuestProjects ? (
                                                            <span
                                                                onClick={() => setSelectedGuestProjects(projectsData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer transition-colors"
                                                            >
                                                                View Additional Guest Projects
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "Emails" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const emailData = normalizeEmails(row.id);
                                                        const hasEmails = emailData.some(email => {
                                                            if (!email) return false;
                                                            const hasGuest = email["Guest"]?.trim();
                                                            const hasCold = email["Cold"]?.trim();
                                                            const hasWarm = email["Warm"]?.trim();
                                                            return hasGuest || hasCold || hasWarm;
                                                        });

                                                        return hasEmails ? (
                                                            <span
                                                                onClick={() => setSelectedEmails(emailData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Emails
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "file_type_icon" ? (

                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => setFileRow(row)}
                                                        className="text-blue-500 hover:text-blue-700 mr-2 transition-colors"
                                                        title="Expand preview"
                                                    >
                                                        <FaExpandAlt size={18} />
                                                    </button>
                                                    {column.render ? column.render(row) : row[column.id] ?? "-"}
                                                </div>
                                            ) : column.id === "Guest" ? (
                                                <div className="flex gap-1">

                                                    {column.render ? column.render(row) : row[column.id] ?? "-"}
                                                </div>
                                            ) : column.id === "Category" ? (
                                                <div className="flex gap-1">

                                                    {column.render ? column.render(row) : row[column.id] ?? "-"}
                                                </div>
                                            ) : column.id === "Description" || column.id === "description" ? (
                                                <Tooltip content={column.render ? column.render(row) : row[column.id] ?? "-"}>
                                                    <div className="line-clamp-2 truncate">
                                                        {column.render ? column.render(row) : row[column.id] ?? "-"}
                                                    </div>
                                                </Tooltip>


                                            ) : column.id === "Formate" ? (
                                                <div className="flex gap-1">

                                                    {column.render ? column.render(row) : row[column.id] ?? "-"}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_VIDEO" ? (
                                                <div className="flex gap-1">
                                                    {/* {(() => {
                                                        const videoData = normalizeFullEpisodeVideo(row.id);
                                                        const hasVideo = videoData.some(video => {
                                                            if (!video) return false;
                                                            const hasVideoFile = video["Video File"]?.trim();
                                                            const hasAudioFile = video["Audio File"]?.trim();
                                                            const hasYouTubeURL = video["YouTube URL"]?.trim();
                                                            const hasDetails = video["Full Episode Details"]?.trim();
                                                            return hasVideoFile || hasAudioFile || hasYouTubeURL || hasDetails;
                                                        });
                                                        return hasVideo ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeVideo(videoData[0])}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Videos
                                                            </span>
                                                        ) : null;
                                                    })()} */}
                                                    {column.render ? column.render(row) : row[column.id] ?? "-"}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_EXTENDED_CONTENT" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const contentData = normalizeFullEpisodeExtendedContent(row.id);
                                                        const hasContent = contentData.some(content => {
                                                            if (!content) return false;
                                                            const hasArticleURL = content["Article URL"]?.trim();
                                                            const hasArticleText = content["Article Text"]?.trim();
                                                            const hasShortVideo = content["YouTube Short Video File"]?.trim();
                                                            const hasShortURL = content["YouTube Short URL"]?.trim();
                                                            const hasShortTranscript = content["YouTube Short Transcript"]?.trim();
                                                            const hasLinkedInVideo = content["LinkedIn Video File"]?.trim();
                                                            const hasLinkedInTranscript = content["LinkedIn Video Transcript"]?.trim();
                                                            const hasComments = content["Extended Content LinkedIn Comments & Hashtags"]?.trim();
                                                            const hasQuoteCard = content["Quote Card"]?.trim();
                                                            return hasArticleURL || hasArticleText || hasShortVideo || hasShortURL ||
                                                                hasShortTranscript || hasLinkedInVideo || hasLinkedInTranscript ||
                                                                hasComments || hasQuoteCard;
                                                        });
                                                        return hasContent ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeExtendedContent(contentData[0])}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Content
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_HIGHLIGHT_VIDEO" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const highlightData = normalizeFullEpisodeHighlightVideo(row.id);
                                                        const hasHighlight = highlightData.some(highlight => {
                                                            if (!highlight) return false;
                                                            const hasVideoFile = highlight["Video File"]?.trim();
                                                            const hasYouTubeURL = highlight["YouTube URL"]?.trim();
                                                            const hasTranscript = highlight["Transcript"]?.trim();
                                                            const hasDetails = highlight["Highlights Video Details"]?.trim();
                                                            return hasVideoFile || hasYouTubeURL || hasTranscript || hasDetails;
                                                        });
                                                        return hasHighlight ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeHighlightVideo(highlightData[0])}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Highlights
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_INTRODUCTION_VIDEO" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const introData = [normalizeFullEpisodeIntroductionVideo(row.id)];
                                                        const hasIntro = introData.some(intro => {
                                                            if (!intro) return false;
                                                            const hasVideoFile = intro["Video File"]?.trim();
                                                            const hasYouTubeURL = intro["YouTube URL"]?.trim();
                                                            const hasTranscript = intro["Transcript"]?.trim();
                                                            const hasDetails = intro["Instruction Video Details"]?.trim();
                                                            return hasVideoFile || hasYouTubeURL || hasTranscript || hasDetails;
                                                        });
                                                        return hasIntro ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeIntroductionVideo(introData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Intros
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_QA_VIDEOS" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const qaData = normalizeFullEpisodeQAVideos(row.id);
                                                        const hasQA = qaData.some(qa => {
                                                            if (!qa) return false;
                                                            const hasQAV1Video = qa["QAV1 Video File"]?.trim();
                                                            const hasQAV1URL = qa["QAV1 YouTube URL"]?.trim();
                                                            const hasQAV1Transcript = qa["QAV1 Transcript"]?.trim();
                                                            const hasQAV1Details = qa["QAV1 QA Video Details"]?.trim();
                                                            const hasArticleURL = qa["Extended Content Article URL"]?.trim();
                                                            const hasArticleText = qa["Extended Content Article Text"]?.trim();
                                                            const hasShortVideo = qa["Extended Content YouTube Short Video File"]?.trim();
                                                            const hasShortURL = qa["Extended Content YouTube Short URL"]?.trim();
                                                            const hasShortTranscript = qa["Extended Content YouTube Short Transcript"]?.trim();
                                                            const hasLinkedInVideo = qa["Extended Content LinkedIn Video File"]?.trim();
                                                            const hasLinkedInTranscript = qa["Extended Content LinkedIn Video Transcript"]?.trim();
                                                            const hasComments = qa["QA Video LinkedIn Comments & Hashtags"]?.trim();
                                                            const hasQuoteCard = qa["Quote Card"]?.trim();
                                                            return hasQAV1Video || hasQAV1URL || hasQAV1Transcript || hasQAV1Details ||
                                                                hasArticleURL || hasArticleText || hasShortVideo || hasShortURL ||
                                                                hasShortTranscript || hasLinkedInVideo || hasLinkedInTranscript ||
                                                                hasComments || hasQuoteCard;
                                                        });
                                                        return hasQA ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeQAVideos(qaData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Q&A
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_PODBOOK" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const podbookData = [normalizeFullEpisodePodbook(row.id)];
                                                        const hasPodbook = podbookData.some(podbook => {
                                                            if (!podbook) return false;
                                                            const hasInteractive = podbook["Interactive Experience"]?.trim();
                                                            const hasWebsiteURL = podbook["Website URL"]?.trim();
                                                            const hasEmbedCode = podbook["Embed Code"]?.trim();
                                                            const hasLoomFolder = podbook["Loom Folder"]?.trim();
                                                            return hasInteractive || hasWebsiteURL || hasEmbedCode || hasLoomFolder;
                                                        });
                                                        return hasPodbook ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodePodbook(podbookData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Podbook
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_FULL_CASE_STUDY" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const caseStudyData = [normalizeFullEpisodeFullCaseStudy(row.id)];
                                                        const hasCaseStudy = caseStudyData.some(study => {
                                                            if (!study) return false;
                                                            const hasInteractive = study["Interactive Experience"]?.trim();
                                                            const hasCaseStudyText = study["Case Study Text"]?.trim();
                                                            const hasSalesEmail = study["Sales Email"]?.trim();
                                                            const hasProblemVideo = study["Problem Section Video"]?.trim();
                                                            const hasProblemLength = study["Problem Section Video Length"]?.trim();
                                                            const hasProblemTranscript = study["Problem Section Video Transcript"]?.trim();
                                                            const hasSolutionsVideo = study["Solutions Section Video"]?.trim();
                                                            const hasSolutionsLength = study["Solutions Section Video Length"]?.trim();
                                                            const hasSolutionsTranscript = study["Solutions Section Video Transcript"]?.trim();
                                                            const hasResultsVideo = study["Results Section Video"]?.trim();
                                                            const hasResultsLength = study["Results Section Video Length"]?.trim();
                                                            const hasResultsTranscript = study["Results Section Video Transcript"]?.trim();
                                                            return hasInteractive || hasCaseStudyText || hasSalesEmail ||
                                                                hasProblemVideo || hasProblemLength || hasProblemTranscript ||
                                                                hasSolutionsVideo || hasSolutionsLength || hasSolutionsTranscript ||
                                                                hasResultsVideo || hasResultsLength || hasResultsTranscript;
                                                        });
                                                        return hasCaseStudy ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeFullCaseStudy(caseStudyData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Case Study
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_ONE_PAGE_CASE_STUDY" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const caseStudyData = [normalizeFullEpisodeOnePageCaseStudy(row.id)];
                                                        const hasCaseStudy = caseStudyData.some(study => {
                                                            if (!study) return false;
                                                            const hasInteractive = study["Interactive Experience"]?.trim();
                                                            const hasOnePageText = study["One Page Text"]?.trim();
                                                            const hasSalesEmail = study["Sales Email"]?.trim();
                                                            const hasOnePageVideo = study["One Page Video"]?.trim();
                                                            const hasLength = study["Length"]?.trim();
                                                            const hasTranscript = study["Transcript"]?.trim();
                                                            return hasInteractive || hasOnePageText || hasSalesEmail ||
                                                                hasOnePageVideo || hasLength || hasTranscript;
                                                        });
                                                        return hasCaseStudy ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeOnePageCaseStudy(caseStudyData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View One Page
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_OTHER_CASE_STUDY" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const caseStudyData = [normalizeFullEpisodeOtherCaseStudy(row.id)];
                                                        const hasCaseStudy = caseStudyData.some(study => {
                                                            if (!study) return false;
                                                            const hasInteractive = study["Other Case Study Interactive Experience"]?.trim();
                                                            const hasCaseStudyText = study["Case Study Text"]?.trim();
                                                            const hasSalesEmail = study["Sales Email"]?.trim();
                                                            const hasOtherVideo = study["Other Case Study Video"]?.trim();
                                                            const hasOtherLength = study["Other Case Study Video Length"]?.trim();
                                                            const hasOtherTranscript = study["Other Case Study Video Transcript"]?.trim();
                                                            return hasInteractive || hasCaseStudyText || hasSalesEmail ||
                                                                hasOtherVideo || hasOtherLength || hasOtherTranscript;
                                                        });
                                                        return hasCaseStudy ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeOtherCaseStudy(caseStudyData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Other Study
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_ICP_ADVICE" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const adviceData = [normalizeFullEpisodeICPAdvice(row.id)];
                                                        const hasAdvice = adviceData.some(advice => {
                                                            if (!advice) return false;
                                                            const hasPostVideo = advice["Post-Podcast Video"]?.trim();
                                                            const hasVideoLength = advice["Unedited Post-Podcast Video Length"]?.trim();
                                                            const hasTranscript = advice["Unedited Post-Podcast Transcript"]?.trim();
                                                            const hasInsights = advice["Post-Podcast Insights Report"]?.trim();
                                                            const hasVision = advice["Post-Podcast Vision Report"]?.trim();
                                                            return hasPostVideo || hasVideoLength || hasTranscript || hasInsights || hasVision;
                                                        });
                                                        return hasAdvice ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeICPAdvice(adviceData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View ICP Advice
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id === "FULL_EPISODE_CHALLENGE_QUESTIONS" ? (
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const challengeData = [normalizeFullEpisodeChallengeQuestions(row.id)];
                                                        const hasChallenge = challengeData.some(challenge => {
                                                            if (!challenge) return false;
                                                            const hasVideo = challenge["Unedited Challenge Question Video"]?.trim();
                                                            const hasLength = challenge["Unedited Challenge Question Video Length"]?.trim();
                                                            const hasTranscript = challenge["Unedited Challenge Question Transcript"]?.trim();
                                                            const hasReport = challenge["Challenge Report"]?.trim();
                                                            return hasVideo || hasLength || hasTranscript || hasReport;
                                                        });
                                                        return hasChallenge ? (
                                                            <span
                                                                onClick={() => setSelectedFullEpisodeChallengeQuestions(challengeData)}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                                            >
                                                                View Challenges
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            ) : column.id == "thumbnail" ? (
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => setFileRow(row)}
                                                        className="text-blue-500 hover:text-blue-700 mr-2 transition-colors"
                                                        title="Expand preview"
                                                    >
                                                        <FaExpandAlt size={18} />
                                                    </button>
                                                    <img
                                                        src={row[column.id] || "/default-avatar.png"}
                                                        alt="User Avatar"
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                </div>
                                            ) : column.id === "title_roles" || column.id === "system_roles" || column.id === 'file_type' || column.id === 'category' || column.id === 'tags' || column.id === 'account_status' || column.id === 'market_categories' || column.id === 'content_categories' || column.id === 'Mentioned_Quotes' ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(row[column.id])
                                                        ? row[column.id]
                                                        : typeof row[column.id] === 'string'
                                                            ? column.id === 'Mentioned_Quotes'
                                                                ? row[column.id]
                                                                    .replace(/^\[|\]$/g, '') // Remove square brackets
                                                                    .split('"')              // Split by quotes
                                                                    .filter(item => item.trim() && item !== ',' && item !== ' ') // Filter out empty items and commas
                                                                : row[column.id].split(',').map(item => item.trim()).filter(Boolean)
                                                            : []
                                                    )
                                                        .filter(item => item && item !== "nan" && item !== "[]")
                                                        .map((item, index) => (
                                                            <span
                                                                key={index}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg ${getRandomColor()}`}
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : arrayFields?.includes(column.label) && Array.isArray(row[column.id]) ? (
                                                row[column.id]
                                                    .filter((item) => item && item !== "nan" && item !== "[]")
                                                    .map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                        >
                                                            {item}
                                                        </span>
                                                    ))
                                            ) : column.id === "Video Type" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const videoTypeData = normalizeVideoType(row.id);
                                                        if (videoTypeData.length > 0) {
                                                            setSelectedVideoType(videoTypeData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeVideoType(row.id)
                                                        .filter(videoObj => {
                                                            if (!videoObj) return false;
                                                            const videotypeStr = String(videoObj.videoType).toLowerCase().trim();
                                                            return videotypeStr !== 'nan' && videotypeStr !== '[]' && videotypeStr !== '';
                                                        })
                                                        .map((videoObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {videoObj.videoType}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Themes" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const themesData = normalizeThemes(row.id);
                                                        if (themesData.length > 0) {
                                                            setSelectedThemes(themesData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeThemes(row.id)
                                                        .filter(themeObj => {
                                                            if (!themeObj) return false;
                                                            const themeStr = String(themeObj.theme).toLowerCase().trim();
                                                            return themeStr !== 'nan' && themeStr !== '[]' && themeStr !== '';
                                                        })
                                                        .map((themeObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {themeObj.theme}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Objections" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const objectionData = normalizeObjections(row.id);
                                                        if (objectionData.length > 0) {
                                                            setSelectedObjections(objectionData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeObjections(row.id)
                                                        .filter(objectionObj => {
                                                            if (!objectionObj) return false;
                                                            const objectionStr = String(objectionObj.objection).toLowerCase().trim();
                                                            return objectionStr !== 'nan' && objectionStr !== '[]' && objectionStr !== '';
                                                        })
                                                        .map((objectionObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {objectionObj.objection}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Validations" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const validationData = normalizeValidations(row.id);
                                                        if (validationData.length > 0) {
                                                            setSelectedValidations(validationData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeValidations(row.id)
                                                        .filter(validationObj => {
                                                            if (!validationObj) return false;
                                                            const validationStr = String(validationObj.validation).toLowerCase().trim();
                                                            return validationStr !== 'nan' && validationStr !== '[]' && validationStr !== '';
                                                        })
                                                        .map((validationObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {validationObj.validation}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Challenges" ? (
                                                <div
                                                    className="flex  gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const challengesData = normalizeChallenges(row.id);
                                                        if (challengesData.length > 0) {
                                                            setSelectedChallenges(challengesData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeChallenges(row.id)
                                                        .filter(challengesObj => {
                                                            if (!challengesObj) return false;
                                                            const challengesStr = String(challengesObj.challenges).toLowerCase().trim();
                                                            return challengesStr !== 'nan' && challengesStr !== '[]' && challengesStr !== '';
                                                        })
                                                        .map((challengesObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {challengesObj.challenges}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Sales Insights" ? (
                                                <div
                                                    className="flex gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const insightsData = normalizeSalesInsights(row.id);
                                                        if (insightsData.length > 0) {
                                                            setSelectedSalesInsights(insightsData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeSalesInsights(row.id)
                                                        .filter(insightObj => {
                                                            if (!insightObj) return false;
                                                            const insightStr = String(insightObj.insight).toLowerCase().trim();
                                                            return insightStr !== 'nan' && insightStr !== '[]' && insightStr !== '';
                                                        })
                                                        .map((insightObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {insightObj.insight}

                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Case_Study_Other_Video" ? (
                                                <div
                                                    className="flex gap-1 cursor-pointer"
                                                    onClick={() => {
                                                        const videoData = normalizeCaseStudyOtherVideo(row.id);
                                                        if (videoData.length > 0) {
                                                            setSelectedCaseStudyVideos(videoData);
                                                        }
                                                    }}
                                                >
                                                    {normalizeCaseStudyOtherVideo(row.id)
                                                        .filter(videoObj => {
                                                            if (!videoObj) return false;
                                                            const title = String(videoObj.video_title).toLowerCase().trim();
                                                            return title !== 'nan' && title !== '[]' && title !== '';
                                                        })
                                                        .map((videoObj, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mr-1 ${getRandomColor()}`}
                                                            >
                                                                {videoObj.video_title}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : column.id === "Likes" ? (
                                                <LikeButton user_name={row?.Guest} likesTableName={likesTableName} record_id={row?.id} current_user_id={localStorage.getItem("current_user_id")} user_email={localStorage.getItem("email")} />
                                            ) : column.id === "Comments" ? (
                                                <div onClick={() => setCommentRow(row)} className="text-blue-500">
                                                    <FaCommentDots size={18} />
                                                </div>
                                            ) : column.type === 'url' ? (
                                                row[column.id] ? (
                                                    <a
                                                        href={formatUrl(row[column.id])}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {row[column.id]}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )
                                            ) : column.id === "action" ? (
                                                row[column.id] || null
                                            ) : (
                                                row[column.id] || "-"
                                            )}
                                        </td>
                                    ))}
                                    <td className="sticky right-0  px-0 z-10">
                                        <div className="flex gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {showActions && !isEndUser && (
                                                <>
                                                    {onEdit && (
                                                        <button
                                                            className="p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(row);
                                                            }}
                                                            aria-label="Edit"
                                                        >
                                                            <FaEdit className="w-4 h-4" style={{ color: appColors.primaryColor }} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            className="p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(row.id);
                                                            }}
                                                            aria-label="Delete"
                                                        >
                                                            <FaTrash className="w-4 h-4" style={{ color: appColors.primaryColor }} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>

                                </tr>

                            ))


                        )}
                        {/* Show More row - only visible if there are more records to load */}
                        {hasMoreRecords && !loading && (
                            <tr className="hover:bg-white/10 scroll-hidden">
                                <td
                                    colSpan={columns.length + 1}
                                    className="relative py-3 text-center cursor-pointer"
                                    onClick={onLoadMore}
                                >
                                    <div className="sticky left-1/2 transform -translate-x-1/2 ml-[300px] z-50 w-max mx-auto">
                                        <div className="flex items-center justify-center gap-2 text-white font-bold">
                                            {loadingMore ? (
                                                <>
                                                    <CustomSpinner className="w-4 h-4" />
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Show More</span>
                                                    <FaSortDown className="-mt-2 w-6 h-6" />

                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>

                        )}

                    </tbody>
                </table>
                {loading && (
                    <div className={`${loadingRecord
                        ? 'fixed top-[50%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50' : alignRecord ? 'fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50' : ''}
                        }`}>
                        <CustomSpinner className="w-12 h-12 text-white" />
                    </div>
                )}
            </div>

            {/* Show Themes/Objects etc Modal when a row is selected */}
            {/* {selectedRow && (
                <Modal
                    data={{
                        ...selectedRow,
                        Themes: normalizeThemes(selectedRow.id),
                        Validations: normalizeValidations(selectedRow.id),
                        Objections: normalizeObjections(selectedRow.id),
                        Challenges: normalizeChallenges(selectedRow.id),
                        "Sales Insights": normalizeSalesInsights(selectedRow.id),
                        Case_Study_Other_Video: normalizeCaseStudyOtherVideo(selectedRow.id),
                        "Video Type": normalizeVideoType(selectedRow.id),
                    }}
                    onClose={() => setSelectedRow(null)}
                />
            )} */}
            {selectedRow && (
                <GenericModal
                    data={selectedRow}
                    onClose={() => setSelectedRow(null)}
                    appliedFilters={appliedFilters}
                />
            )}
            {fileRow && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1b41]">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold truncate max-w-md">
                                File Preview
                            </h3>
                            <div className="flex gap-4">
                                <a
                                    href={fileRow.file_link || fileRow.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={!fileRow.file_link} // Only download for actual files
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                                >
                                    {fileRow.file_link ? (
                                        <>
                                            <FaExternalLinkAlt size={14} /> Open Link
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload size={14} /> Download
                                        </>
                                    )}
                                </a>
                                <button
                                    onClick={() => setFileRow(null)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm flex items-center gap-1"
                                >
                                    <FaTimes size={14} /> Close
                                </button>
                            </div>
                        </div>

                        {/* File Preview */}
                        <div className="flex-1 overflow-auto p-4">
                            <FileContentViewer
                                fileUrl={fileRow.file_link || fileRow.file}
                                fileType={fileRow.file_type}
                                isLink={!!fileRow.file_link}  // Pass whether this is a link
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Comment Modal (For Comments) */}
            {commentRow && <CommentModal row={commentRow} commentsTableName={commentsTableName} onClose={() => setCommentRow(null)} />}

            {/* Ranking Modal (For Ranks) */}
            {selectedVideoType && (
                <RankingModal
                    data={selectedVideoType}
                    onClose={() => setSelectedVideoType(null)}
                />

            )}
            {selectedThemes && (
                <RankingModal
                    data={selectedThemes}
                    onClose={() => setSelectedThemes(null)}
                />

            )}
            {selectedValidations && (
                <RankingModal
                    data={selectedValidations}
                    onClose={() => setSelectedValidations(null)}
                />
            )}
            {selectedObjections && (
                <RankingModal
                    data={selectedObjections}
                    onClose={() => setSelectedObjections(null)}
                />
            )}
            {selectedChallenges && (
                <RankingModal
                    data={selectedChallenges}
                    onClose={() => setSelectedChallenges(null)}
                />
            )}
            {selectedSalesInsights && (
                <RankingModal
                    data={selectedSalesInsights}
                    onClose={() => setSelectedSalesInsights(null)}
                />
            )}
            {selectedCaseStudyVideos && (
                <RankingModal
                    data={selectedCaseStudyVideos}
                    onClose={() => setSelectedCaseStudyVideos(null)}
                />
            )}
            {selectedGuests && (
                <GuestDetailsModal
                    guests={selectedGuests}
                    onClose={() => setSelectedGuests(null)}
                />
            )}

            {selectedPrepCalls && (
                <PrepCallDetailsModal
                    prepCalls={selectedPrepCalls}
                    onClose={() => setSelectedPrepCalls(null)}
                />
            )}

            {selectedGuestProjects && (
                <AdditionalGuestProjectsModal
                    projects={selectedGuestProjects}
                    onClose={() => setSelectedGuestProjects(null)}
                />
            )}

            {selectedEmails && (
                <EmailDetailsModal
                    emails={selectedEmails}
                    onClose={() => setSelectedEmails(null)}
                />
            )}
            {selectedFullEpisodeDetails && (
                <FullEpisodeDetailsModal
                    data={selectedFullEpisodeDetails}
                    onClose={() => setSelectedFullEpisodeDetails(null)}
                />
            )}

            {selectedFullEpisodeVideo && (
                <FullEpisodeVideoModal
                    data={selectedFullEpisodeVideo}
                    onClose={() => setSelectedFullEpisodeVideo(null)}
                />
            )}

            {selectedFullEpisodeExtendedContent && (
                <FullEpisodeExtendedContentModal
                    data={selectedFullEpisodeExtendedContent}
                    onClose={() => setSelectedFullEpisodeExtendedContent(null)}
                />
            )}

            {selectedFullEpisodeHighlightVideo && (
                <FullEpisodeHighlightVideoModal
                    data={selectedFullEpisodeHighlightVideo}
                    onClose={() => setSelectedFullEpisodeHighlightVideo(null)}
                />
            )}

            {selectedFullEpisodeIntroductionVideo && (
                <FullEpisodeIntroductionVideoModal
                    data={selectedFullEpisodeIntroductionVideo}
                    onClose={() => setSelectedFullEpisodeIntroductionVideo(null)}
                />
            )}

            {selectedFullEpisodeQAVideos && (
                <FullEpisodeQAVideosModal
                    data={selectedFullEpisodeQAVideos}
                    onClose={() => setSelectedFullEpisodeQAVideos(null)}
                />
            )}

            {selectedFullEpisodePodbook && (
                <FullEpisodePodbookModal
                    data={selectedFullEpisodePodbook}
                    onClose={() => setSelectedFullEpisodePodbook(null)}
                />
            )}

            {selectedFullEpisodeFullCaseStudy && (
                <FullEpisodeFullCaseStudyModal
                    data={selectedFullEpisodeFullCaseStudy}
                    onClose={() => setSelectedFullEpisodeFullCaseStudy(null)}
                />
            )}

            {selectedFullEpisodeOnePageCaseStudy && (
                <FullEpisodeOnePageCaseStudyModal
                    data={selectedFullEpisodeOnePageCaseStudy}
                    onClose={() => setSelectedFullEpisodeOnePageCaseStudy(null)}
                />
            )}

            {selectedFullEpisodeOtherCaseStudy && (
                <FullEpisodeOtherCaseStudyModal
                    data={selectedFullEpisodeOtherCaseStudy}
                    onClose={() => setSelectedFullEpisodeOtherCaseStudy(null)}
                />
            )}

            {selectedFullEpisodeICPAdvice && (
                <FullEpisodeICPAdviceModal
                    data={selectedFullEpisodeICPAdvice}
                    onClose={() => setSelectedFullEpisodeICPAdvice(null)}
                />
            )}

            {selectedFullEpisodeChallengeQuestions && (
                <FullEpisodeChallengeQuestionsModal
                    data={selectedFullEpisodeChallengeQuestions}
                    onClose={() => setSelectedFullEpisodeChallengeQuestions(null)}
                />
            )}
        </DndProvider>
    );

};



export default DraggableTable;

