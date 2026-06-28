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
    name: "Emerald & Gold",
    primary: "#0e6e6e", on_primary: "#ffffff",
    primary_container: "#032e2e", on_primary_container: "#a7eded",
    secondary: "#b88a3e", on_secondary: "#120b00",
    secondary_container: "#3d2a0a", on_secondary_container: "#f5d9a0",
  },
  {
    name: "Royal Blue & Gold",
    primary: "#1f6feb", on_primary: "#ffffff",
    primary_container: "#0d2d5a", on_primary_container: "#bfd4fd",
    secondary: "#b88a3e", on_secondary: "#120b00",
    secondary_container: "#3d2a0a", on_secondary_container: "#f5d9a0",
  },
  {
    name: "Violet & Amber",
    primary: "#7c3aed", on_primary: "#ffffff",
    primary_container: "#2d0f5c", on_primary_container: "#ddd6fe",
    secondary: "#f59e0b", on_secondary: "#1c1917",
    secondary_container: "#451a03", on_secondary_container: "#fde68a",
  },
  {
    name: "Crimson & Gold",
    primary: "#be123c", on_primary: "#ffffff",
    primary_container: "#4c0519", on_primary_container: "#fda4af",
    secondary: "#b88a3e", on_secondary: "#120b00",
    secondary_container: "#3d2a0a", on_secondary_container: "#f5d9a0",
  },
  {
    name: "Teal & Rose",
    primary: "#0f766e", on_primary: "#ffffff",
    primary_container: "#042f2e", on_primary_container: "#99f6e4",
    secondary: "#e11d48", on_secondary: "#ffffff",
    secondary_container: "#4c0519", on_secondary_container: "#fecdd3",
  },
  {
    name: "Amber & Teal",
    primary: "#b45309", on_primary: "#ffffff",
    primary_container: "#431407", on_primary_container: "#fed7aa",
    secondary: "#0ea5a4", on_secondary: "#ffffff",
    secondary_container: "#043535", on_secondary_container: "#a5f3f3",
  },
  {
    name: "Blue & Slate",
    primary: "#1f6feb", on_primary: "#ffffff",
    primary_container: "#0d2d5a", on_primary_container: "#bfd4fd",
    secondary: "#475569", on_secondary: "#ffffff",
    secondary_container: "#1e293b", on_secondary_container: "#cbd5e1",
  },
  {
    name: "Teal & Lime",
    primary: "#0f766e", on_primary: "#ffffff",
    primary_container: "#042f2e", on_primary_container: "#99f6e4",
    secondary: "#65a30d", on_secondary: "#0e1c00",
    secondary_container: "#1a2e05", on_secondary_container: "#d9f99d",
  },
] as const;
