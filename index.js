require("dotenv").config();
const lodashMerge = require("lodash.merge");
const { Client } = require("@notionhq/client");
const { fetchQuery } = require("./utils/fetch-query");
const { notionBlocksToHtml } = require("./utils/blocks-to-html");

const NotionPlugin = (eleventyConfig, suppliedOptions) => {
  const defaultOptions = {
    integrationToken: process.env.NOTION_INTEGRATION_TOKEN,
    cacheTime: "10m",
    queries: {
      blogPages: {
        fetchBlocks: true,
        queryFunction: async (notion) =>
          notion.databases.query({
            database_id: process.env.NOTION_BLOG_DATABASE_ID,
          }),
      },
    },
  };

  const options = lodashMerge(defaultOptions, suppliedOptions);

  eleventyConfig.addGlobalData("notionData", async () => {
    const notionClient = new Client({
      auth: options.integrationToken,
    });

    // group all the queries into a single promise and await it
    const resolvedQueries = await Promise.all(
      // turn the queries object into an array of [queryName, queryFunction] and map them
      Object.entries(options.queries).map(async ([queryName, queryOptions]) =>
        // return an object with {queryName: resolvedData}
        ({
          [queryName]: await fetchQuery({
            queryName,
            fetchBlocks: queryOptions.fetchBlocks,
            queryPromise: queryOptions.queryFunction(notionClient),
            notionClient,
            cacheTime: options.cacheTime,
          }),
        })
      )
    )
      // then merge them together as an object
      .then((resultObjects) => lodashMerge(...resultObjects));

    return resolvedQueries;
  });

  eleventyConfig.addFilter("blocksToHtml", notionBlocksToHtml);
};

module.exports = {
  NotionPlugin,
};
