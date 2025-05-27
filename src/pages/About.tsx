
import React from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <>
      <SEOHead
        title="About Us - InvoiceHub | GST Invoice Management Platform"
        description="Learn about InvoiceHub's mission to simplify GST invoice management for Indian businesses. Our story, values, and commitment to excellence."
        keywords="about invoicehub, gst billing software company, invoice management team, indian startup"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About InvoiceHub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to simplify GST invoice management for businesses across India, 
              making compliance effortless and growth sustainable.
            </p>
          </div>

          {/* Our Story */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
              <div className="prose prose-lg mx-auto text-gray-700">
                <p>
                  InvoiceHub was born out of a simple observation: Indian businesses were struggling 
                  with complex GST compliance requirements while trying to focus on growth. Traditional 
                  invoicing solutions were either too complicated or didn't understand the nuances of 
                  Indian taxation.
                </p>
                <p>
                  Founded in 2024, we set out to create a solution that would make GST invoice management 
                  as simple as sending an email. Our team of experienced developers and business experts 
                  worked tirelessly to build a platform that not only meets compliance requirements but 
                  also helps businesses operate more efficiently.
                </p>
                <p>
                  Today, InvoiceHub serves thousands of businesses across India, from small startups to 
                  established enterprises, helping them streamline their invoicing processes and stay 
                  compliant with GST regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Customer First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Every decision we make is guided by what's best for our customers and their success.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>Simplicity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We believe complex problems deserve simple solutions that anyone can use.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We strive for excellence in everything we do, from code quality to customer support.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We believe in open communication and transparent business practices.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  To empower Indian businesses with intuitive, compliant, and efficient invoicing 
                  solutions that enable them to focus on what they do best - growing their business.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  To become India's most trusted platform for business financial operations, 
                  making GST compliance and financial management effortless for every business.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about InvoiceHub? We'd love to hear from you.
            </p>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Email:</strong> support@invoicehub.com
              </p>
              <p className="text-lg">
                <strong>Phone:</strong> +91-XXXX-XXXXXX
              </p>
              <p className="text-lg">
                <strong>Address:</strong> Bangalore, Karnataka, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
