import { describe, it, expect } from "vitest";
import reels from "./reels.cjs";

const { xfadeOffsets, reelsDuration, buildReelsFfmpegArgs, planReelsFrames } = reels;

describe("reels: xfade zamanlaması", () => {
  it("4 kare, 5s/kare, 1s geçiş → offset [4,8,12], toplam 17s", () => {
    expect(xfadeOffsets(4, 5, 1)).toEqual([4, 8, 12]);
    expect(reelsDuration(4, 5, 1)).toBe(17);
  });
  it("3 kare → offset [4,8], toplam 13s", () => {
    expect(xfadeOffsets(3, 5, 1)).toEqual([4, 8]);
    expect(reelsDuration(3, 5, 1)).toBe(13);
  });
});

describe("reels: buildReelsFfmpegArgs", () => {
  const frames = ["f0.png", "f1.png", "f2.png", "f3.png"];
  const args = buildReelsFfmpegArgs(frames, { out: "out.mp4" });

  it("her kare için -loop 1 -t girdi ekler", () => {
    expect(args.filter((a) => a === "-loop")).toHaveLength(4);
    frames.forEach((f) => expect(args).toContain(f));
  });
  it("sessiz, yuv420p, sabit fps, faststart çıkışı", () => {
    expect(args).toContain("-an");
    expect(args[args.indexOf("-pix_fmt") + 1]).toBe("yuv420p");
    expect(args).toContain("libx264");
    expect(args[args.length - 1]).toBe("out.mp4");
  });
  it("filter_complex xfade zincirini içerir", () => {
    const fc = args[args.indexOf("-filter_complex") + 1];
    expect(fc).toContain("xfade=transition=fade:duration=1:offset=4");
    expect(fc).toContain("xfade=transition=fade:duration=1:offset=12");
    expect(fc).toContain("[vout]");
  });
  it("tek kare için de geçerli argüman üretir", () => {
    const a = buildReelsFfmpegArgs(["only.png"], { out: "o.mp4" });
    expect(a).toContain("-an");
    expect(a[a.length - 1]).toBe("o.mp4");
  });
  it("boş kare / out yok / geçiş >= süre hata verir", () => {
    expect(() => buildReelsFfmpegArgs([], { out: "o.mp4" })).toThrow();
    expect(() => buildReelsFfmpegArgs(["f.png"], {})).toThrow(/out/);
    expect(() => buildReelsFfmpegArgs(["a.png", "b.png"], { out: "o.mp4", perFrame: 1, transition: 1 })).toThrow(/transition/);
  });
});

describe("reels: planReelsFrames", () => {
  it("4 kare üretir (intro, başlık, özet, CTA)", () => {
    const f = planReelsFrames({ title: "Kaygı", excerpt: "Kısa özet" });
    expect(f.map((x) => x.kind)).toEqual(["intro", "title", "excerpt", "cta"]);
    expect(f[1].text).toBe("Kaygı");
    expect(f[2].text).toBe("Kısa özet");
  });
  it("özet boşsa yedek metin kullanır", () => {
    const f = planReelsFrames({ title: "T", excerpt: "" });
    expect(f[2].text).toMatch(/web sitemizde/);
  });
});
