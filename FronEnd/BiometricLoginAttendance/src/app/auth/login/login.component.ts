import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Subject } from 'rxjs';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WebcamModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  webcamImage: WebcamImage | null = null;
  trigger: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder, private userManagerService: UserManagerService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  submit(): void {
    if (!this.webcamImage) return;

    const payload = {
      image: this.webcamImage.imageAsDataUrl
    };

    this.userManagerService.login_user(payload).subscribe(
      (profile) => {
        console.log("profile ", profile);
        localStorage.setItem(
          "profile",
          JSON.stringify(profile)
        );
        alert(`Login successful ${localStorage.getItem("profile")}`);
      },
      (err) => {
        alert(" Please register or login with light in surroundings");
      }
    );
  }

  get triggerObservable() {
    return this.trigger.asObservable();
  }
}
