import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function SidebarNav({
  className,
  items,
  activeSection,
  setActiveSection,
  ...props
}: SidebarNavProps) {
  return (
    <nav className={cn("space-y-1 h-full", className)} {...props}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            activeSection === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start w-full text-left px-3 py-2 text-sm"
          )}
          onClick={() => setActiveSection(item.href)}
        >
          {item.title}
        </Button>
      ))}
    </nav>
  );
}
