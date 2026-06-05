import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/data/mockData";
import { collaborationBadge, getCollabLabel } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

const statusColor: Record<string, string> = {
  "Ý tưởng": "tag-warning",
  "Nguyên mẫu": "tag-primary",
  "Đang phát triển": "tag-accent",
};

const ProjectCard = ({ project }: { project: Project }) => {
  const badge = collaborationBadge[project.collaborationMode];
  const collabLabel = getCollabLabel(project);
  const { t } = useLanguage();

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block rounded-xl border bg-card p-5 card-hover"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`tag ${statusColor[project.status]}`}>{project.status}</span>
          <span className="tag tag-muted">{project.category}</span>
        </div>
        <span className={`tag ${badge.className}`}>{collabLabel}</span>
      </div>

      <h3 className="mb-1.5 font-display text-lg font-semibold group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
        {project.description}
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {project.skillsNeeded.slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {skill}
          </span>
        ))}
      </div>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{t("project.progress")}</span>
          <span>{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {project.creator.avatar}
          </div>
          <span className="text-sm text-muted-foreground">{project.creator.name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {project.currentMembers}/{project.teamSize}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        {t("landing.featured.all")} <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
};

export default ProjectCard;
