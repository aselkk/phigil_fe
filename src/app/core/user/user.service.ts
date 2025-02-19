import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { User } from 'app/core/user/user.types';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User | null> = new ReplaySubject<User | null>(
        1
    );
    private _uid: string | null = null;

    constructor(private _auth: Auth) {
        this.initializeUser();
    }

    set user(value: User | null) {
        this._user.next(value);
    }

    get user$(): Observable<User | null> {
        return this._user.asObservable();
    }

    private initializeUser(): void {
        onAuthStateChanged(this._auth, (user) => {
            if (user) {
                this._uid = user.uid;
                this._user.next({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                });
            } else {
                this._uid = null;
                this._user.next(null);
            }
        });
    }

    getUid(): string | null {
        return this._uid;
    }

    update(user: User): void {
        this._user.next(user);
    }
}
