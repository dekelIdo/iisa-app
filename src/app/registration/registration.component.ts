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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Candidate } from '../models/candidate.model';
import { CandidateService } from '../core/services/candidate.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { NotificationService } from '../core/services/notification.service';
import { ImagePreviewComponent } from '../shared/components/image-preview.component';
import { DashboardService } from '../core/services/dashboard.service';

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
    ImagePreviewComponent,
    MatDatepickerModule,
    MatNativeDateModule
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
  validCities: string[] = [];
  showFormSelection: boolean = true; // New property to control form selection display
  selectedFormType: 'new' | 'edit' | null = null; // New property to track selected form type
  
  // Date picker constraints
  maxDate: Date;
  minDate: Date;
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
    private notificationService: NotificationService,
    private dashboardService: DashboardService
  ) {
    // Initialize date constraints
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, this.fullNameValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]*$/)]],
      dateOfBirth: ['', [Validators.required, this.dateOfBirthValidator.bind(this)]],
      city: ['', Validators.required],
      hobbies: ['', Validators.required],
      whyPerfect: ['', Validators.required],
      profileImage: [null]
    });

    this.emailCheckForm = this.fb.group({
      checkEmail: ['', [Validators.email]]
    });
  }

  // Add date of birth validator
  private dateOfBirthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    console.log('Date validation called with value:', value);
    
    if (!value) {
      console.log('Date validation: no value provided');
      return null; // Let required validator handle this
    }
    
    try {
      const selectedDate = new Date(value);
      console.log('Date validation: parsed date:', selectedDate);
      
      // Check if it's a valid date
      if (isNaN(selectedDate.getTime())) {
        console.log('Date validation: invalid date');
        return { invalidDate: true };
      }
      
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      
      console.log('Date validation: min date:', minDate, 'max date:', maxDate, 'selected:', selectedDate);
      
      if (selectedDate > maxDate) {
        console.log('Date validation: too young');
        return { tooYoung: true };
      }
      
      if (selectedDate < minDate) {
        console.log('Date validation: too old');
        return { tooOld: true };
      }
      
      console.log('Date validation: valid date');
      return null;
    } catch (error) {
      console.log('Date validation: error:', error);
      return { invalidDate: true };
    }
  }

  // Helper method to calculate age from date of birth
  calculateAge(dateOfBirth: Date | undefined | null): number {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  ngOnInit(): void {
    this.analyticsService.incrementVisits();
    this.validCities = this.dashboardService.getValidCities()
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
            dateOfBirth: existing.dateOfBirth,
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

  // New methods for form selection
  selectFormType(type: 'new' | 'edit'): void {
    console.log('Selecting form type:', type);
    this.selectedFormType = type;
    this.showFormSelection = false;
    
    if (type === 'new') {
      console.log('Resetting form for new registration');
      this.resetForm();
    }
    
    console.log('Form type selected. Form valid:', this.registrationForm.valid);
  }

  goBackToSelection(event?: Event): void {
    console.log('Going back to form selection');
    
    // Prevent any form submission
    event?.preventDefault();
    event?.stopPropagation();
    
    this.showFormSelection = true;
    this.selectedFormType = null;
    this.emailChecked = false;
    this.isEditing = false;
    this.existingCandidate = null;
    this.emailCheckMessage = '';
    this.emailCheckMessageType = '';
    this.resetForm();
    console.log('Back to selection. Form valid:', this.registrationForm.valid);
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
    console.log('Form submission attempted');
    console.log('Form valid:', this.registrationForm.valid);
    console.log('Form values:', this.registrationForm.value);
    console.log('Form errors:', this.registrationForm.errors);
    
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      
      // Additional validation for dateOfBirth
      if (!formData.dateOfBirth) {
        this.notificationService.error('Please select a valid date of birth');
        return;
      }
      
      // Validate that all required fields have actual values
      if (!formData.fullName?.trim() || !formData.email?.trim() || !formData.phone?.trim() || 
          !formData.city?.trim() || !formData.hobbies?.trim() || !formData.whyPerfect?.trim()) {
        this.notificationService.error('Please fill in all required fields');
        return;
      }
      
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
        dateOfBirth: new Date(formData.dateOfBirth), // Now we know it exists
        city: this.sanitizeInput(formData.city),
        hobbies: this.sanitizeInput(formData.hobbies),
        whyPerfect: this.sanitizeInput(formData.whyPerfect),
        profileImage: formData.profileImage || defaultImage,
        submissionDate: this.existingCandidate?.submissionDate || new Date()
      };

      console.log('Submitting candidate:', candidate);

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
    } else {
      console.log('Form is invalid, cannot submit');
      this.notificationService.error('Please fix the form errors before submitting');
    }
  }

  resetForm(): void {
    console.log('Resetting form');
    this.registrationForm.reset();
    this.profileImagePreview = null;
    
    // Reset form controls to pristine state
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });
    
    this.emailCheckForm.reset();
    Object.keys(this.emailCheckForm.controls).forEach(key => {
      const control = this.emailCheckForm.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });
    
    this.emailChecked = false;
    this.emailCheckMessage = '';
    this.emailCheckMessageType = '';
    this.isEditing = false;
    this.existingCandidate = null;
    
    console.log('Form reset complete. Form valid:', this.registrationForm.valid);
  }

  clearField(fieldName: string): void {
    if (fieldName === 'dateOfBirth') {
      this.registrationForm.get(fieldName)?.setValue(null);
    } else {
      this.registrationForm.get(fieldName)?.setValue('');
    }
  }

  private sanitizeInput(input: string | null | undefined): string {
    if (!input) return '';
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