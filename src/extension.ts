// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { join } from "path";

import { processServices } from "./tools/process-services";
import { processTemplates } from "./tools/process-templates";

const rootAppDir = "app/";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your extension \"apollon\" is now active!");

  // The command has been defined in the package.json file1
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.apollon", async () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user

    const rootPath = join(vscode.workspace.rootPath as string, rootAppDir);

    vscode.window.showInformationMessage("Start renaming files from js to ts");

    // await processComponents({base: rootPath, pattern: '**/*component.{js,ts}'});
    // resolve
    await convertService({ base: rootPath, pattern: "**/*.{service,config,grid-config}.js" });
    // await processPipes({base: rootPath, pattern: '**/*pipe.{js,ts}'});

    vscode.window.showInformationMessage("Start work with templates");

    await convertTemplates({ base: rootPath, pattern: "**/*.{template,tpl,component}.html" }, {
      base: rootPath,
      pattern: "**/*.component.js"
    });
    vscode.window.showInformationMessage("Finish work with templates");

    // await processFiles({base: rootPath, pattern: '**/*component.{js,ts}'});
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

// async function processComponents(globPath: {base: string; pattern: string}) {
// 	const tool = require('./tools/process-components');
// 	const files = await vscode.workspace.findFiles(globPath);
//
// 	tool(files);
// }

async function convertService(globPath: { base: string; pattern: string }) {
  const files = await vscode.workspace.findFiles(globPath);
  //processServices(files);
}

// async function processPipes(globPath: {base: string; pattern: string}) {
// 	const tool = require('./tools/process-services');
// 	const files = await vscode.workspace.findFiles(globPath);
// 	tool(files);
// }

async function convertTemplates(globPath: { base: string; pattern: string }, componentGlobPath: { base: string; pattern: string }) {
  const files = await vscode.workspace.findFiles(globPath);
  const componentFiles = await vscode.workspace.findFiles(componentGlobPath);
  processTemplates(files, componentFiles);
}

//
// async function processFiles(globPath: {base: string; pattern: string}) {
// 	const tool = require('./tools/process-files');
// 	const files = await vscode.workspace.findFiles(globPath);
// 	tool(files);
// }
//
//
