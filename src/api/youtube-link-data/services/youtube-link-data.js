"use strict";

/**
 * youtube-link-data service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::youtube-link-data.youtube-link-data",
  ({ strapi }) => ({
    async updateYoutubeDetails() {
      try {
        // Fetch all entries from youtube-link-data collection
        const youtubeLinksData = await strapi.entityService.findMany(
          "api::youtube-link-data.youtube-link-data"
        );
        console.log("==== links ", youtubeLinksData);
        // Loop through each link and update with fresh data
        for (const linkData of youtubeLinksData) {
          const freshData = await strapi
            .service("api::youtube-link.youtube-link")
            .processLink(linkData.youtube_link);

          if (freshData) {
            // Update the database with the fresh data
            await strapi.entityService.update(
              "api::youtube-link-data.youtube-link-data",
              linkData.id,
              {
                data: {
                  youtube_channel_name: freshData.channelName,
                  youtube_video_title: freshData.videoTitle,
                  youtube_views: freshData.views,
                  youtube_video_thumbnails: freshData.thumbnails,
                },
              }
            );
          }
        }

        strapi.log.info("YouTube links data updated successfully");
      } catch (error) {
        strapi.log.error("Error updating YouTube links data:", error);
      }
    },
  })
);
