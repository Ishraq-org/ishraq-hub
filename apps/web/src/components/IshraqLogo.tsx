import React from 'react';

interface IshraqLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export const IshraqLogo: React.FC<IshraqLogoProps> = ({
  size = 32,
  className = '',
  animate = false,
}) => {
  return (
    <img
      src="/ishraq-mark.svg"
      alt="Ishraq Hub Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block object-contain ${animate ? 'animate-pulse opacity-90' : ''} ${className}`}
    />
  );
};

export default IshraqLogo;
