import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { TerminalMockup } from "../components/TerminalMockup";
import { TypewriterText } from "../components/TypewriterText";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { CodeDemoScene } from "../engine/types";

type Props = Omit<CodeDemoScene, "type">;

export const Scene6_CodeEditor: React.FC<Props> = ({
  durationInFrames,
  command,
  successMessage,
  details,
  terminalTitle = "Terminal",
  promptPath = "~/my-app",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const slideUp = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
    delay: 3,
  });

  const opacityOut = useSceneFade({ durationInFrames, fadeInFrames: 0, fadeOutFrames: 25 });

  const commandDone = frame > 12 + command.length / 0.7;

  const progressStart = 50;
  const progressDuration = 25;
  const progressValue = interpolate(
    frame,
    [progressStart, progressStart + progressDuration],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const showSuccess = frame > progressStart + progressDuration + 3;
  const successOpacity = interpolate(
    frame,
    [progressStart + progressDuration + 3, progressStart + progressDuration + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: opacityOut,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - slideUp) * 80}px)`,
          opacity: slideUp,
        }}
      >
        <TerminalMockup title={terminalTitle}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: colors.accent, fontSize: 16 }}>➜ </span>
            <span style={{ color: colors.textSecondary, fontSize: 16 }}>
              {promptPath}{" "}
            </span>
            <TypewriterText
              text={command}
              startFrame={12}
              speed={0.7}
              style={{ color: colors.textPrimary, fontSize: 16 }}
              cursorColor={colors.accent}
              showCursor={!commandDone}
            />
          </div>

          {commandDone && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Deploying...
                </span>
                <span style={{ color: colors.accent, fontSize: 14 }}>
                  {Math.round(progressValue)}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressValue}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                  }}
                />
              </div>
            </div>
          )}

          {showSuccess && (
            <div style={{ opacity: successOpacity }}>
              <div
                style={{
                  color: "#28c840",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                ✓ {successMessage}
              </div>
              {details.map((line, i) => (
                <div
                  key={i}
                  style={{ color: colors.textSecondary, fontSize: 14 }}
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </TerminalMockup>
      </div>
    </div>
  );
};
