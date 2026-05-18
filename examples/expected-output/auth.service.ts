import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {} from '@angular/core';

@Injectable()
export class AuthService {
    private token: any;

    private isAuthenticated: any;

    constructor(private $Window: $window, private httpClient: HttpClient) {
        this.token = null;
        this.isAuthenticated = false;
    }

    login(credentials) {
        return this.httpClient
            .post('/api/auth/login', credentials)
            .toPromise()
            .then(response => {
                this.token = response.token;
                this.isAuthenticated = true;
                $window.localStorage.setItem('auth_token', this.token);
                return response;
            });
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        $window.localStorage.removeItem('auth_token');
    }

    checkToken() {
        let storedToken = $window.localStorage.getItem('auth_token');

        if (typeof storedToken !== 'undefined' && storedToken !== null) {
            this.token = storedToken;
            this.isAuthenticated = true;
        }
    }

    scheduleTokenRefresh() {
        setTimeout(() => {
            this.refreshToken();
        }, 3600000);
    }

    refreshToken() {
        return this.httpClient
            .post('/api/auth/refresh', { token: this.token })
            .toPromise()
            .then(response => {
                this.token = response.token;
                $window.localStorage.setItem('auth_token', this.token);
                this.scheduleTokenRefresh();
            });
    }
}
