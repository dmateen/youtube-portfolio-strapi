module.exports = {
  async afterCreate(event) {
    const { result } = event;

    // Assuming the link is available in the result object
    const link = result.link;

    if (!link) {
      console.error("No YouTube link found in the result object.");
      return;
    }

    try {
      // Process the link to get video details
      const videoDetails = await strapi
        .service("api::youtube-link.youtube-link")
        .processLink(link);

      if (!videoDetails) {
        console.error("Failed to retrieve video details.");
        return;
      }

      // Prepare the data to be saved in the database
      const dataToSave = {
        youtube_link: link,
        youtube_channel_name: videoDetails.channel,
        youtube_video_title: videoDetails.title,
        youtube_views: videoDetails.views,
        youtube_video_thumbnails: videoDetails.thumbnails,
        publishedAt: new Date(), // Mark the entry as published
      };

      // Save the data to the database using Entry service API
      const entry = await strapi.entityService.create(
        "api::youtube-link-data.youtube-link-data",
        {
          data: {
            ...dataToSave,
          },
        }
      );

      // Log success message
      console.log("YouTube video details saved successfully", entry);
    } catch (error) {
      console.error("Error processing YouTube link and saving data", error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    // Assuming the link is available in the result object
    const link = result.link;

    if (!link) {
      console.error("No YouTube link found in the result object.");
      return;
    }

    try {
      // Process the link to get updated video details
      const videoDetails = await strapi
        .service("api::youtube-link.youtube-link")
        .processLink(link);

      if (!videoDetails) {
        console.error("Failed to retrieve video details.");
        return;
      }

      // Prepare the data to be updated in the database
      const dataToUpdate = {
        youtube_channel_name: videoDetails.channel,
        youtube_video_title: videoDetails.title,
        youtube_views: videoDetails.views,
        youtube_video_thumbnails: videoDetails.thumbnails,
        publishedAt: new Date(), // Mark the entry as published
      };

      // Find the existing entry by link and update it
      const existingEntry = await strapi.entityService.findMany(
        "api::youtube-link-data.youtube-link-data",
        {
          filters: { youtube_link: link },
        }
      );

      if (existingEntry && existingEntry.length > 0) {
        const entryId = existingEntry[0].id;
        const updatedEntry = await strapi.entityService.update(
          "api::youtube-link-data.youtube-link-data",
          entryId,
          {
            data: {
              ...dataToUpdate,
            },
          }
        );

        // Log success message
        console.log("YouTube video details updated successfully", updatedEntry);
      } else {
        console.error("No existing entry found for the provided link.");
      }
    } catch (error) {
      console.error("Error processing YouTube link and updating data", error);
    }
  },

  async afterDelete(event) {
    const { result } = event;

    // Assuming the link is available in the result object
    const link = result.link;

    if (!link) {
      console.error("No YouTube link found in the result object.");
      return;
    }

    try {
      // Find the existing entry by link and delete it
      const existingEntry = await strapi.entityService.findMany(
        "api::youtube-link-data.youtube-link-data",
        {
          filters: { youtube_link: link },
        }
      );

      if (existingEntry && existingEntry.length > 0) {
        const entryId = existingEntry[0].id;
        await strapi.entityService.delete(
          "api::youtube-link-data.youtube-link-data",
          entryId
        );

        // Log success message
        console.log("YouTube video details deleted successfully");
      } else {
        console.error("No existing entry found for the provided link.");
      }
    } catch (error) {
      console.error("Error processing YouTube link and deleting data", error);
    }
  },
  async beforeDeleteMany(event) {
    const ids = event?.params?.where?.$and?.[0]?.id?.$in;

    if (!ids || ids.length === 0) {
      console.error("No YouTube link IDs found in the event parameters.");
      return;
    }

    try {
      const entries = await strapi.entityService.findMany(
        "api::youtube-link.youtube-link",
        {
          filters: { id: { $in: ids } },
        }
      );

      const links = entries.map((entry) => entry.link);

      if (links.length === 0) {
        console.error("No YouTube links found for the provided IDs.");
        return;
      }

      for (const link of links) {
        const existingEntries = await strapi.entityService.findMany(
          "api::youtube-link-data.youtube-link-data",
          {
            filters: { youtube_link: link },
          }
        );

        for (const entry of existingEntries) {
          if (entry) {
            await strapi.entityService.delete(
              "api::youtube-link-data.youtube-link-data",
              entry.id
            );
          }
        }
      }

      console.log("YouTube video details deleted successfully for all links");
    } catch (error) {
      console.error("Error processing YouTube links and deleting data", error);
    }
  },

  async afterUpdateMany(event) {
    const ids = event?.params?.where?.id?.$in;

    if (!ids || ids.length === 0) {
      console.error("No YouTube link IDs found in the event parameters.");
      return;
    }

    try {
      const entries = await strapi.entityService.findMany(
        "api::youtube-link.youtube-link",
        {
          filters: { id: { $in: ids } },
        }
      );

      for (const entry of entries) {
        const link = entry.link;

        if (!link) {
          console.error(`No YouTube link found for entry ID ${entry.id}.`);
          continue;
        }

        if (entry.publishedAt === null) {
          // If the entry is unpublished, delete the corresponding data entry
          const existingEntries = await strapi.entityService.findMany(
            "api::youtube-link-data.youtube-link-data",
            {
              filters: { youtube_link: link },
            }
          );

          for (const dataEntry of existingEntries) {
            if (dataEntry) {
              await strapi.entityService.delete(
                "api::youtube-link-data.youtube-link-data",
                dataEntry.id
              );
            }
          }
        } else {
          // If the entry is published, update the corresponding data entry
          const videoDetails = await strapi
            .service("api::youtube-link.youtube-link")
            .processLink(link);

          if (!videoDetails) {
            console.error(`Failed to retrieve video details for link ${link}.`);
            continue;
          }

          const dataToUpdate = {
            youtube_channel_name: videoDetails.channel,
            youtube_video_title: videoDetails.title,
            youtube_views: videoDetails.views,
            youtube_video_thumbnails: videoDetails.thumbnails,
            publishedAt: new Date(), // Mark the entry as published
          };

          const existingEntries = await strapi.entityService.findMany(
            "api::youtube-link-data.youtube-link-data",
            {
              filters: { youtube_link: link },
            }
          );

          if (existingEntries && existingEntries.length > 0) {
            const dataEntryId = existingEntries[0].id;
            await strapi.entityService.update(
              "api::youtube-link-data.youtube-link-data",
              dataEntryId,
              {
                data: {
                  ...dataToUpdate,
                },
              }
            );

            console.log(
              `YouTube video details updated successfully for link ${link}`
            );
          } else {
            await strapi.entityService.create(
              "api::youtube-link-data.youtube-link-data",
              {
                data: {
                  youtube_link: link,
                  ...dataToUpdate,
                },
              }
            );

            console.log(
              `YouTube video details created successfully for link ${link}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error processing YouTube links and updating data", error);
    }
  },
};
