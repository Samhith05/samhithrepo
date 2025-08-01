// src/components/QuickStats.jsx

export default function QuickStats({ stats, userType = "user" }) {
    const getStatsConfig = () => {
        if (userType === "admin") {
            return [
                {
                    label: "Total Issues",
                    value: stats.totalIssues || 0,
                    icon: "📊",
                    color: "from-blue-500 to-blue-600",
                    bgColor: "from-blue-50 to-blue-100",
                    textColor: "text-blue-700"
                },
                {
                    label: "Pending Approval",
                    value: stats.pendingUsers || 0,
                    icon: "⏳",
                    color: "from-amber-500 to-amber-600",
                    bgColor: "from-amber-50 to-amber-100",
                    textColor: "text-amber-700"
                },
                {
                    label: "Active Contractors",
                    value: stats.verifiedContractors || 0,
                    icon: "👷",
                    color: "from-green-500 to-green-600",
                    bgColor: "from-green-50 to-green-100",
                    textColor: "text-green-700"
                },
                {
                    label: "Resolved Today",
                    value: stats.resolvedToday || 0,
                    icon: "✅",
                    color: "from-purple-500 to-purple-600",
                    bgColor: "from-purple-50 to-purple-100",
                    textColor: "text-purple-700"
                }
            ];
        } else if (userType === "contractor") {
            return [
                {
                    label: "Open Issues",
                    value: stats.openIssues || 0,
                    icon: "🚨",
                    color: "from-yellow-500 to-orange-500",
                    bgColor: "from-yellow-50 to-orange-50",
                    textColor: "text-yellow-700"
                },
                {
                    label: "In Progress",
                    value: stats.assignedIssues || 0,
                    icon: "🔧",
                    color: "from-blue-500 to-indigo-500",
                    bgColor: "from-blue-50 to-indigo-50",
                    textColor: "text-blue-700"
                },
                {
                    label: "Completed",
                    value: stats.resolvedIssues || 0,
                    icon: "✅",
                    color: "from-green-500 to-emerald-500",
                    bgColor: "from-green-50 to-emerald-50",
                    textColor: "text-green-700"
                }
            ];
        } else {
            return [
                {
                    label: "My Issues",
                    value: stats.myIssues || 0,
                    icon: "📋",
                    color: "from-blue-500 to-blue-600",
                    bgColor: "from-blue-50 to-blue-100",
                    textColor: "text-blue-700"
                },
                {
                    label: "In Progress",
                    value: stats.inProgress || 0,
                    icon: "⚡",
                    color: "from-amber-500 to-orange-500",
                    bgColor: "from-amber-50 to-orange-50",
                    textColor: "text-amber-700"
                },
                {
                    label: "Resolved",
                    value: stats.resolved || 0,
                    icon: "✅",
                    color: "from-green-500 to-green-600",
                    bgColor: "from-green-50 to-green-100",
                    textColor: "text-green-700"
                }
            ];
        }
    };

    const statsConfig = getStatsConfig();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {statsConfig.map((stat, index) => (
                <div
                    key={stat.label}
                    className={`bg-gradient-to-br ${stat.bgColor} rounded-lg shadow-md border border-opacity-20 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 fade-in-up stagger-${index + 1}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-2xl md:text-3xl font-bold ${stat.textColor} mb-1`}>
                                {stat.value}
                            </p>
                            <p className={`text-sm font-medium ${stat.textColor} opacity-80`}>
                                {stat.label}
                            </p>
                            {stat.label === "Resolved Today" && stat.value > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Great progress! 🎉
                                </p>
                            )}
                        </div>
                        <div className="text-2xl md:text-3xl opacity-80">
                            {stat.icon}
                        </div>
                    </div>

                    {/* Progress indicator for in-progress items */}
                    {(stat.label.includes("Progress") && stat.value > 0) && (
                        <div className="mt-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white bg-opacity-50 rounded-full h-2">
                                    <div
                                        className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.min(100, (stat.value / 10) * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                    Active
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
