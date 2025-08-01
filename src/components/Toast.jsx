// src/components/Toast.jsx

import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            case 'error':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
            case 'info':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div
                className={`${getToastStyle()} px-6 py-4 rounded-lg shadow-lg max-w-sm flex items-center gap-3`}
            >
                <span className="text-xl">{getIcon()}</span>
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-auto text-white hover:text-gray-200 transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );

    return { showToast, ToastContainer };
};

export default Toast;
