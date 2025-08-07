export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  hobbies: string;
  whyPerfect: string;
  profileImage: string;
  submissionDate: Date;
  lastEditDate?: Date;
}
