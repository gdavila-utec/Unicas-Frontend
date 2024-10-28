// Components/UserProfile.tsx
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { useUser } from './useUser';
import { useUpdateUser } from './useUpdateUser';

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
}

export function UserProfile() {
  const { user } = useAuthStore();
  const { data: userData, loading } = useUser(user?.id || '');
  const updateUser = useUpdateUser(user?.id || '');

  // Handle case where user is not logged in
  if (!user?.id) {
    return <div>Please log in to view profile</div>;
  }

  const handleUpdateProfile = async (data: UpdateUserData) => {
    try {
      await updateUser.mutateAsync(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile: {userData?.name}</h1>
      {/* Profile form would go here, using handleUpdateProfile */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateProfile({
            name: userData?.name,
            email: userData?.email,
            phone: userData?.phone,
          });
        }}
      >
        {/* Form fields would go here */}
      </form>
    </div>
  );
}
