import React, { useState, useRef } from 'react';
import PageHeader from './PageHeader';
import PrimaryButton from './PrimaryButton';
import ValidationMessage from './ValidationMessage';

function AIReceiptUpload({ onBack, onReceiptParsed, onSwitchToManual }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const validateFile = (file) => {
        if (!file) {
            setError('Please select a file');
            return false;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, or WebP)');
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 10MB');
            return false;
        }

        setError('');
        return true;
    };

    const handleFileSelect = (file) => {
        if (validateFile(file)) {
            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('receipt', selectedFile);

            const response = await fetch('http://localhost:5001/api/parse-receipt', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Success - pass parsed items to parent
            onReceiptParsed(result.items, result.total);
        } catch (err) {
            setError(err.message || 'Failed to parse receipt. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRetry = () => {
        setSelectedFile(null);
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadIcon = (
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    );

    const cameraIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Upload Receipt"
                description="Take a photo or upload an image of your grocery receipt"
                onBack={onBack}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Upload Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        {!preview ? (
                            /* File Upload Interface */
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                    ? 'border-purple-400 bg-purple-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    {uploadIcon}
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Drop your receipt here
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    or click to browse files
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    id="file-upload"
                                />

                                <label
                                    htmlFor="file-upload"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer transition-colors"
                                >
                                    {cameraIcon}
                                    <span className="ml-2">Choose File</span>
                                </label>

                                <p className="text-xs text-gray-500 mt-4">
                                    Supported formats: JPEG, PNG, WebP (max 10MB)
                                </p>
                            </div>
                        ) : (
                            /* Preview and Actions */
                            <div className="text-center">
                                <div className="mb-6">
                                    <img
                                        src={preview}
                                        alt="Receipt preview"
                                        className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm border border-gray-200"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <PrimaryButton
                                        onClick={handleSubmit}
                                        disabled={isUploading}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Parse Receipt'
                                        )}
                                    </PrimaryButton>

                                    <button
                                        onClick={handleRetry}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        Try Again
                                    </button>

                                    <button
                                        onClick={onSwitchToManual}
                                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Switch to Manual
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tips and Instructions */}
                <div className="lg:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tips for Best Results
                        </h3>
                        <ul className="text-blue-800 space-y-2">
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                Ensure good lighting and clear focus
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                Capture the entire receipt in frame
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                Avoid shadows and glare on the receipt
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                Make sure text is readable and not cut off
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-6">
                    <ValidationMessage message={error} type="error" />
                </div>
            )}
        </div>
    );
}

export default AIReceiptUpload; 