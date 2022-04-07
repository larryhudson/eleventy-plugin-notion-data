const { NotionPlugin } = require("./index");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(NotionPlugin);

  return {
    dir: {
      input: "test_input",
      output: "test_output",
    },
  };
};
