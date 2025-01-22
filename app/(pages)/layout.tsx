import Footer from "@/components/Custom/Static/Footer";
import { Header } from "@/components/Custom/Static/Landing/header";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
