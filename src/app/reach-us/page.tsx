"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Linkedin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { toast } from 'sonner';

export default function ReachUsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const heroRef = useScrollAnimation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.interest) {
      newErrors.interest = 'Please select an option';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          interestType: formData.interest,
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Thank you! Your message has been sent successfully. Our support team will contact you shortly.');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          interest: '',
          message: ''
        });
        setErrors({});
      } else {
        // Show error toast
        toast.error('We couldn\'t send your message at the moment. Please try again later or email us directly at support@connectcapitals.com.');
        console.error('Contact form submission failed:', data.error, data.details);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('We couldn\'t send your message at the moment. Please try again later or email us directly at support@connectcapitals.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section with Animated Gradient Background */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="relative py-20 overflow-hidden">

        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%'
            }} />

          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }} />

          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }} />

        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ y: 50, opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                scale: 1.02,
                textShadow: "0 0 8px rgba(26, 62, 109, 0.5)"
              }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent cursor-default">
              Get In Touch
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.5, 
                duration: 0.7,
                type: "spring",
                stiffness: 80,
                damping: 12
              }}
              whileHover={{ scale: 1.01 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Have questions about buying or selling an online business, or renting an AI Agent? Our expert team is here to help you navigate every step.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form with Animation */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-8 shadow-lg">

              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background ${
                        errors.firstName ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="John" />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background ${
                        errors.lastName ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="Doe" />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background ${
                      errors.email ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="john@example.com" />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="+1 (555) 000-0000" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">I'm Interested In *</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background ${
                      errors.interest ? 'border-red-500' : 'border-border'
                    }`}>
                    <option value="">Select an option</option>
                    <option value="buying-online">Buying an Online Business</option>
                    <option value="selling-online">Selling an Online Business</option>
                    <option value="ai-agent">Rent an AI Agent</option>
                    <option value="trustbridge">TrustBridge Services</option>
                    <option value="education">Educational Programs</option>
                    <option value="general">General Inquiry</option>
                  </select>
                  {errors.interest && (
                    <p className="text-red-500 text-sm mt-1">{errors.interest}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background ${
                      errors.message ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="Tell us about your needs...">
                  </textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8">

              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-muted-foreground">Firm based in Varna</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">0879209747</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">Info: deals@connectcapitals.com<br />Support: support@connectcapitals.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">Monday - Friday: 8:30 AM - 6:30 PM GMT +2<br />Saturday: 9:00 AM - 6:00 PM<br />Sunday: Open only for email texting</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Quick Help
                </h3>
                <div className="space-y-3">
                  <Link href="/educational-center" className="block text-primary hover:underline">
                    → Browse Educational Resources
                  </Link>
                  <Link href="/our-team" className="block text-primary hover:underline">
                    → Meet Our Team
                  </Link>
                  <Link href="/buy-a-business" className="block text-primary hover:underline">
                    → View Business Listings
                  </Link>
                  <Link href="/trustbridge" className="block text-primary hover:underline">
                    → Learn About TrustBridge
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Map Embed */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Visit Our Headquarters</h2>
            <p className="text-lg text-muted-foreground">Located in beautiful Varna, Bulgaria</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border">

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d93166.80291137458!2d27.848837!3d43.214050!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4538baaf3d7a1%3A0x5727941c71a58b7c!2sVarna%2C%20Bulgaria!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full" />
          </motion.div>
        </div>
      </section>

      {/* Social Media Links */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect With Us</h2>
            <p className="text-lg text-muted-foreground">Follow us on social media for the latest updates</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'LinkedIn', url: 'https://www.linkedin.com/in/connect-capitals-41544339b/', icon: Linkedin, color: 'text-[#0A66C2]' },
              { name: 'Instagram', url: 'https://www.instagram.com/connect_capitals?igsh=MTFvMWRjanViZnludg==', icon: Instagram, color: 'text-[#E4405F]' },
              { name: 'Facebook', url: 'https://www.facebook.com/share/17GhQLyNgY/', icon: Facebook, color: 'text-[#1877F2]' },
              { name: 'Our Forum', url: '/forum', icon: MessageSquare, color: 'text-[#8B5CF6]' }
            ].map((social, index) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-4 group">

                  <div className={`${social.color} transition-transform group-hover:scale-110`}>
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="font-bold text-lg">{social.name}</h3>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">
              Let's discuss how we can help you achieve your business goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join-us" className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg">
                Create Account
              </Link>
              <Link href="/our-team" className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all">
                Meet Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
