"use strict";

/**
 * youtube-link-data controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::youtube-link-data.youtube-link-data",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        pagination: {
          limit: -1,
        },
      };

      const { data, meta } = await super.find(ctx);

      // Sort the data based on youtube_views in descending order
      // data.sort(
      //   (a, b) => b.attributes.youtube_views - a.attributes.youtube_views
      // );

      // Append the video details to the response if needed
      return { data, meta };
    },
  })
);
