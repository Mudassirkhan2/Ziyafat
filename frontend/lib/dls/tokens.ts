export type OrgTheme = {
  primary: string;
  on_primary: string;
  primary_container: string;
  on_primary_container: string;
  secondary: string;
  on_secondary: string;
  secondary_container: string;
  on_secondary_container: string;
};

export function applyOrgTheme(org: OrgTheme): void {
  const root = document.documentElement;
  root.style.setProperty("--color-primary",                org.primary);
  root.style.setProperty("--color-on-primary",             org.on_primary);
  root.style.setProperty("--color-primary-container",      org.primary_container);
  root.style.setProperty("--color-on-primary-container",   org.on_primary_container);
  root.style.setProperty("--color-secondary",              org.secondary);
  root.style.setProperty("--color-on-secondary",           org.on_secondary);
  root.style.setProperty("--color-secondary-container",    org.secondary_container);
  root.style.setProperty("--color-on-secondary-container", org.on_secondary_container);
  root.style.setProperty("--primary",            org.primary);
  root.style.setProperty("--primary-foreground", org.on_primary);
}
