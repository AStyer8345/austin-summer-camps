'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Crown, Check, ArrowRight, Sparkles, Calendar } from 'lucide-react';

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Premium!</h1>
          <p className="text-gray-500 mb-8">
            You now have access to all premium features. Let&apos;s plan an amazing summer!
          </p>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 text-left">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What&apos;s unlocked:</h3>
            <ul className="space-y-2.5">
              {[
                'AI-powered summer plan generator',
                'Priority registration alerts (48h early)',
                'Export calendar to Google/iCal',
                'Compare camps side-by-side',
                'Exclusive partner discounts',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/planner"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Try AI Planner
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/calendar"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Open Calendar
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
