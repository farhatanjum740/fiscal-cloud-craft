
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const blogPosts = [
  {
    slug: "gst-for-small-businesses",
    title: "GST Guide for Small Businesses in India",
    description: "Learn how small businesses can comply with GST regulations and simplify their tax filing process.",
    date: "May 15, 2025",
    category: "GST Compliance",
    image: "/blog/gst-small-business.jpg"
  },
  {
    slug: "gst-invoice-requirements",
    title: "Complete Guide to GST Invoice Requirements in India",
    description: "Everything you need to know about creating GST-compliant invoices for your business in India.",
    date: "May 10, 2025",
    category: "Invoicing",
    image: "/blog/gst-invoice-requirements.jpg"
  },
  {
    slug: "hsn-codes-explained",
    title: "HSN Codes Explained: What Indian Businesses Need to Know",
    description: "A comprehensive guide to using HSN codes correctly on your GST invoices.",
    date: "May 5, 2025",
    category: "GST Compliance",
    image: "/blog/hsn-codes.jpg"
  },
  {
    slug: "e-invoicing-india",
    title: "E-Invoicing in India: Implementation Guide",
    description: "How to implement e-invoicing for your business and stay compliant with GST regulations.",
    date: "April 28, 2025",
    category: "E-Invoicing",
    image: "/blog/e-invoicing.jpg"
  },
  {
    slug: "gst-filing-tips",
    title: "10 Tips to Simplify Your GST Return Filing Process",
    description: "Practical tips to make your GST return filing faster and error-free.",
    date: "April 20, 2025",
    category: "Tax Filing",
    image: "/blog/gst-filing.jpg"
  },
  {
    slug: "invoice-management-small-business",
    title: "Invoice Management Best Practices for Small Businesses",
    description: "Optimize your invoicing workflow and get paid faster with these proven strategies.",
    date: "April 15, 2025",
    category: "Invoicing",
    image: "/blog/invoice-management.jpg"
  }
];

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>GST Invoicing Blog - Tips and Guides | InvoiceNinja</title>
        <meta name="description" content="Expert articles on GST compliance, invoicing best practices, and tax filing tips for Indian businesses." />
        <meta name="keywords" content="GST blog, invoicing tips, tax compliance, HSN codes, e-invoicing India" />
        <link rel="canonical" href="https://invoiceninja.com/blog" />
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
          <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">GST Invoicing Blog</h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Expert guides, tips, and resources to help Indian businesses master GST compliance and invoicing.
              </p>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div key={post.slug} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200">
                    {/* In a real implementation, this would be an actual image */}
                    <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      Blog Image Placeholder
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500 ml-auto">{post.date}</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      <Link to={`/blog/${post.slug}`} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{post.description}</p>
                    <Link to={`/blog/${post.slug}`} className="text-primary font-medium hover:underline">
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-6">Start Creating GST-Compliant Invoices Today</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Join thousands of Indian businesses that use InvoiceNinja for hassle-free GST invoicing and compliance.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                  Try InvoiceNinja Free
                </Button>
              </Link>
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

export default Blog;
