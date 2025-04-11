import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, WebcamModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  webcamImage: WebcamImage | null = null;
  trigger: Subject<void> = new Subject<void>();
  showWebcam = true;

  constructor(private fb: FormBuilder, private userManagerService: UserManagerService) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: any): void {
    this.webcamImage = webcamImage;
  }

  get triggerObservable() {
    return this.trigger.asObservable();
  }

  submit(): void {
    if (this.registerForm.valid && this.webcamImage) {
      const formData = {
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
        image: this.webcamImage.imageAsDataUrl
      };

      this.userManagerService.register_user(formData).subscribe(
        (profile) => {
          localStorage.setItem(
            "profile", JSON.stringify(profile)
          );
          alert("Registration successful");
        },
        (err) => {
          console.log("err?.error ", err.error.error)
          alert(`Registration failed ${err?.error?.error}`);
        }
      )
    }
  }
}
