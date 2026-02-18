import React from "react";
import { useTheme } from "../engine/ThemeContext";

interface BrandLogoProps {
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 80 }) => {
  const { colors, gradients, brand } = useTheme();
  const letter = brand.name.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.25 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="brandLogoGrad"
            x1="0"
            y1="0"
            x2="80"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
        </defs>
        {/* Hexagonal shape */}
        <path
          d="M40 4L72 22V58L40 76L8 58V22L40 4Z"
          stroke="url(#brandLogoGrad)"
          strokeWidth="3"
          fill="none"
        />
        {/* Brand letter */}
        <text
          x="40"
          y="52"
          textAnchor="middle"
          fontSize="36"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
          fill="url(#brandLogoGrad)"
        >
          {letter}
        </text>
      </svg>
      <span
        style={{
          fontSize: size * 0.5,
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "-0.02em",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {brand.name}
      </span>
    </div>
  );
};
