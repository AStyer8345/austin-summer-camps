'use client';

import { useState } from 'react';
import { Mail, Sparkles, ArrowRight, Check } from 'lucide-react';

export default function EmailCaptureBanner() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Silently fail for inline banner
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
          <Check className="w-5 h-5" />
          You&apos;re subscribed! We&apos;ll keep you updated on Austin summer camps.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 via-purple-50 to-coral-50 border border-sky-200/50 rounded-2xl p-6 md:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-sky-700 shadow-sm mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Free Camp Alerts
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Get Registration Alerts & Early Bird Deals
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Be the first to know when popular camps open registration. Austin&apos;s best camps fill up fast!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-gray-400 mt-3">
          Join 1,000+ Austin parents. Free forever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
