}

export function isDemoMode(): boolean {
  return Boolean(env.LUCARE_DEMO_MODE || env.NEXT_PUBLIC_LUCARE_DEMO_MODE);
}

/** Lectura segura en componentes cliente */
export function isDemoModeClient(): boolean {
  const flag = process.env.NEXT_PUBLIC_LUCARE_DEMO_MODE;
  return flag === "true" || flag === "1";
}
