module.exports = {
  "0 0 * * *": async ({ strapi }) => {
    console.log("==== Cron job running");

    try {
      await strapi
        .service("api::youtube-link-data.youtube-link-data")
        .updateYoutubeDetails();
      console.log("==== YouTube links data updated successfully");
    } catch (error) {
      console.error("Error updating YouTube links data:", error);
    }
  },
};
