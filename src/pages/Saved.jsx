export default function Saved() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Saved Items</h1>
      <p>Saved page content coming soon...</p>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Your Saved Posts</h2>
        <div className="space-y-4">
          {[1, 2].map(id => (
            <div key={id} className="border rounded-lg p-4 hover:shadow-md">
              <h3 className="font-bold">The Future of Web Development</h3>
              <p className="text-gray-600 mt-1">Saved 3 days ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 