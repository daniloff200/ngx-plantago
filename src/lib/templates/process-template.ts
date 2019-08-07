import * as cheerio from "cheerio";
import * as pretty from "js-beautify";
import { camelToDash } from "../camel-to-dash";
import { replaceComponentsProps } from "./replace-component-props";

// Reference for changes in templates https://angular.io/guide/ajs-quick-reference
export function processTemplate(template: any, componentDict: any) {
  /* tslint:disable:no-implicit-any */
  let result = template;

  const $ = cheerio.load(result, {
    normalizeWhitespace: false,
    decodeEntities: false
  });
  /*********************************** Processing template with cheerio *********************************/

    // Replace ng-bind
  const mdButton = $("md-button");
  mdButton.each(function(index, item) {
    // Do not use ()=>
    $(item).attr("mat-button", "mat-button");
  });

  // Replace ng-bind
  const ngBind = $("[ng-bind]");
  ngBind.each(function(index, item) {
    // Do not use ()=>
    const val = $(item).attr("ng-bind");
    $(item).removeAttr("ng-bind");
    $(item).text(`{{${val}}}`);
  });
  ngBind.removeAttr("ng-bind");

  // Replace ng-show
  const ngShow = $("[ng-show]");
  ngShow.each(function(index, item) {
    // Do not use ()=>
    const val = $(item).attr("ng-show");
    $(item).removeAttr("ng-show");
    $(item).attr("[hidden]", `!${val}`);
  });

  // in Angular2, structural directives cannot live on the same element, so *ngIf and *ngRepeat can't be on the same element.
  // solution is to move ngIf to a wrapper like ng-container, and not introduce new html elements.
  // https://angular.io/guide/structural-directives#group-sibling-elements-with-ng-container
  const ngIfngRepeats = $("[ng-if][ng-repeat]");
  ngIfngRepeats.each(function(index, item) {
    const $el = $(item);
    const ifVal = $el.attr("ng-if");

    $el.removeAttr("ng-if");
    $el.wrap($(`<ng-container ng-if="${ifVal}"></ng-container>`));
  });

  // Remove ng-model-options
  const ngModelOptions = $("[ng-model-options]");
  ngModelOptions.each(function(index, item) {
    $(item).removeAttr("ng-model-options");
  });

  const allInputs = $("input, select");
  allInputs.each(function(index, item) {
    const name = $(item).attr("name");
    if (name) {
      $(item).attr(`#${name}`, "ngModel");
    }
  });

  for (let componentKey in componentDict) {
    const components = $(componentKey);

    components.each(function(index, item) {

      const componentBindings = componentDict[componentKey];
      for (let newInputBinding of componentBindings.input) {
        const oldInputBinding = camelToDash(newInputBinding);
        const attrValue = $(item).attr(oldInputBinding);
        $(item).removeAttr(oldInputBinding);
        $(item).attr(`[${newInputBinding}]`, attrValue);
      }
      for (let newOutputBinding of componentBindings.output) {
        const oldOutputBinding = camelToDash(newOutputBinding);
        const attrValue = $(item).attr(oldOutputBinding);
        $(item).removeAttr(oldOutputBinding);
        $(item).attr(`(${newOutputBinding})`, attrValue);
      }
      for (let newBinding of componentBindings["two-way"]) {
        const oldBinding = camelToDash(newBinding);
        const attrValue = $(item).attr(oldBinding);
        $(item).removeAttr(oldBinding);
        $(item).attr(`[(${newBinding})]`, attrValue);
      }
    });
  }

  result = $("body").html();

  /*********************************** Processing template with regex replace ***************************/


  result = result.replace(/'true'/g, "true");
  result = result.replace(/'false/g, "false");

  // Replace one time bindings
  result = result.replace(/"::/g, "\"");
  result = result.replace(/{::/g, "{");

  // Remove $ctrl
  result = result.replace(/\::\$ctrl\./g, "");
  result = result.replace(/\$ctrl\./g, "");

  result = replaceComponentsProps(result);

  // Cheerio adds ="" to empty attributes
  result = result.replace(/=""/g, "");

  // Replace ng-if with *ngIf
  result = result.replace(/ng-if/g, "*ngIf");

  // Replace ng-click with (click)
  result = result.replace(/([^\w])ng-click([^\w])/g, "$1(click)$2");

  // Replace ng-dblclick with (dblclick)
  result = result.replace(/([^\w])ng-dblclick([^\w])/g, "$1(dblclick)$2");


  // Replace ng-blur with (blur)
  result = result.replace(/([^\w])ng-blur([^\w])/g, "$1(blur)$2");

  // Replace ng-focus with (focus)
  result = result.replace(/([^\w])ng-focus([^\w])/g, "$1(focus)$2");

  // Replace ng-mouseenter with (mouseenter)
  result = result.replace(/([^\w])ng-mouseenter([^\w])/g, "$1(mouseenter)$2");

  // Replace ng-mouseleave with (mouseleave)
  result = result.replace(/([^\w])ng-mouseleave([^\w])/g, "$1(mouseleave)$2");

  // Replace ng-mouseover with (mouseover)
  result = result.replace(/([^\w])ng-mouseover([^\w])/g, "$1(mouseover)$2");

  // Replace ng-keypress with (keypress)
  result = result.replace(/([^\w])ng-keypress([^\w])/g, "$1(keypress)$2");

  // Replace ng-keydown with (keydown)
  result = result.replace(/([^\w])ng-keydown([^\w])/g, "$1(keydown)$2");

  // Replace ng-change with (change)
  result = result.replace(/([^\w])ng-change([^\w])/g, "$1(change)$2");

  // Replace ng-change with (change)
  result = result.replace(/([^\w])ng-submit([^\w])/g, "$1(ngSubmit)$2");

  // Replace track by with trackBy
  result = result.replace(/([^\w])track by (\w+)(\..*)"/g, ";trackBy:$2?$3\"");

  // Replace ng-href with [href]
  result = result.replace(/([^\w])ng-href([^\w])/g, "$1[href]$2");
  result = result.replace(/\[href\]="((\w|\/)+)"/g, "href=\"$1\"");
  result = result.replace(
    /\[href\]="(.+){{(.*)}}(.*)"/g,
    "[href]=\"`$1${$2}$3`\""
  );
  result = result.replace(/\[href\]="{{(.*)}}"/g, "[href]=\"$1\"");
  result = result.replace(
    /\[href\]="`(.*)\${(.*)}(.*)`"/g,
    "[href]=\"'$1' + $2 + '$3'\""
  );
  result = result.replace(/\[href\]="(.*) \+ ''"/g, "[href]=\"$1\"");

  result = result.replace(/ng-class-even/g, "[class.even]");
  result = result.replace(/ng-class-odd/g, "[class.odd]");


  // Replace ng-class with [ngClass]
  result = result.replace(/([^\w])ng-class([^\w])/g, "$1[ngClass]$2");


  // Replace ng-style with [ngStyle]
  result = result.replace(/([^\w])ng-style([^\w])/g, "$1[ngStyle]$2");

  // Replace ng-src with [src]
  result = result.replace(/([^\w])ng-src([^\w])/g, "$1[src]$2");

  // Replace ng-bind-html with [innerHtml]
  // https://stackoverflow.com/questions/34585453/how-to-bind-raw-html-in-angular2
  result = result.replace(/([^\w])ng-bind-html([^\w])/g, "$1[innerHtml]$2");

  // Replace ng-hide with [hidden]
  result = result.replace(/([^\w])ng-hide([^\w])/g, "$1[hidden]$2");

  // Replace ng-disabled with [disabled]
  result = result.replace(/(ng-| )disabled="(.*)"/g, "[disabled]=\"$2\"");
  result = result.replace(/ng-disabled/, "[disabled]");

  // Replace ng-checked with [checked]
  // https://stackoverflow.com/questions/40214655/angular-2-checkbox-two-way-data-binding
  result = result.replace(/(ng-| )checked="(.*)"/g, "[checked]=\"$2\"");

  // Replace ng-model with [(ngModel)]
  result = result.replace(/([^\w])ng-model([^\w])/g, "$1[(ngModel)]$2");

  // Replace ng-model-options with [(ngModelOptions)]
  result = result.replace(/([^\w])ng-model-options([^\w])/g, "$1[ngModelOptions]$2");

  // Replace ng-value with [value]
  result = result.replace(/([^\w])ng-value([^\w])/g, "$1[value]$2");

  // Replace ng-required with [required]
  result = result.replace(/(ng-| )required="(.*)"/g, "[required]=\"$2\"");

  // Replace ng-pattern with [pattern]
  result = result.replace(/(ng-| )pattern="(.*)"/g, "[pattern]=\"$2\"");

  // Replace ng-repeat="x in ..." with *ngFor="let x of"
  result = result.replace(
    /([^\w])ng-repeat="(\w+)\sin\s([^"]*)"/g,
    "$1*ngFor=\"let $2 of $3\""
  );

  // Replace track by with ; trackBy
  result = result.replace(/track by/g, ";trackBy:");

  // Replace limitTo pipe in ngRepeats with slice pipe
  result = result.replace(/limitTo\s?:\s?([^"]*)/g, "slice:0:$1");

  // Replace ng-switch-when with *ngSwitchCase
  result = result.replace(
    /([^\w])ng-switch-when([^\w])/g,
    "$1*ngSwitchCase$2"
  );

  // Replace ng-switch-default with *ngSwitchDefault
  result = result.replace(
    /([^\w])ng-switch-default([^\w])/g,
    "$1*ngSwitchDefault$2"
  );

  // Replace ng-switch with [ngSwitch]
  result = result.replace(/([^\w])ng-switch([^\w])/g, "$1[ngSwitch]$2");

  // Replace itemtype with [attr.itemtype]
  result = result.replace(/itemtype="{{(.*)}}"/, "[attr.itemtype]=\"$1\"");

  // Replace ng-view with router-outlet
  result = result.replace(/ng-view/g, "router-outlet");

  // Replace ng-readonly
  result = result.replace(/ng-readonly/g, "[readonly]");

  // Replace ng-maxlength and ng-minlength
  result = result.replace(/ng-maxlength/g, "maxlength");
  result = result.replace(/ng-minlength/g, "minlength");

  // Replace &amp; after parse with &
  result = result.replace(/&amp;/g, "&");

  // Replace !=  and ==
  result = result.replace(/(?:^|\W)==(?:$|\W)/g, " === ");
  result = result.replace(/(?:^|\W)!=(?:$|\W)/g, " !== ");

  result = pretty.html(result, {
    unformatted: ["code", "pre", "em", "strong"],
    indent_inner_html: true,
    indent_char: " ",
    indent_size: 4,
    wrap_attributes: "force-aligned"
  });

  return result;
}