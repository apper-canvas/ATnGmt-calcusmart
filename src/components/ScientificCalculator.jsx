import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, RotateCcw, Percent, Divide, X, Minus, Plus, Equal, 
  CornerUpLeft, Superscript, Square, X as TimesIcon
} from 'lucide-react'

const ScientificCalculator = ({ onCalculate, formatNumber, memory, setMemory, decimalPlaces, setDecimalPlaces }) => {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [lastOperation, setLastOperation] = useState(null)
  const [isCalculated, setIsCalculated] = useState(false)
  const [animateDisplay, setAnimateDisplay] = useState(false)
  const [angleMode, setAngleMode] = useState(() => {
    const savedMode = localStorage.getItem('angleMode')
    return savedMode || 'DEG'
  })
  const [shift, setShift] = useState(false)
  const [lastResult, setLastResult] = useState(null)  // To store last numeric result

  // Save angle mode preference
  useEffect(() => {
    localStorage.setItem('angleMode', angleMode)
  }, [angleMode])

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
    // Use the numeric lastResult if available
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
      
      // Get the previous number either from lastResult or expression
      let previousNum;
      if (lastResult !== null) {
        previousNum = lastResult;
      } else {
        // Extract number from expression and convert to number
        const expressionParts = expression.split(' ');
        previousNum = parseFloat(expressionParts[0].replace(/,/g, ''));
      }

      if (isNaN(previousNum) || isNaN(currentNum)) {
        setDisplay('Error')
        setExpression('')
        setIsCalculated(true)
        setLastResult(null)
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
        case '^':
          result = Math.pow(previousNum, currentNum)
          break
        default:
          result = currentNum
      }

      // Store numeric result for future calculations
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

  // Perform scientific operations
  const performScientificOperation = (operation) => {
    try {
      const value = parseFloat(display.replace(/,/g, ''))
      if (isNaN(value) && operation !== 'pi' && operation !== 'e') {
        setDisplay('Error')
        return
      }

      let result;

      // Convert degrees to radians if needed
      const angle = angleMode === 'DEG' && ['sin', 'cos', 'tan'].includes(operation) 
        ? value * (Math.PI / 180) 
        : value

      switch (operation) {
        case 'sin':
          result = Math.sin(angle)
          break
        case 'cos':
          result = Math.cos(angle)
          break
        case 'tan':
          result = Math.tan(angle)
          break
        case 'asin':
          result = Math.asin(value)
          if (angleMode === 'DEG') result = result * (180 / Math.PI)
          break
        case 'acos':
          result = Math.acos(value)
          if (angleMode === 'DEG') result = result * (180 / Math.PI)
          break
        case 'atan':
          result = Math.atan(value)
          if (angleMode === 'DEG') result = result * (180 / Math.PI)
          break
        case 'log':
          result = Math.log10(value)
          break
        case 'ln':
          result = Math.log(value)
          break
        case 'sqrt':
          result = Math.sqrt(value)
          break
        case 'square':
          result = Math.pow(value, 2)
          break
        case 'cube':
          result = Math.pow(value, 3)
          break
        case 'reciprocal':
          result = 1 / value
          break
        case 'factorial':
          if (value < 0 || !Number.isInteger(value)) {
            setDisplay('Error')
            return
          }
          result = factorial(value)
          break
        case 'exp':
          result = Math.exp(value)
          break
        case 'pi':
          result = Math.PI
          break
        case 'e':
          result = Math.E
          break
        default:
          result = value
      }

      // Store numeric result for future calculations
      setLastResult(result)
      
      // Format and display result
      setDisplay(formatNumber(result))
      setIsCalculated(true)
      
      // Add to history for completed operations
      if (onCalculate && operation !== 'pi' && operation !== 'e') {
        const opSymbol = getOperationSymbol(operation)
        onCalculate({
          expression: `${opSymbol}(${display})`,
          result: formatNumber(result)
        })
      }
    } catch (error) {
      console.error('Scientific operation error:', error)
      setDisplay('Error')
      setIsCalculated(true)
      setLastResult(null)
    }
  }

  // Get operation symbol for history display
  const getOperationSymbol = (operation) => {
    switch (operation) {
      case 'sin': return 'sin'
      case 'cos': return 'cos'
      case 'tan': return 'tan'
      case 'asin': return 'sin⁻¹'
      case 'acos': return 'cos⁻¹'
      case 'atan': return 'tan⁻¹'
      case 'log': return 'log'
      case 'ln': return 'ln'
      case 'sqrt': return '√'
      case 'square': return 'x²'
      case 'cube': return 'x³'
      case 'reciprocal': return '1/'
      case 'factorial': return 'fact'
      case 'exp': return 'exp'
      default: return operation
    }
  }

  // Calculate factorial
  const factorial = (n) => {
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
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
    const value = parseFloat(display.replace(/,/g, ''))
    if (!isNaN(value)) {
      setMemory(value)
    }
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
      const value = parseFloat(display.replace(/,/g, ''))
      if (!isNaN(value)) {
        setMemory(memory + value)
      }
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

  // Handle backspace
  const handleBackspace = () => {
    if (isCalculated) {
      setDisplay('0')
      setIsCalculated(false)
      setLastResult(null)
    } else if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0')
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
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
      } else if (e.key === '^' || e.key === 'p') {
        handleOperation('^')
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate()
      } else if (e.key === 'Escape') {
        clearDisplay()
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 's') {
        performScientificOperation('sin')
      } else if (e.key === 'c') {
        performScientificOperation('cos')
      } else if (e.key === 't') {
        performScientificOperation('tan')
      } else if (e.key === 'l') {
        performScientificOperation('log')
      } else if (e.key === 'n') {
        performScientificOperation('ln')
      } else if (e.key === 'r') {
        performScientificOperation('sqrt')
      } else if (e.key === 'q') {
        performScientificOperation('square')
      } else if (e.key === 'i') {
        performScientificOperation('pi')
      } else if (e.key === 'e') {
        performScientificOperation('e')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [display, expression, lastOperation, isCalculated, angleMode, lastResult])

  return (
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
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShift(!shift)}
            className={`calculator-key h-8 px-2 text-sm ${
              shift 
                ? 'bg-primary text-white' 
                : 'calculator-key-function'
            }`}
          >
            SHIFT
          </button>
          <button
            onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
            className="angle-mode-button bg-secondary-light/10 dark:bg-secondary-dark/20 text-secondary-dark dark:text-secondary-light"
          >
            {angleMode}
          </button>
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
      
      <div className="grid grid-cols-5 gap-2 mb-3">
        {/* Scientific Functions Row 1 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation(shift ? 'asin' : 'sin')}
          className="calculator-key calculator-key-scientific h-10"
        >
          {shift ? 'sin⁻¹' : 'sin'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation(shift ? 'acos' : 'cos')}
          className="calculator-key calculator-key-scientific h-10"
        >
          {shift ? 'cos⁻¹' : 'cos'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation(shift ? 'atan' : 'tan')}
          className="calculator-key calculator-key-scientific h-10"
        >
          {shift ? 'tan⁻¹' : 'tan'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('pi')}
          className="calculator-key calculator-key-scientific h-10"
        >
          π
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('e')}
          className="calculator-key calculator-key-scientific h-10"
        >
          e
        </motion.button>
        
        {/* Scientific Functions Row 2 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('log')}
          className="calculator-key calculator-key-scientific h-10"
        >
          log
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('ln')}
          className="calculator-key calculator-key-scientific h-10"
        >
          ln
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('sqrt')}
          className="calculator-key calculator-key-scientific h-10"
        >
          √
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('square')}
          className="calculator-key calculator-key-scientific h-10"
        >
          x²
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('cube')}
          className="calculator-key calculator-key-scientific h-10"
        >
          x³
        </motion.button>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-3">
        {/* Memory Row */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={memoryClear}
          className="calculator-key calculator-key-function h-10"
        >
          MC
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={memoryRecall}
          className="calculator-key calculator-key-function h-10"
        >
          MR
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={memoryAdd}
          className="calculator-key calculator-key-function h-10"
        >
          M+
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={memoryStore}
          className="calculator-key calculator-key-function h-10"
        >
          MS
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('factorial')}
          className="calculator-key calculator-key-scientific h-10"
        >
          n!
        </motion.button>
        
        {/* Function Row */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={clearDisplay}
          className="calculator-key calculator-key-clear h-10"
        >
          <Trash2 size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={clearEntry}
          className="calculator-key calculator-key-clear h-10"
        >
          <RotateCcw size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperation('%')}
          className="calculator-key calculator-key-operation h-10"
        >
          <Percent size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperation('÷')}
          className="calculator-key calculator-key-operation h-10"
        >
          <Divide size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBackspace}
          className="calculator-key calculator-key-function h-10"
        >
          <CornerUpLeft size={16} />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {/* Number Grid */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('7')}
          className="calculator-key calculator-key-number h-10"
        >
          7
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('8')}
          className="calculator-key calculator-key-number h-10"
        >
          8
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('9')}
          className="calculator-key calculator-key-number h-10"
        >
          9
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperation('×')}
          className="calculator-key calculator-key-operation h-10"
        >
          <TimesIcon size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperation('^')}
          className="calculator-key calculator-key-operation h-10"
        >
          <Superscript size={16} />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('4')}
          className="calculator-key calculator-key-number h-10"
        >
          4
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('5')}
          className="calculator-key calculator-key-number h-10"
        >
          5
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('6')}
          className="calculator-key calculator-key-number h-10"
        >
          6
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperation('-')}
          className="calculator-key calculator-key-operation h-10"
        >
          <Minus size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('reciprocal')}
          className="calculator-key calculator-key-scientific h-10"
        >
          1/x
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('1')}
          className="calculator-key calculator-key-number h-10"
        >
          1
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('2')}
          className="calculator-key calculator-key-number h-10"
        >
          2
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('3')}
          className="calculator-key calculator-key-number h-10"
        >
          3
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperation('+')}
          className="calculator-key calculator-key-operation h-10"
        >
          <Plus size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => performScientificOperation('exp')}
          className="calculator-key calculator-key-scientific h-10"
        >
          exp
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={changeSign}
          className="calculator-key calculator-key-number h-10"
        >
          +/-
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKeyInput('0')}
          className="calculator-key calculator-key-number h-10"
        >
          0
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!display.includes('.')) handleKeyInput('.')
          }}
          className="calculator-key calculator-key-number h-10"
        >
          .
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={calculate}
          className="calculator-key h-10 bg-primary text-white hover:bg-primary-dark col-span-2"
        >
          <Equal size={16} />
        </motion.button>
      </div>
    </>
  )
}

export default ScientificCalculator