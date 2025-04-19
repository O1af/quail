import { BookIcon } from "lucide-react";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  links: [
    {
      icon: <BookIcon />,
      text: "Blog",
      url: "/blog",
    },
  ],
  theme: {
    light: "fumadocs-light",
    dark: "fumadocs-dark",
  },
};
