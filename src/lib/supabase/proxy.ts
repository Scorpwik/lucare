    const isApp =
      pathname.startsWith("/hoy") ||
      pathname.startsWith("/gym") ||
      pathname.startsWith("/gimnasio") ||
      pathname.startsWith("/cuidado") ||
      pathname.startsWith("/cuidado-personal") ||
      pathname.startsWith("/cuerpo") ||
      pathname.startsWith("/sueno-habitos") ||
      pathname.startsWith("/mente") ||
      pathname.startsWith("/agenda") ||
      pathname.startsWith("/ajustes") ||
      pathname.startsWith("/habitos-mente");
  const protectedPrefixes = [
    "/hoy",
    "/gym",
    "/gimnasio",
    "/cuidado",
    "/cuidado-personal",
    "/cuerpo",
    "/sueno-habitos",
    "/mente",
    "/agenda",
    "/ajustes",
    "/habitos-mente",
