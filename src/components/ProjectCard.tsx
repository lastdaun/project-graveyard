import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, User, Building2, Phone } from "lucide-react";
import type { Project } from "@/data/mockData";

const statusColor: Record<string, string> = {
  "Ý tưởng": "tag-warning",
  "Nguyên mẫu": "tag-primary",
  "Đang phát triển": "tag-accent",
};

const LICENSE_LABEL: Record<string, string> = {
  PERSONAL: "Personal",
  COMMERCIAL: "Commercial",
  EXCLUSIVE: "Exclusive",
};

const LICENSE_COLOR: Record<string, string> = {
  PERSONAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMMERCIAL: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  EXCLUSIVE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const ProjectCard = ({ project }: { project: Project }) => {
  const isCompany = project.listingType === "COMPANY_SHOWCASE";
  const isForSale = project.collaborationMode === "Sell Usage Rights" || !!project.price;

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block rounded-xl border bg-card p-5 card-hover"
    >
      {/* Image preview */}
      {project.imageUrl && (
        <div className="mb-3 -mx-5 -mt-5 overflow-hidden rounded-t-xl">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-40 w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Tags */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {isCompany && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Building2 className="h-3 w-3" /> Công ty
          </span>
        )}
        {project.licenseType && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${LICENSE_COLOR[project.licenseType] ?? "bg-muted text-muted-foreground"}`}>
            {LICENSE_LABEL[project.licenseType] ?? project.licenseType}
          </span>
        )}
        {project.sellerType && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {project.sellerType === "INDIVIDUAL"
              ? <><User className="h-3 w-3" /> Cá nhân</>
              : <><Building2 className="h-3 w-3" /> Công ty</>
            }
          </span>
        )}
      </div>

      {/* Title & description */}
      <h3 className="mb-1.5 font-display text-lg font-semibold group-hover:text-primary transition-colors leading-tight">
        {project.title}
      </h3>
      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
        {project.description}
      </p>

      {/* Tech stack */}
      {project.techStack.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-mono text-secondary-foreground">
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Price + Sold count */}
      <div className="mb-3 flex items-end justify-between">
        {project.price != null && project.price > 0 ? (
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="font-display text-xl font-bold text-primary">
              {project.price.toLocaleString("vi-VN")}₫
            </span>
          </div>
        ) : isCompany ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>Liên hệ để biết giá</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Cộng tác / Miễn phí</span>
        )}
        {project.soldCount != null && project.soldCount > 0 && (
          <span className="text-xs text-muted-foreground">Đã bán: {project.soldCount}</span>
        )}
      </div>

      {/* Creator */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {project.creator.avatar?.slice(0, 2) ?? "?"}
          </div>
          <span className="text-sm text-muted-foreground">{project.creator.name}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
