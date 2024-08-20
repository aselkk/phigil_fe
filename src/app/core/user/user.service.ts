import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; // Import from Firebase
import { User } from 'app/core/user/user.types';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User | null> = new ReplaySubject<User | null>(
        1
    );

    constructor(private _auth: Auth) {
        this.initializeUser();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User | null) {
        this._user.next(value);
    }

    get user$(): Observable<User | null> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize the user state
     */
    private initializeUser(): void {
        onAuthStateChanged(this._auth, (user) => {
            if (user) {
                this._user.next({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                });
            } else {
                this._user.next(null);
            }
        });
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
