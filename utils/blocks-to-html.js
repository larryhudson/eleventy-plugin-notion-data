const annotationWrappers = {
  bold: (content) => `<strong>${content}</strong>`,
  italic: (content) => `<em>${content}</em>`,
  strikethrough: (content) => `<strike>${content}</strike>`,
  underline: (content) => `<u>${content}</u>`,
  code: (content) => `<code>${content}</code>`,
  color: (content, color) =>
    `<span class="notion-color-${color}">${content}</span>`,
};

const renderTextWithAnnotations = ({ textNode, permalinkById }) => {
  var output = textNode.text.content;

  Object.entries(textNode.annotations).forEach(
    ([annotationType, annotationValue]) => {
      if (annotationType === "color" && annotationValue !== "default") {
        output = annotationWrappers.color(output, annotationValue);
      } else if (annotationValue === true) {
        // if the value is true, annotate
        const wrapper = annotationWrappers[annotationType];
        output = wrapper(output);
      }
    }
  );

  if (textNode.text.link) {
    console.log("text node link!");
    console.log(textNode);
    console.log(textNode.text.link);
    output = `<a href="${textNode.text.link.url}">${output}</a>`;
  }

  return output;
};

const richTextRenderers = {
  text: ({ textNode, permalinkById }) => {
    return renderTextWithAnnotations({ textNode, permalinkById });
  },
  mention: ({ textNode, permalinkById }) =>
    `<a class="notion-mention" href="${
      permalinkById[textNode.mention.page.id]
    }">${textNode.plain_text}</a>`,
  equation: ({ textNode, permalinkById }) => textNode.plain_text,
};

const renderRichText = (richTextNodes, permalinkById) => {
  return richTextNodes
    .map((textNode) => {
      const renderer = richTextRenderers[textNode.type];
      return renderer({ textNode, permalinkById });
    })
    .join("");
};

const renderPlainText = (textNodes) => {
  return textNodes.map((textNode) => textNode.plain_text).join("");
};

const getFilenameFromUrl = (url) => {
  return url.split("/").slice(-1)[0].split("?")[0];
};

const renderers = {
  paragraph: ({ block, permalinkById }) =>
    `<p>${renderRichText(block.paragraph.rich_text, permalinkById)}</p>`,
  heading_1: ({ block, permalinkById }) =>
    `<h1>${renderRichText(block.heading_1.rich_text, permalinkById)}</h1>`,
  heading_2: ({ block, permalinkById }) =>
    `<h2>${renderRichText(block.heading_2.rich_text, permalinkById)}</h2>`,
  heading_3: ({ block, permalinkById }) =>
    `<h3>${renderRichText(block.heading_3.rich_text, permalinkById)}</h3>`,
  callout: ({ block, permalinkById }) =>
    `<aside>${renderRichText(block.callout.rich_text, permalinkById)}</aside>`,
  quote: ({ block, permalinkById }) =>
    `<blockquote>${renderRichText(
      block.quote.rich_text,
      permalinkById
    )}</blockquote>`,
  bulleted_list_item: ({ block, permalinkById }) =>
    `<ul><li>${renderRichText(
      block.bulleted_list_item.rich_text,
      permalinkById
    )}</li></ul>`, // fix this
  numbered_list_item: ({ block, permalinkById }) =>
    `<ol><li>${renderRichText(
      block.numbered_list_item.rich_text,
      permalinkById
    )}</li></ol>`,
  to_do: ({ block, permalinkById }) =>
    `<label><input type="checkbox" ${
      block.to_do.checked ? "checked=''" : ""
    } onclick="return false;">${renderRichText(
      block.to_do.rich_text,
      permalinkById
    )}</label>`,
  toggle: ({ block, permalinkById }) => {
    return `<details><summary>${renderRichText(
      block.toggle.rich_text
    )}</summary>${notionBlocksToHtml(block.children, permalinkById)}</details>`;
  },
  code: ({ block, permalinkById }) =>
    `<pre>${renderRichText(block.code.rich_text, permalinkById)}</pre>`,
  child_page: ({ block, permalinkById }) =>
    `<div class="notion-child-page">${notionBlocksToHtml(
      block.children,
      permalinkById
    )}</pre>`, // to do
  child_database: ({ block, permalinkById }) =>
    `<pre>${JSON.stringify(block, null, 2)}</pre>`, // to do
  embed: ({ block, permalinkById }) =>
    `<a href="${block.video.external.url}">${block.video.external.url}</a>`,
  image: ({ block, permalinkById }) =>
    `<img src="${
      block.image.type === "external"
        ? block.image.external.url
        : block.image.file.url
    }" alt="" />`,
  video: ({ block, permalinkById }) =>
    `<a href="${block.video.external.url}">${block.video.external.url}</a>`,
  file: ({ block, permalinkById }) =>
    `<a href="${block.file.file.url}">${getFilenameFromUrl(
      block.file.file.url
    )}</a>`,
  pdf: ({ block, permalinkById }) =>
    `<a href="${block.pdf.file.url}">${getFilenameFromUrl(
      block.pdf.file.url
    )}</a>`,
  bookmark: ({ block, permalinkById }) =>
    `<a href="${block.bookmark.url}">${block.bookmark.url}</a>`,
  equation: ({ block, permalinkById }) =>
    `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  divider: () => `<hr />`,
  table_of_contents: ({ block, permalinkById }) =>
    `<p>Table of contents goes here</p>`,
  breadcrumb: ({ block, permalinkById }) => `<p>Breacrumb goes here</p>`,
  column_list: ({ block, permalinkById }) =>
    `<div class="columns-container">${notionBlocksToHtml(
      block.children,
      permalinkById
    )}</div>`,
  column: ({ block, permalinkById }) =>
    `<div class="column">${notionBlocksToHtml(
      block.children,
      permalinkById
    )}</div>`,
  link_preview: ({ block, permalinkById }) =>
    `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  template: ({ block, permalinkById }) =>
    `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  link_to_page: ({ block, permalinkById }) =>
    `<a href="${permalinkById[block.link_to_page.page_id]}">Link to page</a>`, // think about getting the permalink and the page title somehow
  synced_block: ({ block, permalinkById }) =>
    `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  table: ({ block, permalinkById }) => {
    return `<table><tbody>${notionBlocksToHtml(
      block.children,
      permalinkById
    )}</tbody></table>`;
  }, // to do - headers
  table_row: ({ block, permalinkById }) => {
    return `<tr>${block.table_row.cells
      .map((cell) => `<td>${renderRichText(cell, permalinkById)}</td>`)
      .join("")}</tr>`;
  },
};

const renderBlock = (block, permalinkById) => {
  const blockRenderer = renderers[block.type];

  const renderedBlock = blockRenderer({ block, permalinkById });

  return renderedBlock;
};

const notionBlocksToHtml = function (blocks, permalinkById) {
  const renderedBlocks = blocks.map((block) =>
    renderBlock(block, permalinkById)
  );

  return renderedBlocks.join("");
};

module.exports = {
  notionBlocksToHtml,
  renderRichText,
  renderPlainText,
};
