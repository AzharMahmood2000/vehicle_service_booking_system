const STORAGE_KEY = 'vehiclecare_admin_profile';

const initialProfile = {
  fullName: 'Isuru Udana',
  email: 'example@vehiclecare.com',
  phone: '078-1234567',
  profileImage: '/assets/images/profile vector.png',
  role: 'SYSTEM ADMIN',
  accessLevel: 'Full Access',
  primaryAdmin: true
};

export const getAdminProfile = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
  return initialProfile;
};

export const updateAdminProfile = (updates) => {
  const current = getAdminProfile();
  
  // We explicitly do not update role or accessLevel from generic updates unless backend specifically pushes them
  const updated = {
    ...current,
    fullName: updates.fullName || current.fullName,
    email: updates.email || current.email,
    phone: updates.phone || current.phone,
    profileImage: updates.profileImage || current.profileImage,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
