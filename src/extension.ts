import * as vscode from 'vscode';
import { join } from 'path';
import * as path from 'path';
import pascalCase from 'pascal-case';
import { uniq, sortBy } from 'lodash';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

import { processServicesAndComponents } from './tools/process-code';
import { processPaths } from './tools/process-paths';
import { processTemplates } from './tools/process-templates';
import { getStorage } from './lib/file-paths-storage';
import { printString } from './lib/pretty-print';
import { FilesPaths } from './lib/models/file-content';


const options: vscode.OpenDialogOptions = {
    canSelectFolders: true,
    canSelectFiles: false,
    openLabel: 'Add',
};

let rootAppDir = '';

console.log('here')

export async function activate(context: vscode.ExtensionContext) {

    vscode.window.showInformationMessage('Hello ! :) ngx-plantago is active');

        let disposable = vscode.commands.registerCommand('extension.ngx-plantago', async () => {

            vscode.window.showOpenDialog(options).then(folders => {
                if (folders) {
                    rootAppDir = folders[0].path;
                }
            
            if (rootAppDir.length > 0) {
                const rootPath = rootAppDir + '/';

            try {
                const templatesPromise = templates(rootPath);
    
                if (templatesPromise) {
                    templatesPromise.then(() => {
                        buildPathsStorage(rootPath);
                    });
                }
    
            } catch (e) {
                vscode.window.showErrorMessage(e);
                vscode.window.showErrorMessage('Path error'); 
                console.log(e);
            }
        }

        });
        context.subscriptions.push(disposable);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}

async function secondStep(rootPath: string) {
    // components
    return new Promise(async (resolve, reject) => {
        vscode.window.showInformationMessage('Start migration components');

        try {
            await convertService({base: rootPath, pattern: '**/*.component.js'});
        } catch (e) {
            reject(new Error('whoops'));
            return;

        }
        vscode.window.showInformationMessage('Finished migration components');

        // thirdStep(rootPath);
        // commented for now, proceed with modules

        workWithModules();

        resolve(true);
    });
}

async function buildPathsStorage(rootPath: string): Promise<boolean> {
    // saving paths to all js files in storage
    return new Promise(async (resolve, reject) => {
        vscode.window.showInformationMessage('Start saving paths');

        try {
            await workWithPaths({base: rootPath, pattern: '**/*.js'});
        } catch (e) {
            reject(new Error('whoops'));
            return;

        }

        vscode.window.showInformationMessage('Finished saving paths');
        firstStep(rootPath);

        resolve(true);
    });
}


async function firstStep(rootPath: string): Promise<boolean> {
    // services
    return new Promise(async (resolve, reject) => {
        vscode.window.showInformationMessage('Start migration services');

        try {
            await convertService({base: rootPath, pattern: '**/*.{service,config,grid-config,resolve}.js'});
        } catch (e) {
            reject(new Error('whoops'));
            return;

        }

        vscode.window.showInformationMessage('Finished migration services');
        secondStep(rootPath);

        resolve(true);
    });
}

async function thirdStep(rootPath: string): Promise<boolean> {
    // other js (configs, filters, etc).

return new Promise(async (resolve, reject) => {
    vscode.window.showInformationMessage('Start migration js files');

    try {
        await convertService({base: rootPath, pattern: '**/*.js'});
    } catch (e) {
        reject(new Error('whoops'));
        return;
    }

    vscode.window.showInformationMessage('Finished migration js files');

    workWithModules();

    resolve(true);
  });
}

async function templates(rootPath: string) {
    let res;
    vscode.window.showInformationMessage('Start work with templates');

    try {
        res = await convertTemplates({base: rootPath, pattern: '**/*.html'}, {
            base: rootPath,
            pattern: '**/*.component.js'
        });
    } catch (e) {
        vscode.window.showErrorMessage('Error during templates migration');
        console.log(e, 'error happened');
    }

    if (res) {
        vscode.window.showInformationMessage('Finish work with templates');
    }
}

async function convertService(globPath: { base: string; pattern: string }) {
    const files = await vscode.workspace.findFiles(globPath);

    files.forEach((file, index) => {
        const fileNumber = `${index + 1}/${files.length}`;
        vscode.window.showInformationMessage(`(${fileNumber}): Start processing the "${path.basename(file.path)}" file`);
        console.log(`Processing: ${path.basename(file.path)} - (${index + 1}/${files.length})`);
        const res = processServicesAndComponents(file, fileNumber);
        return res;
    });

    return true;
}

async function workWithPaths(globPath: { base: string; pattern: string }) {
    const files = await vscode.workspace.findFiles(globPath);

    files.forEach((file, index) => {
        vscode.window.showInformationMessage(`(${index + 1}/${files.length}): Getting path of the "${path.basename(file.path)}" file`);
        const res = processPaths(file);
        vscode.window.showInformationMessage(`(${index + 1}/${files.length}): Saved path of the "${path.basename(file.path)}" file`);
        return res;
    });

    return true;
}

function workWithModules(dataArray?: any) {
    // creating modules here

	let currentModule = '';
    const rootPath = join(vscode.workspace.rootPath as string, rootAppDir);
	let filesWithModulesData: FilesPaths[];
    if (!existsSync(rootPath + '/modules')) {
        mkdirSync(rootPath + '/modules');
    }

	if (dataArray) {
		filesWithModulesData = dataArray;
	} else {
		filesWithModulesData = getStorage();
	}

	let paths: string[] = [`import { NgModule } from \'@angular/core\';`, `import { CommonModule } from \'@angular/common\';`];
	let imports: string[] = ['CommonModule'];
	let providers: any[] = [];
    let declarations: any[] = [];
    let exports = '';

	filesWithModulesData.forEach((item:any) => {
		if (currentModule === '') {
         currentModule = item.moduleName;
		}

         if (currentModule === item.moduleName) {
			 item.isInModule = true;
			 switch (item.type) {
                case 'component':
                case 'filter':
				declarations.push(item.name);
				break;
				case 'service':
				case 'factory':
				providers.push(item.name);
				break;
			 }
             
             const filePath = path.relative(rootPath + '/modules/' + currentModule + '.module.ts', item.path).replace('../','').replace('.js','');
             paths.push(`import { ${item.name} } from '${filePath}';`);
		 }

		 return item;
	});

    providers = sortBy(uniq(providers));
    declarations = sortBy(uniq(declarations));
    imports = sortBy(uniq(imports));
    paths = sortBy(uniq(paths));

	const code =`${paths.join('\n')}
	${'@NgModule({'}${'\n'}
	${`imports: [${imports}],`}${'\n'}
	${`providers: [${providers}],`}${'\n'}
	${`declarations: [${declarations}],`}${'\n'}
	${`exports: [${exports}],`}${'\n'}
	${`entryComponents: [${declarations}],`}${'\n'}
	${`})`}
	${`export class  ${pascalCase(currentModule.replace(/\./g,' '))} {}`}`;

    printString(code);
    
    console.log(`MODULE ${rootPath + '/modules/' + currentModule + '.module.ts'} has been created`);
    vscode.window.showInformationMessage(`Module: ${currentModule + '.module.ts'} has been created`);

	writeFileSync(rootPath + '/modules/' + currentModule + '.module.ts' , code);

	filesWithModulesData = filesWithModulesData.filter(x => !x.isInModule);

    if (filesWithModulesData.length > 0) {
		workWithModules(filesWithModulesData);
	} 	
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

