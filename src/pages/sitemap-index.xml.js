export const GET = ({ site }) => {
    const base = site?.toString() ?? '';
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}/sitemap.xml</loc></sitemap>
</sitemapindex>`;
    return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

