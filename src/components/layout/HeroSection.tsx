'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, MapPin, Calendar } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-sunshine-50 to-coral-50">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sunshine-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-coral-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-sm font-medium text-sky-700 shadow-sm mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Austin, TX Metro Area
            </span>

            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4 text-balance">
              Find the{' '}
              <span className="bg-gradient-to-r from-sky-500 to-coral-500 bg-clip-text text-transparent">
                Perfect Summer Camp
              </span>{' '}
              for Your Kids
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
              Browse 100+ camps across Austin. Filter by age, interest, budget, and location.
              Plan your entire summer in minutes.
            </p>
          </motion.div>

          {/* Quick action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="#browse"
              className="btn-primary flex items-center gap-2 text-base"
            >
              <Search className="w-4 h-4" />
              Browse All Camps
            </a>
            <a
              href="/planner"
              className="btn-secondary flex items-center gap-2 text-base"
            >
              <Sparkles className="w-4 h-4" />
              AI Summer Planner
            </a>
            <a
              href="/calendar"
              className="btn-outline flex items-center gap-2 text-base"
            >
              <Calendar className="w-4 h-4" />
              My Calendar
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            <StatItem value="100+" label="Camps" />
            <StatItem value="5" label="Regions" />
            <StatItem value="FREE" label="to $6,875" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display font-bold text-2xl text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}
