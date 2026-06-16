import React, { useState, useRef } from 'react';
import { User, Building, Phone, Globe, Camera, Save, Mail, Shield, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface UserProfileProps {
  onProfileUpdated: (force?: boolean) => void;
  tenantProfile: any;
  teamRole: string | null;
  onAvatarChange: (url: string) => void;
}

export default function UserProfile({
  onProfileUpdated,
  tenantProfile,
  teamRole,
  onAvatarChange,
}: UserProfileProps) {
  const [fullName, setFullName] = useState(tenantProfile?.name || tenantProfile?.fullName || '');
  const [companyName, setCompanyName] = useState(tenantProfile?.company_name || tenantProfile?.companyName || '');
  const [botName, setBotName] = useState(tenantProfile?.bot_name || tenantProfile?.botName || '');
  const [phone, setPhone] = useState(tenantProfile?.phone || '');
  const [website, setWebsite] = useState(tenantProfile?.website || '');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to fetch auth token
  const getAuthToken = () => {
    return localStorage.getItem('session_token') || localStorage.getItem('neslead_session_token') || '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = getAuthToken();

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          fullName,
          companyName,
          botName,
          phone,
          website,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile details');
      }

      setMessage({ type: 'success', text: 'Profile details updated successfully!' });
      onProfileUpdated(true);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error updating profile details' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAuthToken();

    try {
      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.imageUrl) {
        onAvatarChange(data.imageUrl);
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        onProfileUpdated(true);
      } else {
        throw new Error('Image URL not returned by server');
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error uploading image' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setUploading(true);
    setMessage(null);

    const token = getAuthToken();

    try {
      const response = await fetch('/api/profile/remove-image', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Removal failed');
      }

      onAvatarChange('');
      setMessage({ type: 'success', text: 'Avatar removed successfully!' });
      onProfileUpdated(true);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error removing image' });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    const nameStr = fullName || tenantProfile?.email || 'User';
    return nameStr.charAt(0).toUpperCase();
  };

  const currentAvatarUrl = tenantProfile?.profile_image_url || tenantProfile?.profileImageUrl || '';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-neutral-900 rounded-3xl border border-neutral-800" id="user-profile-widget">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 w-full md:w-1/3 text-center border-b md:border-b-0 md:border-r border-neutral-800 pb-6 md:pb-0 md:pr-6">
          <div className="relative group">
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500/50 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black border-2 border-neutral-700">
                {getInitials()}
              </div>
            )}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 p-2 bg-indigo-605 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors cursor-pointer shadow-md disabled:opacity-50"
              title="Upload New Avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-1">
            <h4 className="text-base font-black tracking-tight text-white">{fullName || 'My Account'}</h4>
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-505 bg-indigo-500/10 text-indigo-400">
                <Shield className="w-3 h-3" />
                {teamRole || 'Owner'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-amber-500/10 text-amber-400">
                Plan: {tenantProfile?.plan || 'Starter'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full max-w-xs mt-2 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/20 text-[11px] font-bold text-neutral-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              Upload Photo
            </button>
            {currentAvatarUrl && (
              <button
                onClick={handleAvatarRemove}
                disabled={uploading}
                className="px-3 py-1.5 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/20 text-[11px] font-bold text-red-405 text-red-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Form Fields Area */}
        <form onSubmit={handleSave} className="flex-1 w-full space-y-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-black tracking-tight text-white">Profile Settings</h3>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-bold leading-normal ${message.type === 'success' ? 'bg-emerald-505 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jordan Vance"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-550 focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-neutral-550 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="email"
                  value={tenantProfile?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-850 bg-neutral-950/80 text-xs font-semibold text-neutral-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Company/Brand Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Vance Legal Partners"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-neutral-550 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Assistant/Bot Display Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. NesLead AI Assistant"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-neutral-550 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 0199"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-neutral-550 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Corporate Website</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-neutral-550 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="user-profile-save-btn"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
