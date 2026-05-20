'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Loader2 } from 'lucide-react';

type Form = { name: string; email: string; password: string; confirm: string };

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success('Account created!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-gray-400 mt-2">Join CampusHub today</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input {...register('name', { required: 'Name required' })} className="input" placeholder="John Doe" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input {...register('email', { required: 'Email required' })} type="email" className="input" placeholder="you@college.edu" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input {...register('password', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} type="password" className="input" placeholder="••••••••" />
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
