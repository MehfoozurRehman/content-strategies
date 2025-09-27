'use client';
import { useEffect, useState } from 'react';
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

const FileContentViewer = ({ fileUrl, fileType, isLink = false }) => {
    const [dimensions, setDimensions] = useState({
        width: '100%',
        height: '600px'
    });

    // Safely get file type as string
    const safeFileType = String(fileType || '').toLowerCase();
    const fileExtension = isLink ? null : fileUrl?.split('.').pop()?.toLowerCase();

    useEffect(() => {
        if (!fileUrl) return;

        if (isLink) {
            // Handle document links
            setDimensions({
                width: '100%',
                height: '70vh',
                maxWidth: '100%'
            });
        } else {
            // Handle uploaded files
            const type = safeFileType || getFileType(fileExtension);
            
            if (type === 'image') {
                setDimensions({
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '70vh'
                });
            } else if (type === 'pdf') {
                setDimensions({
                    width: '100%',
                    height: '70vh'
                });
            } else if (type === 'video') {
                setDimensions({
                    width: '800px',
                    height: '450px',
                    maxWidth: '100%'
                });
            }else if (type === 'audio') {
                setDimensions({
                    width: '100%',
                    height: 'auto',
                    maxWidth: '800px',
                });
            }
            // Add other types as needed
        }
    }, [fileUrl, safeFileType, fileExtension, isLink]);

    const getFileType = (ext) => {
        if (!ext) return 'unknown';
        
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        const docTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        
        if (imageTypes.includes(ext)) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (docTypes.includes(ext)) return 'document';
        return 'unknown';
    };

    if (!fileUrl) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">No file available for preview</p>
            </div>
        );
    }

    if (isLink) {
        // Handle Google Docs links
        if (fileUrl.includes('docs.google.com') || fileUrl.includes('drive.google.com')) {
            let embedUrl = fileUrl;
            if (fileUrl.includes('/edit')) {
                embedUrl = fileUrl.replace('/edit', '/preview');
            }
            return (
                <iframe
                    src={embedUrl}
                    style={dimensions}
                    className="border-0 w-full"
                    title="Document Preview"
                />
            );
        }
        
        // Generic link handling
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="text-6xl mb-4">🔗</div>
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                >
                    Open document link <FaExternalLinkAlt />
                </a>
            </div>
        );
    }

    // Determine file type for uploaded files
    const type = safeFileType || getFileType(fileExtension);

    switch (type) {
        case 'image':
            return (
                <div className="flex justify-center">
                    <img
                        src={fileUrl}
                        alt="Preview"
                        style={dimensions}
                        className="object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/file-placeholder.png';
                        }}
                    />
                </div>
            );
        
        case 'pdf':
            return (
                <iframe
                    src={`${fileUrl}#view=FitH`}
                    style={dimensions}
                    className="border-0 w-full"
                    title="PDF Preview"
                />
            );
            
        case 'document':
            return (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                    style={dimensions}
                    className="border-0 w-full"
                    title="Document Preview"
                />
            );
            
        default:
            return (
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-6xl mb-4">📄</div>
                    <div
     
                        className="flex items-center gap-2 px-4 py-2 text-white rounded"
                    > Please Download File to view
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                        {type === 'unknown' ? 'Unsupported file type' : `File type: ${type}`}
                    </p>
                </div>
            );
    }
};

export default FileContentViewer;