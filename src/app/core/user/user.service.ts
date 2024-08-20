import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth'; // Import from Firebase
import { User } from 'app/core/user/user.types';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User | null> = new ReplaySubject<User | null>(
        1
    );

    constructor(private _auth: Auth) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User | null) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User | null> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): void {
        const user = this._auth.currentUser;
        if (user) {
            this._user.next({
                id: user.uid,
                email: user.email,
                name: user.displayName,
                // Add any additional fields you need
            });
        } else {
            this._user.next(null);
        }
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): void {
        this._user.next(user);
    }
}
