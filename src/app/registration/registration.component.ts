import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Candidate } from '../models/candidate.model';
import { CandidateService } from '../core/services/candidate.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { NotificationService } from '../core/services/notification.service';
import { ImagePreviewComponent } from '../shared/components/image-preview.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    ReactiveFormsModule,
    ImagePreviewComponent
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  registrationForm: FormGroup;
  emailCheckForm: FormGroup;
  profileImagePreview: string | null = null;
  existingCandidate: Candidate | null = null;
  daysRemaining: number = 3;
  isEditing: boolean = false;
  emailChecked: boolean = false;
  emailCheckMessage: string = '';
  emailCheckMessageType: 'success' | 'error' | '' = '';
  validCities: string[] = [
    'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya',
    'Ashdod', 'Rishon LeZion', 'Petah Tikva', 'Holon', 'Bnei Brak',
    'Rehovot', 'Kfar Saba', 'Herzliya', 'Modiin', 'Ra\'anana',
    'Kiryat Gat', 'Lod', 'Nazareth', 'Tiberias', 'Eilat'
  ];

  private fullNameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    if (!value.includes(' ')) {
      return { fullNameFormat: true };
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private analyticsService: AnalyticsService,
    private notificationService: NotificationService
  ) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, this.fullNameValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]*$/)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      city: ['', Validators.required],
      hobbies: ['', Validators.required],
      whyPerfect: ['', Validators.required],
      profileImage: [null]
    });

    this.emailCheckForm = this.fb.group({
      checkEmail: ['', [Validators.email]]
    });
  }

  ngOnInit(): void {
    this.analyticsService.incrementVisits();
  }

  onPhoneInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const numbersOnly = value.replace(/[^0-9+\-\s()]/g, '');
    
    if (value !== numbersOnly) {
      input.value = numbersOnly;
      this.registrationForm.patchValue({ phone: numbersOnly });
    }
  }

  onPhoneKeyPress(event: KeyboardEvent): void {
    const allowedChars = /[0-9+\-\s()]/;
    const key = event.key;
    
    if (!allowedChars.test(key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  removeImage(): void {
    this.profileImagePreview = null;
    this.registrationForm.patchValue({ profileImage: null });
  }

  checkEmailForExisting(): void {
    const email = this.emailCheckForm.get('checkEmail')?.value;
    if (email && this.emailCheckForm.get('checkEmail')?.valid) {
      const status = this.candidateService.getSubmissionStatus(email);

      if (status.canEdit && status.daysRemaining <= 3) {
        const existing = this.candidateService.getCandidateByEmail(email);
        if (existing) {
          this.existingCandidate = existing;
          this.daysRemaining = status.daysRemaining;
          this.isEditing = true;
          this.emailChecked = true;
          this.emailCheckMessage = `We've found your details. You can now edit them. (${status.daysRemaining} day(s) remaining)`;
          this.emailCheckMessageType = 'success';

          this.registrationForm.patchValue({
            fullName: existing.fullName,
            email: existing.email,
            phone: existing.phone,
            age: existing.age,
            city: existing.city,
            hobbies: existing.hobbies,
            whyPerfect: existing.whyPerfect
          });
          this.profileImagePreview = existing.profileImage;
        }
      } else if (!status.canEdit) {
        this.emailChecked = true;
        this.emailCheckMessage = status.message;
        this.emailCheckMessageType = 'error';
        this.isEditing = false;
      } else {
        this.emailChecked = true;
        this.emailCheckMessage = 'No existing registration found for this email.';
        this.emailCheckMessageType = 'error';
        this.isEditing = false;
      }
    }
  }

  startNewRegistration(): void {
    this.emailChecked = false;
    this.isEditing = false;
    this.existingCandidate = null;
    this.emailCheckMessage = '';
    this.emailCheckMessageType = '';
    this.resetForm();
  }

  onFileSelected(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.registrationForm.patchValue({ profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      const email = this.sanitizeInput(formData.email);
      
      if (!this.existingCandidate) {
        const existingCandidate = this.candidateService.getCandidateByEmail(email);
        if (existingCandidate) {
          this.notificationService.duplicateEmailError();
          this.registrationForm.get('email')?.setValue('');
          return;
        }
      }
      
      const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
      
      const candidate: Candidate = {
        id: this.existingCandidate?.id || Date.now().toString(),
        fullName: this.sanitizeInput(formData.fullName),
        email: email,
        phone: this.sanitizeInput(formData.phone),
        age: formData.age,
        city: this.sanitizeInput(formData.city),
        hobbies: this.sanitizeInput(formData.hobbies),
        whyPerfect: this.sanitizeInput(formData.whyPerfect),
        profileImage: formData.profileImage || defaultImage,
        submissionDate: this.existingCandidate?.submissionDate || new Date()
      };

      if (this.existingCandidate) {
        if (this.candidateService.updateCandidate(candidate)) {
          this.notificationService.applicationUpdated();
        }
      } else {
        if (this.candidateService.addCandidate(candidate)) {
          this.notificationService.applicationSubmitted();
        }
      }

      this.resetForm();
    }
  }

  resetForm(): void {
    this.registrationForm.reset();
    this.profileImagePreview = null;
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.setErrors(null);
    });
    
    this.emailCheckForm.reset();
    Object.keys(this.emailCheckForm.controls).forEach(key => {
      const control = this.emailCheckForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.setErrors(null);
    });
    this.emailChecked = false;
    this.emailCheckMessage = '';
    this.emailCheckMessageType = '';
    this.isEditing = false;
    this.existingCandidate = null;
  }

  clearField(fieldName: string): void {
    this.registrationForm.get(fieldName)?.setValue('');
  }

  private sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  checkExistingSubmission(): void {
    const email = this.registrationForm.get('email')?.value;
    if (email) {
      const existing = this.candidateService.getCandidateByEmail(email);
      if (existing && !this.existingCandidate) {
        this.notificationService.duplicateEmailError();
        this.registrationForm.get('email')?.setValue('');
      }
    }
  }
} 