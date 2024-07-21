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
      return { title, channel, views };
    }
  } catch (error) {
    console.error(`Error fetching video details: ${error}`);
  }
  return null;
}

module.exports = createCoreService(
  "api::youtube-link.youtube-link",
  ({ strapi }) => ({
    async processLinks(youtubePortfolioLinks) {
      try {
        const videoData = [];

        for (const link of youtubePortfolioLinks) {
          let videoId;
          if (link.includes("youtu.be")) {
            videoId = link.split("youtu.be/")[1].split("?")[0];
          } else if (link.includes("youtube.com")) {
            videoId = link.split("v=")[1].split("&")[0];
          }
          const details = await getVideoDetails(videoId);
          if (details) {
            videoData.push({
              title: details.title,
              channel: details.channel,
              views: details.views,
              link: link,
            });
          }
        }

        videoData.sort((a, b) => b.views - a.views);
        return videoData;
      } catch (error) {
        console.error("Error processing links", error);
        throw new Error("Error processing links");
      }
    },
  })
);
