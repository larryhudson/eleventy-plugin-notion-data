const { AssetCache } = require("@11ty/eleventy-fetch");
const { renderProperties } = require("./properties");

async function fetchBlockWithChildren(blockId, notionClient) {
  try {
    const { results, ...blockResponse } =
      await notionClient.blocks.children.list({
        block_id: blockId,
      });

    const childrenBlocks = results;

    const fetchedChildren = await Promise.all(
      childrenBlocks.map(async (block) => {
        if (block.has_children) {
          // recursive!
          const children = await fetchBlockWithChildren(block.id, notionClient);
          return { ...block, children };
        }
        return block;
      })
    );

    return fetchedChildren;
  } catch (error) {
    console.log("error!");
    console.error(error);
  }
}

async function fetchPage(pageId, notionClient, getPermalinkFromData) {
  const pageInfo = notionClient.pages.retrieve({
    page_id: pageId,
  });

  const pageBlocks = fetchBlockWithChildren(pageId, notionClient);

  try {
    const [info, children] = await Promise.all([pageInfo, pageBlocks]);

    const renderedProperties = renderProperties(info.properties);

    const permalink = getPermalinkFromData(info);

    const pageData = { ...info, children, renderedProperties, permalink };

    return pageData;
  } catch (error) {
    console.log("error!");
    console.error(error);
  }
}

const fetchQuery = async ({
  queryName,
  queryPromise,
  notionClient,
  fetchBlocks,
  cacheTime,
  getPermalinkFromData,
}) => {
  let cachedQuery = new AssetCache(`notion_query_${queryName}`);

  if (cachedQuery.isCacheValid(cacheTime)) {
    return cachedQuery.getCachedValue();
  }

  let queryValue = await queryPromise;

  let permalinkById = {};

  queryValue.results.forEach((page) => {
    permalinkById[page.id] = getPermalinkFromData(page);
  });

  if (fetchBlocks) {
    const blocks = await Promise.all(
      queryValue.results.map((block) =>
        fetchPage(block.id, notionClient, getPermalinkFromData)
      )
    );

    queryValue.results = blocks;

    queryValue.permalinkById = permalinkById;

    console.log(JSON.stringify(queryValue, null, 2));
  }

  cachedQuery.save(queryValue, "json");

  return queryValue;
};

module.exports = {
  fetchQuery,
};
