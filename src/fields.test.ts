import { describe, it, expect } from "vitest";
import { getVideoPreviewFields } from "./fields.js";

describe("getVideoPreviewFields", () => {
  it("should return two group fields", () => {
    const fields = getVideoPreviewFields();
    expect(fields).toHaveLength(2);
    expect(fields[0].name).toBe("previewClip");
    expect(fields[1].name).toBe("previewThumbnail");
  });

  it("each group should have filename, filesize, mimeType, url subfields", () => {
    const fields = getVideoPreviewFields();
    for (const field of fields) {
      expect(field.type).toBe("group");
      const subNames = field.fields.map((f: { name: string }) => f.name);
      expect(subNames).toContain("filename");
      expect(subNames).toContain("filesize");
      expect(subNames).toContain("mimeType");
      expect(subNames).toContain("url");
    }
  });

  it("should return a new array each call (no shared state)", () => {
    const a = getVideoPreviewFields();
    const b = getVideoPreviewFields();
    expect(a).not.toBe(b);
  });
});
