import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainFeature from '../components/MainFeature'

const Home = () => {
  const [history, setHistory] = useState([])

  const addToHistory = (calculation) => {
    setHistory(prev => [calculation, ...prev].slice(0, 10))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to ICal
        </h1>
        
        <p className="text-center text-surface-600 dark:text-surface-300 mb-8 max-w-2xl mx-auto">
          A modern calculator with advanced features, designed for speed and accuracy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MainFeature onCalculate={addToHistory} />
        </div>
        
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-surface-100 dark:bg-surface-800 rounded-2xl p-4 h-full"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-primary rounded-full"></span>
              Calculation History
            </h2>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 rounded-xl bg-white dark:bg-surface-700 shadow-sm"
                    >
                      <div className="text-surface-500 dark:text-surface-400 text-sm">
                        {item.expression}
                      </div>
                      <div className="font-medium text-lg">
                        = {item.result}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                    No calculations yet. Start calculating!
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home