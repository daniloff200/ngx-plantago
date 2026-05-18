import { Component, OnInit } from '@angular/core';
import { Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: '',
    templateUrl: 'dashboard.html',
    styleUrls: []
})
export class Dashboard implements OnInit {
    @Input()
    userId: any;

    @Output()
    onLogout: EventEmitter<any> = new EventEmitter<any>();

    private userData: any;

    private isLoading: any;

    constructor(private userService: UserService) {
        this.userData = null;
        this.isLoading = true;
    }

    ngOnInit() {
        this.loadUser();
    }

    loadUser() {
        this.isLoading = true;
        this.userService.getUserById(this.userId).then(data => {
            this.userData = data;
            this.isLoading = false;
        });
    }

    handleLogout() {
        this.onLogout();
    }

    refreshData() {
        setTimeout(() => {
            this.loadUser();
        }, 1000);
    }
}
