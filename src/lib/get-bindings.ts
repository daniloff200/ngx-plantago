import * as ts from 'typescript';
import { SourceFile } from 'typescript';

const kind = ts.SyntaxKind;

export function getBindings(ast: SourceFile) {
    const classes = ast.statements.filter(x => x.kind === kind.ClassDeclaration);
    const componentClass: any = classes[0];
    let bindingsProperty;

    if (!componentClass) {
       return [];
    }

    const constructor = componentClass.members.find((x: any) => x.kind === kind.Constructor);
    if (constructor) {
        bindingsProperty = constructor.body.statements.find((x: any) => x.expression && x.expression.left && x.expression.left.name.text === 'bindings');
    }

    if (!bindingsProperty) {
        bindingsProperty = componentClass.members.find((x: any) => x.kind === kind.PropertyDeclaration && x.name.text === 'bindings');
    }

    if (bindingsProperty) {
        const text = ast.text.slice(bindingsProperty.pos, bindingsProperty.end);
        const results = [];

        // Bindings look like
        // this.bindings = {
        //     compactCount: '<?',
        //     cssClass: '@',
        //     itemprop: '@',
        //     rating: '<',
        //     ratingCount: '<',
        //     reviewCount: '<',
        //     size: '@?',  // default to 14px, medium = 20px, large = 32px
        //     toReviews: '&?',
        //     tooFew: '<',
        //     noCompile: '<'
        //     name: '='
        // };

        const regexp = /(\w+: '.*'),?/g;
        //^ Should return
        // compactCount: '<?',
        // cssClass: '@',
        // itemprop: '@',
        // rating: '<',
        // ratingCount: '<',
        // reviewCount: '<',
        // size: '@?',
        // toReviews: '&?',
        // tooFew: '<',
        // noCompile: '<'
        // name: '='

        const match = regexp.exec(text);

        while (match !== null) {
            const binding = match[1].split(':');
            const result = { name: binding[0], optional: false, type: '' };

            if (/=/.test(binding[1])) {
                // Only bindings containing "=" should become two way bindings
                result.type = 'two-way';
            }
            else if (/&/.test(binding[1])) {
                // Only bindings containins "&" should become output bindings
                result.type = 'output';
            }
            else {
                // Everything else become an input binding
                result.type = 'input';
            }

            if (/\?/.test(binding[1])) {
                result.optional = true;
            }

            results.push(result);
        }
        return results;
    }

    return [];
}