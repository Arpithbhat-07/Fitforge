import { motion } from "framer-motion";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ({ faqs }) {
  return (
    <section id="faq" className="section-y bg-[#0B0B0B] border-t border-[#2A2A2A]" data-testid="faq-section">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[2px] bg-[#FF5A1F]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold">Questions</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight" data-testid="faq-heading">
              Frequently<br /><span className="text-[#FF5A1F]">asked.</span>
            </h2>
            <p className="mt-6 text-[#CFCFCF] max-w-md">Can't find your answer? WhatsApp us — we usually reply within an hour.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
              {(faqs || []).map((f, i) => (
                <AccordionItem key={f.id} value={f.id} className="border-b border-[#2A2A2A]" data-testid={`faq-item-${i}`}>
                  <AccordionTrigger className="text-left py-6 hover:no-underline group">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#FF5A1F] font-bold w-6">0{i + 1}</span>
                      <span className="font-display text-xl md:text-2xl uppercase tracking-wider group-hover:text-[#FF5A1F] transition-colors">{f.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-10 pb-6 text-[#CFCFCF] leading-relaxed text-base">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
