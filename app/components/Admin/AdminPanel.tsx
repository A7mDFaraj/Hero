'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, User, Star, Link as LinkIcon, Eye, EyeOff, Video, Film } from 'lucide-react';
import { FanArt, FeaturedWork } from '@/types';
import ProfileManager from './ProfileManager';

interface AdminPanelProps {}

export default function AdminPanel({}: AdminPanelProps) {
  const [fanArts, setFanArts] = useState<FanArt[]>([]);
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);

  const loadFanArts = async () => {
    try {
      const response = await fetch('/api/fanart');
      if (!response.ok) throw new Error('Failed to fetch fan arts');
      const { data } = await response.json();
      setFanArts(data || []);
    } catch (error) {
      console.error('Error loading fan arts:', error);
      setFanArts([]);
    }
  };

  const loadFeaturedWorks = async () => {
    try {
      const response = await fetch('/api/featured-works');
      if (!response.ok) throw new Error('Failed to fetch featured works');
      const { data } = await response.json();
      setFeaturedWorks(data || []);
    } catch (error) {
      console.error('Error loading featured works:', error);
      setFeaturedWorks([]);
    }
  };

  useEffect(() => {
    loadFanArts();
    loadFeaturedWorks();
  }, []);
  const [formData, setFormData] = useState({
    image: '',
    creatorName: '',
    creatorLink: '',
    rating: '',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMessage({ type: 'error', text: 'No file selected.' });
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid file type. Please upload PNG, JPG, GIF, or WEBP images only.' 
      });
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ 
        type: 'error', 
        text: `File size too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` 
      });
      e.target.value = ''; // Clear input
      return;
    }

    setImageFile(file);
    setMessage(null); // Clear previous errors

    // Create a local preview
    // In Phase 2, this will upload to Cloudinary first
    const reader = new FileReader();
    
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read image file. Please try again.' });
      setPreview(null);
      setImageFile(null);
      e.target.value = '';
    };

    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        // Only use for preview, actual upload will be to Cloudinary
        setPreview(reader.result);
        // Don't set formData.image here - it will be set after Cloudinary upload
      } else {
        setMessage({ type: 'error', text: 'Failed to process image. Please try again.' });
        setPreview(null);
        setImageFile(null);
        e.target.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage(null);

    // Validate required fields
    if (!formData.creatorName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a creator name.' });
      setIsUploading(false);
      return;
    }

    // Validate image file exists
    if (!imageFile) {
      setMessage({ type: 'error', text: 'Please select an image to upload.' });
      setIsUploading(false);
      return;
    }

    // Validate rating if provided
    if (formData.rating) {
      const ratingNum = parseInt(formData.rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        setMessage({ type: 'error', text: 'Rating must be a number between 1 and 5.' });
        setIsUploading(false);
        return;
      }
    }

    // Validate creator link format if provided
    if (formData.creatorLink && formData.creatorLink.trim()) {
      try {
        new URL(formData.creatorLink);
      } catch {
        setMessage({ type: 'error', text: 'Please enter a valid URL for the creator link.' });
        setIsUploading(false);
        return;
      }
    }

    try {
      // 1. First upload image to Cloudinary
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', imageFile);
      
      const cloudinaryResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToUpload,
      });

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(errorData.error || 'Failed to upload image to Cloudinary');
      }

      const { imageUrl } = await cloudinaryResponse.json();
      
      // 2. Then save fan art data (currently to localStorage, ready for NestJS API)
      const response = await fetch('/api/fanart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl, // Cloudinary URL
          creatorName: formData.creatorName.trim(),
          creatorLink: formData.creatorLink.trim() || undefined,
          adminRating: formData.rating ? parseInt(formData.rating) : undefined,
          likes: 0,
          dislikes: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save fan art');
      }

      const { data: newFanArt } = await response.json();

      // Reload fan arts from API
      await loadFanArts();
      setMessage({ type: 'success', text: 'Fan art added successfully! It will appear in the gallery.' });
      
      // Reload featured works too in case it was updated
      await loadFeaturedWorks();
      
      // Reset form
      setFormData({
        image: '',
        creatorName: '',
        creatorLink: '',
        rating: '',
      });
      setPreview(null);
      setImageFile(null);
      
      // Clear file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload fan art. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fan art?')) {
      return;
    }

    try {
      const response = await fetch(`/api/fanart/${id}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete fan art');
      }

      // Reload fan arts from API
      await loadFanArts();
      setMessage({ type: 'success', text: 'Fan art deleted successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete fan art' 
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/fanart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update fan art');
      }

      // Reload fan arts from API
      await loadFanArts();
      setMessage({ 
        type: 'success', 
        text: `Fan art ${!currentStatus ? 'activated' : 'deactivated'} successfully!` 
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update fan art' 
      });
    }
  };

  // Featured Works state
  const [featuredWorkFormData, setFeaturedWorkFormData] = useState({
    url: '',
    title: '',
    kind: 'image' as 'image' | 'video' | 'gif',
    posterUrl: '',
  });
  const [featuredWorkFile, setFeaturedWorkFile] = useState<File | null>(null);
  const [featuredWorkPreview, setFeaturedWorkPreview] = useState<string | null>(null);
  const [isUploadingFeaturedWork, setIsUploadingFeaturedWork] = useState(false);

  const handleFeaturedWorkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    let kind: 'image' | 'video' | 'gif' = 'image';
    
    if (fileType.startsWith('video/')) {
      kind = 'video';
    } else if (fileType === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
      kind = 'gif';
    }

    setFeaturedWorkFile(file);
    setFeaturedWorkFormData({ ...featuredWorkFormData, kind });

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        setFeaturedWorkPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFeaturedWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingFeaturedWork(true);
    setMessage(null);

    try {
      let finalUrl = featuredWorkFormData.url.trim();

      // If file is uploaded, upload to Cloudinary first
      if (featuredWorkFile) {
        const formDataToUpload = new FormData();
        formDataToUpload.append('file', featuredWorkFile);
        
        const cloudinaryResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (!cloudinaryResponse.ok) {
          const errorData = await cloudinaryResponse.json();
          throw new Error(errorData.error || 'Failed to upload to Cloudinary');
        }

        const { imageUrl } = await cloudinaryResponse.json();
        finalUrl = imageUrl;
      }

      if (!finalUrl) {
        throw new Error('Please provide a URL or upload a file');
      }

      const response = await fetch('/api/featured-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          title: featuredWorkFormData.title.trim() || undefined,
          kind: featuredWorkFormData.kind,
          posterUrl: featuredWorkFormData.posterUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save featured work');
      }

      await loadFeaturedWorks();
      setMessage({ type: 'success', text: 'Featured work added successfully!' });
      
      setFeaturedWorkFormData({ url: '', title: '', kind: 'image', posterUrl: '' });
      setFeaturedWorkFile(null);
      setFeaturedWorkPreview(null);
      const fileInput = document.getElementById('featured-work-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload featured work' 
      });
    } finally {
      setIsUploadingFeaturedWork(false);
    }
  };

  const handleDeleteFeaturedWork = async (id: string) => {
    if (!confirm('Are you sure you want to delete this featured work?')) return;

    try {
      const response = await fetch(`/api/featured-works/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await loadFeaturedWorks();
      setMessage({ type: 'success', text: 'Featured work deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete featured work' 
      });
    }
  };

  const handleToggleFeaturedWorkActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/featured-works/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');
      await loadFeaturedWorks();
      setMessage({ 
        type: 'success', 
        text: `Featured work ${!currentStatus ? 'activated' : 'deactivated'} successfully!` 
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update featured work' 
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Management */}
      <ProfileManager />

      {/* Featured Works Management */}
      <div className="bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-[var(--purple-primary)] flex items-center gap-2">
          <Film className="w-6 h-6" />
          Featured Works Management
        </h2>

        <form onSubmit={handleFeaturedWorkSubmit} className="space-y-6 mb-8">
          {/* Upload or URL */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
              Upload File or Provide URL
            </label>
            <div className="space-y-4">
              <div>
                <input
                  id="featured-work-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFeaturedWorkFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="featured-work-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--purple-primary)]/30 rounded-lg cursor-pointer hover:border-[var(--purple-primary)] transition-colors bg-[var(--purple-darker)]/30"
                >
                  {featuredWorkPreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      {featuredWorkFormData.kind === 'video' ? (
                        <video src={featuredWorkPreview} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={featuredWorkPreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedWorkPreview(null);
                          setFeaturedWorkFile(null);
                          const fileInput = document.getElementById('featured-work-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <Upload className="w-8 h-8 text-[var(--purple-glow)]/50 mb-2" />
                      <p className="text-sm text-[var(--purple-glow)]">
                        <span className="font-semibold">Click to upload</span> image/video
                      </p>
                    </div>
                  )}
                </label>
              </div>
              <div className="text-center text-[var(--purple-glow)]/60 text-sm">OR</div>
              <input
                type="url"
                value={featuredWorkFormData.url}
                onChange={(e) => setFeaturedWorkFormData({ ...featuredWorkFormData, url: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://cloudinary.com/... or https://drive.google.com/..."
              />
              <p className="text-xs text-[var(--purple-glow)]/60">Supports Cloudinary URLs, Google Drive links, or direct URLs</p>
              <p className="text-xs text-[var(--purple-primary)]/80 mt-1 font-semibold">
                Recommended: Images 1920x1080 (16:9) or 1920x1333 (3:2) • Videos 1920x1080 (16:9) MP4, max 100MB
              </p>
            </div>
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
              Media Type
            </label>
            <div className="flex gap-4">
              {(['image', 'video', 'gif'] as const).map((kind) => (
                <label key={kind} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    value={kind}
                    checked={featuredWorkFormData.kind === kind}
                    onChange={(e) => setFeaturedWorkFormData({ ...featuredWorkFormData, kind: e.target.value as 'image' | 'video' | 'gif' })}
                    className="w-4 h-4 text-[var(--purple-primary)]"
                  />
                  <span className="text-[var(--purple-glow)] capitalize">{kind}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={featuredWorkFormData.title}
              onChange={(e) => setFeaturedWorkFormData({ ...featuredWorkFormData, title: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
              placeholder="Enter title"
            />
          </div>

          {/* Poster URL (for videos) */}
          {featuredWorkFormData.kind === 'video' && (
            <div>
              <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
                Poster/Thumbnail URL (Optional)
              </label>
              <input
                type="url"
                value={featuredWorkFormData.posterUrl}
                onChange={(e) => setFeaturedWorkFormData({ ...featuredWorkFormData, posterUrl: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="https://..."
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isUploadingFeaturedWork || (!featuredWorkFile && !featuredWorkFormData.url)}
            className="w-full py-3 px-6 bg-[var(--purple-primary)] hover:bg-[var(--purple-vibrant)] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploadingFeaturedWork ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Add Featured Work
              </>
            )}
          </button>
        </form>

        {/* Featured Works List */}
        {featuredWorks.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-[var(--purple-primary)]">
              Featured Works ({featuredWorks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredWorks.map((work) => (
                <div
                  key={work.id}
                  className="relative group bg-[var(--purple-darker)]/30 border border-[var(--purple-primary)]/20 rounded-lg overflow-hidden hover:border-[var(--purple-primary)] transition-all"
                >
                  <div className="relative h-48">
                    {work.kind === 'video' ? (
                      <video
                        src={work.url}
                        poster={work.posterUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={work.url}
                        alt={work.title || 'Featured work'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleFeaturedWorkActive(work.id, work.isActive !== false)}
                        className={`p-2 rounded-full transition-colors ${
                          work.isActive !== false
                            ? 'bg-green-500/80 hover:bg-green-600'
                            : 'bg-gray-500/80 hover:bg-gray-600'
                        }`}
                      >
                        {work.isActive !== false ? (
                          <Eye className="w-4 h-4 text-white" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteFeaturedWork(work.id)}
                        className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[var(--purple-glow)] font-semibold">{work.title || 'Untitled'}</p>
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50 capitalize">
                        {work.kind}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        work.isActive !== false
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}
                    >
                      {work.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-[var(--purple-primary)] flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Fan Art
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
              Fan Art Image
            </label>
            <div className="relative">
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--purple-primary)]/30 rounded-lg cursor-pointer hover:border-[var(--purple-primary)] transition-colors bg-[var(--purple-darker)]/30"
              >
                {preview ? (
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreview(null);
                        setFormData({ ...formData, image: '' });
                        setImageFile(null);
                        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-12 h-12 text-[var(--purple-glow)]/50 mb-2" />
                    <p className="mb-2 text-sm text-[var(--purple-glow)]">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-[var(--purple-glow)]/60">
                      PNG, JPG, GIF, WEBP up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Creator Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Creator Name
            </label>
            <input
              type="text"
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
              placeholder="Enter creator's name or username"
              required
            />
          </div>

          {/* Creator Link */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Creator Link (Optional)
            </label>
            <input
              type="url"
              value={formData.creatorLink}
              onChange={(e) => setFormData({ ...formData, creatorLink: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
              placeholder="https://twitter.com/creator"
            />
          </div>

          {/* Admin Rating */}
          <div>
            <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Your Rating (Optional) - Rate this fan art 1-5 stars
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
              placeholder="1-5"
            />
            <p className="text-xs text-[var(--purple-glow)]/60 mt-1">Visitors can like/dislike, but only you can rate with stars.</p>
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
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 px-6 bg-[var(--purple-primary)] hover:bg-[var(--purple-vibrant)] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Fan Art
              </>
            )}
          </button>
        </form>
      </div>

      {/* Uploaded Fan Arts List */}
      {fanArts.length > 0 && (
        <div className="bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-[var(--purple-primary)]">
            Uploaded Fan Arts ({fanArts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fanArts.map((art) => (
              <div
                key={art.id}
                className="relative group bg-[var(--purple-darker)]/30 border border-[var(--purple-primary)]/20 rounded-lg overflow-hidden hover:border-[var(--purple-primary)] transition-all"
              >
                <div className="relative h-48">
                  <img
                    src={art.image}
                    alt={art.creatorName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%234C1D95" width="400" height="300"/%3E%3Ctext fill="%23A78BFA" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleActive(art.id, art.isActive !== false)}
                      className={`p-2 rounded-full transition-colors ${
                        art.isActive !== false
                          ? 'bg-green-500/80 hover:bg-green-600'
                          : 'bg-gray-500/80 hover:bg-gray-600'
                      }`}
                      title={art.isActive !== false ? 'Hide from carousel' : 'Show in carousel'}
                    >
                      {art.isActive !== false ? (
                        <Eye className="w-4 h-4 text-white" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                      title="Delete fan art"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[var(--purple-glow)] font-semibold">{art.creatorName}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        art.isActive !== false
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}
                    >
                      {art.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {art.adminRating && (
                    <p className="text-[var(--purple-glow)]/60 text-sm mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[var(--purple-primary)] text-[var(--purple-primary)]" />
                      Admin: {art.adminRating}/5
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--purple-glow)]/60">
                    <span>👍 {art.likes || 0}</span>
                    <span>👎 {art.dislikes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-[var(--purple-darker)]/30 border border-[var(--purple-primary)]/20 rounded-xl p-6">
        <p className="text-[var(--purple-glow)]/60 text-sm">
          <strong className="text-[var(--purple-primary)]">Info:</strong> Images are uploaded to Cloudinary and stored permanently. 
          Fan art data is currently saved to localStorage. Ready for NestJS backend API integration.
        </p>
      </div>
    </div>
  );
}
