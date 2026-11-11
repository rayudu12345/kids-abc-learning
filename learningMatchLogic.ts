export function tryLearningMatch(
  matched: readonly string[],
  source: string,
  target: string | undefined,
  allowed: readonly string[],
) {
  if (!allowed.includes(source) || matched.includes(source) || source !== target)
    return { correct: false, matched: [...matched] };
  return { correct: true, matched: [...matched, source] };
}
