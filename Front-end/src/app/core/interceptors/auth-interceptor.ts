import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  }

  return next(clonedReq).pipe(
    catchError((error) => {

      if (error.status === 401) {
        return auth.refreshAccessToken().pipe(
          switchMap((newResponse: any) => {
            const finalReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newResponse.accessToken}`,
              },
              withCredentials: true,
            });

            return next(finalReq);
          }),

          catchError((refreshError) => {
            auth.logout(); 
            return throwError(() => refreshError); 
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
