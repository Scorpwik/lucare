import { AsistenteChat } from "@/components/asistente/asistente-chat";

export const metadata = { title: "Asistente" };

export default function AsistentePage() {
  return (
    <div>
      <header className="mb-4">
        <p className="silk">módulo · ia</p>
        <h1 className="font-dot font-black text-4xl">Asistente</h1>
        <p className="text-xs text-muted-foreground mt-2 max-w-prose">
          Responde con base en tus registros de LuCare. Configura{" "}
          <span className="font-mono">GOOGLE_GENERATIVE_AI_API_KEY</span> o{" "}
          <span className="font-mono">AI_GATEWAY_API_KEY</span> en el servidor para respuestas en
          vivo.
        </p>
      </header>
      <AsistenteChat />
    </div>
  );
}