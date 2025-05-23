
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

// Blog posts data - expanded with more content
const blogPosts = {
  "gst-for-small-businesses": {
    title: "GST Guide for Small Businesses in India",
    description: "Learn how small businesses can comply with GST regulations and simplify their tax filing process.",
    content: `
      <h1>GST Guide for Small Businesses in India</h1>
      <p class="text-gray-500 mb-6">Published on May 15, 2025 • 8 min read</p>
      
      <p>Goods and Services Tax (GST) has transformed the way businesses operate in India since its implementation in July 2017. For small businesses, understanding and complying with GST regulations can be challenging but is essential for legal operation.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">GST Registration Requirements</h2>
      <p>Small businesses with an annual turnover exceeding ₹40 lakhs (₹20 lakhs for special category states) must register for GST. However, even if your business falls below this threshold, voluntary registration offers several benefits:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Access to input tax credit</li>
        <li>Ability to do business with GST-registered entities</li>
        <li>Enhanced credibility with customers and suppliers</li>
        <li>Seamless interstate operations</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Composition Scheme for Small Businesses</h2>
      <p>The GST Composition Scheme is designed to reduce the compliance burden for small taxpayers. Businesses with an annual turnover up to ₹1.5 crore can opt for this scheme, which allows them to:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Pay a fixed percentage of their turnover as tax</li>
        <li>File quarterly returns instead of monthly returns</li>
        <li>Maintain simplified records</li>
      </ul>
      
      <p>However, businesses under the composition scheme cannot collect tax from customers or claim input tax credit.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">GST Invoicing Requirements</h2>
      <p>Creating GST-compliant invoices is mandatory for all registered businesses. A proper GST invoice must include:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Supplier's name, address, and GSTIN</li>
        <li>Customer's name, address, and GSTIN (for B2B transactions)</li>
        <li>HSN codes for products</li>
        <li>Tax rates and amounts (CGST, SGST, IGST)</li>
        <li>Total invoice value</li>
      </ul>
      
      <p>Using an invoicing software like InvoiceNinja can automate this process, ensuring all your invoices are fully compliant with GST regulations.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">GST Return Filing for Small Businesses</h2>
      <p>Even small businesses must file regular GST returns. The main returns include:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li><strong>GSTR-1:</strong> Details of outward supplies of goods or services</li>
        <li><strong>GSTR-3B:</strong> Monthly summary return</li>
        <li><strong>GSTR-4:</strong> Quarterly return for composition taxpayers</li>
      </ul>
      
      <p>Missing return filing deadlines can result in penalties. Using automated software can help you track due dates and prepare returns with minimal effort.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Input Tax Credit</h2>
      <p>One of the significant benefits of GST is the ability to claim input tax credit (ITC) for taxes paid on purchases. To claim ITC, ensure that:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>You have tax invoices for all purchases</li>
        <li>Your supplier has actually paid the tax to the government</li>
        <li>You've filed your returns on time</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Common GST Challenges for Small Businesses</h2>
      <p>Small businesses often face several challenges with GST compliance:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Understanding complex GST rates for different products and services</li>
        <li>Managing invoice reconciliation</li>
        <li>Keeping up with frequent changes in GST rules and regulations</li>
        <li>Maintaining digital records</li>
      </ul>
      
      <p>Using a GST-compliant invoicing system can address many of these challenges by automating calculations, storing records securely, and staying updated with regulatory changes.</p>
      
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-8">
        <h3 class="font-semibold">How InvoiceNinja Helps Small Businesses with GST</h3>
        <p class="mt-2">InvoiceNinja offers a comprehensive solution for small businesses to manage GST compliance:</p>
        <ul class="list-disc pl-6 mt-2">
          <li>Automatic GST calculations based on customer location</li>
          <li>HSN code management for products</li>
          <li>GST-compliant invoice templates</li>
          <li>Easy generation of GST returns</li>
          <li>Secure record-keeping for audit purposes</li>
        </ul>
      </div>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
      <p>While GST compliance may seem complex for small businesses, using the right tools can significantly simplify the process. By understanding the basic requirements and leveraging GST-compliant invoicing software, small businesses can focus on growth while remaining fully compliant with tax regulations.</p>
      
      <div class="mt-8 mb-12 text-center">
        <p class="mb-4">Ready to simplify your GST compliance?</p>
        <div>
          <a href="/signup" class="bg-primary text-white hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium px-8 py-3">
            Try InvoiceNinja Free
          </a>
        </div>
      </div>
    `,
    keywords: "GST small business, GST registration, composition scheme, GST filing for small business, GST compliance",
    image: "https://invoiceninja.com/blog/gst-small-business.jpg"
  },
  "gst-invoice-requirements": {
    title: "Complete Guide to GST Invoice Requirements in India",
    description: "Everything you need to know about creating GST-compliant invoices for your business in India.",
    content: `
      <h1>Complete Guide to GST Invoice Requirements in India</h1>
      <p class="text-gray-500 mb-6">Published on May 10, 2025 • 10 min read</p>
      
      <p>Creating GST-compliant invoices is a critical requirement for businesses operating in India. This guide covers everything you need to know about GST invoice requirements and how to ensure your business remains compliant.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">What Makes an Invoice GST Compliant?</h2>
      <p>A GST-compliant invoice must contain specific information as mandated by the GST law. These requirements ensure transparency in transactions and facilitate proper tax collection.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Essential Components of a GST Invoice</h2>
      <p>Every GST invoice must include:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>A unique, consecutive invoice number</li>
        <li>Date of issue</li>
        <li>Name, address, and GSTIN of the supplier</li>
        <li>Name, address, and GSTIN of the recipient (for B2B)</li>
        <li>HSN code or SAC for each product or service</li>
        <li>Description of goods or services</li>
        <li>Quantity and unit</li>
        <li>Total value of supply</li>
        <li>Taxable value of supply</li>
        <li>Tax rates and amounts (CGST, SGST/UTGST, IGST)</li>
        <li>Place of supply</li>
        <li>Signature of the supplier or authorized representative</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Different Types of GST Invoices</h2>
      <p>Depending on the nature of your business and transactions, you may need to issue different types of invoices:</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">1. Tax Invoice</h3>
      <p>Standard invoice issued by registered suppliers to registered or unregistered buyers.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">2. Bill of Supply</h3>
      <p>Issued when supplying exempted goods/services or by composition dealers.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">3. Credit Note</h3>
      <p>Issued when the taxable value or tax charged is more than the actual amount, or when goods are returned.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">4. Debit Note</h3>
      <p>Issued when the taxable value or tax charged is less than the actual amount.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Time Limit for Issuing GST Invoices</h2>
      <p>For goods, invoices must be issued:</p>
      <ul class="list-disc pl-6 my-4">
        <li>Before or at the time of removal of goods (when supply involves movement)</li>
        <li>At the time of delivery or making goods available to the recipient (when supply doesn't involve movement)</li>
      </ul>
      
      <p>For services, invoices must be issued:</p>
      <ul class="list-disc pl-6 my-4">
        <li>Within 30 days from the date of supply of services</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Special Cases in GST Invoicing</h2>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">Reverse Charge Mechanism</h3>
      <p>When a supply falls under reverse charge, the recipient must self-issue an invoice if the supplier hasn't issued one.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">Continuous Supply</h3>
      <p>For continuous supply of goods or services, invoices should be issued:</p>
      <ul class="list-disc pl-6 my-4">
        <li>When payment is received</li>
        <li>When statement of accounts is issued</li>
        <li>At specific intervals as per contract</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">E-Invoicing Requirements</h2>
      <p>Businesses with turnover exceeding ₹10 crore are required to generate e-invoices through the Invoice Registration Portal (IRP). E-invoicing involves:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Generating invoices in a standard format</li>
        <li>Uploading to the IRP</li>
        <li>Obtaining a unique Invoice Reference Number (IRN)</li>
        <li>Getting a QR code to be printed on the invoice</li>
      </ul>
      
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-8">
        <h3 class="font-semibold">How InvoiceNinja Makes GST Invoicing Easy</h3>
        <p class="mt-2">InvoiceNinja's platform automatically handles all GST invoice requirements:</p>
        <ul class="list-disc pl-6 mt-2">
          <li>Pre-designed GST-compliant invoice templates</li>
          <li>Automatic calculation of CGST, SGST, and IGST</li>
          <li>HSN/SAC code management</li>
          <li>Proper numbering and dating of invoices</li>
          <li>Support for e-invoicing requirements</li>
          <li>Easy generation of credit and debit notes</li>
        </ul>
      </div>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Record Keeping Requirements</h2>
      <p>GST law requires businesses to maintain invoice records for at least 72 months from the last date of filing the annual return for that year. Digital storage of invoices is recommended for easier access and backup.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Common Errors in GST Invoicing</h2>
      <p>Avoid these common mistakes to ensure your invoices are fully GST compliant:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Incorrect GSTIN of supplier or recipient</li>
        <li>Missing or wrong HSN/SAC codes</li>
        <li>Incorrect tax calculations</li>
        <li>Improper invoice numbering</li>
        <li>Missing mandatory fields</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
      <p>Creating GST-compliant invoices is not just a legal requirement but also essential for maintaining proper business records and claiming input tax credits. Using a dedicated GST invoicing software like InvoiceNinja can help you generate compliant invoices automatically, reducing errors and ensuring regulatory compliance.</p>
      
      <div class="mt-8 mb-12 text-center">
        <p class="mb-4">Ready to simplify your GST invoicing?</p>
        <div>
          <a href="/signup" class="bg-primary text-white hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium px-8 py-3">
            Create Free Account
          </a>
        </div>
      </div>
    `,
    keywords: "GST invoice format, GST invoice requirements, HSN codes, GST tax invoice, e-invoicing India",
    image: "https://invoiceninja.com/blog/gst-invoice-requirements.jpg"
  },
  "hsn-codes-explained": {
    title: "HSN Codes Explained: What Indian Businesses Need to Know",
    description: "A comprehensive guide to using HSN codes correctly on your GST invoices.",
    content: `
      <h1>HSN Codes Explained: What Indian Businesses Need to Know</h1>
      <p class="text-gray-500 mb-6">Published on May 5, 2025 • 7 min read</p>
      
      <p>Harmonized System of Nomenclature (HSN) codes are an integral part of GST-compliant invoicing in India. This guide explains what HSN codes are, why they're important, and how to use them correctly in your invoices.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">What Are HSN Codes?</h2>
      <p>HSN codes are internationally standardized numerical codes used to classify products. Under the GST system in India, these codes help identify products and determine the applicable tax rates. The codes were developed by the World Customs Organization (WCO) and have been adopted by over 200 countries worldwide.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Why Are HSN Codes Important?</h2>
      <p>HSN codes serve several important purposes in the GST system:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>They ensure uniform classification of goods across India</li>
        <li>They help determine the correct GST rate applicable to products</li>
        <li>They facilitate smooth filing of GST returns</li>
        <li>They enable proper reconciliation of input tax credits</li>
        <li>They support international trade by using a standardized system</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">HSN Code Structure</h2>
      <p>HSN codes can be 2, 4, 6, or 8 digits long. The more digits, the more specific the classification:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li><strong>2-digit code:</strong> Chapter heading</li>
        <li><strong>4-digit code:</strong> Heading within the chapter</li>
        <li><strong>6-digit code:</strong> Subheading</li>
        <li><strong>8-digit code:</strong> Tariff item (most detailed classification)</li>
      </ul>
      
      <p>For example, if we look at the HSN code 85076000:</p>
      <ul class="list-disc pl-6 my-4">
        <li>85: Electrical machinery and equipment</li>
        <li>8507: Electric accumulators</li>
        <li>850760: Lithium-ion accumulators</li>
        <li>85076000: Specific type of lithium-ion battery</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">HSN Code Requirements Based on Turnover</h2>
      <p>The number of digits required in HSN codes on invoices depends on the annual turnover of the business:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li><strong>Turnover up to ₹1.5 crore:</strong> 4-digit HSN code</li>
        <li><strong>Turnover above ₹1.5 crore and up to ₹5 crore:</strong> 6-digit HSN code</li>
        <li><strong>Turnover above ₹5 crore:</strong> 8-digit HSN code</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">How to Find the Correct HSN Code</h2>
      <p>Finding the right HSN code for your products can be challenging. Here are some resources to help:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>The official GST portal (www.gst.gov.in) provides a search facility for HSN codes</li>
        <li>The CBIC (Central Board of Indirect Taxes and Customs) website has a detailed HSN code directory</li>
        <li>GST-compliant invoicing software like InvoiceNinja often includes HSN code lookup features</li>
        <li>You can consult with a tax professional for specific products</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Common Challenges with HSN Codes</h2>
      <p>Businesses often face several challenges when dealing with HSN codes:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li><strong>Multiple applicable codes:</strong> Some products may seem to fit under multiple HSN codes</li>
        <li><strong>New or innovative products:</strong> Finding appropriate codes for new innovations can be difficult</li>
        <li><strong>Changes in HSN classification:</strong> The government occasionally updates the code structure</li>
        <li><strong>Different interpretations:</strong> Different tax authorities might interpret classifications differently</li>
      </ul>
      
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-8">
        <h3 class="font-semibold">How InvoiceNinja Simplifies HSN Code Management</h3>
        <p class="mt-2">InvoiceNinja makes HSN code management easy with these features:</p>
        <ul class="list-disc pl-6 mt-2">
          <li>Built-in HSN code database with search functionality</li>
          <li>Automatic HSN code suggestions based on product descriptions</li>
          <li>Ability to save HSN codes with product details for future use</li>
          <li>Automatic HSN code validation to prevent errors</li>
          <li>Regular updates to the HSN code database when changes occur</li>
        </ul>
      </div>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Best Practices for HSN Code Management</h2>
      <p>Follow these best practices to ensure proper HSN code management:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li>Create a master database of products with their corresponding HSN codes</li>
        <li>Regularly update your HSN codes to reflect any government changes</li>
        <li>Maintain consistency in using HSN codes across all your invoices</li>
        <li>Train your staff on the importance of using correct HSN codes</li>
        <li>Use automated software to reduce human errors in HSN code application</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
      <p>Proper use of HSN codes is essential for GST compliance in India. While it may seem challenging at first, with the right tools and practices, HSN code management can be streamlined. Using a GST-compliant invoicing software like InvoiceNinja can significantly simplify this aspect of your business operations.</p>
      
      <div class="mt-8 mb-12 text-center">
        <p class="mb-4">Ready to simplify your HSN code management?</p>
        <div>
          <a href="/signup" class="bg-primary text-white hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium px-8 py-3">
            Try InvoiceNinja Free
          </a>
        </div>
      </div>
    `,
    keywords: "HSN codes, GST classification, HSN code guide, product classification GST, HSN lookup",
    image: "https://invoiceninja.com/blog/hsn-codes.jpg"
  }
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  
  useEffect(() => {
    if (slug && blogPosts[slug as keyof typeof blogPosts]) {
      setPost(blogPosts[slug as keyof typeof blogPosts]);
    }
  }, [slug]);
  
  if (!post) {
    return <div className="container mx-auto px-4 py-12">Post not found</div>;
  }
  
  return (
    <>
      <Helmet>
        <title>{post.title} | InvoiceNinja</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.image} />
        <link rel="canonical" href={`https://invoiceninja.com/blog/${slug}`} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": "${post.title}",
              "description": "${post.description}",
              "image": "${post.image}",
              "keywords": "${post.keywords}",
              "datePublished": "${post.date}",
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
              }
            }
          `}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <header className="bg-primary text-white py-4">
          <div className="container mx-auto flex justify-between items-center px-4">
            <Link to="/">
              <h1 className="text-2xl font-bold">InvoiceNinja</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-primary/80">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white text-primary hover:bg-slate-100">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <Link to="/blog" className="text-primary hover:underline flex items-center">
                  <span>← Back to Blog</span>
                </Link>
              </div>
              
              <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              
              <div className="mt-12 pt-8 border-t">
                <h3 className="font-semibold text-xl mb-4">Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(blogPosts)
                    .filter(([key]) => key !== slug)
                    .slice(0, 2)
                    .map(([key, value]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">
                          <Link to={`/blog/${key}`} className="hover:text-primary">
                            {value.title}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-gray-900 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">InvoiceNinja</h2>
                <p className="text-sm text-gray-400">GST Invoicing Solution for Indian Businesses</p>
              </div>
              <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} InvoiceNinja. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogPost;
