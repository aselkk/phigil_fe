import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { map } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (
    route,
    state
) => {
    const router = inject(Router);
    const userService = inject(UserService);

    return userService.user$.pipe(
        map((user) => {
            if (user) {
                return router.parseUrl('/onboarding');
            }
            return true;
        })
    );
};
