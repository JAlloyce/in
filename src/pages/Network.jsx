import { HiUserAdd, HiUserGroup, HiCalendar } from "react-icons/hi"

export default function Network() {
  const suggestions = [
    { name: "Alice Johnson", title: "Product Manager at Google", mutualConnections: 12 },
    { name: "Bob Smith", title: "Software Engineer at Microsoft", mutualConnections: 8 },
    { name: "Carol Davis", title: "UX Designer at Apple", mutualConnections: 15 },
    { name: "David Wilson", title: "Data Scientist at Netflix", mutualConnections: 6 },
    { name: "Emma Brown", title: "Marketing Manager at Spotify", mutualConnections: 9 },
    { name: "Frank Miller", title: "DevOps Engineer at Amazon", mutualConnections: 11 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">People you may know</h2>
          <div className="flex flex-col gap-4">
            {suggestions.map((person, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow w-full">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{person.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{person.mutualConnections} mutual connections</p>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">My Network</h1>
          <p>Network page content coming soon...</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Your network</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HiUserGroup className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Connections</span>
              </div>
              <span className="text-sm font-medium">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HiUserAdd className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Following</span>
              </div>
              <span className="text-sm font-medium">89</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HiCalendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Events</span>
              </div>
              <span className="text-sm font-medium">3</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Recent activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium">You appeared in 15 searches this week</p>
              <p className="text-xs text-gray-500">See who viewed your profile</p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">3 new connection requests</p>
              <p className="text-xs text-gray-500">Manage your invitations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
