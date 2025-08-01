// src/components/IssueCard.jsx

import StatusProgress from "./StatusProgress";

export default function IssueCard({ issue, onStatusUpdate, getStatusColor, isResolved = false }) {
    const statusOptions = ["Open", "Assigned", "In Progress", "Resolved"];

    const getCategoryIcon = (category) => {
        const icons = {
            "Electrical": "⚡",
            "Plumbing": "🔧",
            "HVAC": "❄️",
            "Structural": "🏗️",
            "Painting": "🎨",
            "Landscaping": "🌱",
            "Cleaning": "🧹",
            "Security": "🔒",
            "Other": "🔧"
        };
        return icons[category] || "🔧";
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "No date";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className={`bg-white rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isResolved ? "opacity-75 border-green-200 bg-green-50" : "border-gray-200"
            }`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryIcon(issue.category)}</span>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {issue.title || "Issue Report"}
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                            {issue.priority || "Medium"}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {issue.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Description */}
                {issue.description && (
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {issue.description}
                    </p>
                )}

                {/* Location & Category */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {issue.location && (
                        <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{issue.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span>🏷️</span>
                        <span>{issue.category}</span>
                    </div>
                </div>

                {/* Image */}
                {issue.imageUrl && (
                    <div className="mt-3">
                        <img
                            src={issue.imageUrl}
                            alt="Issue"
                            className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-200"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Progress Indicator */}
                <div className="mt-4">
                    <StatusProgress currentStatus={issue.status} />
                </div>

                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span>Reported: {formatDate(issue.createdAt)}</span>
                        {issue.assignedTo && (
                            <span>Assigned to: {issue.assignedTo}</span>
                        )}
                    </div>
                    {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
                        <span>Updated: {formatDate(issue.updatedAt)}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            {!isResolved && onStatusUpdate && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <label className="text-sm font-medium text-gray-700 sm:min-w-max">
                            Update Status:
                        </label>
                        <select
                            value={issue.status}
                            onChange={(e) => onStatusUpdate(issue.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
