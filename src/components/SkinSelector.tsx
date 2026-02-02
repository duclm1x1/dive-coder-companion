import { Sun, Moon, Palette } from "lucide-react";
import { useTheme, ThemeSkin } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const skins: { id: ThemeSkin; name: string; icon: typeof Sun; description: string }[] = [
  { id: "light", name: "Clean Light", icon: Sun, description: "Professional light theme" },
  { id: "cyberpunk", name: "Cyberpunk Dark", icon: Moon, description: "Neon dark aesthetic" },
];

export function SkinSelector() {
  const { skin, setSkin } = useTheme();
  const currentSkin = skins.find(s => s.id === skin) || skins[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">{currentSkin.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {skins.map((s) => {
          const Icon = s.icon;
          return (
            <DropdownMenuItem
              key={s.id}
              onClick={() => setSkin(s.id)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                skin === s.id && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="w-4 h-4" />
              <div className="flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              {skin === s.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
