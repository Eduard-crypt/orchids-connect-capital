"use client";

import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';

const SLIDESHOW_IMAGES = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-upscale-resta-b9b110e9-20251003151407.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-fitnes-7ca9c5b1-20251003151421.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-retail-688a9a68-20251003151431.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-clean-modern--fd843572-20251003151438.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-upscale-luxur-a2ed476d-20251003151445.jpg"
];

const CLIENT_LOGOS = [
  { name: 'TechCorp', sold: '$2.5M' },
  { name: 'Retail Solutions', sold: '$1.8M' },
  { name: 'Digital Agency', sold: '$3.2M' },
  { name: 'E-commerce Plus', sold: '$4.1M' },
  { name: 'SaaS Innovate', sold: '$5.5M' },
  { name: 'Restaurant Group', sold: '$2.9M' }
];

export const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-rotate slideshow effect removed since images are removed
    useEffect(() => {
      // No-op
    }, []);

    return (
      <section className="relative py-24 overflow-hidden bg-slate-950">
        {/* Abstract Premium Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950"></div>
          {/* Refined Professional Overlay */}
          <div className="absolute inset-0 bg-slate-950/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/80"></div>
          
          {/* Decorative elements to replace photos */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>


      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full mb-10 shadow-2xl transition-all hover:bg-white/10 duration-500">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-100">Premium M&A Advisory</span>
          </div>
          
            <h1 className="text-6xl md:text-[7.5rem] font-bold mb-10 leading-[0.9] tracking-tighter">
              Sell Your Business with<br />
              <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent italic inline-block pb-4">Absolute Precision</span>
            </h1>
          <p className="text-lg md:text-xl text-slate-200/90 mb-14 leading-relaxed max-w-2xl mx-auto font-light tracking-wide">
            Europe’s fastest-growing brokerage platform for buying and selling online businesses, built on trust and security.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="#get-valuation" className="group relative px-14 py-6 overflow-hidden bg-primary text-white rounded-2xl font-bold transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 uppercase tracking-widest text-xs">
              <span className="relative z-10">Get Strategic Valuation</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            <a href="#process" className="px-14 py-6 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-xs active:scale-95">
              Our Methodology
            </a>
          </div>

          {/* Institutional Partners */}
          <div className="mt-32 pt-16 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-12">Institutional Reach & Success</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {[
                      { label: 'Deal Potential', value: 'Elevate' },
                  { label: 'Qualified Buyers', value: 'Reach' },
                  { label: 'Premium Support', value: 'Access' },
                  { label: 'Deal Success', value: 'Secure' }
                ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-white transition-all group-hover:text-primary group-hover:translate-y-[-4px] duration-500">{stat.value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
