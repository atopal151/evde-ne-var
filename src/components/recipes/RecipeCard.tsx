import { Clock, ChefHat, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Recipe } from "@/types/recipes";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  isNew?: boolean;
}

const matchTone = (rate: string) => {
  const num = parseInt(rate, 10);
  if (num >= 80) return "from-forest-500 to-forest-700";
  if (num >= 50) return "from-plum-500 to-plum-700";
  return "from-coffee-500 to-coffee-700";
};

export function RecipeCard({ recipe, onSelect, isNew }: RecipeCardProps) {
  return (
    <Card
      padding="md"
      className={[
        "group cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
        isNew
          ? "border-forest-200/80 bg-gradient-to-br from-forest-50 to-emerald-50/70 hover:border-forest-300/80 hover:shadow-forest-900/10"
          : "hover:border-plum-200/60 hover:shadow-plum-900/10",
      ].join(" ")}
      onClick={() => onSelect(recipe)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(recipe);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner">
          <ChefHat className="h-6 w-6" aria-hidden />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
            <Sparkles className="h-3 w-3 text-plum-600" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="font-semibold text-navy-900 group-hover:text-forest-800">
                {recipe.name}
              </h3>
              {isNew && (
                <span className="shrink-0 rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-700">
                  Yeni
                </span>
              )}
            </div>
            <span
              className={[
                "shrink-0 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white shadow-sm",
                matchTone(recipe.match_rate),
              ].join(" ")}
            >
              {recipe.match_rate}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-navy-500">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {recipe.prep_time}
          </div>

          {recipe.required_extra_ingredients.length > 0 && (
            <p className="mt-2 rounded-lg bg-cream-100/80 px-2 py-1 text-xs text-navy-600">
              <span className="font-medium text-navy-700">Eksik: </span>
              {recipe.required_extra_ingredients.join(", ")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
