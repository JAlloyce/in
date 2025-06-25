import { useState } from 'react';
import { HiUserAdd, HiUserRemove, HiX } from 'react-icons/hi';

export default function AdminSettings({
  admins,
  onAddAdmin,
  onRemoveAdmin,
  pageAdmins,
  setPageAdmins,
  onClose
}) {
  // Prefer the explicit `admins` prop but fall back to `pageAdmins` (legacy)
  const adminList = admins ?? pageAdmins ?? [];

  // Compose default handlers when consumer doesn't provide them
  const addAdmin = (email) => {
    if (onAddAdmin) onAddAdmin(email);
    else if (setPageAdmins) setPageAdmins((prev) => [...prev, email]);
  };

  const removeAdmin = (email) => {
    if (onRemoveAdmin) onRemoveAdmin(email);
    else if (setPageAdmins) setPageAdmins((prev) => prev.filter((a) => a !== email));
  };

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddAdmin = () => {
    if (newAdminEmail && !adminList.includes(newAdminEmail)) {
      addAdmin(newAdminEmail);
      setNewAdminEmail('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-blue-200">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-900">Page Administration</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="text-blue-600">
          <HiUserAdd className="w-5 h-5" />
        </button>
      </div>

      {showAddForm && (
        <div className="flex items-center mb-3">
          <input
            type="email"
            placeholder="Enter admin's email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="flex-1 border rounded-l-md px-3 py-1.5 text-sm"
          />
          <button 
            onClick={handleAddAdmin}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-r-md"
          >
            Add
          </button>
          <button 
            onClick={() => setShowAddForm(false)}
            className="ml-2 text-gray-500"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Current Admins:</h3>
        {adminList.map((admin, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span className="text-sm">{admin}</span>
            <button 
              onClick={() => removeAdmin(admin)}
              className="text-red-600 hover:text-red-800"
            >
              <HiUserRemove className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 