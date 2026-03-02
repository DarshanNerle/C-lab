import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, Mail, Save } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useGameStore from '../store/useGameStore';
import { storageService } from '../lib/storageService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, profile, dbSource, storageMode, setUser } = useAuthStore();
    const { level, rank, xp, badges } = useGameStore();

    const [username, setUsername] = useState(profile?.settings?.username || (user?.email ? user.email.split('@')[0] : ''));
    const [displayName, setDisplayName] = useState(profile?.name || user?.displayName || '');
    const [bio, setBio] = useState(profile?.settings?.bio || '');
    const [email] = useState(user?.email || profile?.email || '');
    const [avatarPreview, setAvatarPreview] = useState(profile?.settings?.profilePicture || user?.photoURL || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const profileInitial = useMemo(() => {
        return (displayName || username || email || '?').trim().charAt(0).toUpperCase() || '?';
    }, [displayName, username, email]);

    const validate = () => {
        if (!username.trim()) return 'Username cannot be empty.';
        if (email && !emailRegex.test(email)) return 'Please provide a valid email format.';
        return '';
    };

    const onUploadAvatar = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setAvatarPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const onSave = async () => {
        setError('');
        setSuccess('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!email) {
            setError('Unable to update profile: no authenticated email found.');
            return;
        }

        setIsSaving(true);
        try {
            const mergedSettings = {
                ...(profile?.settings || {}),
                username: username.trim(),
                bio: bio.trim(),
                profilePicture: avatarPreview || ''
            };

            const response = await storageService.updateUserProfile({
                email,
                name: displayName.trim() || username.trim(),
                settings: mergedSettings
            });

            if (!response?.ok) {
                setError(response?.error || 'Profile update failed. Please try again.');
                return;
            }

            setUser(
                user,
                {
                    ...(profile || {}),
                    email,
                    name: displayName.trim() || username.trim(),
                    settings: mergedSettings
                },
                dbSource,
                storageMode
            );

            setSuccess('Profile updated successfully.');
        } catch (saveError) {
            setError(saveError?.message || 'Profile update failed.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-6xl pb-28 md:pb-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Edit Profile</h1>
                    <p className="mt-2 text-sm text-slate-400">Update your scientist profile details and preview them in real time.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
                <section className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Profile Picture</span>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-slate-800 text-lg font-bold text-white">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
                                    ) : (
                                        profileInitial
                                    )}
                                </div>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">
                                    <Camera className="h-4 w-4" />
                                    Upload
                                    <input type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} />
                                </label>
                            </div>
                        </label>

                        <label>
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Username</span>
                            <input
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="username"
                                className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Display Name</span>
                            <input
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                placeholder="Display name"
                                className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                            />
                        </label>

                        <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Bio (Optional)</span>
                            <textarea
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                                rows={4}
                                placeholder="Write a short bio"
                                className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                            />
                        </label>

                        <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</span>
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                                <Mail className="h-4 w-4 text-cyan-300" />
                                <input value={email} readOnly className="w-full bg-transparent outline-none" />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Email is controlled by your authentication provider.</p>
                        </label>
                    </div>

                    {!!error && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
                    )}
                    {!!success && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="hidden w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 md:inline-flex"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </section>

                <aside className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                    <h2 className="text-lg font-bold text-white">Profile Preview</h2>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-slate-800 text-lg font-bold text-white">
                                {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" /> : profileInitial}
                            </div>
                            <div>
                                <p className="text-base font-semibold text-white">{displayName || username || 'Scientist'}</p>
                                <p className="text-xs text-slate-400">@{username || 'username'}</p>
                            </div>
                        </div>
                        <p className="min-h-16 text-sm text-slate-300">{bio || 'No bio added yet.'}</p>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <p className="text-xs text-slate-400">Level</p>
                                <p className="text-sm font-bold text-white">{level}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <p className="text-xs text-slate-400">XP</p>
                                <p className="text-sm font-bold text-white">{xp}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <p className="text-xs text-slate-400">Badges</p>
                                <p className="text-sm font-bold text-white">{badges.length}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs uppercase tracking-widest text-cyan-300">{rank}</p>
                    </div>
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-[140] border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur-xl md:hidden">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>
    );
}
