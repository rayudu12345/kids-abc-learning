/** Select recordings without substituting letter names for phonemes or dropping definitions. */
export function selectClips(text: string, available: (id: string) => boolean): string[] {
  const trimmed = text.trim(),
    word = trimmed
      .toLowerCase()
      .replace(/[!.]+$/, "")
      .replace(/ /g, "-");
  if (/^[A-Z]$/.test(trimmed) && available(`letter-${trimmed}`)) return [`letter-${trimmed}`];
  if (/^[a-z]+(?:-[a-z]+)*$/.test(word) && available(word)) return [word];
  const basic = trimmed.match(/^([A-Z])! \1 is for ([^!]+)!(?: Meow!| A soft roar!)?$/);
  if (!basic) return [];
  const id = basic[2].toLowerCase().replace(/ /g, "-");
  if (!available(`letter-${basic[1]}`) || !available(id)) return [];
  const clips = [`letter-${basic[1]}`, id];
  const sound = basic[1] === "C" ? "sound-cat" : basic[1] === "D" ? "sound-dog" : null;
  if (sound && available(sound)) clips.push(sound);
  return clips;
}
