import type { Field } from "payload";

const mediaSubFields = (): Field[] => [
  { name: "filename", type: "text", admin: { hidden: true } },
  { name: "filesize", type: "number", admin: { hidden: true } },
  { name: "mimeType", type: "text", admin: { hidden: true } },
  { name: "url", type: "text" },
];

export const getVideoPreviewFields = (): Field[] => [
  {
    name: "clipStartTime",
    type: "number",
    label: "Clip Start Time (seconds)",
    admin: { description: "Where to start the preview clip. Defaults to plugin config." },
  },
  {
    name: "clipDuration",
    type: "number",
    label: "Clip Duration (seconds)",
    admin: { description: "How long the preview clip should be. Defaults to plugin config." },
  },
  {
    name: "thumbnailTime",
    type: "number",
    label: "Thumbnail Time (seconds)",
    admin: { description: "Which frame to use as the thumbnail. Defaults to plugin config." },
  },
  {
    name: "reprocessVideo",
    type: "checkbox",
    label: "Regenerate Preview & Thumbnail",
    defaultValue: false,
    admin: { description: "Check and save to regenerate the clip and thumbnail with the settings above." },
  },
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
