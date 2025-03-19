import Link from "next/link";
import { Twitter, Linkedin, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerData = {
  company: {
    name: "Quail AI",
    tagline: "The Simpler,Smarter Data Query Tool for Everyone",
    socialLinks: [
      { name: "Twitter", href: "https://x.com/useQuail", icon: Twitter },
      {
        name: "LinkedIn",
        href: "https://linkedin.com/company/quailbi/",
        icon: Linkedin,
      },
      { name: "GitHub", href: "https://github.com/QuailAI", icon: GithubIcon },
    ],
  },
  sections: [
    {
      title: "Product",
      links: [{ name: "SQL Editor", href: "https://app.quailbi.com/" }],
    },
    {
      title: "Resources",
      links: [
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Company",
      links: [{ name: "Contact", href: "/contact" }],
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background text-foreground py-12 border-t">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info Section */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/">
              <h2 className="text-2xl font-bold tracking-tight hover:text-primary transition-colors duration-200">
                {footerData.company.name}
              </h2>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {footerData.company.tagline}
            </p>
            <div className="flex space-x-5 pt-2">
              {footerData.company.socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                >
                  <span className="sr-only">{link.name}</span>
                  <link.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {footerData.sections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
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
      </div>
    </footer>
  );
}
