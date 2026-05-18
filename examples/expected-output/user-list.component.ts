import { Component, OnInit } from '@angular/core';
import { Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: '',
    templateUrl: 'user-list.html',
    styleUrls: []
})
export class UserList implements OnInit {
    @Input()
    filter: any;

    @Output()
    onSelect: EventEmitter<any> = new EventEmitter<any>();

    private users: any[];

    private selected: any;

    constructor(private userService: UserService) {
        this.users = [];
        this.selected = null;
    }

    ngOnInit() {
        this.fetchAll();
    }

    fetchAll() {
        Promise.all([this.userService.getUsers(), this.userService.getAdmins()]).then(results => {
            if (Array.isArray(results[0])) {
                this.users = results[0].concat(results[1]);
            }
        });
    }

    selectUser(user) {
        this.selected = user;
        this.onSelect({ $event: user });
    }
}
