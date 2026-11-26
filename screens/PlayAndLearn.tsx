import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { activities, Screen } from "../data/activities";
import {
  activityGuide,
  GuideGroup,
  GuidedActivity,
  guideGroups,
  pickSurpriseGame,
} from "../data/activityGuide";
import { AnimatedAnimal } from "../AnimalArt";
import useActivityAudio from "../hooks/useActivityAudio";
import ActivityIntroModal from "../components/guide/ActivityIntroModal";
import ActivityGuideCard from "../components/guide/ActivityGuideCard";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
export default function PlayAndLearn({
  onExit,
  onNavigate,
}: {
  onExit: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const { width } = useWindowDimensions(),
    audio = useActivityAudio();
  const [group, setGroup] = useState<GuideGroup | "all">("play");
  const [selected, setSelected] = useState<GuidedActivity | null>(null);
  const [previousSurprise, setPreviousSurprise] = useState<GuidedActivity>();
  const cards = activities.filter((activity) => activity.id !== "guide");
  const visible = cards.filter(
    (activity) => group === "all" || activityGuide[activity.id].group === group,
  );
  const introduce = (id: GuidedActivity) => {
    setSelected(id);
    audio.introduce(activityGuide[id].instruction);
  };
  const close = () => {
    void audio.stop();
    setSelected(null);
  };
  const play = (id: GuidedActivity) => {
    void audio.stop();
    setSelected(null);
    onNavigate(id);
  };
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={audio.muted}
        onToggleSound={audio.toggleSound}
        soundLabel="Spoken introductions"
      />
      <Text style={styles.title}>🎉 Choose your adventure!</Text>
      <View style={styles.welcome}>
        <AnimatedAnimal letter="C" size={115} />
        <Text style={styles.intro}>
          1. Choose a friend or game.{"\n"}2. Hear how to play.{"\n"}3. Have fun and try again!
        </Text>
      </View>
      <ActionButton
        variant="primary"
        accessibilityLabel="Pick a game for me"
        onPress={() => {
          const id = pickSurpriseGame(previousSurprise);
          setPreviousSurprise(id);
          introduce(id);
        }}
      >
        🎲 Pick a game for me
      </ActionButton>
      <View style={styles.filters}>
        {guideGroups.map((item) => (
          <ActionButton
            key={item.id}
            accessibilityState={{ selected: item.id === group }}
            onPress={() => setGroup(item.id)}
          >
            {item.label}
          </ActionButton>
        ))}
      </View>
      <Text style={styles.count}>{visible.length} activities to explore</Text>
      <View style={styles.grid}>
        {visible.map((activity) => (
          <ActivityGuideCard
            key={activity.id}
            activity={activity}
            tablet={width >= 600}
            online={Boolean(activityGuide[activity.id].onlinePhotos)}
            grownups={activityGuide[activity.id].group === "grownups"}
            onIntroduction={() => introduce(activity.id)}
            onPlay={play}
          />
        ))}
      </View>
      <Text style={styles.note}>
        Introductions use your tablet's English voice. An installed English voice is needed for
        offline speech. No timer, no penalties—just discovering!
      </Text>
      <ActivityIntroModal
        activityId={selected}
        muted={audio.muted}
        onClose={close}
        onHear={() => {
          if (selected) audio.introduce(activityGuide[selected].instruction);
        }}
        onPlay={() => {
          if (selected) play(selected);
        }}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { alignItems: "center", padding: 14, paddingBottom: 35 },
  title: {
    color: "#57388E",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 16,
  },
  welcome: { flexDirection: "row", alignItems: "center", gap: 10, maxWidth: 650 },
  intro: { flex: 1, fontSize: 20, lineHeight: 30, color: "#267866", fontWeight: "800" },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    justifyContent: "center",
    marginTop: 16,
  },
  count: { color: "#9C3868", fontSize: 21, fontWeight: "800", marginVertical: 14 },
  grid: {
    width: "100%",
    maxWidth: 950,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  note: {
    color: "#615574",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 750,
    marginTop: 18,
  },
});
