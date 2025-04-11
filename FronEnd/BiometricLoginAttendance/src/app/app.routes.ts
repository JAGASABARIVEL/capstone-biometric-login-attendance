import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AttendanceComponent } from './auth/attendance/attendance.component';

export const routes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'attendance', component: AttendanceComponent }
];
