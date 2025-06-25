import { useAuth } from '../../context/AuthContext';

export default function AuthDebug() {
  const { user, loading, session, profile, isAuthenticated } = useAuth();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Auth Debug Info</h3>
      <div className="text-sm space-y-1">
        <p><strong>Loading:</strong> {loading ? 'YES' : 'NO'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'YES' : 'NO'}</p>
        <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        <p><strong>Session:</strong> {session ? 'EXISTS' : 'None'}</p>
        <p><strong>Profile:</strong> {profile?.name || 'None'}</p>
        <p><strong>Provider:</strong> {user?.app_metadata?.provider || 'None'}</p>
      </div>
    </div>
  );
}