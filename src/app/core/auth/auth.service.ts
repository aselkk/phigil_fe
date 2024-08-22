import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from '@angular/fire/auth';
import { UserService } from 'app/core/user/user.service';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _auth = inject(Auth);

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return from(sendPasswordResetEmail(this._auth, email));
    }

    /**
     * Reset password
     *
     * @param password
     */

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return from(
            signInWithEmailAndPassword(
                this._auth,
                credentials.email,
                credentials.password
            )
        ).pipe(
            switchMap((userCredential) => {
                this._authenticated = true;

                const user = userCredential.user;

                this._userService.user = {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                };

                return of(this._userService.user);
            }),
            map((user) => {
                return user;
            })
        );
    }

    signInWithGoogle(): Observable<any> {
        const provider = new GoogleAuthProvider();

        return from(signInWithPopup(this._auth, provider)).pipe(
            switchMap((result) => {
                this._authenticated = true;

                const user = result.user;

                this._userService.user = {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                };

                return of(this._userService.user);
            }),
            map((user) => {
                return user;
            })
        );
    }

    signOut(): Observable<any> {
        this._authenticated = false;
        this._auth.signOut();
        this._userService.user = null;
        return of(true);
    }

    /**
     * Sign up
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        const promise = createUserWithEmailAndPassword(
            this._auth,
            user.email,
            user.password
        ).then((res) => updateProfile(res.user, { displayName: user.name }));
        return from(promise);
    }

    check(): Observable<boolean> {
        return of(this._authenticated);
    }
}
