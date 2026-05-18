import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: '',
    templateUrl: 'modal-dialog.html',
    styleUrls: []
})
export class ModalDialog implements OnInit, OnDestroy {
    @Input()
    title: any;

    @Input()
    isOpen: any;

    @Output()
    onClose: EventEmitter<any> = new EventEmitter<any>();

    private animating: any;

    constructor() {
        this.animating = false;
    }

    ngOnDestroy() {
        this.cleanup();
    }

    ngOnInit() {
        this.animating = false;
    }

    close() {
        this.animating = true;
        setTimeout(() => {
            this.animating = false;
            this.onClose();
        }, 300);
    }

    cleanup() {
        this.animating = false;
    }
}
