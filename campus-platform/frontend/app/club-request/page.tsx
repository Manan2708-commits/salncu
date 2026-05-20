'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Building2, Loader2, CheckCircle } from 'lucide-react';

type Form = { clubName: string; description: string; category: string; motivation: string };
const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Arts', 'Science', 'Social', 'Other'];

export default function ClubRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center pt-32 text-gray-400">
          Please <a href="/login" className="text-indigo-400 mx-1">login</a> to submit a club request.
        </div>
      </div>
    );
  }

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      await api.post('/club-requests', fd);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-gray-400 mb-6">Our admin team will review your request and get back to you via email.</p>
          <button onClick={() => router.push('/')} className="btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="w-8 h-8 text-indigo-400" /> Register a Club</h1>
          <p className="text-gray-400 mt-2">Fill in the details below. Admin will review and approve your request.</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Club Name *</label>
              <input {...register('clubName', { required: 'Club name required' })} className="input" placeholder="e.g. Robotics Club" />
              {errors.clubName && <p className="text-red-400 text-xs mt-1">{errors.clubName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
              <select {...register('category', { required: 'Category required' })} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
              <textarea {...register('description', { required: 'Description required' })} className="input min-h-[100px] resize-none" placeholder="What does your club do?" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Why do you want to start this club?</label>
              <textarea {...register('motivation')} className="input min-h-[80px] resize-none" placeholder="Your motivation..." />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
