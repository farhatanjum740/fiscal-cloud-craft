
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

// Mock blog posts data
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
