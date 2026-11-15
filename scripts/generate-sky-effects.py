"""Generate original, quiet offline pop and kite-chime effects (no external samples)."""
from pathlib import Path
import math
import random
import struct
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parent.parent
DESTINATION = ROOT / "assets" / "effects"
DESTINATION.mkdir(parents=True, exist_ok=True)
SAMPLE_RATE = 22050
random.seed(42)

def generate(name, duration, sample):
    with tempfile.TemporaryDirectory() as directory:
        source = Path(directory) / (name + ".wav")
        with wave.open(str(source), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(SAMPLE_RATE)
            frames = []
            for index in range(int(duration * SAMPLE_RATE)):
                time = index / SAMPLE_RATE
                fade = min(1, time / 0.004) * min(1, (duration - time) / 0.02)
                value = max(-0.65, min(0.65, sample(time) * fade))
                frames.append(struct.pack("<h", round(value * 32767)))
            output.writeframes(b"".join(frames))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(source), "-b:a", "48k", str(DESTINATION / (name + ".mp3"))], check=True)

generate("pop", 0.21, lambda t: 0.42 * math.sin(2 * math.pi * (620 * t - 1100 * t * t)) * math.exp(-29 * t) + 0.16 * random.uniform(-1, 1) * math.exp(-50 * t))
generate("kite", 0.4, lambda t: (0.18 * math.sin(2 * math.pi * 784 * t) + 0.12 * math.sin(2 * math.pi * 1175 * t)) * math.exp(-9 * t))
print("Generated pop.mp3 and kite.mp3")
