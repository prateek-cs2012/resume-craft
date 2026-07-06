import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const premiumGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const user = inject(UserService);
  const router = inject(Router);

  if (!auth.isSignedIn()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (!user.profile()) {
    await user.loadProfile();
  }

  if (user.isPremium) return true;
  return router.createUrlTree(['/pricing']);
};
