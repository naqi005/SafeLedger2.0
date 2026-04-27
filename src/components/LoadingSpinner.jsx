import React from 'react'

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }
  return (
    <div
      className={`${sizes[size]} rounded-full border-dark-border border-t-gold animate-spin ${className}`}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-dark flex flex-col items-center justify-center z-50">
      <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-6 animate-pulse">
        <span className="text-dark font-bold text-lg">SL</span>
      </div>
      <LoadingSpinner size="lg" />
    </div>
  )
}
