import type { ApiProject } from "@/types/api";
import type { Project, CollaborationMode } from "@/data/mockData";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(endpoint, { ...options, headers });
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getStoredUser(): { id: number; email: string; fullName: string; role: string } | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getStoredUser()?.role === "ADMIN";
}

const CATEGORY_LABEL: Record<string, Project["category"]> = {
  IT: "IT",
  STARTUP: "Startup",
};

const STATUS_LABEL: Record<string, Project["status"]> = {
  IDEA: "Ý tưởng",
  PROTOTYPE: "Nguyên mẫu",
  DEVELOPING: "Đang phát triển",
};

const COLLAB_LABEL: Record<string, CollaborationMode> = {
  FREE_COLLABORATION: "Free Collaboration",
  PROFIT_SHARING: "Profit Sharing",
  SELL_USAGE_RIGHTS: "Sell Usage Rights",
  FIND_COFOUNDER: "Find Co-founder",
};

function getAvatarInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

export function adaptApiProject(p: ApiProject): Project {
  return {
    id: String(p.id),
    title: p.title,
    description: p.description,
    category: CATEGORY_LABEL[p.category] ?? (p.category as Project["category"]),
    status: STATUS_LABEL[p.status] ?? (p.status as Project["status"]),
    skillsNeeded: p.skillsNeeded ?? [],
    techStack: p.techStack ?? [],
    creator: {
      name: p.creator?.fullName ?? "Unknown",
      avatar: p.creator?.avatar || getAvatarInitials(p.creator?.fullName ?? "U"),
    },
    teamSize: p.teamSize,
    currentMembers: p.currentMembers,
    progress: p.completionPercent ?? p.progress,
    imageUrl: p.imageUrl || p.imageUrls?.[0],
    imageUrls: p.imageUrls,
    createdAt: p.createdAt ?? "",
    collaborationMode: COLLAB_LABEL[p.collaborationMode ?? "SELL_USAGE_RIGHTS"] ?? "Sell Usage Rights",
    price: p.price,
    equitySplit: p.equitySplit,
    listingType: p.listingType,
    completionStatus: p.completionStatus,
    completionPercent: p.completionPercent,
    completedParts: p.completedParts,
    missingParts: p.missingParts,
    currentStage: p.currentStage,
    demoUrl: p.demoUrl,
    reviewStatus: p.reviewStatus,
    rejectionReason: p.rejectionReason,
    approved: p.approved,
    estimatedPriceLow: p.estimatedPriceLow,
    estimatedPriceSuggested: p.estimatedPriceSuggested,
    estimatedPriceHigh: p.estimatedPriceHigh,
    valuationNote: p.valuationNote,
    companyName: p.companyName,
    companyWebsite: p.companyWebsite,
    companyEmail: p.companyEmail,
    companyPhone: p.companyPhone,
    githubUrl: p.githubUrl,
  };
}
