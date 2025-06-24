import { useParams } from 'react-router-dom';
import Profile from './Profile';

export default function UserProfile() {
  const { userId } = useParams();
  
  // In a real app, you would fetch user data based on userId
  // For now, we pass a dummy userId to the Profile component
  // to indicate that it should be in a view-only state.
  return (
    <Profile 
      isEditable={false} 
      userData={{ id: userId, name: "Another User" }} 
    />
  );
} 