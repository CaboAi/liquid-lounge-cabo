'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

const slideVariants = {
  initial: { 
    x: '100%',
    opacity: 0
  },
  in: { 
    x: 0,
    opacity: 1
  },
  out: { 
    x: '-100%',
    opacity: 0
  }
}

const slideTransition = {
  type: 'tween',
  ease: 'circOut',
  duration: 0.3
}

const fadeVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
}

const fadeTransition = {
  duration: 0.2
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function SlideTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={slideTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function FadeTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={fadeVariants}
        transition={fadeTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Route-specific transitions
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // Determine transition type based on route
  const getTransitionType = () => {
    if (pathname.startsWith('/auth/')) return 'fade'
    if (pathname.startsWith('/booking/') || pathname.startsWith('/classes/')) return 'slide'
    return 'default'
  }

  const transitionType = getTransitionType()

  switch (transitionType) {
    case 'fade':
      return <FadeTransition>{children}</FadeTransition>
    case 'slide':
      return <SlideTransition>{children}</SlideTransition>
    default:
      return <PageTransition>{children}</PageTransition>
  }
}

// Component-level transitions
interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn'
}

export function AnimatedContainer({ 
  children, 
  className,
  delay = 0,
  duration = 0.4,
  variant = 'fadeIn'
}: AnimatedContainerProps) {
  const variants = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 }
    },
    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 }
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 }
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered list animations
interface StaggeredListProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
}

export function StaggeredList({ children, className, staggerDelay = 0.1 }: StaggeredListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Modal transitions
export function ModalTransition({ 
  isOpen, 
  children 
}: { 
  isOpen: boolean
  children: ReactNode 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Sheet/Drawer transitions
export function SheetTransition({ 
  isOpen, 
  children, 
  side = 'right' 
}: { 
  isOpen: boolean
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
}) {
  const variants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' }
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' }
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' }
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants[side]}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Loading transition
export function LoadingTransition({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2 bg-background border rounded-lg p-4 shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-sm font-medium">Loading...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Success/Error message transitions
export function MessageTransition({ 
  message, 
  type = 'success' 
}: { 
  message?: string
  type?: 'success' | 'error' | 'info'
}) {
  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${colors[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Card hover animations
export function HoverCard({ 
  children, 
  className,
  scale = 1.02,
  duration = 0.2 
}: {
  children: ReactNode
  className?: string
  scale?: number
  duration?: number
}) {
  return (
    <motion.div
      whileHover={{ 
        scale,
        transition: { duration, ease: 'easeOut' }
      }}
      whileTap={{ 
        scale: scale * 0.98,
        transition: { duration: 0.1 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Button press animation
export function PressableButton({ 
  children, 
  className,
  onPress 
}: {
  children: ReactNode
  className?: string
  onPress?: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onPress}
      className={className}
    >
      {children}
    </motion.button>
  )
}