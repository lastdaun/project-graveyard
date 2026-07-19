import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ApiListingType, ApiProject, ApiResponse, ApiPage } from "@/types/api";
import { adaptApiProject } from "@/lib/api";
import type { Project } from "@/data/mockData";

const CATEGORY_OPTIONS = ["Tất cả", "IT", "Startup IT"];

const CATEGORY_API_MAP: Record<string, string> = {
  IT: "IT",
  "Startup IT": "STARTUP",
};

type ListingTab = "ALL" | ApiListingType;

async function fetchProjectPage(params: URLSearchParams): Promise<ApiProject[]> {
  const res = await fetch(`/api/projects?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Không thể tải danh sách dự án (${res.status})`);
  }
  const body: ApiResponse<ApiPage<ApiProject>> = await res.json();
  return body.data?.content ?? [];
}

const Explore = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [listingTab, setListingTab] = useState<ListingTab>("ALL");

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const base = new URLSearchParams();
        if (search) base.set("search", search);
        if (category !== "Tất cả") base.set("category", CATEGORY_API_MAP[category] ?? category.toUpperCase());
        base.set("size", "50");

        let content: ApiProject[];

        if (listingTab === "ALL") {
          // Fetch both listing types separately then merge (avoids DB enum issues on ALL)
          const companyParams = new URLSearchParams(base);
          companyParams.set("listingType", "COMPANY_PROJECT");
          const userParams = new URLSearchParams(base);
          userParams.set("listingType", "USER_INCOMPLETE_PROJECT");

          const [company, community] = await Promise.all([
            fetchProjectPage(companyParams),
            fetchProjectPage(userParams),
          ]);
          const merged = [...company, ...community];
          merged.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
          content = merged;
        } else {
          const params = new URLSearchParams(base);
          params.set("listingType", listingTab);
          content = await fetchProjectPage(params);
        }

        setProjects(content.map(adaptApiProject));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounce);
  }, [search, category, listingTab]);

  const tabs: { id: ListingTab; label: string }[] = [
    { id: "ALL", label: "Tất cả" },
    { id: "COMPANY_PROJECT", label: "Project công ty / hoàn thiện" },
    { id: "USER_INCOMPLETE_PROJECT", label: "Project chưa hoàn thiện" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">{t("explore.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("explore.sub")}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={listingTab === tab.id ? "default" : "outline"}
              onClick={() => setListingTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("explore.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("explore.category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium text-destructive">{error}</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">{t("explore.empty")}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
