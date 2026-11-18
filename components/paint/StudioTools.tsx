import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { StudioTool, studioColors, studioTools } from "../../studioLogic";
import ActionButton from "../ui/ActionButton";
type Props = {
  tool: StudioTool;
  onTool: (tool: StudioTool) => void;
  color: string;
  onColor: (color: string) => void;
  size: number;
  onSize: (size: number) => void;
  filled: boolean;
  onFilled: () => void;
  disabled: boolean;
};
export default function StudioTools({
  tool,
  onTool,
  color,
  onColor,
  size,
  onSize,
  filled,
  onFilled,
  disabled,
}: Props) {
  return (
    <>
      <ScrollView
        horizontal
        style={styles.strip}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        {studioTools.map((item) => (
          <ActionButton
            key={item.id}
            accessibilityLabel={`Use ${item.id} tool`}
            accessibilityState={{ selected: tool === item.id }}
            disabled={disabled}
            onPress={() => onTool(item.id)}
            style={tool === item.id ? styles.selected : undefined}
          >
            {item.label}
          </ActionButton>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        style={styles.strip}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        {studioColors.map((item) => (
          <ActionButton
            key={item.name}
            accessibilityLabel={`Studio color ${item.name}`}
            accessibilityState={{ selected: item.value === color }}
            disabled={disabled}
            onPress={() => onColor(item.value)}
            style={{
              backgroundColor: item.value,
              paddingHorizontal: 6,
              paddingVertical: 8,
              borderWidth: 3,
              borderColor: item.value === color ? "#6946BC" : "#E8DEF7",
            }}
            textStyle={{
              fontSize: 19,
              color: ["Orange", "Yellow", "White", "Pink"].includes(item.name)
                ? "#302A3C"
                : "#FFFFFF",
            }}
          >{`${item.name}${item.value === color ? " ✓" : ""}`}</ActionButton>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        style={styles.strip}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        {[4, 12, 24].map((value, index) => (
          <ActionButton
            key={value}
            accessibilityLabel={`${["Small", "Medium", "Big"][index]} studio brush`}
            accessibilityState={{ selected: size === value }}
            disabled={disabled}
            onPress={() => onSize(value)}
          >{`${["Small", "Medium", "Big"][index]}${size === value ? " ✓" : ""}`}</ActionButton>
        ))}
        <ActionButton
          accessibilityRole="switch"
          accessibilityLabel="Filled shapes"
          accessibilityState={{ checked: filled }}
          aria-checked={filled}
          disabled={disabled}
          onPress={onFilled}
        >
          {filled ? "● Filled shapes" : "◯ Outline shapes"}
        </ActionButton>
      </ScrollView>
    </>
  );
}
const styles = StyleSheet.create({
  strip: { width: "100%", height: 62, flexGrow: 0, marginVertical: 2 },
  row: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  selected: { backgroundColor: "#D9C5FF", borderWidth: 2, borderColor: "#6946BC" },
});
