import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatTooltipModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    }, { validator: this.passwordMatchValidator }); // Added password confirmation validation
  }

  passwordTooltip = 'Reveal Password';

  confirmTooltip = 'Reveal Password';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordTooltip = this.showPassword ? 'Hide Password' : 'Reveal Password';
  }

  toggleConfirmVisibility() {
    this.showConfirm = !this.showConfirm;
    this.confirmTooltip = this.showConfirm ? 'Hide Password' : 'Reveal Password';
  }

  getPasswordVisibility() {
    return this.showPassword
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirm')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      this.authService.register(username, email, password).subscribe({
        next: (response: any) => {
          if (response) {
            // Successful registration
            this.router.navigate(['/home']);
          } else {
            // Fallback if the response does not contain the expected data
            alert('Registration failed. Please try again.');
          }
        },
        error: (error: HttpErrorResponse) => {
          // Handle specific errors based on status code
          if (error.status === 400) {
            alert('Please ensure all fields are filled out correctly.');
          } else if (error.status === 409) {
            alert('Username or email already taken. Please choose another.');
          } else if (error.status === 500) {
            alert('An internal error occurred. Please try again later.');
          } else {
            alert('An unexpected error occurred. Please try again.');
          }
          console.error('Registration error:', error);
        }
      });
    } else {
      alert('Form is invalid. Please fill out all required fields.');
    }
  }
}
