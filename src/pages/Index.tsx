import { LinkCategory } from "@/components/LinkCategory";
import { Compass } from "lucide-react";

const Index = () => {
  const categories = [
    {
      title: "Technologie",
      color: "blue" as const,
      links: [
        {
          title: "GitHub",
          url: "https://github.com",
          description: "Platforma pro vývoj a sdílení kódu",
        },
        {
          title: "Stack Overflow",
          url: "https://stackoverflow.com",
          description: "Komunita pro programátory",
        },
        {
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org",
          description: "Dokumentace pro webové technologie",
        },
      ],
    },
    {
      title: "Zprávy",
      color: "orange" as const,
      links: [
        {
          title: "iDNES.cz",
          url: "https://www.idnes.cz",
          description: "Zpravodajský portál",
        },
        {
          title: "Novinky.cz",
          url: "https://www.novinky.cz",
          description: "Aktuální zprávy ze světa i domova",
        },
        {
          title: "ČT24",
          url: "https://ct24.ceskatelevize.cz",
          description: "Zpravodajství České televize",
        },
      ],
    },
    {
      title: "Sociální sítě",
      color: "purple" as const,
      links: [
        {
          title: "Facebook",
          url: "https://www.facebook.com",
          description: "Největší sociální síť",
        },
        {
          title: "Twitter / X",
          url: "https://twitter.com",
          description: "Mikroblogovací platforma",
        },
        {
          title: "LinkedIn",
          url: "https://www.linkedin.com",
          description: "Profesní síť",
        },
        {
          title: "Instagram",
          url: "https://www.instagram.com",
          description: "Sdílení fotek a videí",
        },
      ],
    },
    {
      title: "Nástroje",
      color: "green" as const,
      links: [
        {
          title: "Google Drive",
          url: "https://drive.google.com",
          description: "Cloudové úložiště",
        },
        {
          title: "Notion",
          url: "https://www.notion.so",
          description: "Nástroj pro produktivitu",
        },
        {
          title: "Figma",
          url: "https://www.figma.com",
          description: "Nástroj pro design",
        },
      ],
    },
    {
      title: "Zábava",
      color: "red" as const,
      links: [
        {
          title: "YouTube",
          url: "https://www.youtube.com",
          description: "Platforma pro sdílení videí",
        },
        {
          title: "Netflix",
          url: "https://www.netflix.com",
          description: "Streamovací služba",
        },
        {
          title: "Spotify",
          url: "https://www.spotify.com",
          description: "Hudební streaming",
        },
      ],
    },
    {
      title: "E-shopy",
      color: "cyan" as const,
      links: [
        {
          title: "Alza.cz",
          url: "https://www.alza.cz",
          description: "Elektronika a gadgety",
        },
        {
          title: "Mall.cz",
          url: "https://www.mall.cz",
          description: "Největší český e-shop",
        },
        {
          title: "Amazon",
          url: "https://www.amazon.com",
          description: "Mezinárodní e-shop",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 justify-center">
            <Compass className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Rozcestník odkazů</h1>
          </div>
          <p className="text-center text-muted-foreground mt-3 text-lg">
            Rychlý přístup k oblíbeným webům
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <LinkCategory
              key={index}
              title={category.title}
              color={category.color}
              links={category.links}
            />
          ))}
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Vytvořeno s pomocí Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
