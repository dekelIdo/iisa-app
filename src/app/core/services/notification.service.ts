import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  panelClass?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly DEFAULT_DURATION = 3000;
  private readonly DEFAULT_ACTION = 'Close';

  constructor(private snackBar: MatSnackBar) { }

  success(message: string, config?: Partial<NotificationConfig>): void {
    const finalConfig: NotificationConfig = {
      message,
      action: config?.action || this.DEFAULT_ACTION,
      duration: config?.duration || this.DEFAULT_DURATION,
      panelClass: config?.panelClass || ['success-snackbar']
    };

    this.showNotification(finalConfig);
  }

  error(message: string, config?: Partial<NotificationConfig>): void {
    const finalConfig: NotificationConfig = {
      message,
      action: config?.action || this.DEFAULT_ACTION,
      duration: config?.duration || this.DEFAULT_DURATION,
      panelClass: config?.panelClass || ['error-snackbar']
    };

    this.showNotification(finalConfig);
  }

  info(message: string, config?: Partial<NotificationConfig>): void {
    const finalConfig: NotificationConfig = {
      message,
      action: config?.action || this.DEFAULT_ACTION,
      duration: config?.duration || this.DEFAULT_DURATION,
      panelClass: config?.panelClass || ['info-snackbar']
    };

    this.showNotification(finalConfig);
  }

  warning(message: string, config?: Partial<NotificationConfig>): void {
    const finalConfig: NotificationConfig = {
      message,
      action: config?.action || this.DEFAULT_ACTION,
      duration: config?.duration || this.DEFAULT_DURATION,
      panelClass: config?.panelClass || ['warning-snackbar']
    };

    this.showNotification(finalConfig);
  }

  custom(config: NotificationConfig): void {
    this.showNotification(config);
  }

  applicationSubmitted(): void {
    this.success('Application submitted successfully! You can edit your submission within 3 days.', {
      duration: 4000
    });
  }

  applicationUpdated(): void {
    this.success('Application updated successfully!');
  }

  duplicateEmailError(): void {
    this.error('An application with this email already exists. You can edit it within 3 days of submission.', {
      duration: 4000
    });
  }

  loginSuccess(): void {
    this.success('Login successful! Welcome back.');
  }

  loginError(): void {
    this.error('Invalid credentials. Please try again.');
  }

  existingSubmissionFound(): void {
    this.info('Found existing submission. You can edit it within 3 days.');
  }

  submissionExpired(): void {
    this.warning('Submission cannot be edited after 3 days.');
  }

  private showNotification(config: NotificationConfig): void {
    this.snackBar.open(
      config.message,
      config.action || this.DEFAULT_ACTION,
      {
        duration: config.duration || this.DEFAULT_DURATION,
        panelClass: config.panelClass
      }
    );
  }
}
