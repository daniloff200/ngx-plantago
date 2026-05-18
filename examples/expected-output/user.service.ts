import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {} from '@angular/core';

@Injectable()
export class UserService {
    private users: any[];

    constructor(private httpClient: HttpClient) {
        this.users = [];
    }

    getUsers() {
        let deferredResolve;
        let deferredReject;
        let deferred: Promise<any> = new Promise((resolve, reject) => {
            deferredResolve = resolve;
            deferredReject = reject;
        });

        this.httpClient
            .get('/api/users')
            .toPromise()
            .then(
                response => {
                    this.users = response;
                    deferredResolve(response);
                },
                err => {
                    console.error('Failed to load this.users');
                    deferredReject(err);
                }
            );

        return deferred;
    }

    getUserById(id) {
        return this.httpClient
            .get('/api/users/' + id)
            .toPromise()
            .then(response => {
                return response;
            });
    }

    createUser(userData) {
        return this.httpClient.post('/api/this.users', userData).toPromise();
    }

    deleteUser(id) {
        return this.httpClient.delete('/api/this.users/' + id).toPromise();
    }
}
