import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const _router: Router = inject(Router);
    const _userService: UserService = inject(UserService);
    // Check the authentication status
    return _userService.user$.pipe(
        map((user) => {
            if (user) {
                return true;
            } else {
                _router.navigate(['/sign-in']);
                return false;
            }
        })
    );
};
