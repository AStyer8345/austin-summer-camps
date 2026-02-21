'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { User, Plus, Trash2, Save } from 'lucide-react';

interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  interests: string[];
  allergies: string;
  notes: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const addChild = () => {
    setChildren(prev => [
      ...prev,
      {
        id: `child-${Date.now()}`,
        firstName: '',
        lastName: '',
        age: 8,
        interests: [],
        allergies: '',
        notes: '',
      },
    ]);
  };

  const updateChild = (id: string, field: keyof ChildProfile, value: unknown) => {
    setChildren(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <div className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-500 mb-6">
            Sign in to save your camp calendar, manage child profiles, and get registration alerts.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Sign In or Create Account
          </button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Family Profile</h1>

        {/* Parent Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Parent/Guardian</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder={user.user_metadata?.full_name || 'Your name'}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={parentEmail || user.email || ''}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="(512) 555-0100"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Children */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Children</h2>
            <button
              onClick={addChild}
              className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Child
            </button>
          </div>

          {children.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-400 mb-3">No children added yet</p>
              <button
                onClick={addChild}
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                Add your first child
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <div key={child.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      {child.firstName || 'New Child'}
                    </h3>
                    <button
                      onClick={() => removeChild(child.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">First Name</label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={(e) => updateChild(child.id, 'firstName', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={child.lastName}
                        onChange={(e) => updateChild(child.id, 'lastName', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Age</label>
                      <select
                        value={child.age}
                        onChange={(e) => updateChild(child.id, 'age', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none"
                      >
                        {Array.from({ length: 16 }, (_, i) => i + 3).map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Allergies / Medical Notes</label>
                    <input
                      type="text"
                      value={child.allergies}
                      onChange={(e) => updateChild(child.id, 'allergies', e.target.value)}
                      placeholder="e.g. Peanut allergy, asthma..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                    <textarea
                      value={child.notes}
                      onChange={(e) => updateChild(child.id, 'notes', e.target.value)}
                      placeholder="Anything camps should know..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Profile
        </button>
      </div>
    </div>
  );
}
