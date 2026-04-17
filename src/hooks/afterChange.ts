import os from "os";
import path from "path";
import fs from "fs/promises";
import { createRequire } from "module";
import ffmpeg from "fluent-ffmpeg";
import { put } from "@vercel/blob";
import type { CollectionAfterChangeHook } from "payload";
import type { VideoPreviewPluginOptions } from "../types.js";

const require = createRequire(import.meta.url);
const ffmpegPath: string | null = require("ffmpeg-static");

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

const runFFmpeg = (command: ReturnType<typeof ffmpeg>): Promise<void> =>
  new Promise((resolve, reject) => {
    command.on("end", () => resolve()).on("error", reject).run();
  });

export const getAfterChangeHook =
  (options: VideoPreviewPluginOptions): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, collection, req }) => {
    if (req.context?.skipVideoProcessing) return doc;
    if (typeof doc.mimeType !== "string" || !doc.mimeType.startsWith("video/"))
      return doc;
    if (operation === "update" && doc.filename === previousDoc?.filename)
      return doc;
    if (!req.file?.data) return doc;

    const { startTime = 0, duration = 15 } = options.clipOptions ?? {};
    const thumbnailTime = options.thumbnailTime ?? 1;
    const prefix = options.vercelBlob.prefix ?? "video-previews/";
    const token = options.vercelBlob.token;

    const basename = path.parse(doc.filename as string).name;
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "payload-vidpreview-"),
    );
    const inputPath = path.join(tmpDir, "input.mp4");
    const clipPath = path.join(tmpDir, `${basename}-preview.mp4`);
    const thumbPath = path.join(tmpDir, `${basename}-thumbnail.jpg`);

    try {
      await fs.writeFile(inputPath, req.file.data as Buffer);

      await runFFmpeg(
        ffmpeg(inputPath)
          .setStartTime(startTime)
          .duration(duration)
          .videoCodec("copy")
          .audioCodec("copy")
          .output(clipPath),
      );

      await runFFmpeg(
        ffmpeg(inputPath)
          .setStartTime(thumbnailTime)
          .frames(1)
          .output(thumbPath),
      );

      const [clipBuffer, thumbBuffer] = await Promise.all([
        fs.readFile(clipPath),
        fs.readFile(thumbPath),
      ]);

      const clipFilename = `${basename}-preview.mp4`;
      const thumbFilename = `${basename}-thumbnail.jpg`;

      const [clipResult, thumbResult] = await Promise.all([
        put(path.posix.join(prefix, clipFilename), clipBuffer, {
          access: "public",
          contentType: "video/mp4",
          token,
        }),
        put(path.posix.join(prefix, thumbFilename), thumbBuffer, {
          access: "public",
          contentType: "image/jpeg",
          token,
        }),
      ]);

      req.context.skipVideoProcessing = true;
      await req.payload.update({
        id: doc.id as string,
        collection: collection.slug,
        data: {
          previewClip: {
            filename: clipFilename,
            filesize: clipBuffer.byteLength,
            mimeType: "video/mp4",
            url: clipResult.url,
          },
          previewThumbnail: {
            filename: thumbFilename,
            filesize: thumbBuffer.byteLength,
            mimeType: "image/jpeg",
            url: thumbResult.url,
          },
        },
      });
    } catch (err) {
      req.payload.logger.error({
        err,
        msg: "video-preview-plugin: failed to process video",
      });
    } finally {
      delete req.context.skipVideoProcessing;
      await fs.rm(tmpDir, { recursive: true, force: true });
    }

    return doc;
  };
