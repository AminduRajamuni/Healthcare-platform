import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(13, 11, 20, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel" style={{
                padding: '32px',
                width: '90%',
                maxWidth: '400px',
                textAlign: 'center',
                animation: 'fade-in 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#f43f5e' }}>
                    <AlertCircle size={48} />
                </div>
                <h3 className="text-h3" style={{ marginBottom: '12px' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button 
                        className="btn-outline" 
                        onClick={onCancel}
                        style={{ flex: 1 }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={onConfirm}
                        style={{ flex: 1, background: 'linear-gradient(to right, #e11d48, #be123c)' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ConfirmDialog;
