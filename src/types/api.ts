export type ApiCollaborationMode =
  | "FREE_COLLABORATION"
  | "PROFIT_SHARING"
  | "SELL_USAGE_RIGHTS"
  | "FIND_COFOUNDER";

export type ApiProjectCategory = "IT" | "STARTUP";

export type ApiProjectStatus = "IDEA" | "PROTOTYPE" | "DEVELOPING";

export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  university?: string;
  role: string;
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
