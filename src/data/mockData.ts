export type CollaborationMode = "Free Collaboration" | "Profit Sharing" | "Sell Usage Rights" | "Find Co-founder";

export const collaborationModeLabels: Record<CollaborationMode, string> = {
  "Free Collaboration": "Cộng tác miễn phí",
  "Profit Sharing": "Chia sẻ lợi nhuận",
  "Sell Usage Rights": "Mua quyền sử dụng",
  "Find Co-founder": "Tìm đồng sáng lập",
};

export type ListingType = "COMPANY_SHOWCASE" | "ABANDONED_PROJECT";
export type LicenseType = "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE";
export type ReviewStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type ProjectStage = "IDEA" | "PROTOTYPE" | "MVP" | "IN_DEVELOPMENT" | "NEARLY_COMPLETED" | "COMPLETED";
export type HandoverType = "SELL_SOURCE_CODE" | "TRANSFER_OWNERSHIP" | "FIND_COFOUNDER" | "FIND_CONTRIBUTOR" | "PROFIT_SHARING";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "IT" | "Startup";
  status: "Ý tưởng" | "Nguyên mẫu" | "Đang phát triển";
  skillsNeeded: string[];
  techStack: string[];
  creator: {
    name: string;
    avatar: string;
  };
  teamSize: number;
  currentMembers: number;
  progress: number;
  imageUrl?: string;
  createdAt: string;
  collaborationMode: CollaborationMode;
  price?: number;
  equitySplit?: number;

  // Listing type
  listingType?: ListingType;

  // Common fields
  licenseType?: LicenseType;
  reviewStatus?: ReviewStatus;
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
  projectStage?: ProjectStage;
  completionPercent?: number;
  completedParts?: string;
  missingParts?: string;
  handoverType?: HandoverType;
  lookingFor?: string;

  // Valuation fields
  estimatedPriceLow?: number;
  estimatedPriceSuggested?: number;
  estimatedPriceHigh?: number;
  valuationScore?: number;
  valuationConfidence?: string;
  valuationNote?: string;
}

export const collaborationBadge: Record<CollaborationMode, { label: string; className: string }> = {
  "Free Collaboration": { label: "Miễn phí tham gia", className: "bg-accent/15 text-accent" },
  "Sell Usage Rights": { label: "", className: "bg-warning/15 text-warning" },
  "Profit Sharing": { label: "", className: "bg-[hsl(270_60%_55%)]/15 text-[hsl(270_60%_55%)]" },
  "Find Co-founder": { label: "Tìm đồng sáng lập", className: "bg-[hsl(210_70%_50%)]/15 text-[hsl(210_70%_50%)]" },
};

export function getCollabLabel(project: Project): string {
  const mode = project.collaborationMode;
  if (mode === "Sell Usage Rights") return `${(project.price ?? 0).toLocaleString("vi-VN")}₫ - Mua quyền`;
  if (mode === "Profit Sharing") return `${project.equitySplit ?? 50}/${100 - (project.equitySplit ?? 50)} Chia lợi nhuận`;
  return collaborationBadge[mode].label;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "EcoTracker - Ứng dụng theo dõi Carbon",
    description: "Ứng dụng web mobile-first giúp người dùng theo dõi và giảm lượng carbon thải ra thông qua các thử thách hàng ngày và bảng xếp hạng cộng đồng.",
    category: "IT",
    status: "Đang phát triển",
    skillsNeeded: ["React Native", "Node.js", "UI/UX Design"],
    techStack: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
    creator: { name: "Alex Chen", avatar: "AC" },
    teamSize: 4,
    currentMembers: 2,
    progress: 60,
    createdAt: "2025-12-15",
    collaborationMode: "Sell Usage Rights",
    price: 1_250_000,
  },
  {
    id: "2",
    title: "CampusConnect - Nền tảng sự kiện",
    description: "Nền tảng giúp cộng đồng khám phá, tạo và quản lý sự kiện với tính năng RSVP, thông báo và mạng xã hội.",
    category: "Startup",
    status: "Nguyên mẫu",
    skillsNeeded: ["Backend Dev", "Marketing", "Flutter"],
    techStack: ["Flutter", "Firebase", "Figma"],
    creator: { name: "Maria Santos", avatar: "MS" },
    teamSize: 5,
    currentMembers: 1,
    progress: 35,
    createdAt: "2026-01-20",
    collaborationMode: "Find Co-founder",
  },
  {
    id: "3",
    title: "BrandKit - Công cụ xây dựng thương hiệu",
    description: "Công cụ web giúp nhà sáng tạo tạo tài liệu thương hiệu cá nhân chuyên nghiệp bao gồm logo, danh thiếp và mẫu truyền thông xã hội.",
    category: "IT",
    status: "Ý tưởng",
    skillsNeeded: ["Frontend Dev", "Backend Dev", "UI/UX"],
    techStack: ["React", "Canvas API", "Node.js"],
    creator: { name: "Jordan Lee", avatar: "JL" },
    teamSize: 3,
    currentMembers: 1,
    progress: 10,
    createdAt: "2026-02-05",
    collaborationMode: "Free Collaboration",
  },
  {
    id: "4",
    title: "StudyBuddy - Trợ lý học tập AI",
    description: "Trợ lý học tập AI tạo flashcard, bài kiểm tra và tóm tắt từ ghi chú bài giảng và sách giáo trình đã tải lên.",
    category: "IT",
    status: "Nguyên mẫu",
    skillsNeeded: ["Machine Learning", "Python", "React"],
    techStack: ["Python", "FastAPI", "OpenAI", "React"],
    creator: { name: "Sarah Kim", avatar: "SK" },
    teamSize: 3,
    currentMembers: 2,
    progress: 45,
    createdAt: "2026-01-10",
    collaborationMode: "Profit Sharing",
    equitySplit: 50,
  },
  {
    id: "5",
    title: "LocalBites - Khám phá ẩm thực quanh trường",
    description: "Nền tảng kết nối cộng đồng với các quán ăn giá rẻ xung quanh, với đánh giá, ưu đãi hàng ngày và tính năng đặt nhóm.",
    category: "Startup",
    status: "Đang phát triển",
    skillsNeeded: ["Mobile Dev", "Business Strategy", "Content"],
    techStack: ["React Native", "Supabase", "Stripe"],
    creator: { name: "Tom Rivera", avatar: "TR" },
    teamSize: 4,
    currentMembers: 3,
    progress: 70,
    createdAt: "2025-11-28",
    collaborationMode: "Sell Usage Rights",
    price: 1_875_000,
  },
  {
    id: "6",
    title: "PortfolioForge - Portfolio nhà sáng tạo",
    description: "Trình tạo portfolio kéo-thả cho developer với các mẫu chuyên nghiệp và xuất tương thích ATS.",
    category: "IT",
    status: "Ý tưởng",
    skillsNeeded: ["UI/UX", "Frontend Dev", "Illustration"],
    techStack: ["Next.js", "Prisma", "Vercel"],
    creator: { name: "Nina Patel", avatar: "NP" },
    teamSize: 3,
    currentMembers: 1,
    progress: 5,
    createdAt: "2026-02-20",
    collaborationMode: "Free Collaboration",
  },
  {
    id: "7",
    title: "GreenMarket - Chợ bền vững",
    description: "Nền tảng thương mại điện tử để mua, bán và trao đổi đồ second-hand giữa các thành viên cộng đồng.",
    category: "Startup",
    status: "Nguyên mẫu",
    skillsNeeded: ["Full Stack Dev", "Mobile Dev", "DevOps"],
    techStack: ["Vue.js", "Node.js", "MongoDB"],
    creator: { name: "Leo Zhang", avatar: "LZ" },
    teamSize: 4,
    currentMembers: 2,
    progress: 30,
    createdAt: "2026-01-05",
    collaborationMode: "Profit Sharing",
    equitySplit: 60,
  },
  {
    id: "8",
    title: "SkillSwap - Nền tảng học ngang hàng",
    description: "Nền tảng nơi mọi người có thể trao đổi kỹ năng — dạy những gì mình biết và học những gì mình cần, theo dõi bằng hệ thống tín chỉ.",
    category: "IT",
    status: "Ý tưởng",
    skillsNeeded: ["Full Stack Dev", "Product Design", "Community"],
    techStack: ["React", "Express", "PostgreSQL"],
    creator: { name: "Ava Johnson", avatar: "AJ" },
    teamSize: 5,
    currentMembers: 1,
    progress: 15,
    createdAt: "2026-03-01",
    collaborationMode: "Find Co-founder",
  },
];

export const categories = ["Tất cả", "IT", "Startup"] as const;
export const statuses = ["Tất cả", "Ý tưởng", "Nguyên mẫu", "Đang phát triển"] as const;
export const skills = [
  "React", "Node.js", "Python", "Machine Learning", "Flutter",
  "TypeScript", "Spring Boot", "Docker", "Backend Dev",
  "Frontend Dev", "Mobile Dev", "DevOps", "Full Stack Dev",
];
