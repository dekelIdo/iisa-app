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
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>IISA Dashboard Access</h2>
          <p>Enter the password to access the dashboard</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Enter password">
            <mat-icon matPrefix>lock</mat-icon>
            <button matSuffix mat-icon-button type="button" (click)="clearPassword()" *ngIf="loginForm.get('password')?.value">
              <mat-icon>close</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>
          
          <div class="password-hint">
            <small>💡 Hint: The password is <code>iisa2025</code>. If you had read the README, you'd know that 😉</small>
          </div>
          
          <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
            <mat-icon>login</mat-icon>
            Login
          </button>
        </form>
        
        <div class="login-footer">
          <button mat-button routerLink="/register">
            <mat-icon>arrow_back</mat-icon>
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      @media (max-width: 768px) {
        padding: 16px;
        min-height: calc(100vh - 56px);
      }
    }
    
    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      
      @media (max-width: 768px) {
        padding: 32px 24px;
      }
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 32px;
      
      h2 {
        font-size: 24px;
        font-weight: 600;
        color: #1976d2;
        margin: 0 0 8px 0;
        
        @media (max-width: 768px) {
          font-size: 20px;
        }
      }
      
      p {
        font-size: 16px;
        color: #666;
        margin: 0;
        
        @media (max-width: 768px) {
          font-size: 14px;
        }
      }
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      
      mat-form-field {
        width: 100%;
      }
      
      button {
        height: 48px;
        font-size: 16px;
        font-weight: 500;
        
        @media (max-width: 768px) {
          height: 44px;
          font-size: 15px;
        }
      }
    }
    
    .password-hint {
      text-align: center;
      margin-top: -16px;
      
      small {
        font-size: 12px;
        color: #666;
        opacity: 0.7;
        line-height: 1.4;
        
        code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #333;
        }
      }
    }
    
    .login-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      
      button {
        color: #666;
        font-size: 14px;
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 4px;
        }
      }
    }
  `]
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
