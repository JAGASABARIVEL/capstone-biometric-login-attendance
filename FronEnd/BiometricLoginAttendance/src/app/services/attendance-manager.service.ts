import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BIOMETRIC_BASE_URL } from '../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceManagerService {

  attendance_uri = "/attendance/mark"

  constructor(private http: HttpClient) { }

  mark_attendance(payload: any): Observable<any> {
    let profile: any = JSON.parse(localStorage.getItem("profile") || '{}');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${profile?.access}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${BIOMETRIC_BASE_URL}${this.attendance_uri}`, payload=payload, {headers})
  }
}
