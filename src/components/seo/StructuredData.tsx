
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'organization' | 'software' | 'faq' | 'article' | 'breadcrumb';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "InvoiceNinja",
          "url": "https://invoiceninja.com",
          "logo": "https://invoiceninja.com/logo.png",
          "description": "Free GST-compliant invoicing software for Indian businesses",
          "foundingDate": "2024",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@invoiceninja.com"
          },
          "sameAs": [
            "https://facebook.com/invoiceninja",
            "https://twitter.com/invoiceninja",
            "https://linkedin.com/company/invoiceninja"
          ],
          ...data
        };

      case 'software':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "InvoiceNinja",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Free GST-compliant invoicing software for Indian businesses",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR",
            "description": "Free forever plan available"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
          },
          "featureList": [
            "GST-compliant invoicing",
            "Customer management",
            "Tax calculations",
            "PDF generation",
            "Credit notes",
            "Financial reports"
          ],
          ...data
        };

      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "author": {
            "@type": "Organization",
            "name": "InvoiceNinja"
          },
          "publisher": {
            "@type": "Organization",
            "name": "InvoiceNinja",
            "logo": {
              "@type": "ImageObject",
              "url": "https://invoiceninja.com/logo.png"
            }
          },
          "datePublished": data.publishedDate,
          "dateModified": data.modifiedDate,
          "image": data.image,
          "url": data.url,
          ...data
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      default:
        return data;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(generateSchema())}
      </script>
    </Helmet>
  );
};

export default StructuredData;
