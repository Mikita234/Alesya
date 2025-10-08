export const GET = ({ site }) => {
    const base = site?.toString() ?? '';
    const urls = [
        { url: '/', priority: '1.0', changefreq: 'weekly' },
        { url: '/payments', priority: '0.8', changefreq: 'monthly' },
        { url: '/oferta', priority: '0.6', changefreq: 'monthly' },
        { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
        { url: '/contacts', priority: '0.7', changefreq: 'monthly' },
        { url: '/pricing', priority: '0.6', changefreq: 'monthly' }
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(({ url, priority, changefreq }) => 
    `<url>
    <loc>${base}${url}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`
  ).join('\n  ')}
</urlset>`;
    return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

