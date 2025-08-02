// src/components/LoadingSkeleton.jsx

import React from 'react';

export const IssueCardSkeleton = () => (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="w-full sm:w-28 h-28 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
        <div className="h-20 bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded animate-pulse w-24"></div>
            <div className="h-8 bg-gray-700 rounded animate-pulse w-32"></div>
        </div>
    </div>
);

export const StatCardSkeleton = () => (
    <div className="bg-gray-800/50 backdrop-blur-lg p-4 rounded-lg shadow-xl animate-pulse border border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-12"></div>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
        </div>
    </div>
);

export const UserCardSkeleton = () => (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
            </div>
        </div>
        <div className="flex gap-2">
            <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
            <div className="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
        </div>
    </div>
);

export default {
    IssueCardSkeleton,
    StatCardSkeleton,
    UserCardSkeleton,
};
