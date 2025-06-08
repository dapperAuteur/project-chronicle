'use client';

// import { FirebaseError } from "firebase/app";
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleLogIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mb-8 mx-auto">
      <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
        <div className="mb-4">
          <label htmlFor="email" className="block text-xl font-bold mb-2 text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-xl font-bold mb-2 text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            />
        </div>
        <div className="flex items-center justify-between gap-4">
          <button onClick={handleSignUp} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            Sign Up
          </button>
          <button onClick={handleLogIn} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Log In
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
      </div>
    </div>
  );
}