
interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: {
    loc: string;
    title: string;
    caption: string;
  }[];
}

interface BlogPost {
  slug: string;
  title: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  imageAlt?: string;
}

export class SitemapGenerator {
  private baseUrl = 'https://invoiceninja.com';
  
  private staticPages: SitemapUrl[] = [
    {
      loc: `${this.baseUrl}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      loc: `${this.baseUrl}/features`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.9
    },
    {
      loc: `${this.baseUrl}/pricing`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      loc: `${this.baseUrl}/gst-invoicing`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${this.baseUrl}/blog`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${this.baseUrl}/signin`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${this.baseUrl}/signup`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.8
    }
  ];

  generateMainSitemap(blogPosts: BlogPost[] = []): string {
    const urls = [
      ...this.staticPages,
      ...blogPosts.map(post => ({
        loc: `${this.baseUrl}/blog/${post.slug}`,
        lastmod: post.modifiedDate || post.publishedDate,
        changefreq: 'monthly' as const,
        priority: 0.7,
        images: post.image ? [{
          loc: `${this.baseUrl}/blog/${post.image}`,
          title: post.title,
          caption: post.imageAlt || post.title
        }] : undefined
      }))
    ];

    return this.generateXmlSitemap(urls, true);
  }

  generatePagesSitemap(): string {
    return this.generateXmlSitemap(this.staticPages);
  }

  generateBlogSitemap(blogPosts: BlogPost[]): string {
    const blogUrls = [
      {
        loc: `${this.baseUrl}/blog`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly' as const,
        priority: 0.8
      },
      ...blogPosts.map(post => ({
        loc: `${this.baseUrl}/blog/${post.slug}`,
        lastmod: post.modifiedDate || post.publishedDate,
        changefreq: 'monthly' as const,
        priority: 0.7
      }))
    ];

    return this.generateXmlSitemap(blogUrls);
  }

  generateImageSitemap(blogPosts: BlogPost[]): string {
    const imageUrls: SitemapUrl[] = [];

    // Add main site images
    imageUrls.push({
      loc: `${this.baseUrl}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 1.0,
      images: [
        {
          loc: `${this.baseUrl}/og-image.jpg`,
          title: 'InvoiceNinja - Free GST Invoice Software',
          caption: 'Professional GST-compliant invoicing software for Indian businesses'
        },
        {
          loc: `${this.baseUrl}/logo.png`,
          title: 'InvoiceNinja Logo',
          caption: 'InvoiceNinja brand logo'
        }
      ]
    });

    // Add blog post images
    blogPosts.forEach(post => {
      if (post.image) {
        imageUrls.push({
          loc: `${this.baseUrl}/blog/${post.slug}`,
          lastmod: post.modifiedDate || post.publishedDate,
          changefreq: 'monthly',
          priority: 0.7,
          images: [{
            loc: `${this.baseUrl}/blog/${post.image}`,
            title: post.title,
            caption: post.imageAlt || post.title
          }]
        });
      }
    });

    return this.generateXmlSitemap(imageUrls, true);
  }

  generateSitemapIndex(): string {
    const lastmod = new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.baseUrl}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-blog.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-images.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  private generateXmlSitemap(urls: SitemapUrl[], includeImages = false): string {
    const imageNamespace = includeImages ? '\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>`;

    urls.forEach(url => {
      xml += `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;

      if (includeImages && url.images) {
        url.images.forEach(image => {
          xml += `
    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:title>${this.escapeXml(image.title)}</image:title>
      <image:caption>${this.escapeXml(image.caption)}</image:caption>
    </image:image>`;
        });
      }

      xml += `
  </url>`;
    });

    xml += `
</urlset>`;

    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const sitemapGenerator = new SitemapGenerator();
