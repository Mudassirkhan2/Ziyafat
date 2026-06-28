export type ColorPreset = {
  name: string;
  primary: string;
  on_primary: string;
  primary_container: string;
  on_primary_container: string;
  secondary: string;
  on_secondary: string;
  secondary_container: string;
  on_secondary_container: string;
};

export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: "Saffron & Maroon",
    primary: "#F59E0B", on_primary: "#1c1917",
    primary_container: "#451a03", on_primary_container: "#fde68a",
    secondary: "#BE123C", on_secondary: "#ffffff",
    secondary_container: "#4c0519", on_secondary_container: "#fecdd3",
  },
  {
    name: "Gold & Forest",
    primary: "#FBBF24", on_primary: "#1c1917",
    primary_container: "#451a03", on_primary_container: "#fef9c3",
    secondary: "#16A34A", on_secondary: "#ffffff",
    secondary_container: "#14532d", on_secondary_container: "#bbf7d0",
  },
  {
    name: "Coral & Teal",
    primary: "#F97316", on_primary: "#ffffff",
    primary_container: "#431407", on_primary_container: "#fed7aa",
    secondary: "#0D9488", on_secondary: "#ffffff",
    secondary_container: "#042f2e", on_secondary_container: "#99f6e4",
  },
  {
    name: "Crimson & Gold",
    primary: "#DC2626", on_primary: "#ffffff",
    primary_container: "#7f1d1d", on_primary_container: "#fca5a5",
    secondary: "#D97706", on_secondary: "#1c1917",
    secondary_container: "#451a03", on_secondary_container: "#fde68a",
  },
  {
    name: "Rose & Emerald",
    primary: "#F43F5E", on_primary: "#ffffff",
    primary_container: "#4c0519", on_primary_container: "#fda4af",
    secondary: "#10B981", on_secondary: "#ffffff",
    secondary_container: "#052e16", on_secondary_container: "#a7f3d0",
  },
  {
    name: "Marigold & Indigo",
    primary: "#F59E0B", on_primary: "#1c1917",
    primary_container: "#451a03", on_primary_container: "#fef08a",
    secondary: "#6366F1", on_secondary: "#ffffff",
    secondary_container: "#1e1b4b", on_secondary_container: "#c7d2fe",
  },
  {
    name: "Terracotta & Sky",
    primary: "#C2410C", on_primary: "#ffffff",
    primary_container: "#431407", on_primary_container: "#fed7aa",
    secondary: "#0EA5E9", on_secondary: "#ffffff",
    secondary_container: "#082f49", on_secondary_container: "#bae6fd",
  },
  {
    name: "Burgundy & Gold",
    primary: "#9F1239", on_primary: "#ffffff",
    primary_container: "#4c0519", on_primary_container: "#fda4af",
    secondary: "#F59E0B", on_secondary: "#1c1917",
    secondary_container: "#451a03", on_secondary_container: "#fde68a",
  },
] as const;
