import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

function initializeApp(auth: AuthService, userService: UserService) {
  return async () => {
    if (auth.isSignedIn()) {
      await userService.loadProfile();
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, UserService],
      multi: true,
    },
  ],
};
