import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/data/mockData";

const ProjectCard = ({ project }: { project: Project }) => {
  const isCompany = project.listingType === "COMPANY_PROJECT";
  const percent = project.completionPercent ?? project.progress;

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block rounded-xl border bg-card p-5 card-hover"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`tag ${isCompany ? "tag-accent" : "tag-warning"}`}>
            {isCompany ? "Công ty" : "Chưa hoàn thiện"}
          </span>
          <span className="tag tag-muted">{project.category}</span>
        </div>
        {project.price != null && (
          <span className="tag tag-primary text-xs shrink-0">
            {project.price.toLocaleString("vi-VN")}₫
          </span>
        )}
      </div>

      <h3 className="mb-1.5 font-display text-lg font-semibold group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
        {project.description}
      </p>

      {!isCompany && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Hoàn thiện</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {project.creator.avatar}
          </div>
          <span className="text-sm text-muted-foreground">{project.creator.name}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
};

export default ProjectCard;
