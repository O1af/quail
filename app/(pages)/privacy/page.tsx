import PrivacyPage from "@/components/Custom/Static/Privacy/PrivacyPage";
import { Header } from "@/components/Custom/Static/Landing/header";

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PrivacyPage />
      </main>
    </div>
  );
}
