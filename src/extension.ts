// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { join } from 'path';
import * as path from 'path';

import { processServices } from './tools/process-services';
import { processTemplates } from './tools/process-templates';

const rootAppDir = 'app/';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "apollon" is now active!');

	// The command has been defined in the package.json file1
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.apollon', async() => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user

		const rootPath = join(vscode.workspace.rootPath as string, rootAppDir);

	try {
	//	await second(rootPath);
		const promise1 = templates(rootPath);

		if (promise1) {
			promise1.then((value: any) => {
				second(rootPath);
			});
		}
	
	} catch (e) {
		console.log(e);
	}

	//	const finalResult = [await first(rootPath), await second(rootPath), third(rootPath)];

	// 	// vscode.window.showInformationMessage('Start migration services');
	// 	await convertService({base: rootPath, pattern: '**/*.{service,config,grid-config,resolve}.js'});
  //       // vscode.window.showInformationMessage('Finished migration services');
  //   vscode.window.showInformationMessage('Start migration js files');
  //  await convertService({base: rootPath, pattern: '**/*.js'});
  //   vscode.window.showInformationMessage('Finished migration js files');
	// 	// await processTemplates({base: rootPath, pattern: '**/*.{template,tpl}.html'}, {base: rootPath, pattern: '**/*component.{js,ts}'});
	// 	// await processFiles({base: rootPath, pattern: '**/*component.{js,ts}'});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

async  function first(rootPath: string) {
	return new Promise(async (resolve, reject) => {
		vscode.window.showInformationMessage('Start migration components');

		try {
			await convertService({base: rootPath, pattern: '**/*.component.js'});
				} catch (e) {
			 reject(new Error('whoops'));
			 return;

		}
		vscode.window.showInformationMessage('Finished migration components');
     
			resolve(true);
	 });
	}


async	 function second(rootPath: string): Promise<boolean> {
	 return new Promise(async (resolve, reject) => {
		vscode.window.showInformationMessage('Start migration services');

		try {
	   await convertService({base: rootPath, pattern: '**/*.{service,config,grid-config,resolve}.js'});
		} catch (e) {
			 reject(new Error('whoops'));
			 return;

		}
		

		  vscode.window.showInformationMessage('Finished migration services');
     	    first(rootPath);

			resolve(true);
	 });
	}

async	 function third(rootPath: string) {
	let b;
	//return new Promise(async res => {
		vscode.window.showInformationMessage('Start migration js files');


		try {
			b =	await convertService({base: rootPath, pattern: '**/*.js'});
		} catch (e) {
			console.log(e, 'error happened');
		}

		if (b) {
			vscode.window.showInformationMessage('Finished migration js files');

			console.log('finish')
		}
	//	 res();
//	});

	 }

	 async	 function templates(rootPath: string) {
		let b;
		//return new Promise(async res => {
			vscode.window.showInformationMessage('Start work with templates');
	
	
			try {
				b =     await convertTemplates({ base: rootPath, pattern: '**/*.html' }, {
					base: rootPath,
					pattern: '**/*.component.js'
				  });
			} catch (e) {
				console.log(e, 'error happened');
			}
	
			if (b) {
				vscode.window.showInformationMessage('Finish work with templates');
			}
		//	 res();
	//	});
	
		 }

async function convertService(globPath: {base: string; pattern: string}) {
	const files = await vscode.workspace.findFiles(globPath);

    files.forEach((file, index) => {
	vscode.window.showInformationMessage(`(${index + 1}/${files.length}): Start processing the "${path.basename(file.path)}" file`);
    const a = processServices(file);
    vscode.window.showInformationMessage(`(${index + 1}/${files.length}): Finished processing the "${path.basename(file.path)}" file`);
    return a;
 });

 return true;
}


async function convertTemplates(globPath: { base: string; pattern: string }, componentGlobPath: { base: string; pattern: string }) {
	const files = await vscode.workspace.findFiles(globPath);
	const componentFiles = await vscode.workspace.findFiles(componentGlobPath);
	await processTemplates(files, componentFiles);
	return true;
  }
// async function processFiles(globPath: {base: string; pattern: string}) {
// 	const tool = require('./tools/process-files');
// 	const files = await vscode.workspace.findFiles(globPath);
// 	tool(files);
// }
