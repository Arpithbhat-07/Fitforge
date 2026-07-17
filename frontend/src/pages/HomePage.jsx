import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Services from "@/components/site/Services";
import Pricing from "@/components/site/Pricing";
import Trainers from "@/components/site/Trainers";
import Testimonials from "@/components/site/Testimonials";
import BMICalculator from "@/components/site/BMICalculator";
import Schedule from "@/components/site/Schedule";
import Gallery from "@/components/site/Gallery";
import WhyChooseUs from "@/components/site/WhyChooseUs";
import FAQ from "@/components/site/FAQ";
import Contact from "@/components/site/Contact";
import JoinForm from "@/components/site/JoinForm";
import Footer from "@/components/site/Footer";
import DiscountBanner from "@/components/site/DiscountBanner";
import FloatingCTAs from "@/components/site/FloatingCTAs";
import BackToTop from "@/components/site/BackToTop";
import ExitIntent from "@/components/site/ExitIntent";
import BookTrialModal from "@/components/site/BookTrialModal";
import { motion } from "framer-motion";

function SkeletonHero() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }} className="font-display text-6xl md:text-8xl tracking-wider">
        FIT<span className="text-[#FF5A1F]">FORGE</span>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get("/content/hero"),
      api.get("/content/about"),
      api.get("/content/contact"),
      api.get("/content/site-settings"),
      api.get("/content/seo"),
      api.get("/services"),
      api.get("/plans"),
      api.get("/trainers"),
      api.get("/testimonials"),
      api.get("/faqs"),
      api.get("/schedule"),
      api.get("/gallery"),
      api.get("/features"),
    ]).then(([hero, about, contact, settings, seo, services, plans, trainers, testimonials, faqs, schedule, gallery, features]) => {
      if (!alive) return;
      setData({
        loading: false,
        hero: hero.data, about: about.data, contact: contact.data,
        settings: settings.data, seo: seo.data,
        services: services.data, plans: plans.data, trainers: trainers.data,
        testimonials: testimonials.data, faqs: faqs.data,
        schedule: schedule.data, gallery: gallery.data, features: features.data,
      });
    }).catch(() => alive && setData({ loading: false, error: true }));

    // Track visit
    api.post("/visits/track").catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (data.seo?.meta_title) {
      document.title = data.seo.meta_title;
      const setMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
        el.setAttribute("content", content);
      };
      setMeta("description", data.seo.meta_description || "");
      setMeta("keywords", data.seo.meta_keywords || "");
      setMeta("robots", data.seo.robots || "index,follow");
    }
  }, [data.seo]);

  if (data.loading) return <SkeletonHero />;

  if (data.error) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#171717] border border-[#2A2A2A] p-8 rounded-lg shadow-xl">
          <div className="w-16 h-16 bg-[#FF5A1F]/10 border border-[#FF5A1F] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-[#FF5A1F] font-bold">!</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl mb-4 font-bold tracking-tight text-white">Connection Error</h1>
          <p className="text-[#CFCFCF] text-sm md:text-base mb-6 leading-relaxed">
            Could not connect to the backend server. Please verify that:
          </p>
          <ul className="text-[#8A8A8A] text-xs md:text-sm text-left mb-6 space-y-2 list-disc list-inside">
            <li>The backend server is running (e.g. <code className="bg-[#0B0B0B] px-1 py-0.5 rounded">uvicorn</code> on port 8000).</li>
            <li>MongoDB is active and listening on port 27017.</li>
            <li>Your <code className="bg-[#0B0B0B] px-1 py-0.5 rounded">.env</code> configuration is correct.</li>
          </ul>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#FF5A1F] hover:bg-[#FF8A00] text-white font-bold uppercase text-xs md:text-sm tracking-widest py-4 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <DiscountBanner enabled={data.settings?.discount_banner_enabled} text={data.settings?.discount_banner_text} />
      <Navbar />
      <main>
        <Hero hero={data.hero} />
        <About about={data.about} />
        <Services services={data.services} />
        <Pricing plans={data.plans} />
        <Trainers trainers={data.trainers} />
        <Testimonials testimonials={data.testimonials} />
        <BMICalculator />
        <Schedule schedule={data.schedule} />
        <Gallery images={data.gallery} />
        <WhyChooseUs features={data.features} />
        <FAQ faqs={data.faqs} />
        <JoinForm plans={data.plans} />
        <Contact contact={data.contact} />
      </main>
      <Footer contact={data.contact} />

      <FloatingCTAs contact={data.contact} whatsappEnabled={data.settings?.whatsapp_float_enabled} stickyEnabled={data.settings?.sticky_cta_enabled} />
      <BackToTop />
      <ExitIntent enabled={data.settings?.exit_intent_enabled} title={data.settings?.exit_intent_title} message={data.settings?.exit_intent_message} />
      <BookTrialModal />
    </div>
  );
}
