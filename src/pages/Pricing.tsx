import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Freemium",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Perfect for small businesses just getting started",
      popular: false,
      features: [
        { name: "Up to 50 invoices per month", included: true },
        { name: "Up to 5 customers", included: true },
        { name: "GST compliant invoicing", included: true },
        { name: "PDF generation", included: true },
        { name: "Basic customer management", included: true },
        { name: "1 user account", included: true },
        { name: "Credit notes (up to 10/month)", included: true },
        { name: "GSTR-1 & 3B reports", included: false },
        { name: "Priority support", included: false },
        { name: "Multi-user access", included: false },
      ],
      cta: "Get Started Free",
      ctaLink: "/signup"
    },
    {
      name: "Starter",
      monthlyPrice: 139,
      yearlyPrice: 125, // 10% discount
      description: "Ideal for growing businesses with regular invoicing needs",
      popular: true,
      features: [
        { name: "Unlimited invoices", included: true },
        { name: "Up to 50 customers", included: true },
        { name: "GST compliant invoicing", included: true },
        { name: "PDF generation", included: true },
        { name: "Advanced customer management", included: true },
        { name: "Up to 3 user accounts", included: true },
        { name: "Unlimited credit notes", included: true },
        { name: "GSTR-1 & 3B reports", included: false },
        { name: "Priority support", included: true },
        { name: "Multi-user access", included: true },
      ],
      cta: "Start Free Trial",
      ctaLink: "/signup"
    },
    {
      name: "Professional",
      monthlyPrice: 239,
      yearlyPrice: 215, // 10% discount
      description: "Complete solution for established businesses",
      popular: false,
      features: [
        { name: "Unlimited invoices", included: true },
        { name: "Unlimited customers", included: true },
        { name: "GST compliant invoicing", included: true },
        { name: "PDF generation", included: true },
        { name: "Advanced customer management", included: true },
        { name: "Unlimited user accounts", included: true },
        { name: "Unlimited credit notes", included: true },
        { name: "GSTR-1 & 3B reports", included: true },
        { name: "Priority support", included: true },
        { name: "Multi-user access", included: true },
      ],
      cta: "Start Free Trial",
      ctaLink: "/signup"
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return "Free";
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `₹${price}`;
  };

  const getPeriod = () => {
    return isYearly ? "per month (billed yearly)" : "per month";
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice * 12;
    const savings = monthlyCost - yearlyCost;
    return savings;
  };

  const faqs = [
    {
      question: "Is the free plan really free forever?",
      answer: "Yes! Our freemium plan is completely free forever with no hidden costs. You can create up to 50 invoices and manage 5 customers without any charges."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
    },
    {
      question: "Are all plans GST compliant?",
      answer: "Yes, all our plans generate 100% GST-compliant invoices that meet Indian tax regulations and include all required fields like HSN codes and GSTIN."
    },
    {
      question: "What's included in GSTR-1 & 3B reports?",
      answer: "Our GSTR reports automatically compile your invoice data into GST-compliant formats for easy filing. Available in Professional plan with downloadable Excel/CSV formats."
    },
    {
      question: "How does multi-user access work?",
      answer: "Add team members with different permission levels (Admin, Staff, Viewer). Perfect for accountants, staff, and business owners to collaborate securely."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "InvoiceNinja GST Invoice Software",
    "offers": plans.map(plan => ({
      "@type": "Offer",
      "name": plan.name,
      "price": plan.monthlyPrice.toString(),
      "priceCurrency": "INR",
      "description": plan.description,
      "url": `https://invoiceninja.com/pricing#${plan.name.toLowerCase()}`
    }))
  };

  return (
    <>
      <SEOHead
        title="Pricing Plans - Free GST Invoice Software | InvoiceNinja"
        description="Choose the perfect plan for your business. Start with our free GST-compliant invoicing software. Starter plan at ₹139/month, Professional at ₹239/month."
        keywords="invoice software pricing, free GST billing software, affordable invoicing plans India, small business invoice software cost"
        canonicalUrl="https://invoiceninja.com/pricing"
        structuredData={structuredData}
      />
      
      <StructuredData type="faq" data={faqs} />

      {/* Header */}
      <section className="bg-[#121f3d] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="text-2xl font-bold">InvoiceNinja</Link>
            <div className="flex items-center gap-4">
              <Link to="/features" className="text-white hover:text-gray-300">Features</Link>
              <Link to="/pricing" className="text-white hover:text-gray-300">Pricing</Link>
              <Link to="/signin">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-[#1a3b7a]">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white text-[#121f3d] hover:bg-slate-100">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your business. Start free and upgrade as you grow.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Label htmlFor="billing-toggle" className={!isYearly ? "font-semibold" : ""}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing-toggle" className={isYearly ? "font-semibold" : ""}>
                Yearly
              </Label>
              {isYearly && (
                <Badge variant="secondary" className="ml-2">
                  Save 10%
                </Badge>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {getPrice(plan)}
                    {plan.monthlyPrice !== 0 && (
                      <span className="text-sm font-normal text-gray-600">/{getPeriod()}</span>
                    )}
                  </div>
                  {isYearly && plan.monthlyPrice !== 0 && (
                    <p className="text-sm text-green-600">
                      Save ₹{getSavings(plan)} per year
                    </p>
                  )}
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-3" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <span className={feature.included ? '' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.ctaLink} className="w-full">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#121f3d] text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your invoicing?</h2>
          <p className="text-xl mb-8">Start with our free plan and upgrade when you're ready.</p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#121f3d] hover:bg-slate-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Pricing;
