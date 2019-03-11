const replacements: [RegExp, string][] = [
    // $q
    [/(ng\.)?IPromise<(.*)>/g, 'Promise<$2>'],
    [/ng\.IHttpPromise<(.*)>/g, 'Promise<$1>'],
    [/(ng\.)?IPromise/g, 'Promise'],
    [/(ctrl|this|self)\.\$q\.when\(\)/g, 'Promise.resolve()'],
    [/(ctrl|this|self)\.\$q\.all/g, 'Promise.all'],
    [/( *)(var|let|const)?\s*defer(red)?:?.*? = \$q\.defer\(\)/g, '$1let deferredResolve;\n$1let deferredReject;\n$1let deferred: Promise<any> = new Promise((resolve, reject) => {\n$1    deferredResolve = resolve;\n$1    deferredReject = reject;\n$1})'],
    [/defer(red)?\.resolve/g, 'deferredResolve'],
    [/defer(red)?\.reject/g, 'deferredReject'],
    [/defer(red)?\.promise/g, 'deferred'],
    [/(var|ctrl|this|self)\.\$q\.when\((.*)\)/g, 'Promise.resolve($2)'],
    [/(var|ctrl|this|self)\.\$q\.resolve\((.*)\)/g, 'Promise.resolve($2)'],
    [/(var|ctrl|this|self)\.\$q\.reject\((.*)\)/g, 'Promise.reject($2)'],
    [/, (ctrl\.|this\.)\$q/g, ''],
    [/Promise\.reject\(\);/g, 'Promise.reject(new Error(\'An error occurred.\'));'],
    [/\(\$q, /g, '('],

    // $window
    [/private \$window(: (any|ng\.IWindowService))?/g, '@Inject(\'$window\') private $window: any'],

    // $timeout
    [/(ctrl|this|self|)(\.|)\$timeout\.cancel\((.*)\)/g, 'clearTimeout($3)'],
    [/(ctrl|this|self|)(\.|)\$timeout/g, 'setTimeout'],

    // $interval
    [/(ctrl|this|self|)(\.|)\$interval\.cancel\((.*)\)/g, 'clearInterval($3)'],
    [/(ctrl|this|self|)(\.|)\$interval/g, 'setInterval'],

    [/( *)\.finally\((.*)/g, '$1.then($2\n$1    // Native promise does not have finally. This then will execute last.'],

    // Modal one off issues
    [/ \({ \$value: any }\?\) => void;/g, ' EventEmitter<any>;'],
    [/this\.dismiss\(\);/, 'this.dismiss.emit();'],

    [/\$http:\s*ng\.IHttpService/g, 'http: HttpClient'],
    [/(var|ctrl|this|self)\.\$http/g, 'this.httpClient'],
    [/\$http/g, 'this.httpClient'],
    [/\$location:\s*ng\.ILocationService/g, 'location: Location'],
    [/\$location\.path/g, 'location.go'],
    [/this\.activatedRouter\.hash\(\)/g, 'this.activatedRoute.snapshot.fragment'],
    [/((var|ctrl|this|self)\.httpClient(\s*)\.(\s*)(get|post|put|delete)\((.|\n)*?\))/g, '$1.toPromise()'],
    [/params: (.*),/g, 'params: new HttpParams({fromObject: <any>($1) }),'],
    [/headers: {\n(.*)\n.*}\n/g, 'headers: new HttpHeaders({ $1 })'],
    [/response\.data/g, 'response'],
    [/return this\.\$location\.hash\(\)/g, '//return this.location.hash()'],

    [/const .* require\(`\.\/\${process.*\);\n/, ''],
    [/\$element: any(,|\))/g, 'element: ElementRef$1'],

    [/Array<(\w+)>/g, '$1[]'],

    // scope
    [/(ctrl|svc|self)\./g, 'this.'],

    // angular
    [/angular\.isDefined\((.*?)\)/g, '!!$1'],

    // rename functions
    [/( *)(ctrl|this)\.(\w+)\s*\=\s*function\s*(\w+)/g, '$1$3'],
    [/( *)(ctrl|this)\.(\w+)\s*\=\s*function/g, '$1$3'],
    [/(?<!(\=\s*|\:\s*|\(\s*))function\s+(\w+)\s*\((.*)\)\s*\{/g, '$2($3) {'],
    [/(\=|\:|\()\s*function\s+(\w+)\s*\((.*)\)\s*\{/g, '$1 ($3) => {'],
    [/(\=|\:|\()\s*function\s*\((.*)\)\s*\{/g, '$1 ($2) => {'],

    // use arrow function
    // [/function\s+\((.*)\)\s*\{/g, '($1) => {'],
    [/\.then(\s*)\((\s*)(\w+)(\s*)\((\s*)(.*)(\s*)\)(\s*)\{/g, '.then(($6) => {'],
    [/\}\,(\s*)(\w+)(\s*)\((\s*)(.*)(\s*)\)(\s*)\{/g, '}, ($5) => {'],
];

export function processStringReplacements(results: string) {
    for(const r of replacements) {
        results = results.replace(r[0], r[1]);
    }
    return results;
}
