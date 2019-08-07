import * as parse5 from "parse5";

import { dashToCamel } from '../dash-to-camel';

const htmlTagsDictionary = [
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdo", "blockquote", ""
  , "body", "br", "button", "canvas", "caption", "code", "cite", "col", "colgroup", "datalist", "dd", "del", "details", "dfn",
  "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "head", "header", "h1"
  , "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "ins", "input", "kbd", "label", "legend", "li", "link", "map", "mark"
  , "menu", "menuitem", "meta", "meter", "nav", "object", "ol"
  , "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "s", "samp", "script", "section",
  "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "td", "th", "tr", "textarea", "time", "title", "track",
  "u", "ul", "var", "video", "ng-container"
];

export function replaceComponentsProps(htmlData: any) {

  try {
    parse5.parse(htmlData);
  } catch (e) {
    return htmlData;
  }

  const htmlAstTree: any = parse5.parse(htmlData);

  htmlAstTree.childNodes.forEach((treeItem: any) => {
    return getInfo(treeItem);
  });


  const htmlTransformed: any = parse5.serialize(htmlAstTree).match(/<body[^>]*>([\w|\W]*)<\/body>/im);
  return htmlTransformed[1];
}

function getInfo(node: any) {

  if (!node) {
    return node;
  }

  addToDoForNotMigratedDirectives(node);


  if (!(htmlTagsDictionary.indexOf((node.nodeName)) > -1)) {

    if (node.attrs) {
      transformAttributes(node);
    }
  }

  if (!node.childNodes || node.childNodes.length === 0) {
    return node;
  }

  node.childNodes.forEach((cbNode: any) => {

    if (!(cbNode as any).nodeName) {
      return cbNode;
    }

    if (!(htmlTagsDictionary.indexOf(((cbNode as any).nodeName)) > -1)) {

      if ((cbNode as any).attrs) {
        transformAttributes(cbNode);
      }
    }

    if ((cbNode as any).childNodes) {
      getInfo(cbNode);

    }

    return cbNode;

  });

  return node;
}

function transformAttributes(node: any) {
  node.attrs.forEach((attr: any, index: any) => {
    if (attr.name.indexOf("ng-") > -1) {
      return;
    }

    const camelizedName = dashToCamel(attr.name);

    if (/(\[.*?\])/gm.test(attr.name)
      || /(\(.*?\))/gm.test(attr.name)) {
      return;
    }

    if (attr.value.indexOf("$event") > -1) {
      const outputName = "(" + camelizedName + ")";
      attr.name = outputName;
    } else {
      const inputName = "[" + camelizedName + "]";
      attr.name = inputName;
    }

    if (attr.value.indexOf("") || /^[A-Z]/.test(attr.value)) {
      attr.value = "'" + attr.value + "'";
    }
  });
}

function addToDoForNotMigratedDirectives(node: any) {
  const directives = ["ng-message", "ng-messages", "ng-true-value", "ng-false-value", "ng-init"];

  directives.forEach((item, index) => {
    node.attrs.forEach((attr: any) => {
      if (item.indexOf(attr.name) > -1) {

        node.childNodes.unshift(
          {
            nodeName: "#comment",
            data: "ToDo fix " + item,
            parentNode: node
          });
      }
    });
  });
}