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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`inline-block ${animate ? 'animate-pulse opacity-90' : ''} ${className}`}
      aria-label="Ishraq Hub Logo"
    >
      <g textRendering="geometricPrecision">
        {/* Outer Container Ring / Rounded Square */}
        <rect
          x="64"
          y="64"
          width="384"
          height="384"
          rx="56"
          fill="var(--bg-secondary, #221810)"
          stroke="var(--accent, #D2A857)"
          strokeWidth="16"
        />

        {/* Fluid Arabic Calligraphic Alif/Ishraq Qalam Stroke */}
        <path
          d="M 276,136 C 276,136 340,216 340,288 C 340,352 292,388 224,388 C 168,388 132,352 146,300 C 156,256 198,236 222,258 C 242,276 222,312 188,312 C 178,312 174,328 196,338 C 228,350 280,334 280,280 C 280,228 236,176 236,176 Z"
          fill="var(--accent, #D2A857)"
        />

        {/* Calligraphic Diamond Nuqta */}
        <polygon
          points="340,136 370,166 340,196 310,166"
          fill="var(--accent, #D2A857)"
        />
      </g>
    </svg>
  );
};

export default IshraqLogo;
