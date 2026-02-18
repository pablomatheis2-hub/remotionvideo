import React, { useCallback } from "react";
import { Audio, staticFile, useVideoConfig } from "remotion";

interface Props {
  src: string;
  volume: number;
}

export const BackgroundMusic: React.FC<Props> = ({ src, volume }) => {
  const { durationInFrames } = useVideoConfig();

  const volumeCallback = useCallback(
    (f: number) => {
      const fadeFrames = 30;

      // Fade in
      let vol = 1;
      if (f < fadeFrames) {
        vol = f / fadeFrames;
      }

      // Fade out
      const remaining = durationInFrames - f;
      if (remaining < fadeFrames) {
        vol = Math.min(vol, remaining / fadeFrames);
      }

      // Always duck to 30% — voiceover is continuous across entire video
      vol *= 0.3;

      return vol * volume;
    },
    [durationInFrames, volume]
  );

  return <Audio src={staticFile(src)} loop volume={volumeCallback} />;
};
