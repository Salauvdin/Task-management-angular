import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tenantIdStr = typeof window !== 'undefined' ? localStorage.getItem('selectedTenantId') : null;
    const tenantId = tenantIdStr ? Number(tenantIdStr) : 0;

    let headers = req.headers;

    if (token && !headers.has('Authorization')) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (tenantId !== undefined && tenantId !== null && tenantId !== 0) {
      headers = headers.set('x-tenant-id', tenantId.toString());
    }

    const cloned = req.clone({ headers });
    return next.handle(cloned);
  }
}
