export default function Recent() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Activity</h1>
      <p>Recent page content coming soon...</p>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Your Activity</h2>
        <div className="space-y-3">
          {[
            "You commented on Sarah's post",
            "You liked Michael's article",
            "You shared a job posting"
          ].map((activity, index) => (
            <div key={index} className="border-b pb-3 last:border-0">
              <p>{activity}</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 