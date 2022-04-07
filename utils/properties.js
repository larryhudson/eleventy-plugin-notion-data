const lodashMerge = require("lodash.merge");
const { renderRichText } = require("./blocks-to-html");

const propertyRenderers = {
  title: (prop) => renderRichText(prop.title),
  rich_text: (prop) => renderRichText(prop.rich_text),
  number: (prop) => prop.number,
  select: (prop) => prop.select,
  multi_select: (prop) => prop.multi_select,
  date: (prop) => prop.date,
  people: (prop) => prop.people,
  files: (prop) => prop.files,
  checkbox: (prop) => prop.checkbox,
  url: (prop) => prop.url,
  email: (prop) => prop.email,
  phone_number: (prop) => prop.phone_number,
  formula: (prop) => prop.formula,
  relation: (prop) => prop.relation,
  rollup: (prop) => prop.rollup,
  created_time: (prop) => prop.created_time,
  created_by: (prop) => prop.created_by,
  last_ediited_time: (prop) => prop.last_edited_time,
  last_edited_by: (prop) => prop.last_edited_by,
};

const renderProperties = (propertiesObj) => {
  const renderedPropertiesObjects = Object.entries(propertiesObj).map(
    ([propertyName, property]) => {
      const renderer = propertyRenderers[property.type];

      return {
        [propertyName]: renderer(property),
      };
    }
  );

  return lodashMerge(...renderedPropertiesObjects);
};

module.exports = {
  renderProperties,
};
