import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lucare.app",
  appName: "LuCare",
  webDir: "capacitor-www",
  server: {
    url: "https://lucare-paginaspublicas.vercel.app",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [
      "lucare-paginaspublicas.vercel.app",
      "*.vercel.app",
      "cwoigpzfkruptnapmwmh.supabase.co",
      "accounts.google.com",
    ],
  },
};

export default config;