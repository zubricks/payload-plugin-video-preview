import { describe, it, expect } from "vitest";
import { videoPreviewPlugin } from "./plugin.js";
import type { Config } from "payload";

const baseOptions = {
  collections: ["media"],
  vercelBlob: { token: "tok" },
};

const makeConfig = (overrides: Partial<Config> = {}): Config =>
  ({
    collections: [],
    ...overrides,
  }) as unknown as Config;

describe("videoPreviewPlugin", () => {
  it("should return a function that transforms Config", () => {
    const transform = videoPreviewPlugin(baseOptions);
    expect(typeof transform).toBe("function");
  });

  it("should not modify collections not in options.collections", () => {
    const config = makeConfig({
      collections: [{ slug: "posts", fields: [], upload: false } as any],
    });
    const result = videoPreviewPlugin(baseOptions)(config);
    expect(result.collections![0]).toBe(config.collections![0]);
  });

  it("should not modify upload collections not in options.collections list", () => {
    const config = makeConfig({
      collections: [{ slug: "other-media", fields: [], upload: true } as any],
    });
    const result = videoPreviewPlugin(baseOptions)(config);
    expect(result.collections![0]).toBe(config.collections![0]);
  });

  it("should inject previewClip and previewThumbnail fields into targeted upload collections", () => {
    const config = makeConfig({
      collections: [{ slug: "media", fields: [], upload: true } as any],
    });
    const result = videoPreviewPlugin(baseOptions)(config);
    const mediaCollection = result.collections!.find(
      (c) => c.slug === "media",
    )!;
    const fieldNames = mediaCollection.fields.map((f: any) => f.name);
    expect(fieldNames).toContain("previewClip");
    expect(fieldNames).toContain("previewThumbnail");
  });

  it("should register an afterChange hook on targeted upload collections", () => {
    const config = makeConfig({
      collections: [{ slug: "media", fields: [], upload: true } as any],
    });
    const result = videoPreviewPlugin(baseOptions)(config);
    const mediaCollection = result.collections!.find(
      (c) => c.slug === "media",
    )!;
    expect(mediaCollection.hooks?.afterChange).toHaveLength(1);
    expect(typeof mediaCollection.hooks!.afterChange![0]).toBe("function");
  });

  it("should preserve existing afterChange hooks", () => {
    const existingHook = async () => {};
    const config = makeConfig({
      collections: [
        {
          slug: "media",
          fields: [],
          upload: true,
          hooks: { afterChange: [existingHook] },
        } as any,
      ],
    });
    const result = videoPreviewPlugin(baseOptions)(config);
    const mediaCollection = result.collections!.find(
      (c) => c.slug === "media",
    )!;
    expect(mediaCollection.hooks!.afterChange).toHaveLength(2);
    expect(mediaCollection.hooks!.afterChange![0]).toBe(existingHook);
  });

  it("should not modify a collection with upload: false", () => {
    const config = makeConfig({
      collections: [{ slug: "media", fields: [], upload: false } as any],
    });
    const result = videoPreviewPlugin(baseOptions)(config);
    expect(result.collections![0]).toBe(config.collections![0]);
  });
});
