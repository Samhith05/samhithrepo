// src/components/StatusProgress.jsx

import React from "react";

const StatusProgress = ({ currentStatus }) => {
  const statuses = [
    { key: "Open", label: "Open", color: "#f59e0b" },
    { key: "Assigned", label: "Assigned", color: "#3b82f6" },
    { key: "Resolved", label: "Resolved", color: "#10b981" },
  ];

  const currentIndex = statuses.findIndex(
    (status) => status.key === currentStatus
  );

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          maxWidth: "300px",
        }}
      >
        {/* Progress line background */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            right: "12px",
            height: "2px",
            backgroundColor: "#e5e7eb",
            zIndex: 1,
          }}
        />

        {/* Active progress line */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            width:
              currentIndex > 0
                ? `${(currentIndex / (statuses.length - 1)) * 100}%`
                : "0%",
            height: "2px",
            backgroundColor: "#10b981",
            zIndex: 2,
            transition: "width 0.3s ease",
          }}
        />

        {statuses.map((status, index) => {
          const isActive = currentStatus === status.key;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={status.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 3,
                position: "relative",
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: isCompleted
                    ? "#10b981"
                    : isActive
                    ? status.color
                    : "#e5e7eb",
                  border: isActive ? `3px solid ${status.color}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "8px",
                  transition: "all 0.3s ease",
                }}
              >
                {isCompleted && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {isActive && !isCompleted && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  color: isActive
                    ? status.color
                    : isCompleted
                    ? "#10b981"
                    : "#6b7280",
                  fontWeight: isActive ? "600" : "400",
                  textAlign: "center",
                }}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusProgress;
