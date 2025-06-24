import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Sidebar from "./components/layout/Sidebar"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Network from "./pages/Network"
import Notifications from "./pages/Notifications"
import Jobs from "./pages/Jobs"
import Messaging from "./pages/Messaging"
import Communities from "./pages/Communities"
import Saved from "./pages/Saved"
import Recent from "./pages/Recent"
import Pages from "./pages/Pages"
import CompanyPage from "./pages/CompanyPage"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
            <div className="lg:col-span-2">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/network" element={<Network />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/messaging" element={<Messaging />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/community/:id" element={<div>Community Detail Page</div>} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/recent" element={<Recent />} />
                <Route path="/pages" element={<Pages />} />
                <Route path="/company/:id" element={<CompanyPage />} />
              </Routes>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sticky top-24">
                <h3 className="font-semibold mb-4">LinkedIn News</h3>
                <div className="space-y-3">
                  {[
                    "Tech layoffs continue",
                    "AI adoption in workplace",
                    "Remote work trends",
                    "Startup funding news",
                  ].map((news, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-gray-900">{news}</p>
                      <p className="text-gray-500">2h ago • 1,234 readers</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
