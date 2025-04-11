import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BIOMETRIC_BASE_URL } from '../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {

  register_uri = "/users/register"
  login_uri = "/users/login"

  constructor(private http: HttpClient) { }

  register_user(payload: any): Observable<any> {
    return this.http.post(`${BIOMETRIC_BASE_URL}${this.register_uri}`, payload=payload)
  }

  login_user(payload: any): Observable<any> {
    return this.http.post(`${BIOMETRIC_BASE_URL}${this.login_uri}`, payload=payload)
  }
}
