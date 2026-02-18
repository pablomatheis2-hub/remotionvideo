import React from "react";
import { KineticWord } from "../components/KineticWord";
import type { KineticTextScene } from "../engine/types";

type Props = Omit<KineticTextScene, "type">;

export const Scene2_KineticText: React.FC<Props> = ({
  durationInFrames,
  words,
}) => {
  // Each word appears quickly (12 frames apart), last word holds until scene end
  const pace = 12;
  const wordTimings = words.map((word, i) => {
    const isLast = i === words.length - 1;
    return {
      word,
      enterFrame: i * pace + 2,
      exitFrame: isLast ? durationInFrames : (i + 1) * pace + 2,
    };
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {wordTimings.map((w) => (
        <KineticWord
          key={w.word}
          word={w.word}
          enterFrame={w.enterFrame}
          exitFrame={w.exitFrame}
        />
      ))}
    </div>
  );
};
