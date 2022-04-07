const annotationWrappers = {
  bold: (content) => `<strong>${content}</strong>`,
  italic: (content) => `<em>${content}</em>`,
  strikethrough: (content) => `<strike>${content}</strike>`,
  underline: (content) => `<u>${content}</u>`,
  code: (content) => `<code>${content}</code>`,
  color: (content, color) =>
    `<span class="notion-color-${color}">${content}</span>`,
};

const renderTextWithAnnotations = (textNode) => {
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
    output = `<a href="${textNode.text.link.url}">${output}</a>`;
  }

  return output;
};

const richTextRenderers = {
  text: (textNode) => {
    return renderTextWithAnnotations(textNode);
  },
  mention: (textNode) =>
    `<a class="notion-mention" href="/page/${textNode.mention.page.id}">${textNode.plain_text}</a>`,
  equation: (textNode) => textNode.plain_text,
};

const renderRichText = (richTextNodes) => {
  return richTextNodes
    .map((textNode) => {
      const renderer = richTextRenderers[textNode.type];
      return renderer(textNode);
    })
    .join("");
};

const getFilenameFromUrl = (url) => {
  return url.split("/").slice(-1)[0].split("?")[0];
};

const renderers = {
  paragraph: (block) => `<p>${renderRichText(block.paragraph.rich_text)}</p>`,
  heading_1: (block) => `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`,
  heading_2: (block) => `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`,
  heading_3: (block) => `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`,
  callout: (block) =>
    `<aside>${renderRichText(block.callout.rich_text)}</aside>`,
  quote: (block) =>
    `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`,
  bulleted_list_item: (block) =>
    `<ul><li>${renderRichText(block.bulleted_list_item.rich_text)}</li></ul>`, // fix this
  numbered_list_item: (block) =>
    `<ol><li>${renderRichText(block.numbered_list_item.rich_text)}</li></ol>`,
  to_do: (block) =>
    `<label><input type="checkbox" ${
      block.to_do.checked ? "checked=''" : ""
    } onclick="return false;">${renderRichText(block.to_do.rich_text)}</label>`,
  toggle: (block) => {
    return `<details><summary>${renderRichText(
      block.toggle.rich_text
    )}</summary>${notionBlocksToHtml(block.children)}</details>`;
  },
  code: (block) => `<pre>${renderRichText(block.code.rich_text)}</pre>`,
  child_page: (block) =>
    `<div class="notion-child-page">${notionBlocksToHtml(
      block.children
    )}</pre>`, // to do
  child_database: (block) => `<pre>${JSON.stringify(block, null, 2)}</pre>`, // to do
  embed: (block) =>
    `<a href="${block.video.external.url}">${block.video.external.url}</a>`,
  image: (block) =>
    `<img src="${
      block.image.type === "external"
        ? block.image.external.url
        : block.image.file.url
    }" alt="" />`,
  video: (block) =>
    `<a href="${block.video.external.url}">${block.video.external.url}</a>`,
  file: (block) =>
    `<a href="${block.file.file.url}">${getFilenameFromUrl(
      block.file.file.url
    )}</a>`,
  pdf: (block) =>
    `<a href="${block.pdf.file.url}">${getFilenameFromUrl(
      block.pdf.file.url
    )}</a>`,
  bookmark: (block) =>
    `<a href="${block.bookmark.url}">${block.bookmark.url}</a>`,
  equation: (block) => `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  divider: () => `<hr />`,
  table_of_contents: (block) => `<p>Table of contents goes here</p>`,
  breadcrumb: (block) => `<p>Breacrumb goes here</p>`,
  column_list: (block) =>
    `<div class="columns-container">${notionBlocksToHtml(
      block.children
    )}</div>`,
  column: (block) =>
    `<div class="column">${notionBlocksToHtml(block.children)}</div>`,
  link_preview: (block) => `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  template: (block) => `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  link_to_page: (block) =>
    `<a href="${block.link_to_page.page_id}">Link to page</a>`, // think about getting the permalink and the page title somehow
  synced_block: (block) => `<pre>${JSON.stringify(block, null, 2)}</pre>`,
  table: (block) => {
    return `<table><tbody>${notionBlocksToHtml(
      block.children
    )}</tbody></table>`;
  }, // to do - headers
  table_row: (block) => {
    return `<tr>${block.table_row.cells
      .map((cell) => `<td>${renderRichText(cell)}</td>`)
      .join("")}</tr>`;
  },
};

const renderBlock = (block) => {
  const blockRenderer = renderers[block.type];

  console.log({ blocktoRender: block });

  const renderedBlock = blockRenderer(block);

  return renderedBlock;
};

const notionBlocksToHtml = function (blocks) {
  const renderedBlocks = blocks.map(renderBlock);

  return renderedBlocks.join("");
};

module.exports = {
  notionBlocksToHtml,
  renderRichText,
};
