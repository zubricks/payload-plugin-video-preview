import type { Field } from "payload";

const mediaSubFields = (): Field[] => [
  { name: "filename", type: "text", admin: { hidden: true } },
  { name: "filesize", type: "number", admin: { hidden: true } },
  { name: "mimeType", type: "text", admin: { hidden: true } },
  { name: "url", type: "text" },
];

export const getVideoPreviewFields = (): Field[] => [
  {
    name: "previewClip",
    type: "group",
    admin: { readOnly: true },
    fields: mediaSubFields(),
  },
  {
    name: "previewThumbnail",
    type: "group",
    admin: { readOnly: true },
    fields: mediaSubFields(),
  },
];
