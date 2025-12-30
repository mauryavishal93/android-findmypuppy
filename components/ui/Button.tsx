import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, className, disabled, type = 'button' }) => (
  <button 
    type={type}
    onClick={onClick} 
    disabled={disabled}
    className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);