import React from "react";
import { Audio, staticFile } from "remotion";

interface Props {
  volume: number;
}

export const ContinuousVoiceover: React.FC<Props> = ({ volume }) => {
  return (
    <Audio src={staticFile("voiceover/voiceover.mp3")} volume={volume} />
  );
};
