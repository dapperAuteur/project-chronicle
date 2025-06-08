'use client';

import { useState } from 'react';
import { User, updatePassword, deleteUser, updateEmail } from 'firebase/auth';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangeEmail = async () => {
    if (!newEmail) {
      setError('New email cannot be empty.');
      return;
    }
    try {
      await updateEmail(user, newEmail);
      setNewEmail('');
      setError('');
      setMessage('Email updated successfully! A verification email has been sent to your new address.');
    } catch (err: any) {
      setMessage('');
      setError('Error updating email. Please sign out and log back in, then try again. ' + err.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      setError('');
      setMessage('Password updated successfully!');
    } catch (err: any) {
      setMessage('');
      setError('Error updating password. You may need to sign out and log back in first. ' + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("ARE YOU SURE you want to delete your account? This is permanent and cannot be undone.")) {
      try {
        await deleteUser(user);
        // The onAuthStateChanged listener will handle redirecting to the login page.
      } catch (err: any) {
        setMessage('');
        setError('Error deleting account. You may need to sign out and log back in first. ' + err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>

        {message && <p className="text-green-400 mb-4">{message}</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-xl font-bold mb-2 text-gray-300">Change Email (Current: {user.email})</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new.email@example.com"
          />
          <button onClick={handleChangeEmail} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold">
            Update Email
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xl font-bold mb-2 text-gray-300">Change Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
          <button onClick={handleChangePassword} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold">
            Update Password
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <label className="block mb-2 text-red-500 text-xl font-bold">Danger Zone</label>
          <button onClick={handleDeleteAccount} className="w-full bg-red-700 hover:bg-red-800 p-2 rounded-md font-bold">
            Delete My Account
          </button>
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">
          Close
        </button>
      </div>
    </div>
  );
}