import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const [showUnauthorized, setShowUnauthorized] = useState(false);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!token) {
            setShowUnauthorized(true);
        } else if (allowedRoles && !allowedRoles.includes(role)) {
            setShowUnauthorized(true);
        }
    }, [token, role, allowedRoles]);

    if (redirect) {
        return <Navigate to="/" replace />;
    }

    if (showUnauthorized) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
                <ConfirmDialog 
                    isOpen={true}
                    title="Unauthorized Access"
                    message="You must be logged in to view this page. Please log in to continue."
                    confirmText="Go to Login"
                    cancelText="Close"
                    onConfirm={() => setRedirect(true)}
                    onCancel={() => setRedirect(true)}
                />
            </div>
        );
    }

    return token ? children : null;
};

export default ProtectedRoute;
