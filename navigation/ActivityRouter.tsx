import React from "react";
import { Screen } from "../SideMenu";
import AdvancedLetters from "../AdvancedLetters";
import FindLetter from "../FindLetter";
import LetterPairs from "../LetterPairs";
import MatchAnimals from "../MatchAnimals";
import StickerBook from "../StickerBook";
import TraceLetters from "../TraceLetters";
import AlphabetHome from "../components/home/AlphabetHome";
export default function ActivityRouter({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  const onExit = () => onNavigate("home");
  switch (screen) {
    case "advanced":
      return <AdvancedLetters onExit={onExit} />;
    case "pairs":
      return <LetterPairs onExit={onExit} />;
    case "traceLetters":
    case "traceAnimals":
      return (
        <TraceLetters
          key={screen}
          initialMode={screen === "traceAnimals" ? "animal" : "letter"}
          onExit={onExit}
        />
      );
    case "stickers":
      return <StickerBook onExit={onExit} />;
    case "match":
      return <MatchAnimals onExit={onExit} />;
    case "find":
      return <FindLetter onExit={onExit} />;
    default:
      return <AlphabetHome onNavigate={onNavigate} />;
  }
}
