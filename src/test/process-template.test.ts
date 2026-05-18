import * as assert from 'assert';
import { processTemplate } from '../lib/templates/process-template';

describe('processTemplate', () => {

    it('should replace ng-if with *ngIf', () => {
        const input = '<div ng-if="isVisible">Hello</div>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('*ngIf'), `Expected *ngIf, got: ${result}`);
        assert.ok(!result.includes('ng-if'), 'Should not contain ng-if');
    });

    it('should replace ng-click with (click)', () => {
        const input = '<button ng-click="doStuff()">Go</button>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('(click)'), `Expected (click), got: ${result}`);
    });

    it('should replace ng-repeat with *ngFor', () => {
        const input = '<li ng-repeat="item in items">{{item}}</li>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('*ngFor'), `Expected *ngFor, got: ${result}`);
        assert.ok(result.includes('let item of items'), `Expected 'let item of items' in: ${result}`);
    });

    it('should replace ng-model with [(ngModel)]', () => {
        const input = '<input ng-model="user.name">';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[(ngModel)]'), `Expected [(ngModel)], got: ${result}`);
    });

    it('should replace ng-show with [hidden]', () => {
        const input = '<span ng-show="isOpen">Open</span>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[hidden]'), `Expected [hidden], got: ${result}`);
    });

    it('should replace ng-hide with [hidden]', () => {
        const input = '<span ng-hide="isClosed">Visible</span>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[hidden]'), `Expected [hidden], got: ${result}`);
    });

    it('should replace ng-class with [ngClass]', () => {
        const input = '<div ng-class="{active: isActive}">Test</div>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[ngClass]'), `Expected [ngClass], got: ${result}`);
    });

    it('should replace ng-style with [ngStyle]', () => {
        const input = '<div ng-style="{color: red}">Styled</div>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[ngStyle]'), `Expected [ngStyle], got: ${result}`);
    });

    it('should replace ng-src with [src]', () => {
        const input = '<img ng-src="{{imageUrl}}">';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[src]'), `Expected [src], got: ${result}`);
    });

    it('should replace ng-href with [href]', () => {
        const input = '<a ng-href="{{linkUrl}}">Link</a>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[href]'), `Expected [href], got: ${result}`);
    });

    it('should replace ng-bind with interpolation', () => {
        const input = '<span ng-bind="name"></span>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('{{name}}'), `Expected {{name}}, got: ${result}`);
        assert.ok(!result.includes('ng-bind'), 'Should not contain ng-bind');
    });

    it('should replace ng-bind-html with [innerHtml]', () => {
        const input = '<div ng-bind-html="htmlContent">Test</div>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[innerHtml]'), `Expected [innerHtml], got: ${result}`);
    });

    it('should replace ng-switch with [ngSwitch]', () => {
        const input = '<div ng-switch="status"><span ng-switch-when="active">Active</span><span ng-switch-default>Other</span></div>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[ngSwitch]'), `Expected [ngSwitch], got: ${result}`);
        assert.ok(result.includes('*ngSwitchCase'), `Expected *ngSwitchCase, got: ${result}`);
        assert.ok(result.includes('*ngSwitchDefault'), `Expected *ngSwitchDefault, got: ${result}`);
    });

    it('should replace ng-submit with (ngSubmit)', () => {
        const input = '<form ng-submit="save()"></form>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('(ngSubmit)'), `Expected (ngSubmit), got: ${result}`);
    });

    it('should replace ng-change with (change)', () => {
        const input = '<select ng-change="update()"></select>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('(change)'), `Expected (change), got: ${result}`);
    });

    it('should replace ng-disabled with [disabled]', () => {
        const input = '<button ng-disabled="isBusy">Click</button>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('[disabled]'), `Expected [disabled], got: ${result}`);
    });

    it('should replace ng-view with router-outlet', () => {
        const input = '<div ng-view></div>';
        const result = processTemplate(input, {});
        assert.ok(result.includes('router-outlet'), `Expected router-outlet, got: ${result}`);
    });

    it('should remove $ctrl. prefix', () => {
        const input = '<span>{{$ctrl.name}}</span>';
        const result = processTemplate(input, {});
        assert.ok(!result.includes('$ctrl.'), `Should not contain $ctrl., got: ${result}`);
    });

    it('should remove one-time binding :: prefix', () => {
        const input = '<span>{{::value}}</span>';
        const result = processTemplate(input, {});
        assert.ok(!result.includes('::'), `Should not contain ::, got: ${result}`);
    });

    it('should replace string true/false with booleans', () => {
        const input = "<div ng-if=\"'true'\">Yes</div>";
        const result = processTemplate(input, {});
        assert.ok(!result.includes("'true'"), `Should not contain 'true', got: ${result}`);
    });

    it('should handle component bindings dictionary', () => {
        const template = '<my-comp some-input="data" on-action="doIt()"></my-comp>';
        const componentDict = {
            'my-comp': {
                input: ['someInput'],
                output: ['onAction'],
                'two-way': []
            }
        };
        const result = processTemplate(template, componentDict);
        // Note: cheerio lowercases all attribute names, so [someInput] becomes [someinput]
        const lower = result.toLowerCase();
        assert.ok(lower.includes('[someinput]'), `Expected [someInput] (lowercased), got: ${result}`);
        assert.ok(lower.includes('(onaction)'), `Expected (onAction) (lowercased), got: ${result}`);
    });
});