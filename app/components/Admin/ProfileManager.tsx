'use client';

import { useState, useEffect } from 'react';
import { User, Image as ImageIcon, Save, X, Globe, Radio } from 'lucide-react';
import { Profile } from '@/types';

interface ProfileManagerProps {}

export default function ProfileManager({}: ProfileManagerProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    twitchStatus: 'offline' as 'live' | 'offline',
    socialLinks: {
      twitch: '',
      twitter: '',
      tiktok: '',
      youtube: '',
      instagram: '',
      discord: '',
    },
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for profile image
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to load profile');
      const { data } = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        avatar: data.avatar || '',
        twitchStatus: data.twitchStatus || 'offline',
        socialLinks: {
          twitch: data.socialLinks?.twitch || '',
          twitter: data.socialLinks?.twitter || '',
          tiktok: data.socialLinks?.tiktok || '',
          youtube: data.socialLinks?.youtube || '',
          instagram: data.socialLinks?.instagram || '',
          discord: data.socialLinks?.discord || '',
        },
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload PNG, JPG, GIF, or WEBP images only.' });
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: `File size too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` });
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    setMessage(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read image file.' });
      setAvatarPreview(null);
      setAvatarFile(null);
      e.target.value = '';
    };

    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      let avatarUrl = formData.avatar;

      // Upload new avatar if file is selected
      if (avatarFile) {
        const formDataToUpload = new FormData();
        formDataToUpload.append('file', avatarFile);
        formDataToUpload.append('type', 'profile');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload profile image');
        }

        const { imageUrl } = await uploadResponse.json();
        avatarUrl = imageUrl;
      }

      // Update profile
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          bio: formData.bio.trim(),
          avatar: avatarUrl,
          twitchStatus: formData.twitchStatus,
          socialLinks: {
            twitch: formData.socialLinks.twitch.trim() || undefined,
            twitter: formData.socialLinks.twitter.trim() || undefined,
            tiktok: formData.socialLinks.tiktok.trim() || undefined,
            youtube: formData.socialLinks.youtube.trim() || undefined,
            instagram: formData.socialLinks.instagram.trim() || undefined,
            discord: formData.socialLinks.discord.trim() || undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const { data: updatedProfile } = await response.json();
      setProfile(updatedProfile);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[var(--purple-primary)]/30 border-t-[var(--purple-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-[var(--purple-primary)] flex items-center gap-2">
        <User className="w-6 h-6" />
        Profile Management
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Profile Image
          </label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-[var(--purple-primary)] overflow-hidden bg-[var(--purple-darker)]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src={formData.avatar} alt="Current avatar" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-block px-4 py-2 bg-[var(--purple-primary)]/20 hover:bg-[var(--purple-primary)]/30 border border-[var(--purple-primary)]/50 rounded-lg cursor-pointer transition-colors text-[var(--purple-glow)] text-sm font-medium"
              >
                Upload New Image
              </label>
              <p className="text-xs text-[var(--purple-glow)]/60 mt-2">PNG, JPG, GIF, WEBP up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            dir="auto"
            className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors resize-none"
            placeholder="Enter your bio (supports Arabic and English)"
            required
            style={{ 
              fontFamily: 'var(--font-sans), Arial, Helvetica, sans-serif',
              unicodeBidi: 'plaintext'
            }}
          />
        </div>

        {/* Twitch Status */}
        <div>
          <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2 flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Twitch Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="twitchStatus"
                value="live"
                checked={formData.twitchStatus === 'live'}
                onChange={(e) => setFormData({ ...formData, twitchStatus: e.target.value as 'live' | 'offline' })}
                className="w-4 h-4 text-[var(--purple-primary)]"
              />
              <span className="text-[var(--purple-glow)]">Live</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="twitchStatus"
                value="offline"
                checked={formData.twitchStatus === 'offline'}
                onChange={(e) => setFormData({ ...formData, twitchStatus: e.target.value as 'live' | 'offline' })}
                className="w-4 h-4 text-[var(--purple-primary)]"
              />
              <span className="text-[var(--purple-glow)]">Offline</span>
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-[var(--purple-glow)] mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Social Media Links
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--purple-glow)]/70 mb-1">Twitch</label>
              <input
                type="url"
                value={formData.socialLinks.twitch}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitch: e.target.value } })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://twitch.tv/yourusername"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--purple-glow)]/70 mb-1">Twitter/X</label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://twitter.com/yourusername"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--purple-glow)]/70 mb-1">TikTok</label>
              <input
                type="url"
                value={formData.socialLinks.tiktok}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, tiktok: e.target.value } })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://www.tiktok.com/@yourusername"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--purple-glow)]/70 mb-1">YouTube (Optional)</label>
              <input
                type="url"
                value={formData.socialLinks.youtube}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, youtube: e.target.value } })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://youtube.com/@yourusername"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--purple-glow)]/70 mb-1">Instagram (Optional)</label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://instagram.com/yourusername"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--purple-glow)]/70 mb-1">Discord (Optional)</label>
              <input
                type="url"
                value={formData.socialLinks.discord}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, discord: e.target.value } })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://discord.gg/yourserver or https://discord.com/users/yourid"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}
          >
            <span>{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 px-6 bg-[var(--purple-primary)] hover:bg-[var(--purple-vibrant)] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
