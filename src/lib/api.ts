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
    progress: p.progress,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt ?? "",
    collaborationMode: COLLAB_LABEL[p.collaborationMode] ?? ("Free Collaboration" as CollaborationMode),
    price: p.price,
    equitySplit: p.equitySplit,
  };
}
