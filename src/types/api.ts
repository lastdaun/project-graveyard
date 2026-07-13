export type ApiCollaborationMode =
  | "FREE_COLLABORATION"
  | "PROFIT_SHARING"
  | "SELL_USAGE_RIGHTS"
  | "FIND_COFOUNDER";

export type ApiProjectCategory = "IT" | "STARTUP";

export type ApiProjectStatus = "IDEA" | "PROTOTYPE" | "DEVELOPING";

export type ApiRole = "USER" | "ADMIN";

export type ApiListingType = "COMPANY_SHOWCASE" | "ABANDONED_PROJECT";

export type ApiLicenseType = "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE";

export type ApiReviewStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type ApiProjectStage =
  | "IDEA"
  | "PROTOTYPE"
  | "MVP"
  | "IN_DEVELOPMENT"
  | "NEARLY_COMPLETED"
  | "COMPLETED";

export type ApiHandoverType =
  | "SELL_SOURCE_CODE"
  | "TRANSFER_OWNERSHIP"
  | "FIND_COFOUNDER"
  | "FIND_CONTRIBUTOR"
  | "PROFIT_SHARING";

export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  university?: string;
  role: ApiRole | string;
  accountType?: string;
  verified?: boolean;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProject {
  id: number;
  title: string;
  description: string;
  category: ApiProjectCategory;
  status: ApiProjectStatus;
  skillsNeeded: string[];
  techStack: string[];
  creator: ApiUser;
  teamSize: number;
  currentMembers: number;
  progress: number;
  imageUrl?: string;
  collaborationMode: ApiCollaborationMode;
  price?: number;
  equitySplit?: number;
  approved: boolean;
  createdAt: string;
  updatedAt: string;

  // Listing type
  listingType?: ApiListingType;

  // Common marketplace fields
  licenseType?: ApiLicenseType;
  reviewStatus?: ApiReviewStatus;
  rejectionReason?: string;
  soldCount?: number;
  demoUrl?: string;
  supportDays?: number;
  commissionRate?: number;

  // Company showcase fields
  companyName?: string;
  companyWebsite?: string;
  companyContactEmail?: string;
  companyContactPhone?: string;
  companyLogo?: string;
  priceRange?: string;

  // Abandoned project fields
  projectStage?: ApiProjectStage;
  completionPercent?: number;
  completedParts?: string;
  missingParts?: string;
  handoverType?: ApiHandoverType;
  lookingFor?: string;

  // Valuation fields
  estimatedPriceLow?: number;
  estimatedPriceSuggested?: number;
  estimatedPriceHigh?: number;
  valuationScore?: number;
  valuationConfidence?: string;
  valuationNote?: string;
}

export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  status?: number;
  message: string;
  data: T;
}
