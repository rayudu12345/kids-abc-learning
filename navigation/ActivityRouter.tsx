import React from "react";
import AnimalPuzzles from "../screens/AnimalPuzzles";
import PlayAndLearn from "../screens/PlayAndLearn";
import PaintStudio from "../screens/PaintStudio";
import ColoringAnimals from "../screens/ColoringAnimals";
import SurpriseEggs from "../screens/SurpriseEggs";
import MemoryPairs from "../screens/MemoryPairs";
import AnimalSounds from "../screens/AnimalSounds";
import SkyPlay from "../screens/SkyPlay";
import ProgressBackup from "../screens/ProgressBackup";
import ColorsShapes from "../screens/ColorsShapes";
import Counting from "../screens/Counting";
import Phonics from "../screens/Phonics";
import AudioLibrary from "../screens/AudioLibrary";
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
    case "puzzles":
      return <AnimalPuzzles onExit={onExit} />;
    case "guide":
      return <PlayAndLearn onExit={onExit} onNavigate={onNavigate} />;
    case "skyPlay":
      return <SkyPlay onExit={onExit} />;
    case "backup":
      return <ProgressBackup onExit={onExit} />;
    case "colorsShapes":
      return <ColorsShapes onExit={onExit} />;
    case "counting":
      return <Counting onExit={onExit} />;
    case "phonics":
      return <Phonics onExit={onExit} />;
    case "paint":
      return <PaintStudio onExit={onExit} />;
    case "coloring":
      return <ColoringAnimals onExit={onExit} onOpenStudio={() => onNavigate("paint")} />;
    case "eggs":
      return <SurpriseEggs onExit={onExit} />;
    case "memory":
      return <MemoryPairs onExit={onExit} />;
    case "animalSounds":
      return <AnimalSounds onExit={onExit} />;
    case "audio":
      return <AudioLibrary onExit={onExit} />;
    case "advanced":
      return <AdvancedLetters onExit={onExit} />;
    case "pairs":
      return <LetterPairs onExit={onExit} />;
    case "traceLowercase":
    case "traceLetters":
    case "traceAnimals":
      return (
        <TraceLetters
          key={screen}
          initialMode={
            screen === "traceAnimals"
              ? "animal"
              : screen === "traceLowercase"
                ? "lowercase"
                : "letter"
          }
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
