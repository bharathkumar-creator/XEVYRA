'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile } from '@/lib/api/endpoints';
import { UserProfileResponseDto, UpdateProfileRequestDto } from '@xevyra/contracts';

export function useProfile() {
  const [profileData, setProfileData] = useState<UserProfileResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfileData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load athlete profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (updates: UpdateProfileRequestDto) => {
    const updated = await updateProfile(updates);
    setProfileData(updated);
    return updated;
  };

  return {
    profileData,
    isLoading,
    error,
    refetch: fetchProfile,
    saveProfile,
  };
}
