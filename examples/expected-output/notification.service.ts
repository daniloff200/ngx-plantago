import { Injectable } from '@angular/core';
import {} from '@angular/core';

@Injectable()
export class NotificationService {
    private notifications: any[];

    private pollTimer: any;

    constructor(private $Interval: setInterval) {
        this.notifications = [];
        this.pollTimer = null;
    }

    addNotification(message, type) {
        let notification = {
            message: message,
            type: type || 'info',
            timestamp: new Date()
        };

        this.notifications.push(notification);
        console.info('Notification added: ' + message);

        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
    }

    removeNotification(notification) {
        let index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    startPolling() {
        this.pollTimer = setInterval(() => {
            console.debug('Polling for new this.notifications...');
            this.checkForUpdates();
        }, 30000);
    }

    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    checkForUpdates() {
        console.debug('Checking for updates');
    }
}
