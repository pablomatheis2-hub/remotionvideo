import React from "react";
import { useCurrentFrame } from "remotion";

interface TypewriterTextProps {
  text: string;
  startFrame?: number;
  speed?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  speed = 0.5,
  style = {},
  cursorColor = "#06b6d4",
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charCount = Math.min(Math.floor(elapsed * speed), text.length);
  const visibleText = text.slice(0, charCount);
  const isTyping = charCount < text.length;
  const cursorVisible = showCursor && (isTyping || frame % 30 < 15);

  return (
    <span style={style}>
      {visibleText}
      {cursorVisible && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "1.1em",
            background: cursorColor,
            marginLeft: 2,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </span>
  );
};
