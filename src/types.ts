export type VideoPreviewPluginOptions = {
  /** Upload collection slugs to target. Only collections with `upload: true` are processed. */
  collections: string[];
  clipOptions?: {
    /** Seconds from start to begin the clip. Default: 0 */
    startTime?: number;
    /** Duration of the clip in seconds. Default: 15 */
    duration?: number;
  };
  /** Seconds into the video to capture the thumbnail frame. Default: 1 */
  thumbnailTime?: number;
  vercelBlob: {
    /** BLOB_READ_WRITE_TOKEN from Vercel. Pass `process.env.BLOB_READ_WRITE_TOKEN`. */
    token: string | undefined;
    /** Path prefix for generated files in Vercel Blob. Default: 'video-previews/' */
    prefix?: string;
  };
};
