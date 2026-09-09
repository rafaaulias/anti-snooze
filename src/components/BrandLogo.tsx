import React from 'react';

export interface BrandLogoProps {
  className?: string;
  /**
   * Optional custom image URL or icon element.
   * If you want to replace this logo with your own PNG / SVG / JPG file,
   * pass src="/your-logo.png" or edit CUSTOM_LOGO_IMAGE_URL below!
   */
  src?: string;
}

/**
 * 💡 EASY LOGO REPLACEMENT:
 * 1. If you have an image file (e.g. logo.png, logo.svg) in the /public folder:
 *    Set CUSTOM_LOGO_IMAGE_URL = '/logo.png';
 * 2. Or if you want to paste your own SVG markup:
 *    Simply replace the <svg> block below in this file.
 */
export const CUSTOM_LOGO_IMAGE_URL: string | null = null;

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-9 h-7',
  src,
}) => {
  const imageSource = src || CUSTOM_LOGO_IMAGE_URL;

  // If a custom image or logo file is provided, render the image
  if (imageSource) {
    return (
      <img
        src={imageSource}
        alt="Anti-Snooze Logo"
        className={`${className} object-contain shrink-0`}
      />
    );
  }

  // Default clean Anti-Snooze monogram with integrated clock hands
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 160 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#000000]"
        aria-label="Anti-Snooze Logo"
      >
        {/* Outer AS Monogram silhouette */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M38 108 L0 108 L46 6 L84 6 C96 6 109 11 117 19 C123 25 125 33 123 41 C120 51 111 59 100 62 L120 62 C138 62 153 72 154 88 C155 101 144 108 130 108 L86 108 L98 88 L126 88 C131 88 134 85 133 81 C132 77 127 75 120 75 L80 75 C66 75 56 68 55 54 C54 44 61 34 71 28 C76 25 82 24 88 24 L63 24 L38 108 Z"
          fill="currentColor"
        />

        {/* Inner Clock Hands detail */}
        <g fill="currentColor">
          <circle cx="63" cy="74" r="3.5" />
          <rect x="61.2" y="52" width="3.6" height="22" rx="1.8" />
          <rect
            x="61.2"
            y="72"
            width="3.6"
            height="16"
            rx="1.8"
            transform="rotate(-48 63 74)"
          />
        </g>
      </svg>
    </div>
  );
};
