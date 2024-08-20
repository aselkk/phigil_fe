import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FirebaseErrorService {
    constructor() {}

    getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'The email address is already in use by another account.';
            case 'auth/invalid-email':
                return 'The email address is not valid.';
            case 'auth/operation-not-allowed':
                return 'Operation not allowed. Please contact support.';
            case 'auth/weak-password':
                return 'The password is too weak.';
            default:
                return 'An unexpected error occurred. Please try again later.';
        }
    }
}
