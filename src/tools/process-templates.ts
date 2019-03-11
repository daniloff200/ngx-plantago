import * as path from "path";
import { readFileSync, writeFileSync } from "fs";

import { getSourceFile } from "../lib/get-source-file";
import { getOutputFilePath } from "../lib/get-output-file-path";
import { makeDirectoriesInPath } from "../lib/make-directories-in-path";
import { getBindings } from "../lib/get-bindings";
import { processTemplate } from "../lib/templates/process-template";

export function processTemplates(templateFiles: any, componentFiles: any) {
  const encoding = "UTF-8";

  /**
   * key is tag selector
   * value is {
   *  inputs: [],
   *  outputs: [],
   *  both: []
   * }
   */
  const componentDict: any = {};

  (componentFiles || []).forEach((file: any) => {
    // Estimation based on the filename - assumed consistent
    let componentKey = path.basename(file.path);
    componentKey = componentKey.replace(/\.component\.ts/, "");
    const componentBindings: any = {
      input: [],
      output: [],
      "two-way": []
    };
    const ast = getSourceFile(file);
    const bindings = getBindings(ast);
    for (let binding of bindings) {
      componentBindings[binding.type].push(binding.name);
    }
    componentDict[componentKey] = componentBindings;
  });

  templateFiles.forEach((file: any) => {
    console.log(`Processing: ${path.basename(file.path)}`);
    const template = readFileSync(file.path, encoding);
    const outputTemplatePath = getOutputFilePath(file);

    makeDirectoriesInPath(outputTemplatePath);

    if (!checkThatFileWasMigrated(template)) {
      writeFileSync(
        outputTemplatePath,
        processTemplate(template, componentDict),
        encoding
      );

      console.log(`    Migrated: ${path.basename(outputTemplatePath)}`);
    } else {
      console.log(`     ${path.basename(outputTemplatePath)} has been migrated already`);
    }

  });

  console.log(`Converted ${templateFiles.length} templates. \n\n`);
}

function checkThatFileWasMigrated(template: string) {
  let result = false;
  const migratedNgAttributes = ["*ngIf", "ngSwitch", "ngModel", "innerHtml", "ngClass", "ngStyle", "(click)", "trackBy", "(change)", "(ngSubmit)"];

  migratedNgAttributes.forEach((attr) => {
    if (template.indexOf(attr) > -1) {
      result = true;
      return;
    }
  });

  return result;
}
