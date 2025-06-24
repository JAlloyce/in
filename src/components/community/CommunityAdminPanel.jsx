import { HiBan, HiUserRemove, HiUserAdd } from 'react-icons/hi';

export default function CommunityAdminPanel({ 
  blockedMembers, 
  onBlockMember, 
  onUnblockMember 
}) {
  // Mock member data - in real app, fetch from API
  const members = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    // ... more members
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-red-200">
      <h2 className="text-xl font-bold mb-4">Community Administration</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Member Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Member</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => {
                const isBlocked = blockedMembers.includes(member.id);
                return (
                  <tr key={member.id} className="border-b">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-gray-500 text-xs">{member.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {!isBlocked ? (
                        <button
                          onClick={() => onBlockMember(member.id)}
                          className="flex items-center text-red-600 hover:text-red-800"
                        >
                          <HiBan className="mr-1" /> Block
                        </button>
                      ) : (
                        <button
                          onClick={() => onUnblockMember(member.id)}
                          className="flex items-center text-green-600 hover:text-green-800"
                        >
                          <HiUserAdd className="mr-1" /> Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Content Moderation</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Post Approval</p>
              <p className="text-sm text-gray-500">Require admin approval for new posts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Member Invitations</p>
              <p className="text-sm text-gray-500">Allow members to invite others</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 