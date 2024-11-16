'use client';

import { useState, FormEvent } from 'react';

export default function GenerateVideo() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setDownloadUrl('');
        setIsLoading(true);

        try {
            if (!audioFile || !name || !desc) {
                throw new Error('Please fill in all fields');
            }

            const formData = new FormData();
            formData.append('AUDIO_FILE', audioFile);
            formData.append('NAME', name);
            formData.append('DESC', desc);

            const response = await fetch('/api/gen_video', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate video');
            }

            const data = await response.json();
            setDownloadUrl(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Video</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <label 
                        htmlFor="audio" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Audio File
                    </label>
                    <input
                        type="file"
                        id="audio"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div>
                    <label 
                        htmlFor="name" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter name"
                        className="block w-full rounded-md border-gray-300 shadow-sm
                            focus:border-blue-500 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            p-2 border"
                    />
                </div>

                <div>
                    <label 
                        htmlFor="desc" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Description
                    </label>
                    <textarea
                        id="desc"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter description"
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm
                            focus:border-blue-500 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            p-2 border"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent
                        rounded-md shadow-sm text-sm font-medium text-white
                        bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2
                        focus:ring-offset-2 focus:ring-blue-500
                        disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg 
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24"
                            >
                                <circle 
                                    className="opacity-25" 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor" 
                                    strokeWidth="4"
                                />
                                <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Generating...
                        </>
                    ) : 'Generate Video'}
                </button>
            </form>

            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            {downloadUrl && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                    <p className="mb-2">Video generated successfully!</p>
                    <a 
                        href={downloadUrl}
                        download
                        className="inline-flex items-center px-4 py-2 border border-transparent
                            text-sm font-medium rounded-md shadow-sm text-white
                            bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2
                            focus:ring-offset-2 focus:ring-green-500"
                    >
                        Download Video
                    </a>
                </div>
            )}
        </div>
    );
} 