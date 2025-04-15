import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home as HomeIcon } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-6">
          <span className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-surface-800 dark:text-surface-100">
          Page Not Found
        </h1>
        
        <p className="text-surface-600 dark:text-surface-300 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors"
          >
            <HomeIcon size={18} />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound