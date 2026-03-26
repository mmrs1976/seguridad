import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalStorageAdapter } from '../../infrastructure/adapters/storage/local-storage.adapter';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(LocalStorageAdapter);
  const token = storage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};
