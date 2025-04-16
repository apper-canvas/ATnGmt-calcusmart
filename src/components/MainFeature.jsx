import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, Percent, Divide, X, Minus, Plus, Equal, Calculator, Beaker } from 'lucide-react'
import ScientificCalculator from './ScientificCalculator'

const MainFeature = ({ onCalculate }) => {
  const [calculatorType, setCalculatorType] = useState(() => {
    const savedType = localStorage.getItem('calculatorType')
    return savedType || 'standard'
  })
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [memory, setMemory] = useState(null)
  const [lastOperation, setLastOperation] = useState(null)
  const [isCalculated, setIsCalculated] = useState(false)
  const [decimalPlaces, setDecimalPlaces] = useState(4)
  const [animateDisplay, setAnimateDisplay] = useState(false)
  const [lastResult, setLastResult] = useState(null)  // To store the last numeric result

  // Save calculator type preference
  useEffect(() => {
    localStorage.setItem('calculatorType', calculatorType)
  }, [calculatorType])

  // Handle key input
  const handleKeyInput = (key) => {
    setAnimateDisplay(true)
    setTimeout(() => setAnimateDisplay(false), 100)

    if (isCalculated) {
      setDisplay(key)
      setExpression('')
      setIsCalculated(false)
      setLastResult(null)
      return
    }

    if (display === '0' && key !== '.') {
      setDisplay(key)
    } else if (display.length < 12) {
      setDisplay(display + key)
    }
  }

  // Handle operation
  const handleOperation = (op) => {
    setAnimateDisplay(true)
    setTimeout(() => setAnimateDisplay(false), 100)

    if (lastOperation && !isCalculated) {
      calculate()
    }

    setLastOperation(op)
    // If we have a previous calculation result, use that numeric value
    const displayValue = lastResult !== null ? lastResult : display
    setExpression(displayValue + ' ' + op + ' ')
    setIsCalculated(true)
  }

  // Calculate result
  const calculate = () => {
    try {
      let result;
      // Get the current number from display
      const currentNum = parseFloat(display.replace(/,/g, ''))
      
      // Get the previous number either from lastResult (if available) or from expression
      let previousNum;
      if (lastResult !== null) {
        previousNum = lastResult;
      } else {
        // Extract the number from the expression and convert to number
        const expressionParts = expression.split(' ');
        previousNum = parseFloat(expressionParts[0].replace(/,/g, ''));
      }

      if (isNaN(previousNum) || isNaN(currentNum)) {
        setDisplay('Error')
        setExpression('')
        setIsCalculated(true)
        return
      }

      switch (lastOperation) {
        case '+':
          result = previousNum + currentNum
          break
        case '-':
          result = previousNum - currentNum
          break
        case '×':
          result = previousNum * currentNum
          break
        case '÷':
          if (currentNum === 0) {
            setDisplay('Error')
            setExpression('')
            setIsCalculated(true)
            return
          }
          result = previousNum / currentNum
          break
        case '%':
          result = previousNum * (currentNum / 100)
          break
        default:
          result = currentNum
      }

      // Store the numeric result for future calculations
      setLastResult(result)
      
      // Format result for display
      const formattedResult = formatNumber(result)
      
      // Update display and expression
      setDisplay(formattedResult)
      
      const fullExpression = expression + display
      setExpression('')
      
      // Add to history
      if (onCalculate) {
        onCalculate({
          expression: fullExpression,
          result: formattedResult
        })
      }
      
      setIsCalculated(true)
      setLastOperation(null)
    } catch (error) {
      console.error('Calculation error:', error)
      setDisplay('Error')
      setExpression('')
      setIsCalculated(true)
      setLastResult(null)
    }
  }

  // Format number
  const formatNumber = (num) => {
    if (isNaN(num)) return 'Error'
    
    // Check if it's an integer
    if (Number.isInteger(num)) return num.toString()
    
    // Format with specified decimal places
    return num.toFixed(decimalPlaces).replace(/\.?0+$/, '')
  }

  // Clear display
  const clearDisplay = () => {
    setDisplay('0')
    setExpression('')
    setLastOperation(null)
    setIsCalculated(false)
    setLastResult(null)
  }

  // Clear entry
  const clearEntry = () => {
    setDisplay('0')
    setIsCalculated(false)
  }

  // Memory functions
  const memoryStore = () => {
    setMemory(parseFloat(display.replace(/,/g, '')))
  }

  const memoryRecall = () => {
    if (memory !== null) {
      setDisplay(memory.toString())
      setLastResult(memory)
      setIsCalculated(true)
    }
  }

  const memoryAdd = () => {
    if (memory !== null) {
      const newMemory = memory + parseFloat(display.replace(/,/g, ''))
      setMemory(newMemory)
    } else {
      memoryStore()
    }
  }

  const memoryClear = () => {
    setMemory(null)
  }

  // Change sign
  const changeSign = () => {
    if (display !== '0') {
      const numValue = parseFloat(display.replace(/,/g, ''))
      const newValue = -numValue
      setDisplay(newValue.toString())
      if (lastResult !== null) {
        setLastResult(newValue)
      }
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (calculatorType === 'scientific') return // Handle in ScientificCalculator
      
      if (e.key >= '0' && e.key <= '9') {
        handleKeyInput(e.key)
      } else if (e.key === '.') {
        if (!display.includes('.')) handleKeyInput('.')
      } else if (e.key === '+') {
        handleOperation('+')
      } else if (e.key === '-') {
        handleOperation('-')
      } else if (e.key === '*') {
        handleOperation('×')
      } else if (e.key === '/') {
        handleOperation('÷')
      } else if (e.key === '%') {
        handleOperation('%')
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate()
      } else if (e.key === 'Escape') {
        clearDisplay()
      } else if (e.key === 'Backspace') {
        if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
          setDisplay('0')
        } else {
          setDisplay(display.slice(0, -1))
        }
      }
    }

    if (calculatorType === 'standard') {
      window.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [display, expression, lastOperation, isCalculated, calculatorType, lastResult])

  // Handle calculator toggle
  const handleToggleCalculator = (type) => {
    setCalculatorType(type)
    clearDisplay()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-card dark:shadow-none border border-surface-200 dark:border-surface-700"
    >
      <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {calculatorType === 'standard' ? (
              <Calculator size={20} className="text-primary" />
            ) : (
              <Beaker size={20} className="text-secondary" />
            )}
            <h2 className="font-semibold text-surface-800 dark:text-surface-100">
              {calculatorType === 'standard' ? 'CalcuSmart' : 'Scientific Calc'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-surface-500 dark:text-surface-400">
              {memory !== null ? 'M' : ''}
            </div>
            <div className="calculator-mode-toggle border-surface-200 dark:border-surface-700">
              <button
                onClick={() => handleToggleCalculator('standard')}
                className={`calculator-mode-option ${
                  calculatorType === 'standard' 
                    ? 'calculator-mode-option-active' 
                    : 'calculator-mode-option-inactive'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => handleToggleCalculator('scientific')}
                className={`calculator-mode-option ${
                  calculatorType === 'scientific' 
                    ? 'calculator-mode-option-active' 
                    : 'calculator-mode-option-inactive'
                }`}
              >
                Scientific
              </button>
            </div>
          </div>
        </div>
        
        {calculatorType === 'standard' ? (
          <>
            <div className="bg-surface-50 dark:bg-surface-900 rounded-xl p-4 mb-4 h-24 flex flex-col justify-end items-end">
              {expression && (
                <div className="w-full text-right text-sm text-surface-500 dark:text-surface-400 mb-1 overflow-x-auto scrollbar-hide">
                  {expression}
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={display}
                  initial={animateDisplay ? { opacity: 0.5, y: -5 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-right text-3xl font-bold text-surface-800 dark:text-surface-100 overflow-x-auto scrollbar-hide"
                >
                  {display}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {/* Memory Row */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={memoryClear}
                className="calculator-key calculator-key-function h-12"
              >
                MC
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={memoryRecall}
                className="calculator-key calculator-key-function h-12"
              >
                MR
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={memoryAdd}
                className="calculator-key calculator-key-function h-12"
              >
                M+
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={memoryStore}
                className="calculator-key calculator-key-function h-12"
              >
                MS
              </motion.button>
              
              {/* Function Row */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={clearDisplay}
                className="calculator-key calculator-key-clear h-12"
              >
                <Trash2 size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={clearEntry}
                className="calculator-key calculator-key-clear h-12"
              >
                <RotateCcw size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOperation('%')}
                className="calculator-key calculator-key-operation h-12"
              >
                <Percent size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOperation('÷')}
                className="calculator-key calculator-key-operation h-12"
              >
                <Divide size={18} />
              </motion.button>
              
              {/* Number Row 1 */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('7')}
                className="calculator-key calculator-key-number h-12"
              >
                7
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('8')}
                className="calculator-key calculator-key-number h-12"
              >
                8
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('9')}
                className="calculator-key calculator-key-number h-12"
              >
                9
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOperation('×')}
                className="calculator-key calculator-key-operation h-12"
              >
                <X size={18} />
              </motion.button>
              
              {/* Number Row 2 */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('4')}
                className="calculator-key calculator-key-number h-12"
              >
                4
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('5')}
                className="calculator-key calculator-key-number h-12"
              >
                5
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('6')}
                className="calculator-key calculator-key-number h-12"
              >
                6
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOperation('-')}
                className="calculator-key calculator-key-operation h-12"
              >
                <Minus size={18} />
              </motion.button>
              
              {/* Number Row 3 */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('1')}
                className="calculator-key calculator-key-number h-12"
              >
                1
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('2')}
                className="calculator-key calculator-key-number h-12"
              >
                2
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('3')}
                className="calculator-key calculator-key-number h-12"
              >
                3
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOperation('+')}
                className="calculator-key calculator-key-operation h-12"
              >
                <Plus size={18} />
              </motion.button>
              
              {/* Number Row 4 */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={changeSign}
                className="calculator-key calculator-key-number h-12"
              >
                +/-
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyInput('0')}
                className="calculator-key calculator-key-number h-12"
              >
                0
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!display.includes('.')) handleKeyInput('.')
                }}
                className="calculator-key calculator-key-number h-12"
              >
                .
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={calculate}
                className="calculator-key h-12 bg-primary text-white hover:bg-primary-dark"
              >
                <Equal size={18} />
              </motion.button>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-xs text-surface-500 dark:text-surface-400">
                Decimal places:
              </div>
              <div className="flex gap-2">
                {[2, 4, 6, 8].map(places => (
                  <motion.button
                    key={places}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDecimalPlaces(places)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      decimalPlaces === places 
                        ? 'bg-primary text-white' 
                        : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                    }`}
                  >
                    {places}
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <ScientificCalculator 
            onCalculate={onCalculate} 
            formatNumber={formatNumber}
            memory={memory}
            setMemory={setMemory}
            decimalPlaces={decimalPlaces}
            setDecimalPlaces={setDecimalPlaces}
          />
        )}
      </div>
    </motion.div>
  )
}

export default MainFeature