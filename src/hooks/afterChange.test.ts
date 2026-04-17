import { describe, it, expect, vi } from "vitest";
import { getAfterChangeHook } from "./afterChange.js";

const baseOptions = {
  collections: ["media"],
  vercelBlob: { token: "tok" },
};

const makeArgs = (overrides: Record<string, any> = {}) => ({
  doc: { id: "1", filename: "video.mp4", mimeType: "video/mp4" },
  previousDoc: { filename: "old.mp4" },
  operation: "create" as const,
  collection: { slug: "media" } as any,
  req: {
    context: {},
    file: {
      data: Buffer.from("fake"),
      name: "video.mp4",
      mimetype: "video/mp4",
      size: 4,
    },
    payload: {
      logger: { error: vi.fn() },
      update: vi.fn().mockResolvedValue({}),
    },
  },
  ...overrides,
});

describe("getAfterChangeHook - skip conditions", () => {
  it("should return doc unchanged if skipVideoProcessing is set in context", async () => {
    const hook = getAfterChangeHook(baseOptions);
    const args = makeArgs({
      req: { ...makeArgs().req, context: { skipVideoProcessing: true } },
    });
    const result = await hook(args as any);
    expect(result).toBe(args.doc);
    expect(args.req.payload.update).not.toHaveBeenCalled();
  });

  it("should return doc unchanged if mimeType is not video/", async () => {
    const hook = getAfterChangeHook(baseOptions);
    const args = makeArgs({
      doc: { id: "1", filename: "photo.jpg", mimeType: "image/jpeg" },
    });
    const result = await hook(args as any);
    expect(result).toBe(args.doc);
    expect(args.req.payload.update).not.toHaveBeenCalled();
  });

  it("should return doc unchanged on update when filename has not changed", async () => {
    const hook = getAfterChangeHook(baseOptions);
    const args = makeArgs({
      operation: "update",
      doc: { id: "1", filename: "same.mp4", mimeType: "video/mp4" },
      previousDoc: { filename: "same.mp4" },
    });
    const result = await hook(args as any);
    expect(result).toBe(args.doc);
    expect(args.req.payload.update).not.toHaveBeenCalled();
  });

  it("should return doc unchanged if req.file is missing", async () => {
    const hook = getAfterChangeHook(baseOptions);
    const args = makeArgs({ req: { ...makeArgs().req, file: undefined } });
    const result = await hook(args as any);
    expect(result).toBe(args.doc);
    expect(args.req.payload.update).not.toHaveBeenCalled();
  });
});
