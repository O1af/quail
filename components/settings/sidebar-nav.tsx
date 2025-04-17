import { cn } from "@/lib/utils";
import { Settings, CreditCard, Database } from "lucide-react";

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
  const getIcon = (title: string) => {
    switch (title) {
      case "General":
        return <Settings className="h-4 w-4 mr-3 text-muted-foreground" />;
      case "Billing":
        return <CreditCard className="h-4 w-4 mr-3 text-muted-foreground" />;
      case "Connections":
        return <Database className="h-4 w-4 mr-3 text-muted-foreground" />;
      default:
        return <Settings className="h-4 w-4 mr-3 text-muted-foreground" />;
    }
  };

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => setActiveSection(item.href)}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            activeSection === item.href
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {getIcon(item.title)}
          {item.title}
        </button>
      ))}
    </nav>
  );
}
