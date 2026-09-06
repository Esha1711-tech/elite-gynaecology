import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent-navy mb-4">404</h1>
        <p className="text-xl text-text-light mb-8">Page not found</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="h-5 w-5" /> Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
