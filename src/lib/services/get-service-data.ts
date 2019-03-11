import { SyntaxKind, Node, CallExpression, Statement, Block, VariableStatement, FunctionDeclaration, BinaryExpression, PropertyAccessExpression } from 'typescript';

let serviceModuleName: string;
let serviceName: string;
let serviceNameIdentifier: string;
let serviceInjects: string[] = [];
let serviceMethods: string = '';
let declarationVariables: string = '';
let declaredVariables: string[] = [];
let declaredMethods: string[] = [];
let constructorInit: string = '';
let declaredThings: { [hey: string]: any } = {};

export function getServiceData(ast: Node) {
    serviceModuleName = '';
    serviceName = '';
    serviceNameIdentifier = '';
    serviceInjects = [];
    serviceMethods = '';
    declarationVariables = '';
    declaredVariables = [];
    declaredMethods = [];
    constructorInit = '';
    declaredThings = {};

    getServiceInfo(ast);

    return {
        serviceModuleName,
        serviceName,
        serviceInjects,
        serviceMethods,
        declarationVariables,
        declaredVariables,
        declaredMethods,
        constructorInit
    };
}

function getServiceInfo(node: Node) {
    node.forEachChild(cbNode => {
        if (cbNode.getChildCount() === 0) {
            return;
        }

        if (!(cbNode as any).name) {
            getServiceInfo(cbNode);

            return;
        }

        if (cbNode.kind === SyntaxKind.VariableDeclaration) {
            declaredThings[(cbNode as any).name.text] = (cbNode as any).initializer;
        }

        if ((cbNode as any).name.text === 'module' && cbNode.parent.kind === SyntaxKind.CallExpression) {
            getServiceModuleName(cbNode.parent as CallExpression);
        }

        if (((cbNode as any).name.text === 'service' || (cbNode as any).name.text === 'factory') &&
            cbNode.parent.kind === SyntaxKind.CallExpression) {
            getServiceName(cbNode.parent as CallExpression);
        }

        if ((cbNode as any).name.text === '$inject' && cbNode.kind === SyntaxKind.PropertyAccessExpression && cbNode.parent.kind === SyntaxKind.BinaryExpression) {
            if ((cbNode.parent as any).right.kind === SyntaxKind.Identifier) {
                const name = (cbNode.parent as any).right.text;
                if (!declaredThings[name]) {
                    return;
                }

                getServiceInjects(declaredThings[name].elements);
                return;
            }

            getServiceInjects((cbNode.parent as any).right.elements);
        }

        const isFunctionDeclaration = cbNode.kind === SyntaxKind.FunctionDeclaration;

        if ((isFunctionDeclaration && (cbNode as any).name.text === serviceNameIdentifier)) {
            getServiceBody((cbNode as any).body);
        }

        getServiceInfo(cbNode);
    });
}

function getServiceModuleName(node: CallExpression) {
    serviceModuleName = (node.arguments[0] as any).text;
}

function getServiceName(node: CallExpression) {
    serviceName = (node.arguments[0] as any).text;

    if (node.arguments[1].kind !== SyntaxKind.Identifier) {
        getServiceInjects((node.arguments[1] as any).elements);
    }

    if (node.arguments[1].kind === SyntaxKind.Identifier) {
        const name = (node.arguments[1] as any).text;
        const serviceBody = declaredThings[name];

        if (serviceBody) {
            getServiceBody(serviceBody.body);

            return;
        }

        serviceNameIdentifier = name;
    }
}

function getServiceInjects(items: any[]) {
    items.forEach(item => {
        if (item.kind === SyntaxKind.StringLiteral) {
            serviceInjects.push(item.text);
        }

        if (item.kind === SyntaxKind.FunctionExpression) {
            getServiceBody(item.body);
        }
    });
}

function getServiceBody(node: Block) {
    node.statements.forEach((item: Statement) => {
        if (item.kind === SyntaxKind.VariableStatement) {
            const variableStatement = item as VariableStatement;

            variableStatement.declarationList.declarations.forEach(item => {
                if (item.getChildCount() === 0) {
                    return;
                }

                const children = item.getChildren();

                if (children[2].kind === SyntaxKind.ThisKeyword) {
                    return;
                }

                const variable = children[0].getText();
                declaredVariables.push(variable);
                declarationVariables += `private ${variable} = ${children[2].getText()};\n`;
            });

            return;
        }

        if (item.kind === SyntaxKind.ReturnStatement) {
            const getArguments: string[] = (item as any).expression
            .parameters.map((parameter: any) => parameter.name.text);
            const returnFun = `getMethost(${getArguments.join(',')}) {${item.getText()}}` + '\n';
            
            serviceMethods += returnFun;

            return;
        }

        if (item.kind === SyntaxKind.FunctionDeclaration) {
            let declaredFunctionBody: string = getInnerFunctionDeclaration(item as FunctionDeclaration);

            declaredMethods.push((item as any).name.text);

            if (declaredFunctionBody) {
                serviceMethods += item.getText().replace(declaredFunctionBody, '');
            } else {
                serviceMethods += item.getText().replace(/};+$/, '}') + '\n';
            }

            return;
        }

        if (item.kind !== SyntaxKind.ExpressionStatement) {
            return;
        }

        if ((item as any).expression.kind === SyntaxKind.CallExpression) {
            constructorInit += item.getText() + '\n';
            return;
        }

        if ((item as any).expression.kind === SyntaxKind.BinaryExpression &&
            (item as any).expression.left.kind === SyntaxKind.PropertyAccessExpression &&
            (item as any).expression.left.expression.kind === SyntaxKind.Identifier &&
            (item as any).expression.left.expression.text === '$rootScope') {
            constructorInit += item.getText() + '\n';

            return;
        }

        if ((item as any).expression.right.kind === SyntaxKind.FunctionExpression) {
            serviceMethods += item.getText().replace(/};+$/, '}') + '\n';
            
            return;
        }

        if ((item as any).expression.left.kind === SyntaxKind.BinaryExpression) {
            getDeclaredVariables((item as any).expression);
            return;
        }

        const variable = (item as any).expression.left.name.text;
        const value = (item as any).expression.right.getText();
        declarationVariables += `${variable} = ${value};\n`;
    });
}

function getInnerFunctionDeclaration(declaredFunction: FunctionDeclaration): string {
    const body = declaredFunction.body as Block;
    let newBody = '';

    body.statements.forEach(item => {
        if (item.kind === SyntaxKind.FunctionDeclaration) {
            declaredMethods.push((item as any).name.text);
            serviceMethods += item.getText().replace(/};+$/, '}') + '\n';
            newBody += item.getText();
        }
    });

    return newBody;
}

function getDeclaredVariables(item: BinaryExpression) {
    if (item.left.kind === SyntaxKind.BinaryExpression) {
        getDeclaredVariables(item.left as BinaryExpression);
    }

    if (item.right.kind === SyntaxKind.BinaryExpression) {
        getDeclaredVariables(item.right as BinaryExpression);
    }

    if (item.left.kind === SyntaxKind.PropertyAccessExpression) {
        const variable = (item as any).left.name.text;
        const value = (item as any).right.getText();
        declarationVariables += `${variable} = ${value};\n`;
    }
}
