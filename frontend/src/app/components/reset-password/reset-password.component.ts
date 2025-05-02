import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatTooltipModule],
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirm = false;
  message = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    });
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
    if (this.resetPasswordForm.valid) {
      const { password } = this.resetPasswordForm.value;
      const token = this.route.snapshot.paramMap.get('token');

      if (token) {
        this.authService.resetPasswordConfirm(token, password).subscribe(
          (response: any) => {
            this.message = "Password successfully reset.";
          },
          (error) => {
            this.message = "We were unable to reset your password.";
            console.error(error);
          }
        );
      } else {
        this.message = "Invalid or missing token.";
      }
    }
  }
}
