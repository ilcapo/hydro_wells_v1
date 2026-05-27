'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Phone, Sparkles, ShieldCheck, Waves } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Accordion } from '../components/ui/accordion';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';
import Image from "next/image";

const services = [
  {
    title: 'Water Well Drilling',
    description: 'Residential and commercial well solutions focused on precision, efficiency, and durability.',
    accent: 'Tailored to your site',
    href: '/water-well-drilling',
  },
  {
    title: 'Pump Service',
    description: 'Repair, replacement, and installation of pumps with fast, reliable diagnostics.',
    accent: 'Emergency response available',
    href: '/pump-service',
  },
  {
    title: 'Constant Pressure',
    description: 'Smart systems that maintain stable flow and extend equipment life.',
    accent: 'Comfort without fluctuations',
    href: '/constant-pressure',
  },
];

const metrics = [
  { label: '100% Warranty', value: 'Total satisfaction' },
  { label: '24/7 Support', value: 'Rapid response' },
  { label: 'Licensed Team', value: 'Professional & safe' },
];

const steps = [
  { title: 'Contact Us', description: 'Tell us your issue and receive an immediate expert response.', icon: <Phone className="h-5 w-5" /> },
  { title: 'Technical Assessment', description: 'Our team visits your site and designs the right solution.', icon: <ShieldCheck className="h-5 w-5" /> },
  { title: 'Solution Delivered', description: 'Installation or repair completed with cleanup and full warranty.', icon: <Sparkles className="h-5 w-5" /> },
];

const faqs = [
  {
    question: 'When should I call a professional to inspect my well?',
    answer: 'Have your system checked at least once a year or when you notice low pressure, strange noises, changes in water quality, or higher bills.',
  },
  {
    question: 'Can I improve the water pressure in my home?',
    answer: 'Yes. A constant pressure system plus proper maintenance can restore stable flow and reduce equipment wear.',
  },
  {
    question: 'What factors affect the cost of a new well?',
    answer: 'It depends on soil type, depth, site access, and pump selection. We provide a fair, transparent estimate.',
  },
];

const testimonials = [
  {
    quote: 'HydroWells delivered the complete solution for our water system. They are professional, reliable, and always respond, even outside normal hours.',
    author: 'Angel Cruz, Homeowner',
  },
  {
    quote: 'I loved the work they did. I recommend them to anyone who needs water services.',
    author: 'Jerico Jesús Sequera López, Homeowner',
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:px-8 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-panel backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <Image
              src="/hydro-wells-logo_copia.png"
              alt="HydroWells logo"
              width={52}
              height={52}
              className="rounded-xl shadow-[0_0_20px_rgba(0,194,255,0.25)]"
              priority
            />

            <div className="leading-tight">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-200/90">HYDROWELLS</p>
              <p className="text-sm text-slate-300">Water solutions for Maryland & DC</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="rounded-full border border-slate-500/30 bg-slate-950/40 px-4 py-2">24/7 Service</span>
            <a href="tel:3013937090" className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-primary transition hover:bg-slate-800/90">
              <Phone className="h-4 w-4" />
              301-393-7090
            </a>
          </div>
        </motion.header>

        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            <Badge variant="secondary">Premium well and pump solutions</Badge>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl drop-shadow-[0_0_25px_rgba(0,194,255,0.25)]">
              Modern water engineering for homes and businesses.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              24/7 technical support across Maryland and Washington DC. Well drilling, pumps, and constant pressure systems backed by professional guarantees.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="shadow-[0_0_20px_rgba(0,194,255,0.15)] hover:shadow-[0_0_30px_rgba(0,194,255,0.25)] transition-all duration-300">
                <a href="#contact">Request a quote</a>
              </Button>

              <Button variant="ghost" asChild className="hover:bg-white/10 hover:text-primary transition-all duration-300">
                <a href="#services">View services</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-panel"
          >
            <div className="absolute inset-0 bg-hero-glow opacity-80" />
            <div className="relative grid gap-8">
              <div className="rounded-[1.75rem] border border-primary/15 bg-slate-900/85 p-8 shadow-glow">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Immediate emergency</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">We fix your well or pump failure on the spot.</h2>
                <p className="mt-3 text-slate-300">Fast response, expert diagnostics, and professional execution from the first call.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                    <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">{metric.label}</p>
                    <p className="mt-3 text-xl font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section id="services" className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mb-10 max-w-3xl"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Services</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Design, repair, and maintenance with technical expertise.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">A full-service system that covers well drilling, pressure management, and emergency care.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.65, delay: index * 0.1 }}
              >
                <Link href={service.href} className="group block">
                  <Card className="h-full transition duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(0,194,255,0.15)]">

                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-3xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{service.title}</span>
                      <ChevronRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <p className="text-slate-300">{service.description}</p>
                    <p className="mt-6 text-sm font-medium text-slate-200/90">{service.accent}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 shadow-panel"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">How we work</p>
            <h2 className="mt-5 text-4xl font-semibold text-white">A simple process with trusted delivery.</h2>
            <p className="mt-4 text-slate-300">A transparent workflow that keeps your investment secure and your property protected.</p>
            <div className="mt-10 grid gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-3xl border border-white/15 bg-slate-900/70 p-6 transition-all duration-300 hover:bg-slate-900/60 hover:shadow-[0_0_20px_rgba(0,194,255,0.12)] hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 text-primary">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 shadow-[0_0_10px_rgba(0,194,255,0.15)]">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Step {index + 1}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-300 leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/75 to-slate-900/60 p-10 shadow-panel"
          >
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-200/80">Trust</p>
              <h3 className="mt-4 text-3xl font-semibold text-white">Real service guarantees.</h3>
              <p className="mt-4 text-slate-300">Estimate approved before work starts, fully licensed team, and quality assurance at every step.</p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Location</p>
                <p className="mt-3 text-lg font-semibold text-white">22910 Mount Ephraim Rd, Dickerson, MD</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Availability</p>
                <p className="mt-3 text-lg font-semibold text-white">24 hours, 7 days a week</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-24" id="faq">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mb-10 max-w-3xl"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Clear answers for quick decisions.</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <Accordion key={faq.question} title={faq.question} content={faq.answer} />
            ))}
          </div>
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-panel">
            <p className="text-lg font-semibold text-white">Still have questions?</p>
            <p className="mt-3 text-slate-300">Contact us and we’ll connect you with a water systems specialist right away.</p>
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <a href="#contact">Contact us</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-24" id="testimonials">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Testimonials</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">What our clients say.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {testimonials.map((item) => (
              <motion.div
                key={item.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-slate-950/85 border-white/15 hover:bg-slate-900/70 hover:shadow-[0_0_25px_rgba(0,194,255,0.12)] transition-all duration-300">
                  <p className="text-slate-300 leading-relaxed">“{item.quote}”</p>
                  <p className="mt-6 text-sm font-semibold text-white">{item.author}</p>
                </Card>
              </motion.div>
            ))}
          </div>

        </section>

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 shadow-panel" id="contact">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Contact</p>
              <h2 className="mt-4 text-4xl font-semibold text-white">Ready to solve your water emergency.</h2>
              <p className="mt-4 text-slate-300">Send your request or call us for fast, technical, and reliable support.</p>
              <div className="mt-10 space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Phone</p>
                  <a href="tel:3013937090" className="mt-2 block text-xl font-semibold text-white">301-393-7090</a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Address</p>
                  <p className="mt-2 text-base text-slate-300">22910 Mount Ephraim Rd. Dickerson, MD, 20842</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Hours</p>
                  <p className="mt-2 text-base text-slate-300">24 hours, 7 days a week</p>
                </div>
              </div>
            </div>
            <form className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="service">Required service</Label>
                <Select id="service">
                  <option>Water Well Drilling</option>
                  <option>Pump Service</option>
                  <option>Constant Pressure</option>
                  <option>Emergency</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Briefly describe your issue" />
              </div>
              <Button type="submit">Send request</Button>
            </form>
          </div>
        </section>

        <footer className="mt-20 border-t border-white/10 pt-12 text-slate-300">
          <div className="grid gap-10 xl:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">HydroWells</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Fast water solutions with local expertise.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Serving Maryland and Washington DC with premium well drilling, pump service, and constant pressure systems. Always available for emergencies.
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Quick links</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li><a href="#services" className="transition hover:text-primary">Services</a></li>
                <li><a href="#faq" className="transition hover:text-primary">FAQ</a></li>
                <li><a href="#testimonials" className="transition hover:text-primary">Testimonials</a></li>
                <li><a href="#contact" className="transition hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Service pages</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li><a href="/water-well-drilling" className="transition hover:text-primary">Water Well Drilling</a></li>
                <li><a href="/pump-service" className="transition hover:text-primary">Pump Service</a></li>
                <li><a href="/constant-pressure" className="transition hover:text-primary">Constant Pressure</a></li>
                <li><a href="tel:3013937090" className="transition hover:text-primary">Call now</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 HydroWells. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="transition hover:text-primary">Privacy</a>
              <a href="#faq" className="transition hover:text-primary">Terms</a>
              <a href="mailto:hydrowells@gmail.com" className="transition hover:text-primary">hydrowells@gmail.com</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
