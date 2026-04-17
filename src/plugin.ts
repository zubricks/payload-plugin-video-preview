import type { Config } from "payload";
import type { VideoPreviewPluginOptions } from "./types.js";
import { getVideoPreviewFields } from "./fields.js";
import { getAfterChangeHook } from "./hooks/afterChange.js";

export const videoPreviewPlugin =
  (options: VideoPreviewPluginOptions) =>
  (config: Config): Config => ({
    ...config,
    collections: (config.collections ?? []).map((collection) => {
      if (!options.collections.includes(collection.slug)) return collection;
      if (!collection.upload) return collection;

      return {
        ...collection,
        fields: [...collection.fields, ...getVideoPreviewFields()],
        hooks: {
          ...collection.hooks,
          afterChange: [
            ...(collection.hooks?.afterChange ?? []),
            getAfterChangeHook(options),
          ],
        },
      };
    }),
  });
