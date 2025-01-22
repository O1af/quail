import Link from "next/link";
import { Twitter, Linkedin, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerData = {
  company: {
    name: "Quail AI",
    tagline: "The Simpler,Smarter Data Query Tool",
    socialLinks: [
      { name: "Twitter", href: "https://x.com", icon: Twitter },
      { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
      { name: "GitHub", href: "https://github.com/QuailAI", icon: GithubIcon },
    ],
  },
  sections: [
    {
      title: "Product",
      links: [{ name: "SQL Editor", href: "/app" }],
    },
    {
      title: "Resources",
      links: [{ name: "Privacy Policy", href: "/privacy" }],
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background text-foreground py-8 border-t">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-4">
            <Link href="/">
              <h2 className="text-2xl font-bold tracking-tight hover:text-primary transition-colors duration-200">
                {footerData.company.name}
              </h2>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {footerData.company.tagline}
            </p>
            <div className="flex space-x-4 pt-1">
              {footerData.company.socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                >
                  <span className="sr-only">{link.name}</span>
                  <link.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-end">
              {footerData.sections.map((section) => (
                <div key={section.title} className="space-y-3 text-right">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/75">
            © {new Date().getFullYear()} {footerData.company.name}, Inc. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
