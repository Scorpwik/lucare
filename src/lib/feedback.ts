function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "";
}

const RULES: { test: RegExp | string; text: string }[] = [
  { test: /invalid login credentials/i, text: "Correo o contraseña incorrectos." },
  { test: /email not confirmed/i, text: "Confirma tu correo antes de entrar." },
  { test: /user already registered/i, text: "Ese correo ya tiene una cuenta." },
  { test: /password should be at least/i, text: "La contraseña debe tener al menos 6 caracteres." },
  { test: /rate limit|too many requests|security purposes/i, text: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
  { test: /failed to fetch|network error|networkrequestfailed|load failed/i, text: "Sin conexión. Revisa tu internet." },
  { test: /jwt|token.*expired|session.*expired|refresh_token/i, text: "Tu sesión venció. Vuelve a iniciar sesión." },
  { test: /duplicate key|unique constraint/i, text: "Ese registro ya existe." },
  { test: /row-level security|violates row-level security|permission denied/i, text: "No tienes permiso para esta acción." },
  { test: /invalid otp|otp expired|link.*expired|token.*invalid/i, text: "El enlace no es válido o venció. Pide uno nuevo." },
];

export function friendlyError(err: unknown, fallback = "Algo salió mal. Inténtalo de nuevo."): string {
  const raw = extractMessage(err);
  if (raw) {
    console.error("[friendlyError]", raw, err);
    for (const rule of RULES) {
      if (typeof rule.test === "string") {
        if (raw.toLowerCase().includes(rule.test.toLowerCase())) return rule.text;
      } else if (rule.test.test(raw)) {
        return rule.text;
      }
    }
  } else if (err) {
    console.error("[friendlyError]", err);
  }
  return fallback;
}

export function confirmDelete(message: string): boolean {
  if (typeof window === "undefined") return false;
  return window.confirm(message);
}