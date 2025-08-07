import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { AUTH_CONSTANTS } from '../core/constants/auth.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      password: ['', Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      const password = this.loginForm.get('password')?.value;
      
      if (password === AUTH_CONSTANTS.DEFAULT_PASSWORD) {
        sessionStorage.setItem(AUTH_CONSTANTS.SESSION_KEY, 'true');
        this.snackBar.open(AUTH_CONSTANTS.LOGIN_SUCCESS_MESSAGE, 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } else {
        this.snackBar.open(AUTH_CONSTANTS.LOGIN_ERROR_MESSAGE, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loginForm.get('password')?.setValue('');
      }
    }
  }
  
  clearPassword(): void {
    this.loginForm.get('password')?.setValue('');
  }
}
