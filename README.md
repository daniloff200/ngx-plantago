
![ngx-plantago logo](images/logo.png)


<a align="center" href="https://marketplace.visualstudio.com/items?itemName=daniloff200.ngx-plantago">
    <h1 align="center">ngx-plantago</h1>
</a>
<br>

<p align="center">
A VS Code extension that helps you migrate your AngularJS (1.x) code to Angular 13.
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
  - [JavaScript Migration](#javascript-migration)
  - [Template Migration](#template-migration)
  - [Module Generation](#module-generation)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Build](#build)
  - [Tests](#tests)
  - [Examples](#examples)
- [Supported Migrations](#supported-migrations)

---

## Overview

**ngx-plantago** is a VS Code extension that automates the migration of AngularJS (1.x) codebases to Angular 13. It parses AngularJS services, components, factories, filters, and HTML templates, then generates equivalent Angular 13 TypeScript code with proper decorators, imports, and modern syntax.

The tool uses the TypeScript compiler API to parse AngularJS JavaScript files as AST (Abstract Syntax Tree) and transforms them into Angular 13 classes. HTML templates are transformed using cheerio and regex-based replacements.

## Features

- **Service migration**: AngularJS `.service()` and `.factory()` → `@Injectable()` classes
- **Component migration**: AngularJS `.component()` → `@Component()` classes with `@Input()` / `@Output()` decorators
- **Filter migration**: AngularJS `.filter()` → `@Pipe()` classes implementing `PipeTransform`
- **Template migration**: AngularJS directives → Angular 13 syntax (`ng-if` → `*ngIf`, `ng-repeat` → `*ngFor`, etc.)
- **Dependency injection**: `$inject` arrays and inline DI annotation → constructor injection
- **Promise migration**: `$q` deferred patterns → native `Promise`
- **HTTP migration**: `$http` → `HttpClient`
- **Timer migration**: `$timeout` → `setTimeout`, `$interval` → `setInterval`
- **Angular utility migration**: `angular.isDefined()` → `typeof !== "undefined"`, etc.
- **Module generation**: Automatic `@NgModule` scaffolding based on discovered services/components
- **Code formatting**: Output formatted with Prettier

## Installation

### From VS Code Marketplace

Search for `ngx-plantago` in the VS Code Extensions sidebar, or install from the [marketplace page](https://marketplace.visualstudio.com/items?itemName=daniloff200.ngx-plantago).

### From Source

```bash
git clone https://github.com/daniloff200/ngx-plantago.git
cd ngx-plantago
npm install
npm run compile
```

Then press `F5` in VS Code to launch the Extension Development Host.

## Usage

1. Open VS Code
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type `ngx-plantago` and select the command
4. Select the root folder of your AngularJS project
5. The extension will process all files in this order:
   - **Templates**: HTML files are migrated first
   - **Path storage**: All JS files are indexed to build an import map
   - **Services**: `*.service.js`, `*.config.js`, `*.resolve.js` files
   - **Components**: `*.component.js` files
   - **Modules**: `@NgModule` files are auto-generated

Output files are written alongside the originals (`.js` → `.ts`).

## How It Works

### JavaScript Migration

The migration pipeline for each JS file:

1. **Parse**: The TypeScript compiler API (`ts.createSourceFile`) parses the AngularJS JavaScript into an AST
2. **Extract**: `getFileContent()` walks the AST to extract the file type (service/component/factory/filter), module name, declared name, constructor dependencies, methods, variables, and lifecycle hooks
3. **Generate**: `genCode()` produces Angular 13 code with the appropriate decorator (`@Injectable`, `@Component`, `@Pipe`), class definition, constructor injection, and methods
4. **Replace**: `processStringReplacements()` applies regex-based transformations for common patterns (`$q` → `Promise`, `$http` → `HttpClient`, `$timeout` → `setTimeout`, `angular.isDefined` → `typeof`, arrow functions, etc.)
5. **Format**: `printString()` runs the output through Prettier

### Template Migration

HTML templates are processed in two phases:

1. **Cheerio phase**: DOM-level transformations using cheerio (jQuery-like API):
   - `ng-bind` → interpolation `{{}}`
   - `ng-show` → `[hidden]`
   - Component attribute bindings (inputs `[]`, outputs `()`, two-way `[()]`)
   - `ng-if` + `ng-repeat` on same element → wraps in `<ng-container>`

2. **Regex phase**: Text-level replacements for directives:
   - `ng-if` → `*ngIf`
   - `ng-repeat` → `*ngFor`
   - `ng-click` → `(click)`
   - `ng-model` → `[(ngModel)]`
   - `ng-class` → `[ngClass]`
   - `ng-switch` → `[ngSwitch]`
   - And many more (see [Supported Migrations](#supported-migrations))

### Module Generation

After all files are processed, `workWithModules()` generates `@NgModule` files by grouping discovered services and components by their AngularJS module name. Each module gets proper `imports`, `providers`, `declarations`, and `exports` arrays.

## Project Structure

```
ngx-plantago/
├── src/
│   ├── extension.ts              # VS Code extension entry point
│   ├── rename-js-to-ts.ts        # Utility to rename .js files to .ts
│   ├── tools/
│   │   ├── process-code.ts       # Orchestrates JS file migration
│   │   ├── process-paths.ts      # Indexes file paths for import resolution
│   │   └── process-templates.ts  # Orchestrates HTML template migration
│   ├── lib/
│   │   ├── camel-to-dash.ts      # camelCase → dash-case converter
│   │   ├── camelize.ts           # String → camelCase converter
│   │   ├── dash-to-camel.ts      # dash-case → camelCase converter
│   │   ├── file-paths-storage.ts # In-memory storage for file paths/metadata
│   │   ├── gen-code.ts           # Generates Angular 13 TypeScript from FileContent
│   │   ├── get-bindings.ts       # Extracts component bindings from AST
│   │   ├── get-imports.ts        # Extracts import statements from AST
│   │   ├── get-output-file-path.ts  # Resolves output file path
│   │   ├── get-source-file.ts    # Creates TypeScript SourceFile from file
│   │   ├── make-directories-in-path.ts  # Recursive mkdir
│   │   ├── pretty-print.ts       # Prettier formatting wrapper
│   │   ├── process-string-replacements.ts  # Regex-based code transformations
│   │   ├── remove-$injects.ts    # Removes $inject from AST
│   │   ├── remove-from-constructor.ts  # Removes params from constructor
│   │   ├── remove-imports.ts     # Removes import declarations from AST
│   │   ├── render-source-file.ts # TypeScript printer wrapper
│   │   ├── update-references.ts  # Updates import paths (shared/, modules/)
│   │   ├── write-file.ts         # Writes output .ts file
│   │   ├── models/
│   │   │   └── file-content.ts   # TypeScript interfaces (FileContent, Method, etc.)
│   │   ├── services/
│   │   │   ├── gen-document-imports.ts  # Generates import statements
│   │   │   └── get-file-content.ts     # AST → FileContent parser (core logic)
│   │   └── templates/
│   │       ├── process-template.ts       # HTML template migration
│   │       └── replace-component-props.ts # Custom element attribute transformation
│   └── test/                     # Unit tests (Mocha)
├── examples/
│   ├── input/                    # Sample AngularJS files
│   ├── expected-output/          # Generated Angular 13 output
│   └── run-examples.ts           # Script to process examples
├── package.json
├── tsconfig.json                 # Production TypeScript config
└── tsconfig.test.json            # Test TypeScript config (includes test files)
```

## Development

### Prerequisites

- Node.js 14+
- npm

### Build

```bash
npm install
npm run compile
```

### Tests

Run the full test suite (103 tests covering all core modules):

```bash
npm test
```

Tests cover:
- String utilities (`camelToDash`, `camelize`, `dashToCamel`)
- Code generation (`genCode` — decorators, constructors, methods, variables)
- AST parsing (`getFileContent` — services, components, factories, filters, $inject)
- Binding extraction (`getBindings` — input, output, two-way, optional)
- Import extraction (`getImports`)
- String replacements (`processStringReplacements` — $q, $http, $timeout, $interval, etc.)
- Template migration (`processTemplate` — 20+ directive replacements)
- Component props transformation (`replaceComponentsProps`)
- Path reference updates (`updateReferences`)
- Code formatting (`printString`)
- File storage (`file-paths-storage`)

### Examples

Run the example migration to see the tool in action:

```bash
npm run examples
```

This processes all files in `examples/input/` through the migration pipeline and writes the output to `examples/expected-output/`. The examples include:

| File | Type | What it tests |
|------|------|---------------|
| `user.service.js` | Service | `$http`, `$q`, deferred pattern, `response.data` |
| `auth.service.js` | Service | `$inject` style, `$window`, `$timeout`, `angular.isDefined` |
| `notification.service.js` | Service | `$interval`, `$timeout`, `$log`, timer cancellation |
| `data.factory.js` | Factory | `$q.when`, `$q.resolve`, `$q.reject` |
| `dashboard.component.js` | Component | Bindings, `$onInit`, `$timeout` |
| `user-list.component.js` | Component | `$q.all`, `angular.isArray` |
| `modal.component.js` | Component | `$onInit`, `$onDestroy`, `$element` |
| `capitalize.filter.js` | Filter | `angular.isUndefined`, return function → transform |
| `truncate.filter.js` | Filter | Multiple parameters |
| `dashboard.html` | Template | `ng-if`, `ng-repeat`, `ng-click`, `ng-model`, `ng-show`, `ng-class`, `ng-bind`, `ng-disabled` |
| `user-list.html` | Template | `ng-switch`, `ng-href`, `ng-src`, `ng-style`, `ng-submit`, `ng-change`, `ng-hide`, `ng-bind-html` |
| `modal-dialog.html` | Template | `ng-if` + `ng-repeat` conflict, `ng-blur`, `ng-focus`, `ng-mouseenter`, `ng-keydown` |

## Supported Migrations

### JavaScript Transformations

| AngularJS | Angular 13 |
|-----------|------------|
| `.service('Name', [...])` | `@Injectable() export class Name {}` |
| `.factory('Name', [...])` | `@Injectable() export class Name {}` |
| `.component('name', {...})` | `@Component({...}) export class Name {}` |
| `.filter('name', [...])` | `@Pipe({name: 'name'}) export class Name implements PipeTransform {}` |
| `bindings: { prop: '<' }` | `@Input() prop: any;` |
| `bindings: { handler: '&' }` | `@Output() handler = new EventEmitter<any>();` |
| `$onInit` / `$onDestroy` / `$onChanges` | `ngOnInit` / `ngOnDestroy` / `ngOnChanges` with `implements` |
| `$q.defer()` / `deferred.resolve()` | `new Promise((resolve, reject) => {...})` |
| `$q.when(x)` / `$q.resolve(x)` | `Promise.resolve(x)` |
| `$q.reject(x)` | `Promise.reject(x)` |
| `$q.all([...])` | `Promise.all([...])` |
| `$http.get(...)` | `this.httpClient.get(...).toPromise()` |
| `response.data` | `response` |
| `$timeout(fn, ms)` | `setTimeout(fn, ms)` |
| `$timeout.cancel(t)` | `clearTimeout(t)` |
| `$interval(fn, ms)` | `setInterval(fn, ms)` |
| `$interval.cancel(t)` | `clearInterval(t)` |
| `$log.info(...)` | `console.info(...)` |
| `angular.isDefined(x)` | `typeof x !== "undefined"` |
| `angular.isUndefined(x)` | `typeof x === "undefined"` |
| `angular.isArray(x)` | `Array.isArray(x)` |
| `ctrl.` / `self.` / `that.` / `svc.` | `this.` |
| `var x` | `let x` |
| `function(x) {` | `(x) => {` |
| `IPromise<T>` | `Promise<T>` |
| `Array<T>` | `T[]` |

### Template Transformations

| AngularJS | Angular 13 |
|-----------|------------|
| `ng-if="expr"` | `*ngIf="expr"` |
| `ng-repeat="x in items"` | `*ngFor="let x of items"` |
| `ng-click="fn()"` | `(click)="fn()"` |
| `ng-dblclick` | `(dblclick)` |
| `ng-model="prop"` | `[(ngModel)]="prop"` |
| `ng-show="expr"` | `[hidden]="!expr"` |
| `ng-hide="expr"` | `[hidden]="expr"` |
| `ng-class="obj"` | `[ngClass]="obj"` |
| `ng-style="obj"` | `[ngStyle]="obj"` |
| `ng-src="url"` | `[src]="url"` |
| `ng-href="url"` | `[href]="url"` |
| `ng-bind="expr"` | `{{expr}}` |
| `ng-bind-html="expr"` | `[innerHtml]="expr"` |
| `ng-switch` / `ng-switch-when` / `ng-switch-default` | `[ngSwitch]` / `*ngSwitchCase` / `*ngSwitchDefault` |
| `ng-submit="fn()"` | `(ngSubmit)="fn()"` |
| `ng-change="fn()"` | `(change)="fn()"` |
| `ng-blur` / `ng-focus` | `(blur)` / `(focus)` |
| `ng-mouseenter` / `ng-mouseleave` / `ng-mouseover` | `(mouseenter)` / `(mouseleave)` / `(mouseover)` |
| `ng-keypress` / `ng-keydown` | `(keypress)` / `(keydown)` |
| `ng-disabled="expr"` | `[disabled]="expr"` |
| `ng-checked="expr"` | `[checked]="expr"` |
| `ng-required` / `ng-pattern` | `[required]` / `[pattern]` |
| `ng-value="expr"` | `[value]="expr"` |
| `ng-readonly` | `[readonly]` |
| `ng-maxlength` / `ng-minlength` | `maxlength` / `minlength` |
| `ng-view` | `router-outlet` |
| `$ctrl.prop` | `prop` (removed) |
| `::expr` (one-time binding) | `expr` (removed) |
| `'true'` / `'false'` | `true` / `false` |
| `track by expr` | `trackBy:expr` |
| `limitTo: n` | `slice:0:n` |
