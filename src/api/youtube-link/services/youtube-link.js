"use strict";

/**
 * youtube-link service
 */

const { createCoreService } = require("@strapi/strapi").factories;

const API_KEY = process.env.YOUTUBE_DEV;

async function getVideoDetails(videoId) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );
    const data = await response.json();
    const video = data.items[0];

    if (video) {
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;
      const views = video.statistics.viewCount;
      const thumbnails = video.snippet.thumbnails;
      return { title, channel, views, thumbnails };
    }
  } catch (error) {
    console.error(`Error fetching video details: ${error}`);
  }
  return null;
}

module.exports = createCoreService(
  "api::youtube-link.youtube-link",
  ({ strapi }) => ({
    async processLink(youtubeLink) {
      try {
        let videoId;
        if (youtubeLink.includes("youtu.be")) {
          videoId = youtubeLink.split("youtu.be/")[1].split("?")[0];
        } else if (youtubeLink.includes("youtube.com")) {
          videoId = youtubeLink.split("v=")[1].split("&")[0];
        }
        const details = await getVideoDetails(videoId);
        if (details) {
          console.error("=====Processed Link - Successfully");
          return {
            title: details.title,
            channel: details.channel,
            views: details.views,
            thumbnails: details.thumbnails,
            link: youtubeLink,
          };
        }
      } catch (error) {
        console.error("Error processing link", error);
        throw new Error("Error processing link");
      }
      return null;
    },
  })
);
