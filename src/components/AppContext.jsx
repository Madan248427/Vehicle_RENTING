"use client"

import { useState, createContext, useContext, Suspense } from "react"

// Create a context for global app state
const AppContext = createContext(null)

export function useAppContext() {
  return useContext(AppContext)
}

export function AppContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchModal, setShowSearchModal] = useState(false)

  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleSearchClick = () => {
    setShowSearchModal(true)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In a real app, you'd navigate to a search results page
      // For this example, we'll just close the modal
      setShowSearchModal(false)
      console.log("Searching for:", searchQuery)
    }
  }

  const contextValue = {
    isLoggedIn,
    user,
    isMobileMenuOpen,
    searchQuery,
    showSearchModal,
    handleLogin,
    handleLogout,
    toggleMobileMenu,
    handleSearchClick,
    setSearchQuery,
    setShowSearchModal,
    handleSearchSubmit,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </AppContext.Provider>
  )
}
