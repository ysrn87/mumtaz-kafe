'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Package, Warehouse, ShoppingCart, DollarSign, Users, FileText, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { logoutAction } from '@/actions/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  role: 'ADMINISTRATOR' | 'MANAGER' | 'MEMBER';
  userName?: string;
}

export function Navigation({ role, userName }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactLevel, setCompactLevel] = useState<'full' | 'medium' | 'compact' | 'icons-only'>('full');
  const navContainerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const adminNavItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: '/admin/customers', label: 'Member', icon: <Users className="w-4 h-4" /> },
    { href: '/admin/products', label: 'Produk', icon: <Package className="w-4 h-4" /> },
    { href: '/admin/stock', label: 'Stok', icon: <Warehouse className="w-4 h-4" /> },
    { href: '/admin/sales', label: 'Penjualan', icon: <ShoppingCart className="w-4 h-4" /> },
    { href: '/admin/cashflow', label: 'Cashflow', icon: <DollarSign className="w-4 h-4" /> },
    { href: '/admin/reports', label: 'Laporan', icon: <FileText className="w-4 h-4" /> },
    { href: '/admin/settings', label: 'Poin', icon: <FileText className="w-4 h-4" /> },
  ];

  const managerNavItems: NavItem[] = [
    { href: '/manager', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: '/manager/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { href: '/manager/stock', label: 'Stock', icon: <Warehouse className="w-4 h-4" /> },
    { href: '/manager/sales', label: 'Sales', icon: <ShoppingCart className="w-4 h-4" /> },
    { href: '/manager/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  ];

  const memberNavItems: NavItem[] = [
    { href: '/member', label: 'My Points', icon: <Home className="w-4 h-4" /> },
    { href: '/member/purchases', label: 'Purchase History', icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  const navItems = role === 'ADMINISTRATOR'
    ? adminNavItems
    : role === 'MANAGER'
      ? managerNavItems
      : memberNavItems;

  // Smart multi-level responsive detection with user info consideration
  useEffect(() => {
    const checkNavSpace = () => {
      if (!navContainerRef.current) return;

      const container = navContainerRef.current;
      const containerWidth = container.offsetWidth;
      
      // Account for user info section width based on screen size
      // At lg (1024px): ~160px (badge + logout icon + gaps)
      // At xl (1280px): ~280px (name + badge + logout text + gaps)
      const screenWidth = window.innerWidth;
      const userInfoWidth = screenWidth >= 1280 ? 280 : screenWidth >= 1024 ? 160 : 0;
      const availableNavWidth = containerWidth - userInfoWidth;
      
      // Progressive breakpoints for smoother transitions
      const itemCount = navItems.length;
      const fullWidth = itemCount * 110; // Full width with text and padding
      const mediumWidth = itemCount * 85; // Slightly compressed
      const compactWidth = itemCount * 65; // More compressed
      const iconsOnlyWidth = itemCount * 48; // Just icons

      // Determine compact level based on available space
      if (availableNavWidth >= fullWidth) {
        setCompactLevel('full');
      } else if (availableNavWidth >= mediumWidth) {
        setCompactLevel('medium');
      } else if (availableNavWidth >= compactWidth) {
        setCompactLevel('compact');
      } else {
        setCompactLevel('icons-only');
      }
    };

    // Debounced resize handler for better performance
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(checkNavSpace, 50);
    };

    // Use ResizeObserver for more efficient detection
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }

    // Initial check
    checkNavSpace();
    
    // Also listen to window resize for user info width changes
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [navItems.length]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Determine styling based on compact level
  const getNavItemStyles = () => {
    switch (compactLevel) {
      case 'full':
        return { gap: 'gap-2', padding: 'px-4 py-2', textWidth: 'w-auto', textOpacity: 'opacity-100' };
      case 'medium':
        return { gap: 'gap-2', padding: 'px-3 py-2', textWidth: 'w-auto', textOpacity: 'opacity-100' };
      case 'compact':
        return { gap: 'gap-1.5', padding: 'px-2 py-2', textWidth: 'w-auto', textOpacity: 'opacity-100' };
      case 'icons-only':
        return { gap: 'gap-1', padding: 'p-2.5', textWidth: 'w-0', textOpacity: 'opacity-0' };
    }
  };

  const navStyles = getNavItemStyles();
  const showTooltip = compactLevel === 'icons-only';

  return (
    <nav className="bg-white/95 border-b border-gray-200 sticky top-0 z-40 shadow-md backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Desktop Nav */}
          <div className="flex items-center flex-1 min-w-0 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex-shrink-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent whitespace-nowrap">
                Sales System
              </h1>
            </div>

            {/* Smart Auto-Responsive Desktop Navigation */}
            <div 
              ref={navContainerRef}
              className="hidden lg:flex flex-1 items-center overflow-x-auto scrollbar-hide"
            >
              <div className={`flex items-center transition-all duration-500 ease-in-out ${navStyles.gap}`}>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={showTooltip ? item.label : undefined}
                      className={`
                        relative z-10
                        group inline-flex items-center justify-center
                        font-medium rounded-lg 
                        transition-all duration-500 ease-in-out
                        ${navStyles.gap} ${navStyles.padding}
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                        }
                      `}
                    >
                      <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span 
                        className={`
                          whitespace-nowrap font-medium 
                          transition-all duration-500 ease-in-out
                          overflow-hidden
                          ${navStyles.textWidth} ${navStyles.textOpacity}
                          ${compactLevel === 'full' ? 'text-sm' : 'text-xs'}
                        `}
                        style={{
                          transitionProperty: 'width, opacity, font-size',
                        }}
                      >
                        {item.label}
                      </span>
                      
                      {/* Enhanced Tooltip for icons-only mode */}
                      {showTooltip && (
                        <span className="
                          absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                          px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg
                          opacity-0 group-hover:opacity-100 pointer-events-none
                          transition-all duration-300 ease-out
                          whitespace-nowrap z-50 shadow-lg
                          transform group-hover:translate-y-0 translate-y-1
                          after:content-[''] after:absolute after:top-full after:left-1/2 
                          after:-translate-x-1/2 after:border-4 after:border-transparent 
                          after:border-t-gray-900
                        ">
                          {item.label}
                        </span>
                      )}
                      
                      {/* Active indicator with smooth animation */}
                      {isActive && (
                        <span 
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-full
                          transition-all duration-300 ease-out"
                        />
                      )}

                      {/* Hover glow effect */}
                      <span 
                        className={`
                          absolute inset-0 rounded-lg opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300
                          ${isActive ? 'bg-white/10' : 'bg-blue-600/5'}
                        `}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side - User Info and Logout with progressive display */}
          <div className={`
            hidden lg:flex items-center flex-shrink-0 
            transition-all duration-500 ease-in-out
            ${compactLevel === 'icons-only' ? 'gap-1 ml-2' : 
              compactLevel === 'compact' ? 'gap-2 ml-3' : 'gap-3 ml-6'}
          `}>
            {/* User info - progressive disclosure */}
            <div className={`
              text-sm text-right 
              transition-all duration-500 ease-in-out overflow-hidden
              ${compactLevel === 'icons-only' ? 'w-0 opacity-0' : 'opacity-100'}
            `}>
              {/* Full name - only show at xl+ (1280px and above) */}
              <p className={`
                font-medium text-gray-900 whitespace-nowrap 
                transition-all duration-300
                ${compactLevel === 'medium' ? 'text-xs' : 'text-sm'}
                hidden xl:block
              `}>
                {userName || 'User'}
              </p>
              
              {/* Role badge - show at lg+ (1024px and above) */}
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full font-medium 
                bg-blue-100 text-blue-800 whitespace-nowrap
                transition-all duration-300
                ${compactLevel === 'medium' ? 'text-[10px]' : 'text-xs'}
              `}>
                {role}
              </span>
            </div>

            {/* Logout button with adaptive text */}
            <form action={logoutAction}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className={`
                  group relative overflow-hidden
                  whitespace-nowrap border-blue-200 text-blue-600 
                  hover:bg-red-50 hover:border-red-300 hover:text-red-600
                  transition-all duration-500 ease-in-out
                  ${compactLevel === 'icons-only' ? 'px-2' : 'px-3'}
                  hover:scale-105 hover:shadow-md
                `}
              >
                <LogOut className={`
                  w-4 h-4 transition-all duration-300
                  ${compactLevel === 'icons-only' ? '' : 'xl:mr-2'}
                  group-hover:rotate-12
                `} />
                {/* Show "Logout" text only at xl+ (1280px and above) */}
                <span className={`
                  transition-all duration-500 ease-in-out overflow-hidden inline-block
                  ${compactLevel === 'icons-only' ? 'w-0 opacity-0' : 'w-0 opacity-0 xl:w-auto xl:opacity-100'}
                `}>
                  Logout
                </span>
              </Button>
            </form>
          </div>

          {/* Mobile menu button with enhanced animation */}
          <div className="flex items-center lg:hidden ml-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                relative inline-flex items-center justify-center p-2 rounded-md 
                text-gray-700 hover:text-gray-900 hover:bg-gray-100 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:ring-offset-2
                transition-all duration-300 hover:scale-110
              "
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with enhanced smooth animation */}
      <div
        className={`
          lg:hidden overflow-hidden 
          transition-all duration-500 ease-in-out
          ${mobileMenuOpen
            ? 'max-h-[800px] border-t border-gray-200 shadow-2xl'
            : 'max-h-0'
          }
        `}
      >
        <div className={`
          bg-white
          transition-all duration-400
          ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}>
          <div className="px-3 pt-3 pb-3 space-y-1.5">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    text-base font-medium 
                    transition-all duration-300 ease-out
                    transform hover:scale-102
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-102'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }
                  `}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 30}ms` : '0ms',
                  }}
                >
                  <span className={`
                    transition-transform duration-300
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    {item.icon}
                  </span>
                  <span className="relative">
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/50 rounded-full" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Mobile User Info and Logout with stagger animation */}
          <div className="pt-4 pb-4 border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white">
            <div 
              className="px-5 mb-3 transition-all duration-300"
              style={{
                transitionDelay: mobileMenuOpen ? `${navItems.length * 30}ms` : '0ms',
              }}
            >
              <div className="text-base font-medium text-gray-900">
                {userName || 'User'}
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1.5">
                {role}
              </span>
            </div>
            <div 
              className="px-3 transition-all duration-300"
              style={{
                transitionDelay: mobileMenuOpen ? `${(navItems.length + 1) * 30}ms` : '0ms',
              }}
            >
              <form action={logoutAction}>
                <Button
                  variant="outline"
                  className="
                    w-full border-blue-200 text-blue-600 
                    hover:bg-red-50 hover:border-red-300 hover:text-red-600
                    transition-all duration-300 hover:scale-102 hover:shadow-md
                  "
                  type="submit"
                >
                  <LogOut className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}