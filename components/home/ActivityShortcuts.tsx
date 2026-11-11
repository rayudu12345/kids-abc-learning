import React from "react";
import { View } from "react-native";
import { Screen } from "../../SideMenu";
import ActionButton from "../ui/ActionButton";
const shortcuts: { screen: Screen; title: string; color: string }[] = [
  { screen: "phonics", title: "👄 Letter sounds", color: "#A24475" },
  { screen: "counting", title: "🔢 Numbers and counting", color: "#267F67" },
  { screen: "colorsShapes", title: "🎨 Colors and shapes", color: "#426EAE" },
  { screen: "traceLowercase", title: "✍️ Trace lowercase a–z", color: "#8B5FA8" },
  { screen: "audio", title: "🔊 Listen and explore", color: "#9B711D" },
  { screen: "find", title: "🐾 Play: Find the letter!", color: "#6946BC" },
  { screen: "match", title: "🐶 Play: Match the animals!", color: "#287F67" },
  { screen: "stickers", title: "⭐ My sticker book", color: "#9B711D" },
  { screen: "traceLetters", title: "✍️ Trace letters A–Z!", color: "#A0567C" },
  { screen: "pairs", title: "🔤 Play: Big & little letters!", color: "#367B9B" },
  { screen: "advanced", title: "🚀 Advanced Letters", color: "#5559A8" },
  { screen: "traceAnimals", title: "🐾 Play: Trace animals!", color: "#A76128" },
];
export default function ActivityShortcuts({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 12,
      }}
    >
      {shortcuts.map((item) => (
        <ActionButton
          key={item.screen}
          variant="primary"
          style={{ backgroundColor: item.color, width: "45%", minHeight: 72 }}
          onPress={() => onNavigate(item.screen)}
        >
          {item.title}
        </ActionButton>
      ))}
    </View>
  );
}
