'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { REGION_CONFIG, CampRegion } from '@/types/database';
import { Sparkles, Loader2, DollarSign, Calendar, ArrowRight, RefreshCw } from 'lucide-react';

const INTEREST_OPTIONS = [
  'STEM & Coding', 'Arts & Crafts', 'Sports', 'Nature & Outdoors',
  'Theater & Drama', 'Music', 'Swimming', 'Science', 'Reading & Writing',
  'Animals', 'Cooking', 'Dance', 'Gaming', 'Horseback Riding',
  'Robotics', 'Photography', 'Adventure',
];

interface AISuggestion {
  campName: string;
  campId: string;
  weekLabel: string;
  reason: string;
  estimatedCost: number;
}

interface AIPlan {
  suggestions: AISuggestion[];
  summary: string;
  totalCost: number;
  tips: string[];
}

export default function PlannerPage() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(8);
  const [interests, setInterests] = useState<string[]>([]);
  const [budgetPerWeek, setBudgetPerWeek] = useState<number>(400);
  const [weeksNeeded, setWeeksNeeded] = useState<number>(6);
  const [campType, setCampType] = useState<string>('day');
  const [regions, setRegions] = useState<string[]>([]);
  const [plan, setPlan] = useState<AIPlan | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleRegion = (region: string) => {
    setRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleGenerate = async () => {
    if (!childName || interests.length === 0) return;
    setStep('loading');

    try {
      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName,
          childAge,
          interests,
          budgetPerWeek,
          weeksNeeded,
          campType,
          regions,
        }),
      });

      const data = await res.json();
      setPlan(data);
      setStep('results');
    } catch {
      setStep('form');
    }
  };

  const handleStartOver = () => {
    setPlan(null);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Summer Plan Generator</h1>
          <p className="text-gray-500 mt-2">
            Tell us about your child and we&apos;ll create a personalized summer camp schedule
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Form Step */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Child Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">About Your Child</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Child&apos;s First Name</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Emma"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Age</label>
                    <select
                      value={childAge}
                      onChange={(e) => setChildAge(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 3).map(age => (
                        <option key={age} value={age}>{age} years old</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Interests & Activities</h2>
                <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        interests.includes(interest)
                          ? 'bg-purple-100 border-purple-300 text-purple-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Duration */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Budget & Schedule</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Budget per Week</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="number"
                        value={budgetPerWeek}
                        onChange={(e) => setBudgetPerWeek(parseInt(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weeks Needed</label>
                    <select
                      value={weeksNeeded}
                      onChange={(e) => setWeeksNeeded(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1).map(w => (
                        <option key={w} value={w}>{w} week{w > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Camp Type</label>
                    <select
                      value={campType}
                      onChange={(e) => setCampType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                    >
                      <option value="day">Day Camp</option>
                      <option value="overnight">Overnight</option>
                      <option value="both">Either</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Regions */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Preferred Areas</h2>
                <p className="text-xs text-gray-400 mb-3">Leave blank for all areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(REGION_CONFIG) as [CampRegion, typeof REGION_CONFIG[CampRegion]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => toggleRegion(key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        regions.includes(key)
                          ? 'bg-purple-100 border-purple-300 text-purple-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!childName || interests.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Summer Plan
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-900">Creating {childName}&apos;s summer plan...</p>
              <p className="text-sm text-gray-500 mt-1">Matching interests to the best Austin camps</p>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 'results' && plan && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-2">{childName}&apos;s Summer Plan</h2>
                <p className="text-purple-100 text-sm">{plan.summary}</p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-200" />
                    <span className="text-sm">{plan.suggestions.length} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-200" />
                    <span className="text-sm">~${plan.totalCost.toLocaleString()} total</span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-3">
                {plan.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">W{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{suggestion.campName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{suggestion.weekLabel}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                          ${suggestion.estimatedCost}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{suggestion.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tips */}
              {plan.tips && plan.tips.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Pro Tips</h3>
                  <ul className="space-y-1">
                    {plan.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">*</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartOver}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </button>
                <a
                  href="/calendar"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Open in Calendar
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
