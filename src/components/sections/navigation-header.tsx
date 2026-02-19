"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, Bookmark, MessageSquare, CreditCard, LogOut, User, Mail, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const navLinks = [
{ name: "Buy а Business", href: '/buy-a-business' },
{ name: 'Sell a Business', href: '/sell-a-business' },
{ name: 'Rent an AI Agent', href: '/rent-ai-agent' },
{ name: 'Business Education Center', href: '/educational-center' },
{ name: "TrustBridge", href: '/trustbridge' },
{ name: "Forum", href: '/forum' }];

const aboutUsLinks = [
{ name: 'Our Team', href: '/our-team' },
{ name: "Reach Us", href: '/reach-us' }];

type NavigationHeaderProps = {
  initialSession?: any;
};

const NavigationHeader = ({ initialSession }: NavigationHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Properly destructure isPending for loading state
  const { data: clientSession, isPending, refetch } = useSession();
  const session = clientSession ?? initialSession;
  const user = session?.user as {name?: string;email?: string;image?: string;} | undefined;

  // profile state for plan/role label
  const [planLabel, setPlanLabel] = useState<string>('Free Plan');
  const [roleLabel, setRoleLabel] = useState<string>('Member');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // fetch profile for plan/role display when authenticated
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('bearer_token');
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token ?? ''}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        const roles = [] as string[];
        if (data.roleBuyer) roles.push('Buyer');
        if (data.roleSeller) roles.push('Seller');
        setRoleLabel(roles.length ? roles.join(' & ') : 'Member');
        setPlanLabel(data.plan ? `${capitalize(data.plan)} Plan` : 'Free Plan');
      } catch (_) {
        // silent fail
      }};fetchProfile();}, [user]);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('bearer_token');
        const res = await fetch('/api/messages/unread-count', {
          headers: {
            Authorization: `Bearer ${token ?? ''}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (_) {
        // silent fail
      }};fetchUnreadCount(); // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);return () => clearInterval(interval);
  }, [user]);

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const allLinksForMobile = [...navLinks, ...aboutUsLinks];
  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : '';
    const { error } = await authClient.signOut({
      fetchOptions: { headers: { Authorization: `Bearer ${token}` } }
    });
    if (!error?.code) {
      localStorage.removeItem('bearer_token');
      refetch?.();
      router.push('/');
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      isScrolled ?
      'border-border/80 bg-background/95 backdrop-blur-md shadow-lg' :
      'border-border bg-background'}`
      }>

      <div className="container flex h-16 items-center">
        {/* Left Section - Fixed Width */}
        <div className="flex items-center justify-start w-[240px]">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent -ml-2">Connect Capitals
            </motion.span>
          </Link>
        </div>
        
        {/* Center Section - Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 text-sm font-semibold">
          {navLinks.map((link) =>
          <motion.div key={link.name} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
              href={link.href}
              className="text-foreground transition-colors hover:text-primary relative group px-2 py-2 whitespace-nowrap">

                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          )}
          
          {/* About Us Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-foreground transition-colors hover:text-primary relative group px-2 py-2 whitespace-nowrap flex items-center gap-1 outline-none">
              About Us
              <ChevronDown className="h-3 w-3" />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {aboutUsLinks.map((link) =>
              <DropdownMenuItem key={link.name} asChild>
                  <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                    {link.name}
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        {/* Right Section - Fixed Width, matches left section */}
        <div className="flex items-center justify-end gap-2 w-[220px] -ml-4">
          {/* Notification Bell - only show when logged in */}
          {user &&
          <div className="hidden md:block">
              <NotificationDropdown />
            </div>
          }

          {/* Messages Icon with Badge - only show when logged in */}
          {user &&
          <Link href="/messages" className="relative hidden md:block">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Mail className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
                {unreadCount > 0 &&
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">

                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
              }
              </motion.div>
            </Link>
          }
          
          <DarkModeToggle />
          
          {/* Auth actions / Avatar with loading state */}
          {isPending ?
          // Loading skeleton while checking auth status
          <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div> :
          user ?
          // Authenticated state - show avatar dropdown
          <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || ''} alt={user.name || user.email || 'User'} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image || ''} alt={user.name || user.email || 'User'} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{user.name || user.email}</div>
                      <div className="text-xs text-muted-foreground">{planLabel} • {roleLabel}</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Messages
                    </span>
                    {unreadCount > 0 &&
                  <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                  }
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=saved-searches" className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" /> Saved Searches
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=billing" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=settings" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> :

          // Guest state - show Log In and Join Us buttons
          <div className="hidden md:flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-primary rounded-xl transition-all hover:bg-primary/10 whitespace-nowrap">

                  Log In
                </Link>
              </motion.div>
              <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(241, 143, 1, 0.40)" }}
              whileTap={{ scale: 0.95 }}>

                <Link
                href="/join-us"
                className="px-3 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl transition-all shadow-lg shadow-primary/20 whitespace-nowrap">

                  Join Us
                </Link>
              </motion.div>
            </div>
          }
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden rounded-md p-2 hover:bg-accent transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu">

            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>
      
      <AnimatePresence>
        {isMenuOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden border-t border-border bg-background">

            <div className="container pb-8 pt-4">
              <nav className="grid gap-4">
                {allLinksForMobile.map((link, index) =>
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}>

                    <Link
                  href={link.href}
                  className="text-base font-medium text-foreground hover:text-primary transition-colors block py-2"
                  onClick={() => setIsMenuOpen(false)}>

                      {link.name}
                    </Link>
                  </motion.div>
              )}
              </nav>
              <div className="mt-6 flex flex-col gap-4">
                {user ?
              <>
                    <Link
                  href="/messages"
                  className="w-full text-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all shadow-lg flex items-center justify-center gap-2"
                  onClick={() => setIsMenuOpen(false)}>
                      <MessageSquare className="h-4 w-4" />
                      Messages
                      {unreadCount > 0 &&
                  <Badge variant="destructive">{unreadCount}</Badge>
                  }
                    </Link>
                    <Link
                  href="/dashboard"
                  className="w-full text-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all shadow-lg shadow-primary/30"
                  onClick={() => setIsMenuOpen(false)}>
                      Go to Dashboard
                    </Link>
                    <button
                  onClick={() => {setIsMenuOpen(false);handleSignOut();}}
                  className="w-full text-center rounded-xl px-6 py-3 text-sm font-semibold text-destructive border border-destructive/40">
                      Sign out
                    </button>
                  </> :
              <>
                    <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.95 }}>

                      <Link
                    href="/login"
                    className="w-full text-center rounded-xl px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
                    onClick={() => setIsMenuOpen(false)}>

                        Log In
                      </Link>
                    </motion.div>
                    <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  whileTap={{ scale: 0.95 }}>

                      <Link
                    href="/join-us"
                    className="w-full text-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all shadow-lg shadow-primary/30"
                    onClick={() => setIsMenuOpen(false)}>

                        Join Us
                      </Link>
                    </motion.div>
                  </>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

};

export default NavigationHeader;