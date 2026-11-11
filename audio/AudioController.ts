export type Playback = { finished: Promise<void>; stop: () => void };
export type AudioDriver = {
  startClip: (id: string) => Playback;
  stopSpeech: () => Promise<unknown>;
};
/** One owner for recorded playback and device speech. New requests cancel old ones. */
export class AudioController {
  private generation = 0;
  private active: Playback | null = null;
  constructor(private driver: AudioDriver) {}
  async stop() {
    this.generation++;
    this.active?.stop();
    this.active = null;
    await this.driver.stopSpeech();
  }
  async play(ids: readonly string[], fallback: () => void = () => {}) {
    const request = ++this.generation;
    const safeFallback = () => {
      try {
        fallback();
      } catch {
        /* Device speech may be unavailable. */
      }
    };
    this.active?.stop();
    this.active = null;
    try {
      await this.driver.stopSpeech();
    } catch {
      /* Continue recorded playback if device TTS is unavailable. */
    }
    if (request !== this.generation) return;
    if (!ids.length) {
      safeFallback();
      return;
    }
    try {
      for (const id of ids) {
        if (request !== this.generation) return;
        this.active = this.driver.startClip(id);
        await this.active.finished;
        if (request !== this.generation) return;
        this.active = null;
      }
    } catch {
      if (request === this.generation) {
        this.active?.stop();
        this.active = null;
        safeFallback();
      }
    }
  }
}
