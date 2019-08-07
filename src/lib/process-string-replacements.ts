const replacements: [RegExp, string][] = [
    // scope
    [/\b(ctrl|self|that|svc)\b\./g, 'this.'],

    // variables
    [/\bvar\b\s+(\w+)/g, 'let $1'],

    // $q
    [/(ng\.)?IPromise<(.*)>/g, 'Promise<$2>'],
    [/ng\.IHttpPromise<(.*)>/g, 'Promise<$1>'],
    [/(ng\.)?IPromise/g, 'Promise'],
    [/(this\.|)\$q\.when\(\)/g, 'Promise.resolve()'],
    [/(this\.|)\$q\.all/g, 'Promise.all'],
    [/( *)(var|let|const)?\s*defer(red)?:?.*? = \$q\.defer\(\)/g, '$1let deferredResolve;\n$1let deferredReject;\n$1let deferred: Promise<any> = new Promise((resolve, reject) => {\n$1    deferredResolve = resolve;\n$1    deferredReject = reject;\n$1})'],
    [/defer(red)?\.resolve/g, 'deferredResolve'],
    [/defer(red)?\.reject/g, 'deferredReject'],
    [/defer(red)?\.promise/g, 'deferred'],
    [/(this\.|)\$q\.when\((.*)\)/g, 'Promise.resolve($2)'],
    [/(this\.|)\$q\.resolve\((.*)\)/g, 'Promise.resolve($2)'],
    [/(this\.|)\$q\.reject\((.*)\)/g, 'Promise.reject($2)'],
    [/, (this\.|)\$q/g, ''],
    [/Promise\.reject\(\);/g, 'Promise.reject(new Error(\'An error occurred.\'));'],
    [/\(\$q, /g, '('],

    // $window
    [/private \$window(: (any|ng\.IWindowService))?/g, '@Inject(\'$window\') private $window: any'],

    // console
    [/\$log/g, 'console'],

    // $timeout
    [/(this|)(\.|)\$timeout\.cancel\((.*)\)/g, 'clearTimeout($3)'],
    [/(this|)(\.|)\$timeout/g, 'setTimeout'],

    // $interval
    [/(this|)(\.|)\$interval\.cancel\((.*)\)/g, 'clearInterval($3)'],
    [/(this|)(\.|)\$interval/g, 'setInterval'],

    [/( *)\.finally\((.*)/g, '$1.then($2\n$1    // Native promise does not have finally. This then will execute last.'],

    // Modal one off issues
    [/ \({ \$value: any }\?\) => void;/g, ' EventEmitter<any>;'],
    [/this\.dismiss\(\);/, 'this.dismiss.emit();'],

    [/\$http:\s*ng\.IHttpService/g, 'http: HttpClient'],
    [/this\.\$http/g, 'this.httpClient'],
    [/\$http/g, 'this.httpClient'],
    [/\$location:\s*ng\.ILocationService/g, 'location: Location'],
    [/\$location\.path/g, 'location.go'],
    [/this\.activatedRouter\.hash\(\)/g, 'this.activatedRoute.snapshot.fragment'],
    [/((this\.httpClient(\s*)\.(\s*)(get|post|put|delete))\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))/g, '$1.toPromise()'],
    [/params: (.*),/g, 'params: new HttpParams({fromObject: <any>($1) }),'],
    [/headers: {\n(.*)\n.*}\n/g, 'headers: new HttpHeaders({ $1 })'],
    [/response\.data/g, 'response'],
    [/return this\.\$location\.hash\(\)/g, '//return this.location.hash()'],

    [/const .* require\(`\.\/\${process.*\);\n/, ''],
    [/\$element: any(,|\))/g, 'element: ElementRef$1'],

    [/Array<(\w+)>/g, '$1[]'],

    // angular
    [/angular\.isDefined\((.*?)\)/g, 'typeof $1 !== "undefined"'],
    [/angular\.isUndefined\((.*?)\)/g, 'typeof $1 === "undefined"'],
    [/angular\.isArray\((.*?)\)/g, 'Array.isArray($1)'],

    // use arrow function
    [/\.then\s*\(\s*function\s*(\s+\w+\s*|)\s*\(\s*(.*)\s*\)\s*\{/g, '.then(($2) => {'],
    [/(\.then\s*\(\s*\(\s*.*\s*\)\s*\=\>\s*\{[^}]+\}\s*)\,\s*\bfunction\b\s\w+\((.*)\s*\)\s*\{/g, '$1, ($2) => {'],

    [/(\=|\:|\,|\(|\breturn\b)\s*function\s*(\s+\w+\s*|)\((.*)\)\s*\{/g, '$1 ($3) => {'],
    [/(?<!(\=\s*|\:\s*))function\s*(\s+\w+\s*|)\((.*)\)\s*\{/g, 'const $2 = ($3) => {'],

    // http data
    [/(deferredResolve|deferredReject)\(\s*(\w+)\.data\s*\)/g, '$1($2)']
];

export function processStringReplacements(results: string) {
    for(const r of replacements) {
        results = results.replace(r[0], r[1]);
    }
    return results;
}
