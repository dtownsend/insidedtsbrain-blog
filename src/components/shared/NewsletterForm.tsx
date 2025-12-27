'use client';

import { useState, FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  compact?: boolean;
  className?: string;
}

export default function NewsletterForm({ compact = false, className }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Beehiiv form submission
    // Replace with your actual Beehiiv publication ID and form endpoint
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={cn('text-green-600 font-medium', className)}>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className={cn(compact ? 'flex gap-2' : 'space-y-3')}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={cn(
            'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow',
            compact ? 'flex-1' : 'w-full'
          )}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={cn(
            'px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            compact ? 'whitespace-nowrap' : 'w-full'
          )}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-red-600 text-sm">{message}</p>
      )}
    </form>
  );
}
