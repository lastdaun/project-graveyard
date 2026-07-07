export type CollaborationMode = "Free Collaboration" | "Profit Sharing" | "Sell Usage Rights" | "Find Co-founder";

export const collaborationModeLabels: Record<CollaborationMode, string> = {
  "Free Collaboration": "Cộng tác miễn phí",
  "Profit Sharing": "Chia sẻ lợi nhuận",
  "Sell Usage Rights": "Mua quyền sử dụng",
  "Find Co-founder": "Tìm đồng sáng lập",
};

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
    title: "DevPortfolio - Nền tảng portfolio cho lập trình viên",
    description: "Trình tạo portfolio kéo-thả dành riêng cho developer, tích hợp GitHub và hiển thị dự án, contribution graph, kỹ năng theo dạng interactive.",
    category: "IT",
    status: "Ý tưởng",
    skillsNeeded: ["Frontend Dev", "Backend Dev", "UI/UX"],
    techStack: ["Next.js", "Prisma", "Vercel", "GitHub API"],
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
    title: "APIHub - Marketplace API mã nguồn mở",
    description: "Nền tảng tổng hợp và chia sẻ các API mã nguồn mở, cho phép developer tìm kiếm, test trực tiếp và tích hợp API nhanh chóng.",
    category: "IT",
    status: "Ý tưởng",
    skillsNeeded: ["Backend Dev", "Frontend Dev", "DevOps"],
    techStack: ["Next.js", "Prisma", "Vercel", "OpenAPI"],
    creator: { name: "Nina Patel", avatar: "NP" },
    teamSize: 3,
    currentMembers: 1,
    progress: 5,
    createdAt: "2026-02-20",
    collaborationMode: "Free Collaboration",
  },
  {
    id: "7",
    title: "GreenMarket - Chợ thương mại điện tử bền vững",
    description: "Nền tảng e-commerce để mua, bán đồ second-hand với tính năng AI định giá tự động và xác minh chất lượng sản phẩm.",
    category: "Startup",
    status: "Nguyên mẫu",
    skillsNeeded: ["Full Stack Dev", "Mobile Dev", "AI/ML"],
    techStack: ["Vue.js", "Node.js", "MongoDB", "TensorFlow"],
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
  "React", "Node.js", "Python", "TypeScript", "Machine Learning",
  "Flutter", "FastAPI", "DevOps", "Backend Dev",
  "Frontend Dev", "Mobile Dev", "Full Stack Dev", "AI/ML",
];
