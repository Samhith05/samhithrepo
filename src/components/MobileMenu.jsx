// src/components/MobileMenu.jsx

import { useState } from 'react';

export default function MobileMenu({ user, logout, isAdmin, contractorCategory }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="sm:hidden">
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
            >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg
                    className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
                {/* Close icon */}
                <svg
                    className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            {/* Mobile menu dropdown */}
            {isOpen && (
                <div className="absolute top-16 right-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {user?.displayName?.[0] || user?.email?.[0] || '?'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.displayName || user?.email}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {isAdmin && (
                                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                            Admin
                                        </span>
                                    )}
                                    {contractorCategory && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                            {contractorCategory}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3">
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
