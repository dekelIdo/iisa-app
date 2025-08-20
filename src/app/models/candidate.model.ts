export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  city: string;
  hobbies: string;
  whyPerfect: string;
  profileImage: string;
  submissionDate: Date;
  lastEditDate?: Date;
}
