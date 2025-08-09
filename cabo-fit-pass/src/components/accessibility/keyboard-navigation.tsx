'use client'

import { useEffect, useState, useRef, KeyboardEvent, ReactNode, Children, cloneElement, ReactElement } from 'react'

// Generic keyboard navigation wrapper
interface KeyboardNavigationProps {
  children: ReactNode
  direction?: 'horizontal' | 'vertical' | 'both'
  loop?: boolean
  onSelect?: (index: number, element: HTMLElement) => void
  className?: string
  role?: string
  ariaLabel?: string
}

export function KeyboardNavigation({
  children,
  direction = 'vertical',
  loop = true,
  onSelect,
  className,
  role = 'list',
  ariaLabel
}: KeyboardNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  const childrenArray = Children.toArray(children) as ReactElement[]

  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, childrenArray.length)
  }, [childrenArray.length])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (itemsRef.current.length === 0) return

    const { key } = e
    let newIndex = currentIndex

    // Navigation keys
    if (direction === 'vertical' || direction === 'both') {
      if (key === 'ArrowDown') {
        e.preventDefault()
        newIndex = currentIndex + 1
      } else if (key === 'ArrowUp') {
        e.preventDefault()
        newIndex = currentIndex - 1
      }
    }

    if (direction === 'horizontal' || direction === 'both') {
      if (key === 'ArrowRight') {
        e.preventDefault()
        newIndex = currentIndex + 1
      } else if (key === 'ArrowLeft') {
        e.preventDefault()
        newIndex = currentIndex - 1
      }
    }

    // Home/End keys
    if (key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (key === 'End') {
      e.preventDefault()
      newIndex = itemsRef.current.length - 1
    }

    // Enter/Space to select
    if (key === 'Enter' || key === ' ') {
      e.preventDefault()
      if (currentIndex >= 0 && currentIndex < itemsRef.current.length) {
        const element = itemsRef.current[currentIndex]
        if (element) {
          onSelect?.(currentIndex, element)
          // Trigger click on the element
          element.click()
        }
      }
      return
    }

    // Handle wrapping
    if (newIndex < 0) {
      newIndex = loop ? itemsRef.current.length - 1 : 0
    } else if (newIndex >= itemsRef.current.length) {
      newIndex = loop ? 0 : itemsRef.current.length - 1
    }

    // Update focus
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < itemsRef.current.length) {
      setCurrentIndex(newIndex)
      itemsRef.current[newIndex]?.focus()
    }
  }

  const handleFocus = (index: number) => {
    setCurrentIndex(index)
  }

  const enhancedChildren = childrenArray.map((child, index) => {
    return cloneElement(child, {
      ...child.props,
      ref: (el: HTMLElement | null) => {
        itemsRef.current[index] = el
        // Call original ref if it exists
        if (typeof child.ref === 'function') {
          child.ref(el)
        } else if (child.ref) {
          child.ref.current = el
        }
      },
      tabIndex: currentIndex === index ? 0 : -1,
      onFocus: () => handleFocus(index),
      'aria-selected': currentIndex === index,
      role: role === 'list' ? 'listitem' : undefined
    })
  })

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
      role={role}
      aria-label={ariaLabel}
      tabIndex={currentIndex === -1 ? 0 : -1}
    >
      {enhancedChildren}
    </div>
  )
}

// Menu keyboard navigation
interface MenuNavigationProps {
  children: ReactNode
  onSelect?: (index: number, element: HTMLElement) => void
  onClose?: () => void
  className?: string
  ariaLabel?: string
}

export function MenuNavigation({
  children,
  onSelect,
  onClose,
  className,
  ariaLabel
}: MenuNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose?.()
    }
  }

  const handleSelect = (index: number, element: HTMLElement) => {
    onSelect?.(index, element)
    onClose?.()
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <KeyboardNavigation
        direction="vertical"
        loop={true}
        onSelect={handleSelect}
        className={className}
        role="menu"
        ariaLabel={ariaLabel}
      >
        {children}
      </KeyboardNavigation>
    </div>
  )
}

// Tab panel navigation
interface TabPanelNavigationProps {
  children: ReactNode
  activeIndex: number
  onTabChange: (index: number) => void
  className?: string
  ariaLabel?: string
}

export function TabPanelNavigation({
  children,
  activeIndex,
  onTabChange,
  className,
  ariaLabel
}: TabPanelNavigationProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const childrenArray = Children.toArray(children)
    let newIndex = activeIndex

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      newIndex = activeIndex > 0 ? activeIndex - 1 : childrenArray.length - 1
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      newIndex = activeIndex < childrenArray.length - 1 ? activeIndex + 1 : 0
    } else if (e.key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      newIndex = childrenArray.length - 1
    }

    if (newIndex !== activeIndex) {
      onTabChange(newIndex)
    }
  }

  const childrenArray = Children.toArray(children) as ReactElement[]
  const enhancedChildren = childrenArray.map((child, index) => {
    return cloneElement(child, {
      ...child.props,
      tabIndex: activeIndex === index ? 0 : -1,
      'aria-selected': activeIndex === index,
      role: 'tab',
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`
    })
  })

  return (
    <div
      className={className}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      {enhancedChildren}
    </div>
  )
}

// Grid navigation (for card grids, etc.)
interface GridNavigationProps {
  children: ReactNode
  columns: number
  onSelect?: (index: number, element: HTMLElement) => void
  className?: string
  ariaLabel?: string
}

export function GridNavigation({
  children,
  columns,
  onSelect,
  className,
  ariaLabel
}: GridNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  const childrenArray = Children.toArray(children) as ReactElement[]
  const totalItems = childrenArray.length
  const rows = Math.ceil(totalItems / columns)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (totalItems === 0) return

    const { key } = e
    let newIndex = currentIndex

    switch (key) {
      case 'ArrowRight':
        e.preventDefault()
        newIndex = Math.min(currentIndex + 1, totalItems - 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        newIndex = Math.min(currentIndex + columns, totalItems - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        newIndex = Math.max(currentIndex - columns, 0)
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = totalItems - 1
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        const element = itemsRef.current[currentIndex]
        if (element) {
          onSelect?.(currentIndex, element)
          element.click()
        }
        return
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      itemsRef.current[newIndex]?.focus()
    }
  }

  const enhancedChildren = childrenArray.map((child, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns

    return cloneElement(child, {
      ...child.props,
      ref: (el: HTMLElement | null) => {
        itemsRef.current[index] = el
      },
      tabIndex: currentIndex === index ? 0 : -1,
      onFocus: () => setCurrentIndex(index),
      'aria-rowindex': row + 1,
      'aria-colindex': col + 1,
      role: 'gridcell'
    })
  })

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={rows}
      aria-colcount={columns}
      tabIndex={0}
    >
      {enhancedChildren}
    </div>
  )
}

// Listbox navigation (for combobox, select, etc.)
interface ListboxNavigationProps {
  children: ReactNode
  selectedIndex?: number
  onSelect?: (index: number, element: HTMLElement) => void
  multiSelect?: boolean
  selectedIndices?: number[]
  className?: string
  ariaLabel?: string
}

export function ListboxNavigation({
  children,
  selectedIndex = -1,
  onSelect,
  multiSelect = false,
  selectedIndices = [],
  className,
  ariaLabel
}: ListboxNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedIndices))
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  const childrenArray = Children.toArray(children) as ReactElement[]

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { key, ctrlKey, shiftKey } = e
    let newIndex = currentIndex

    switch (key) {
      case 'ArrowDown':
        e.preventDefault()
        newIndex = Math.min(currentIndex + 1, childrenArray.length - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = childrenArray.length - 1
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (multiSelect) {
          const newSelected = new Set(selected)
          if (newSelected.has(currentIndex)) {
            newSelected.delete(currentIndex)
          } else {
            newSelected.add(currentIndex)
          }
          setSelected(newSelected)
        }
        const element = itemsRef.current[currentIndex]
        if (element) {
          onSelect?.(currentIndex, element)
        }
        return
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < childrenArray.length) {
      setCurrentIndex(newIndex)
      itemsRef.current[newIndex]?.focus()
    }
  }

  const enhancedChildren = childrenArray.map((child, index) => {
    const isSelected = multiSelect ? selected.has(index) : index === selectedIndex

    return cloneElement(child, {
      ...child.props,
      ref: (el: HTMLElement | null) => {
        itemsRef.current[index] = el
      },
      tabIndex: currentIndex === index ? 0 : -1,
      onFocus: () => setCurrentIndex(index),
      'aria-selected': isSelected,
      role: 'option'
    })
  })

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable={multiSelect}
      tabIndex={0}
    >
      {enhancedChildren}
    </div>
  )
}