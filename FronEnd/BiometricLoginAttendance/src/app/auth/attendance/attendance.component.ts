

  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { WebcamImage, WebcamModule } from 'ngx-webcam';
  import { Subject } from 'rxjs';
import { AttendanceManagerService } from '../../services/attendance-manager.service';
import { Router } from '@angular/router';
  
  @Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [CommonModule, WebcamModule],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.css']
  })
  export class AttendanceComponent implements OnInit {
    webcamImage: WebcamImage | null = null;
    trigger: Subject<void> = new Subject<void>();
    message: string = '';
    isSubmitting: boolean = false;
  
    constructor(private attendanceManagerService: AttendanceManagerService, private router: Router) {}
    ngOnInit(): void {
      if (!localStorage.getItem("profile"))
        this.router.navigate(["login"]);
    }
  
    triggerSnapshot(): void {
      this.trigger.next();
    }
  
    handleImage(webcamImage: WebcamImage): void {
      this.webcamImage = webcamImage;
    }
  
    get triggerObservable() {
      return this.trigger.asObservable();
    }
  
    markAttendance(): void {
      if (!this.webcamImage) {
        this.message = 'Please capture your image';
        return;
      }
  
      this.isSubmitting = true;
      this.attendanceManagerService.mark_attendance(
        {
          image: this.webcamImage.imageAsDataUrl
        }
      ).subscribe(
        {
          next: (res: any) => {
            alert('Attendance marked successfully');
            this.isSubmitting = false;
          },
          error: (err) => {
            alert('Attendance marking failed');
            this.isSubmitting = false;
          }
        }
      )
    }
  }
  