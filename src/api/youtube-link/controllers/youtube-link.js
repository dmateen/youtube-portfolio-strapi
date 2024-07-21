"use strict";

/**
 * youtube-link controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::youtube-link.youtube-link",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        pagination: {
          limit: -1,
        },
      };
      // Fetch all youtube-link entries
      const { data, meta } = await super.find(ctx);

      // Extract links from the response
      const links = data.map((entry) => entry.attributes.link);

      // Call the service to process the links and get video details
      const videoDetails = await strapi
        .service("api::youtube-link.youtube-link")
        .processLinks(links);

      // Append the video details to the response
      return { videoDetails, meta };
    },
  })
);
