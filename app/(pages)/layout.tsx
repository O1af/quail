import Footer from "@/components/Static/Footer";
import { Header } from "@/components/Static/Landing/header";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
