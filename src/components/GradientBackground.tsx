import React from "react";
import { useTheme } from "../engine/ThemeContext";

export const GradientBackground: React.FC = () => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: colors.background,
      }}
    />
  );
};
