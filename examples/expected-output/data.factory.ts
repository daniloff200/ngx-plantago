import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {} from '@angular/core';

@Injectable()
export class DataFactory {
    private cache: any;

    constructor(private httpClient: HttpClient) {
        this.cache = {};
    }

    fetchData(key) {
        if (typeof cache[key] !== 'undefined') {
            return Promise.resolve(this.cache[key]);
        }

        return this.httpClient
            .get('/api/data/' + key)
            .toPromise()
            .then(response => {
                this.cache[key] = response;
                return response;
            });
    }

    clearCache() {
        cache = {};
        return Promise.resolve();
    }

    failGracefully() {
        return Promise.reject('something went wrong');
    }
}
