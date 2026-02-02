import { useState, useMemo } from "react";
import { Search, X, Zap, CheckCircle, Circle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NEW_SKILLS_V19_5 } from "@/lib/dive-coder-config";

interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  enabled: boolean;
  isNew?: boolean;
}

// Generate all 159+ skills based on V19.5 config
const generateSkills = (): Skill[] => {
  const categories = [
    { name: "Code Generation", prefix: "cg", count: 25 },
    { name: "Testing", prefix: "test", count: 20 },
    { name: "Documentation", prefix: "doc", count: 15 },
    { name: "Review", prefix: "review", count: 18 },
    { name: "Refactoring", prefix: "refactor", count: 22 },
    { name: "Architecture", prefix: "arch", count: 16 },
    { name: "Security", prefix: "sec", count: 14 },
    { name: "Performance", prefix: "perf", count: 12 },
    { name: "DevOps", prefix: "devops", count: 10 },
    { name: "AI/ML", prefix: "ml", count: 7 },
  ];

  const skills: Skill[] = [];
  
  // Add new V19.5 skills
  NEW_SKILLS_V19_5.forEach((skill, idx) => {
    skills.push({
      id: `new-${idx}`,
      name: skill,
      category: "V19.5 New",
      description: `New skill added in V19.5 Enhanced Edition`,
      enabled: true,
      isNew: true,
    });
  });

  // Generate skills per category
  categories.forEach(cat => {
    for (let i = 1; i <= cat.count; i++) {
      skills.push({
        id: `${cat.prefix}-${i}`,
        name: `${cat.name} Skill ${i}`,
        category: cat.name,
        description: `${cat.name} capability for advanced code assistance`,
        enabled: true,
      });
    }
  });

  return skills;
};

const ALL_SKILLS = generateSkills();

interface SkillsBrowserProps {
  onSelectSkill?: (skill: Skill) => void;
  className?: string;
}

export function SkillsBrowser({ onSelectSkill, className }: SkillsBrowserProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(ALL_SKILLS.map(s => s.category));
    return Array.from(cats);
  }, []);

  const filteredSkills = useMemo(() => {
    return ALL_SKILLS.filter(skill => {
      const matchesSearch = !search || 
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || skill.category === selectedCategory;
      const matchesNew = !showOnlyNew || skill.isNew;
      return matchesSearch && matchesCategory && matchesNew;
    });
  }, [search, selectedCategory, showOnlyNew]);

  const categoryStats = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = ALL_SKILLS.filter(s => s.category === cat).length;
      return acc;
    }, {} as Record<string, number>);
  }, [categories]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Zap className="w-4 h-4" />
          <span>{ALL_SKILLS.length}+ Skills</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Skills Browser
            <Badge variant="secondary">{ALL_SKILLS.length} skills</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showOnlyNew ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyNew(!showOnlyNew)}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            New in V19.5
          </Button>
        </div>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Categories Sidebar */}
          <div className="w-48 flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 pr-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    !selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <span>All</span>
                  <Badge variant="secondary" className="text-xs">{ALL_SKILLS.length}</Badge>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{cat}</span>
                    <Badge variant="secondary" className="text-xs ml-2">{categoryStats[cat]}</Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Skills Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pr-2">
              {filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => onSelectSkill?.(skill)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-primary/5",
                    skill.enabled ? "border-border" : "border-border/50 opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{skill.name}</span>
                        {skill.isNew && (
                          <Badge className="bg-primary/20 text-primary text-[10px] px-1.5">NEW</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {skill.description}
                      </p>
                    </div>
                    {skill.enabled ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    {skill.category}
                  </Badge>
                </button>
              ))}
            </div>
            {filteredSkills.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Filter className="w-8 h-8 mb-2" />
                <p className="text-sm">No skills match your filters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
