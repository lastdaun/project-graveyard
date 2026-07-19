export type ApiCollaborationMode =
  | "FREE_COLLABORATION"
  | "PROFIT_SHARING"
  | "SELL_USAGE_RIGHTS"
  | "FIND_COFOUNDER";

export type ApiProjectCategory = "IT" | "STARTUP";

export type ApiProjectStatus = "IDEA" | "PROTOTYPE" | "DEVELOPING";

export type ApiRole = "USER" | "ADMIN";

export type ApiReviewStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type ApiOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING_HANDOVER"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  university?: string;
  role: ApiRole | string;
}

export type ApiCompletionStatus = "INCOMPLETE" | "COMPLETED";
export type ApiListingType = "COMPANY_PROJECT" | "USER_INCOMPLETE_PROJECT";

/** Owner listings from GET /api/projects/my — no githubUrl */
export interface ApiMyProject {
  id: number;
  title: string;
  description: string;
  category: ApiProjectCategory;
  techStack?: string[];
  imageUrls?: string[];
  price?: number;
  listingType?: ApiListingType;
  completionStatus?: ApiCompletionStatus;
  completionPercent?: number;
  completedParts?: string;
  missingParts?: string;
  currentStage?: string;
  reviewStatus?: ApiReviewStatus;
  approved: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProject {
  id: number;
  title: string;
  description: string;
  category: ApiProjectCategory;
  status: ApiProjectStatus;
  skillsNeeded?: string[];
  techStack?: string[];
  creator: ApiUser;
  teamSize: number;
  currentMembers: number;
  progress: number;
  imageUrl?: string;
  imageUrls?: string[];
  collaborationMode?: ApiCollaborationMode;
  price?: number;
  equitySplit?: number;
  approved: boolean;
  reviewStatus?: ApiReviewStatus;
  soldCount?: number;
  listingType?: ApiListingType;
  completionStatus?: ApiCompletionStatus;
  completionPercent?: number;
  completedParts?: string;
  missingParts?: string;
  currentStage?: string;
  demoUrl?: string;
  estimatedPriceLow?: number;
  estimatedPriceSuggested?: number;
  estimatedPriceHigh?: number;
  valuationScore?: number;
  valuationConfidence?: string;
  valuationNote?: string;
  companyName?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrder {
  id: number;
  buyer: ApiUser;
  project: ApiProject;
  amount: number;
  status: ApiOrderStatus;
  paidAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
