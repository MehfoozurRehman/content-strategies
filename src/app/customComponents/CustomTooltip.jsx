import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const ref = useRef(null);

    const handleMouseEnter = () => {
        if (ref.current && content) {
            const rect = ref.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 10, // Position above the element
                left: rect.left + rect.width / 2,
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={ref}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>

            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] inline-block max-w-[30vw] p-3
                  bg-gray-900 text-white text-sm rounded-lg shadow-lg
                  transform -translate-x-1/2 -translate-y-full
                  break-words"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
};