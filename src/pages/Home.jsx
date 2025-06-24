import CreatePost from "../components/feed/CreatePost"
import Post from "../components/feed/Post"

export default function Home() {
  return (
    <div className="space-y-4">
      <CreatePost />
      <Post />
      <Post />
    </div>
  )
}
