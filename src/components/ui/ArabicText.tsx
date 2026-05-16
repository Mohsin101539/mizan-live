import React from 'react';

export interface ArabicTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ArabicText: React.FC<ArabicTextProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`arabic-text w-full text-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
