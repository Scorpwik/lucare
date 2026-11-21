import { HoyPageContent } from "@/components/hoy/hoy-page-content";

export const metadata = { title: "Hoy" };

export default function HoyPage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · hoy</p>
        <h1 className="font-dot font-black text-5xl leading-[0.88] mt-1">Panel</h1>
      </header>
      <HoyPageContent />
    </div>
  );
}