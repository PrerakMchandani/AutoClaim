
export enum ReimbursementType {
  WIFI = 'WiFi',
  MOBILE = 'Mobile'
}

export type UserRole = 'employee' | 'admin';

export interface UserSession {
  name: string;
  role: UserRole;
}

export interface ClaimDetails {
  provider: string;
  billingDate: string;
  totalAmount: number;
  customerName: string;
  extractedText?: string;
}

export interface ClaimResult {
  id: string;
  userId: string; // The name of the user who submitted (Claimant)
  details: ClaimDetails;
  eligibleAmount: number;
  status: 'Auto-Approved' | 'Needs Review' | 'Approved' | 'Pending' | 'Rejected';
  reasoning: string; // AI reasoning
  adminReason?: string; // Reason provided by admin manually
  months: string[];
  type: ReimbursementType;
  submittedAt: string;
}

export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}
