// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ts from 'typescript';
import { join } from 'path';
import { readFileSync } from 'fs';
import { convertJsToTs } from './rename-js-to-ts';

const rootAppDir = '/app';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "apollon" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.apollon', async() => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user

		const rootPath = join(vscode.workspace.rootPath as string, rootAppDir);

		vscode.window.showInformationMessage('Start renaming files from js to ts');

		const items = await vscode.workspace.findFiles(
			{base: rootPath, pattern: '**/*.js'},
			{base: rootPath, pattern: '**/*.spec.js'});

		const sourceFile = ts.createSourceFile(items[507].path, readFileSync(items[507].path).toString(), ts.ScriptTarget.TS, true);
		console.log(111111, items[507].path, sourceFile);

		// items.forEach(convertJsToTs);
		// vscode.window.showInformationMessage('Stop renaming files from js to ts');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
