import React from "react";
import { useCurrentFrame, Easing, interpolate } from "remotion";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  startFrame?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  startFrame = 0,
  duration = 60,
  decimals = 0,
  prefix = "",
  suffix = "",
  style = {},
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const value = from + (to - from) * progress;
  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value);

  return (
    <span style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};
