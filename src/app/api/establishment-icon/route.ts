import { NextRequest } from "next/server";
import * as simpleIcons from "simple-icons";

type SimpleIconExport = { svg: string; hex: string; title: string };

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("id");
  if (!slug || !/^[a-z0-9]+$/i.test(slug)) {
    return new Response("Missing or invalid id", { status: 400 });
  }

  const variableName = `si${slug[0].toUpperCase()}${slug.slice(1)}`;
  const icon = (simpleIcons as unknown as Record<string, SimpleIconExport | undefined>)[
    variableName
  ];

  if (!icon) {
    return new Response("Not found", { status: 404 });
  }

  const svg = icon.svg.replace("<svg ", `<svg fill="#${icon.hex}" `);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
