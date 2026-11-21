"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error.digest ?? error);
  return (
    <html lang="es-EC">
      <body className="min-h-dvh flex items-center justify-center p-4 font-sans bg-[#E8E2D8] text-[#161412]">
        <div
          role="alert"
          className="max-w-md text-center space-y-4 border border-[#161412]/20 rounded-2xl p-6 bg-white/60"
        >
          <h1 className="text-2xl font-bold">Error crítico</h1>
          <p className="text-sm opacity-80">LuCare tuvo un fallo grave. Recarga la aplicación.</p>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-[#c51e2a] text-white font-medium"
            onClick={() => reset()}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}