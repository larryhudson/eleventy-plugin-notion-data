# `eleventy-plugin-notion-data`

This is a plugin for using [Notion](https://notion.so) data in your Eleventy project.

This is a work in progress.

## What this does (or will do)

This plugin:

- lets you add queries that fetch data from your Notion integration
- caches the response with Eleventy Fetch so that it's not polling the API too much
- adds a `blocksToHtml` filter that converts blocks to semantic HTML
- renders the properties of each page so they're easy to use in your templates

## Installation

### Install package

`npm install github:larryhudson/eleventy-plugin-notion-data`

### Add to `.eleventy.js`

```js
const { NotionPlugin } = require("eleventy-plugin-notion-data");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(NotionPlugin);
};
```

## Configuration options

Configuration options coming soon!

## To do list

1. Work out how you could hyperlink from page to page.
