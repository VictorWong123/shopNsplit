import React, { useState } from 'react';

const ShareButton = ({ receiptId, receiptName }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateShareLink = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/shared/${receiptId}`;
    };

    const handleShare = () => {
        setShowShareModal(true);
        setCopied(false);
    };

    const handleCopyLink = async () => {
        try {
            const shareLink = generateShareLink();
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);

            // Reset copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = generateShareLink();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setShowShareModal(false);
        setCopied(false);
    };

    const shareIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
    );

    const copyIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );

    const checkIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <>
            <button
                onClick={handleShare}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                title="Share this receipt"
            >
                {shareIcon}
                <span>Share</span>
            </button>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                {shareIcon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Share Receipt</h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Share this receipt with others using the link below:
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Share Link
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={generateShareLink()}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50 focus:outline-none"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className={`px-4 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium transition-colors ${copied
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {copied ? checkIcon : copyIcon}
                                </button>
                            </div>
                            {copied && (
                                <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-blue-800 text-sm font-medium">Anyone with this link can view your receipt</p>
                                    <p className="text-blue-600 text-xs mt-1">The link will work even if they don't have an account</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareButton; 