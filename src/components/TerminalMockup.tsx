import React from "react";
import { useTheme } from "../engine/ThemeContext";

interface TerminalMockupProps {
  children: React.ReactNode;
  title?: string;
}

export const TerminalMockup: React.FC<TerminalMockupProps> = ({
  children,
  title = "Terminal",
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        width: 800,
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(15,15,15,0.95)",
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 20px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 13,
            color: colors.textSecondary,
            marginRight: 44,
          }}
        >
          {title}
        </span>
      </div>
      {/* Content */}
      <div style={{ padding: "24px 28px", minHeight: 180 }}>{children}</div>
    </div>
  );
};
