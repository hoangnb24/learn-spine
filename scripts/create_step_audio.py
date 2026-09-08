"""Create a quiet, original PCM impact for the Spine editor audio exercise."""
from pathlib import Path
import math
import random
import struct
import wave


def main():
    output = Path(__file__).resolve().parents[1] / "exercises/robot/audio/footstep.wav"
    output.parent.mkdir(parents=True, exist_ok=True)
    sample_rate = 22050
    duration = 0.16
    rng = random.Random(20)
    samples = []
    for index in range(round(duration * sample_rate)):
        t = index / sample_rate
        attack = min(1.0, t / 0.003)
        release = min(1.0, (duration - t) / 0.015)
        thump = math.sin(2 * math.pi * (120 * t - 110 * t * t)) * math.exp(-35 * t)
        click = rng.uniform(-1, 1) * math.exp(-110 * t)
        value = 0.22 * attack * release * (0.8 * thump + 0.2 * click)
        samples.append(round(value * 32767))
    with wave.open(str(output), "wb") as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(sample_rate)
        stream.writeframes(struct.pack(f"<{len(samples)}h", *samples))
    print(f"{output}: mono PCM16, {sample_rate} Hz, {duration}s")


if __name__ == "__main__":
    main()
