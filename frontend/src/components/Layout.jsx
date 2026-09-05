import { useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/contacts': 'Contacts',
  '/products': 'Products',
  '/journals': 'Journals',
}

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'Urban Furniture'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Urban Furniture Accounting System</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="
                relative p-2 rounded-xl
                bg-gray-100 dark:bg-gray-800
                text-gray-500 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-colors duration-200
              "
              title="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-violet-500" />
              }
            </button>

            {/* Avatar placeholder */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20 cursor-pointer">
              UF
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
