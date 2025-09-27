import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState } from "react";

const FullEpisodesNestedSection = ({
    fullEpisodeDetails,
    otherEpisodeFields,
    collapsedSections,
    setCollapsedSections,
    renderSection
}) => {
    const [isFullEpisodesOpen, setIsFullEpisodesOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);

    const toggle = (key) => {
        setCollapsedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="mb-6">
            {/* Top-level Full Episodes Collapsible */}
            <div
                onClick={() => setIsFullEpisodesOpen(!isFullEpisodesOpen)}
                className="flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 bg-gray-800/70 shadow-md"
            >
                <h3 className="text-lg font-semibold text-gray-200">Full Episodes</h3>
                {isFullEpisodesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {isFullEpisodesOpen && (
                <div className="mt-3 ml-4 space-y-4 border-l-2 border-gray-600 pl-4">
                    {/* Nested 'Details' Collapsible */}
                    <div>
                        <div
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            className="flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-white/10 border border-gray-600 bg-gray-700/50"
                        >
                            <h4 className="text-md font-semibold text-gray-200">Details</h4>
                            {isDetailsOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                        {isDetailsOpen && (
                            <div className="mt-3 ml-4 space-y-4 border-l border-gray-600 pl-4">
                                {renderSection("DETAILS_FULL_EPISODES", fullEpisodeDetails)}
                            </div>
                        )}
                    </div>

                    {/* Other FULL_EPISODE_* Fields (non-details) */}
                    {otherEpisodeFields.map(([key, sectionData]) => (
                        <div key={key}>
                            {renderSection(key, sectionData)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FullEpisodesNestedSection;
