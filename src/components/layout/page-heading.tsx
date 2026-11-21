type Props = {
  module: string;
  title: string;
  description?: string;
};

export function PageHeading({ module, title, description }: Props) {
  return (
    <header className="mb-5">
      <p className="silk">{module}</p>
      <h1 className="lc-page-title font-dot font-black mt-1">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-[70ch]">{description}</p>
      ) : null}
    </header>
  );
}