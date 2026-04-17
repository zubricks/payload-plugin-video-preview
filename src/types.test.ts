// src/types.test.ts
import { describe, it, expectTypeOf } from "vitest";
import type { VideoPreviewPluginOptions } from "./types.js";

describe("VideoPreviewPluginOptions", () => {
  it("should accept full options", () => {
    const opts: VideoPreviewPluginOptions = {
      collections: ["media"],
      clipOptions: { startTime: 5, duration: 10 },
      thumbnailTime: 2,
      vercelBlob: { token: "tok", prefix: "vids/" },
    };
    expectTypeOf(opts).toMatchTypeOf<VideoPreviewPluginOptions>();
  });

  it("should accept minimal options (only required fields)", () => {
    const opts: VideoPreviewPluginOptions = {
      collections: ["media"],
      vercelBlob: { token: undefined },
    };
    expectTypeOf(opts).toMatchTypeOf<VideoPreviewPluginOptions>();
  });
});
