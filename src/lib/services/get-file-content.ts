import { SyntaxKind, Node, CallExpression, Statement, Block, VariableStatement, FunctionDeclaration, BinaryExpression, PropertyAccessExpression } from 'typescript';
import { FileContent, LifecycleHook, Variable } from '../models/file-content';
import * as _ from 'lodash';

let fileContentNameIdentifier: string;
let declaredThings: { [hey: string]: any } = {};
let fileContent: FileContent;

const decorators: string[] = ['service', 'factory', 'component', 'filter'];
const lifecycleHooks: string[] = ['$onInit', '$onDestroy', '$onChanges'];

export function getFileContent(ast: Node): FileContent | undefined {
    fileContentNameIdentifier = '';
    declaredThings = {};
    fileContent = initFileContent();
      
     getType(ast);

    if (fileContent.type === 'config' || fileContent.type === '') {
        return;
    } 

    parseFileContent(ast);

    if (fileContent.lifecycleHooks && fileContent.lifecycleHooks.length > 0) {
        fileContent.lifecycleHooks = (fileContent.lifecycleHooks as LifecycleHook[]).map(hook => {
            if (!hook.body) {
                fileContent.methods = fileContent.methods.filter(method => {
                    if (method.name !== hook.identifier) {
                        return method;
                    }

                    hook.body = method.body;
                    hook.arguments = method.arguments;
                });
            }

            fileContent.methods.unshift({
                name: `ng${hook.name}`,
                arguments: hook.arguments as string[],
                body: hook.body as string
            });

            return hook.name;
        });
    }

    return fileContent;
}

function parseFileContent(node: Node) {
    node.forEachChild(cbNode => {
        if (cbNode.getChildCount() === 0) {
            return;
        }

        if (!(cbNode as any).name) {
            parseFileContent(cbNode);

            return;
        }


        // if (!decorators.includes((cbNode as any).name.text)) {
        //     parseFileContent(cbNode);

        //     return;
        // }

        if (cbNode.kind === SyntaxKind.VariableDeclaration) {
            declaredThings[(cbNode as any).name.text] = (cbNode as any).initializer;
        }

        if ((cbNode as any).name.text === 'module' && cbNode.parent.kind === SyntaxKind.CallExpression) {
            getModuleName(cbNode.parent as CallExpression);
        }

        if (decorators.includes((cbNode as any).name.text) && cbNode.parent.kind === SyntaxKind.CallExpression) {
            fileContent.type = (cbNode as any).name.text;

          if( fileContent.type === 'config') {
              return;
          }

            getName(cbNode.parent as CallExpression);
        }

        if ((cbNode as any).name.text === '$inject' && cbNode.kind === SyntaxKind.PropertyAccessExpression && cbNode.parent.kind === SyntaxKind.BinaryExpression) {
            if ((cbNode.parent as any).right.kind === SyntaxKind.Identifier) {
                const name = (cbNode.parent as any).right.text;
                if (!declaredThings[name]) {
                    return;
                }

                getInjects(declaredThings[name].elements);
                return;
            }

            getInjects((cbNode.parent as any).right.elements);
        }

        const isFunctionDeclaration = cbNode.kind === SyntaxKind.FunctionDeclaration;

        if ((isFunctionDeclaration && (cbNode as any).name.text === fileContentNameIdentifier)) {
            getBody((cbNode as any).body);
        }

        parseFileContent(cbNode);
    });
}

function getModuleName(node: CallExpression) {
    fileContent.moduleName = (node.arguments[0] as any).text;
}

function getName(node: CallExpression) {
    fileContent.declaredName = (node.arguments[0] as any).text;

    if (node.arguments[1].kind !== SyntaxKind.Identifier) {
        getInjects((node.arguments[1] as any).elements);
    }

    if (node.arguments[1].kind === SyntaxKind.Identifier) {
        const name = (node.arguments[1] as any).text;
        const body = declaredThings[name];

        if (!body) {
            fileContentNameIdentifier = name;
            return;
        }

        if (body.kind === SyntaxKind.FunctionDeclaration || body.kind === SyntaxKind.FunctionExpression) {
            getBody(body.body);

            return;
        }


        if (body.kind === SyntaxKind.ObjectLiteralExpression) {
            body.properties.forEach((item: any) => {
                switch (item.name.text) {
                    case 'controller':
                        fileContentNameIdentifier = item.initializer.text;
                        break;

                    case 'templateUrl':
                        fileContent.component.templateUrl = item.initializer.text;
                        break;

                    case 'bindings':
                        item.initializer.properties.forEach((property: any) => {
                            const variable: Variable = {
                                isPrivate: false,
                                name: property.name.text,
                                type: 'any',
                                value: null,
                                isInput: true
                            };

                            if (property.initializer.text === '&') {
                                variable.type = 'EventEmitter<any>';
                                variable.value = 'new EventEmitter<any>()';
                                variable.isOutput = true;
                                variable.isInput = false;
                            }

                            fileContent.variables.push(variable);
                        });

                        break;
                }
            });
        }
    }
}

function getInjects(items: any[]) {
    items.forEach(item => {
        if (item.kind === SyntaxKind.StringLiteral) {
            fileContent.constructor.dependencies.push(item.text);
        }

        if (item.kind === SyntaxKind.FunctionExpression) {
            getBody(item.body);
        }
    });
}

function getBody(node: Block) {
    node.statements.forEach((item: Statement) => {
        if (item.kind === SyntaxKind.VariableStatement) {
            const variableStatement = item as VariableStatement;

            variableStatement.declarationList.declarations.forEach(item => {
                if (item.getChildCount() === 0) {
                    return;
                }

                const children = item.getChildren();
                const value = children[2] || null;
                if (value && value.kind === SyntaxKind.ThisKeyword) {
                    return;
                }

                const variableName: string = children[0].getText();
                const variableBody: any = value;

                if (variableBody) {
                    getVariable(variableName, variableBody);
                }
            });

            return;
        }

        if (item.kind === SyntaxKind.ReturnStatement) {
            let funArguments: string[] = [];
            let body = (item as any).getText();

            if ((item as any).expression.kind === SyntaxKind.FunctionExpression) {
                funArguments = (item as any).expression.parameters.map((parameter: any) => parameter.name.text);
                // let declaredFunctionBody: string[] = getInnerFunctionDeclaration((item as any).expression as FunctionDeclaration);

                // if (declaredFunctionBody) {
                //     declaredFunctionBody.forEach(element => {
                //         body = body.replace(element, '');
                //     });
                // }
            }


            if (fileContent.type === 'filter') {
                fileContent.methods.push({
                    name: 'transform',
                    arguments: funArguments,
                    body: `{\n${body}\n}`
                });

                return;
            }

            fileContent.methods.push({
                name: 'get',
                arguments: funArguments,
                body: `{\n${body}\n}`
            });

            return;
        }

        if (item.kind === SyntaxKind.FunctionDeclaration) {
            let body = (item as any).body.getText();
            // let declaredFunctionBody: string[] = getInnerFunctionDeclaration(item as FunctionDeclaration);

            // if (declaredFunctionBody) {
            //     declaredFunctionBody.forEach(element => {
            //         body = body.replace(element, '');
            //     });
            // }

            fileContent.methods.push({
                name: (item as any).name.text,
                arguments: (item as any).parameters.map((parameter: any) => parameter.name.text),
                body
            });

            return;
        }

        if (item.kind !== SyntaxKind.ExpressionStatement) {
            return;
        }

        if ((item as any).expression.kind === SyntaxKind.CallExpression) {
            fileContent.constructor.context += item.getText() + '\n';
            return;
        }

        if ((item as any).expression.kind === SyntaxKind.BinaryExpression &&
            (item as any).expression.left.kind === SyntaxKind.PropertyAccessExpression &&
            (item as any).expression.left.expression.kind === SyntaxKind.Identifier &&
            (item as any).expression.left.expression.text === '$rootScope') {
            fileContent.constructor.context += item.getText() + '\n';

            return;
        }


        const variableName = (item as any).expression.left.name.text;
        const variableBody = (item as any).expression.right;

        if (lifecycleHooks.includes(variableName)) {
            if (variableBody.kind === SyntaxKind.Identifier) {
                const context = fileContent.methods.find(method => method.name === variableBody.text);
                fileContent.lifecycleHooks.push({
                    name: variableName.replace('$o', 'O'),
                    body: context ? context.body : '',
                    arguments: context ? context.arguments : [],
                    identifier: variableBody.text
                });
            }

            if (variableBody.kind === SyntaxKind.FunctionExpression) {
                fileContent.lifecycleHooks.push({
                    name: variableName.replace('$o', 'O'),
                    body: variableBody.body.getText(),
                    arguments: variableBody.parameters.map((parameter: any) => parameter.name.text),
                });
            }

            return;
        }

        if (variableBody.kind === SyntaxKind.FunctionExpression) {
            fileContent.methods.push({
                name: (item as any).expression.left.name.text,
                arguments: variableBody.parameters.map((parameter: any) => parameter.name.text),
                body: variableBody.body.getText()
            });

            return;
        }

        if ((item as any).expression.left.kind === SyntaxKind.BinaryExpression) {
            getDeclaredVariables((item as any).expression);
            return;
        }

        getVariable(variableName, variableBody);
    });
}

function getInnerFunctionDeclaration(declaredFunction: FunctionDeclaration): string[] {
    const time = new Date().getTime();
    declaredThings[time] = [];

    getFunctionDeclaration(declaredFunction, declaredThings[time]);

    return declaredThings[time];
}

function getFunctionDeclaration(node: any, box: string[]) {
    node.forEachChild((cbNode: any) => {
        if (cbNode.getChildCount() === 0) {
            return;
        }

        if (cbNode.kind !== SyntaxKind.FunctionDeclaration) {
            getFunctionDeclaration(cbNode, box);

            return;
        }

        let body = cbNode.body.getText();
        // let declaredFunctionBody: string[] = getInnerFunctionDeclaration(cbNode as FunctionDeclaration);

        // if (declaredFunctionBody) {
        //     declaredFunctionBody.forEach(element => {
        //         body = body.replace(element, '');
        //     });
        // }

        fileContent.methods.push({
            name: cbNode.name.text,
            arguments: cbNode.parameters.map((parameter: any) => parameter.name.text),
            body
        });

        box.push(cbNode.getText());
    });
}

function getDeclaredVariables(item: BinaryExpression) {
    if (item.left.kind === SyntaxKind.BinaryExpression) {
        getDeclaredVariables(item.left as BinaryExpression);
    }

    if (item.right.kind === SyntaxKind.BinaryExpression) {
        getDeclaredVariables(item.right as BinaryExpression);
    }

    if (item.left.kind === SyntaxKind.PropertyAccessExpression) {
        const variableName = (item as any).left.name.text;
        const variableBody = (item as any).right;

        getVariable(variableName, variableBody);
    }
}

function getVariable(variableName: string, variableBody: any) {
    if (variableName === variableBody.getText()) {
        return;
    }

    if (variableBody.kind === SyntaxKind.FunctionExpression && variableBody.name.text === variableName) {
        fileContent.methods.push({
            name: variableBody.name.text,
            arguments: variableBody.parameters.map((parameter: any) => parameter.name.text),
            body: variableBody.body.getText()
        });

        return;
    }

    const valueData = parseValue(variableName, variableBody);

    fileContent.variables.push({ name: variableName, value: valueData.value, type: valueData.type, isPrivate: true });
}

function parseValue(name: string, item: any) {
    let value: string | null = item.getText();
    let type: string;

    switch (item.kind) {
        case SyntaxKind.ArrayLiteralExpression:
            value = null;
            type = 'any[]';

            fileContent.constructor.context += `this.${name} = ${item.getText()};\n`;

            break;

        case SyntaxKind.ObjectLiteralExpression:
            value = null;

            type = objToStringModel(getModel(item.properties));

            fileContent.constructor.context += `this.${name} = ${item.getText()};\n`;

            break;

        case SyntaxKind.StringLiteral:
            type = 'string';
            break;

        case SyntaxKind.NumericLiteral:
        case SyntaxKind.BigIntLiteral:
            type = 'number';
            break;

        case SyntaxKind.BooleanKeyword:
            type = 'boolean';
            break;

        case SyntaxKind.FunctionDeclaration:
        case SyntaxKind.FunctionExpression:
            value = null;
            type = 'Function';

            fileContent.constructor.context += `this.${name} = ${item.getText()};\n`;

            break;

        default:
            value = null;
            type = 'any';

            fileContent.constructor.context += `this.${name} = ${item.getText()};\n`;
    }

    return {
        value,
        type
    };
}

function getModel(properties: any[]) {
    if (properties.length === 0) {
        return 'any';
    }

    return _.reduce(properties, (result: any, value: any) => {
        switch (value.initializer.kind) {
            case SyntaxKind.ArrayLiteralExpression:
                result[value.name.text] = 'any[]';
                break;

            case SyntaxKind.ObjectLiteralExpression:
                result[value.name.text] = objToStringModel(getModel(value.initializer.properties));
                break;

            case SyntaxKind.StringLiteral:
                result[value.name.text] = 'string';
                break;

            case SyntaxKind.NumericLiteral:
            case SyntaxKind.BigIntLiteral:
                result[value.name.text] = 'number';
                break;

            case SyntaxKind.BooleanKeyword:
                result[value.name.text] = 'boolean';
                break;


            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.FunctionExpression:
                result[value.name.text] = 'Function';
                break;

            default:
                result[value.name.text] = 'any';
        }

        return result;
    }, {});
}

function objToStringModel(item: { [key: string]: any } | string) {
    if (typeof item === 'string') {
        return item;
    }

    let str = '';

    for (var p in item) {
        if (item.hasOwnProperty(p)) {
            str += p + ':' + item[p] + ';';
        }
    }

    return `{${str}}`;
}

function initFileContent(): FileContent {
    return {
        type: '',
        moduleName: null,
        declaredName: null,
        lifecycleHooks: [],
        methods: [],
        variables: [],
        component: {
            selector: '',
            styleUrls: [],
            templateUrl: ''
        },
        constructor: {
            dependencies: [],
            context: ''
        },
    };
}

function getType(node: Node) {
    node.forEachChild((cbNode: any) => {
        if (fileContent.type) {
            return;
        }
 
        if (cbNode.getChildCount() === 0) {
            return;
        }

        if ((cbNode as any).name && (cbNode as any).name.text === 'config' ) {
            fileContent.type = (cbNode as any).name.text;
        }
 
        if ((cbNode as any).name && (cbNode as any).name.text && decorators.includes((cbNode as any).name.text) && cbNode.parent.kind === SyntaxKind.CallExpression) {
            fileContent.type = (cbNode as any).name.text;
            console.log(fileContent.type)
        }
 

        getType(cbNode);
    });

 }