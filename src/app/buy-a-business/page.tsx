'use client';

import { useState, useRef, useEffect } from 'react';
import { TrendingUp, Shield, Users, Building2, Search, MapPin, DollarSign, ChevronDown, SlidersHorizontal, Grid3x3, List, Star, Heart, Award, CheckCircle2, BarChart3, Clock, Check, Loader2, X, BadgeCheck, Rocket, Zap, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface MarketplaceListing {
  id: number;
  title: string;
  location: string;
  category: string;
  price: number;
  annualRevenue: number;
  annualCashFlow: number;
  description: string;
  isFeatured: boolean;
  isVerified: boolean;
  employees: number;
  yearEstablished: number;
  createdAt: string;
  updatedAt: string;
}

export default function BuyABusinessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionLoading } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState('all');
  const [location, setLocation] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [revenueRange, setRevenueRange] = useState('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 40]);
  const [openGeo, setOpenGeo] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ 
    priceRange: 'all', 
    location: 'all', 
    industry: 'all', 
    revenueRange: 'all',
    ageRange: [0, 40] as [number, number]
  });
  const [sortBy, setSortBy] = useState('Newest');
  const [isApplying, setIsApplying] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [heroSearchInput, setHeroSearchInput] = useState('');
  
  // API state
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [allListings, setAllListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedListingIds, setSavedListingIds] = useState<Set<number>>(new Set());
  const [savingListingId, setSavingListingId] = useState<number | null>(null);

  // Map category slugs from homepage to industry values
  const mapCategoryToIndustry = (categorySlug: string): string => {
    const mapping: Record<string, string> = {
      'saas': 'saas',
      'mobile-apps': 'apps',
      'marketplaces': 'marketplaces',
      'ecommerce': 'ecommerce',
      'agencies': 'agency',
      'blogs': 'media',
      'digital-products': 'digital-products',
      'dropshipping': 'dropshipping',
      'fintech': 'fintech'
    };
    return mapping[categorySlug] || 'all';
  };

    // Read search query, category, and location from URL on mount
    useEffect(() => {
      const queryFromUrl = searchParams.get('q');
      const categoryFromUrl = searchParams.get('category');
      const locationFromUrl = searchParams.get('location');
      
      if (queryFromUrl) {
        setSearchQuery(queryFromUrl);
        setHeroSearchInput(queryFromUrl);
      }
      
      if (categoryFromUrl) {
        const mappedIndustry = mapCategoryToIndustry(categoryFromUrl);
        setIndustry(mappedIndustry);
        setAppliedFilters(prev => ({ ...prev, industry: mappedIndustry }));
      }

      if (locationFromUrl) {
        setLocation(locationFromUrl);
        setAppliedFilters(prev => ({ ...prev, location: locationFromUrl }));
      }
    }, [searchParams]);

    // Filter listings based on search query
    const filterListingsBySearch = (listingsToFilter: MarketplaceListing[], query: string) => {
      if (!query.trim()) return listingsToFilter;
      
      const lowerQuery = query.toLowerCase().trim();
      return listingsToFilter.filter(listing => {
        return (
          listing.title.toLowerCase().includes(lowerQuery) ||
          listing.description.toLowerCase().includes(lowerQuery) ||
          listing.category.toLowerCase().includes(lowerQuery) ||
          listing.location.toLowerCase().includes(lowerQuery)
        );
      });
    };

    // Filter listings based on location
    const filterListingsByLocation = (listingsToFilter: MarketplaceListing[], locationCode: string) => {
      if (!locationCode || locationCode === 'all' || locationCode === 'europe') return listingsToFilter;
      
      const targetCountry = findLocationLabel(locationCode).toLowerCase().trim();
      
      return listingsToFilter.filter(listing => {
        const listingLoc = listing.location.toLowerCase();
        // Handle "[Country] / Remote" format by splitting and taking the first part
        const countryPart = listingLoc.split('/')[0].trim();
        return countryPart === targetCountry || listingLoc === targetCountry;
      });
    };

    // Fetch listings from API
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (appliedFilters.priceRange !== 'all') {
          params.append('priceRange', appliedFilters.priceRange);
        }
        if (appliedFilters.location !== 'all') {
          params.append('location', appliedFilters.location);
        }
        if (appliedFilters.industry !== 'all') {
          params.append('industry', appliedFilters.industry);
        }
        if (appliedFilters.revenueRange !== 'all') {
          params.append('revenueRange', appliedFilters.revenueRange);
        }
        
        if (appliedFilters.ageRange[0] !== 0 || appliedFilters.ageRange[1] !== 40) {
          params.append('minAge', appliedFilters.ageRange[0].toString());
          params.append('maxAge', appliedFilters.ageRange[1].toString());
        }

        // Map sort option to API format
        let sortParam = 'newest';
        if (sortBy === 'Price: Low to High') sortParam = 'price-low';
        else if (sortBy === 'Price: High to Low') sortParam = 'price-high';
        else if (sortBy === 'Revenue: High to Low') sortParam = 'revenue-high';
        params.append('sort', sortParam);

        const response = await fetch(`/api/marketplace/listings?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch listings');
        
        const data = await response.json();
        
        // Transform "Global" or "Global / Remote" locations to a random country / Remote
        const countriesForRandom = [
          'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
          'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
          'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Poland',
          'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
          'Armenia'
        ];
        
        const transformedData = data.map((listing: MarketplaceListing) => {
          if (listing.location === 'Global' || listing.location === 'Global / Remote' || listing.location === 'Remote') {
            // Use listing.id as a seed for consistent randomization
            const index = listing.id % countriesForRandom.length;
            return { ...listing, location: `${countriesForRandom[index]} / Remote` };
          }
          return listing;
        });

        setAllListings(transformedData);
        
        // Apply location filter and then search filter
        let filteredData = filterListingsByLocation(transformedData, appliedFilters.location);
        filteredData = filterListingsBySearch(filteredData, searchQuery);
        setListings(filteredData);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    // Apply filters when searchQuery or allListings changes
    useEffect(() => {
      if (allListings.length > 0) {
        let filteredData = filterListingsByLocation(allListings, appliedFilters.location);
        filteredData = filterListingsBySearch(filteredData, searchQuery);
        setListings(filteredData);
      }
    }, [searchQuery, allListings, appliedFilters.location]);

  // Fetch user's saved listings
  const fetchSavedListings = async () => {
    if (!session?.user) return;
    
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/users/me/saved-listings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch saved listings');
      
      const data = await response.json();
      const savedIds = new Set<number>(data.map((item: any) => Number(item.listing.id)));
      setSavedListingIds(savedIds);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchListings();
  }, [appliedFilters, sortBy]);

  // Load saved listings when user logs in
  useEffect(() => {
    if (session?.user) {
      fetchSavedListings();
    } else {
      setSavedListingIds(new Set());
    }
  }, [session]);

  // Handle hero search submit
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(heroSearchInput);
    
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle save/unsave listing
  const handleSaveToggle = async (listingId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error('Please log in to save listings');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSavingListingId(listingId);
    const isSaved = savedListingIds.has(listingId);
    
    try {
      const token = localStorage.getItem('bearer_token');
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/marketplace/listings/${listingId}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to update saved listing');

      // Update local state
      const newSavedIds = new Set(savedListingIds);
      if (isSaved) {
        newSavedIds.delete(listingId);
        toast.success('Removed from watchlist');
      } else {
        newSavedIds.add(listingId);
        toast.success('Added to watchlist');
      }
      setSavedListingIds(newSavedIds);
    } catch (error) {
      console.error('Error toggling saved listing:', error);
      toast.error(isSaved ? 'Failed to remove from watchlist' : 'Failed to add to watchlist');
    } finally {
      setSavingListingId(null);
    }
  };

  const geoGroups: {label: string;options: {label: string;value: string;}[];}[] = [
  {
    label: 'General',
    options: [
    { label: 'Global', value: 'all' },
    { label: 'United States (US)', value: 'us' }]
  },
  {
    label: 'Europe',
    options: [
    { label: 'All Europe', value: 'europe' },
    { label: 'Austria', value: 'at' },
    { label: 'Belgium', value: 'be' },
    { label: 'Bulgaria', value: 'bg' },
    { label: 'Croatia', value: 'hr' },
    { label: 'Cyprus', value: 'cy' },
    { label: 'Czechia', value: 'cz' },
    { label: 'Denmark', value: 'dk' },
    { label: 'Estonia', value: 'ee' },
    { label: 'Finland', value: 'fi' },
    { label: 'France', value: 'fr' },
    { label: 'Germany', value: 'de' },
    { label: 'Greece', value: 'gr' },
    { label: 'Hungary', value: 'hu' },
    { label: 'Ireland', value: 'ie' },
    { label: 'Italy', value: 'it' },
    { label: 'Kosovo', value: 'xk' },
    { label: 'Latvia', value: 'lv' },
    { label: 'Lithuania', value: 'lt' },
    { label: 'Luxembourg', value: 'lu' },
    { label: 'Malta', value: 'mt' },
    { label: 'Poland', value: 'pl' },
    { label: 'Portugal', value: 'pt' },
    { label: 'Romania', value: 'ro' },
    { label: 'Serbia', value: 'rs' },
    { label: 'Slovakia', value: 'sk' },
    { label: 'Slovenia', value: 'si' },
      { label: 'Spain', value: 'es' },
      { label: 'Sweden', value: 'se' }]
    },
    {
      label: 'Other',
      options: [
      { label: 'Armenia', value: 'am' }]
    }];

  const findLocationLabel = (val: string) => {
    for (const group of geoGroups) {
      const found = group.options.find((o) => o.value === val);
      if (found) return found.label;
    }
    return 'Select market';
  };

    const formatPrice = (priceInCents: number) => {
      const priceInEuros = priceInCents / 100;
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(priceInEuros);
    };

  const handleApply = () => {
    setIsApplying(true);
    setAppliedFilters({ priceRange, location, industry, revenueRange, ageRange });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsApplying(false);
    }, 400);
  };

  const clearFilter = (key: 'priceRange' | 'location' | 'industry' | 'revenueRange' | 'ageRange') => {
    const next = { ...appliedFilters, [key]: key === 'ageRange' ? [0, 40] : 'all' } as typeof appliedFilters;
    setAppliedFilters(next);
    if (key === 'priceRange') setPriceRange('all');
    if (key === 'location') setLocation('all');
    if (key === 'industry') setIndustry('all');
    if (key === 'revenueRange') setRevenueRange('all');
    if (key === 'ageRange') setAgeRange([0, 40]);
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Professional Hero Section */}
      <section className="relative bg-primary py-20 border-b border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-white !whitespace-pre-line">
              Discover Your Next Business Opportunity
            </h1>
            <p className="text-xl text-white/90 mb-10 !whitespace-pre-line">Browse verified online businesses
            </p>

            {/* Professional Search Bar */}
            <form onSubmit={handleHeroSearch} className="bg-white rounded-lg shadow-xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="Search by name, industry, or keyword…"
                    className="w-full pl-12 pr-4 py-3.5 rounded-md border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
                <div className="relative min-w-[220px]">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Geo market (Global, NA, EU, APAC)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-md border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
                <button type="submit" className="px-8 py-3.5 bg-accent text-white rounded-md font-semibold hover:bg-accent/90 transition-colors shadow-sm">
                  Search
                </button>
              </div>
            </form>
            
            {/* Show active search query */}
            {searchQuery && (
              <div className="mt-4 text-white/90 text-sm">
                Searching for: <span className="font-semibold">"{searchQuery}"</span>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setHeroSearchInput('');
                  }}
                  className="ml-2 underline hover:text-white">
                  Clear search
                </button>
              </div>
            )}
          </motion.div>

          {/* Professional Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {[
                  { label: 'Active Listings', value: 'Verified', icon: BadgeCheck },
                  { label: 'Digital Industries', value: 'Growing', icon: Rocket },
                  { label: 'EU Marketplace', value: 'Fastest', icon: Zap },
                  { label: 'Expert Analysis', value: '6 Years', icon: GraduationCap }].
              map((stat, index) =>
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20">
                  <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </motion.div>
              )}
            </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Professional Sidebar Filters */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-80 shrink-0">
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm sticky top-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground bg-background text-sm">
                    <option value="all">All prices</option>
                    <option value="0-100k">Under $100k</option>
                    <option value="100k-250k">$100k — $250k</option>
                    <option value="250k-500k">$250k — $500k</option>
                    <option value="500k-1m">$500k — $1M</option>
                    <option value="1m+">Over $1M</option>
                  </select>
                </div>

                {/* Region */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-2 !whitespace-pre-line">Location
                  </label>
                  <Popover open={openGeo} onOpenChange={setOpenGeo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGeo}
                        className="w-full justify-between px-4 py-2.5 text-foreground bg-background border-input">
                        <span className="flex items-center gap-2 truncate">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {findLocationLabel(location)}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                      <Command>
                        <CommandInput placeholder="Search markets..." className="text-sm" />
                        <CommandEmpty className="py-6 text-sm text-muted-foreground">No market found.</CommandEmpty>
                        <CommandList>
                          {geoGroups.map((group) =>
                          <CommandGroup key={group.label} heading={group.label}>
                              {group.options.map((opt) =>
                            <CommandItem
                              key={opt.value}
                              value={opt.label}
                              onSelect={() => {
                                setLocation(opt.value);
                                setOpenGeo(false);
                              }}
                              className="text-sm">
                                  <Check
                                className={`mr-2 h-4 w-4 ${location === opt.value ? 'opacity-100' : 'opacity-0'}`} />
                                  {opt.label}
                                </CommandItem>
                            )}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Industry */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground bg-background text-sm">
                    <option value="all">All online categories</option>
                    <option value="saas">SaaS Businesses</option>
                    <option value="apps">Mobile Apps</option>
                    <option value="marketplaces">Marketplaces</option>
                    <option value="ecommerce">E-commerce Stores / Brands</option>
                    <option value="agency">Digital Agencies</option>
                    <option value="media">Online Media & Blogs</option>
                    <option value="digital-products">Digital Products Businesses</option>
                    <option value="dropshipping">Dropshipping Businesses</option>
                    <option value="fintech">Fintech / Digital Tools</option>
                  </select>
                </div>

                  {/* Revenue Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Annual Revenue
                    </label>
                    <select
                      value={revenueRange}
                      onChange={(e) => setRevenueRange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground bg-background text-sm">
                      <option value="all">All revenue</option>
                      <option value="0-250k">Under €250k</option>
                      <option value="250k-500k">€250k — €500k</option>
                      <option value="500k-1m">€500k — €1M</option>
                      <option value="1m+">Over €1M</option>
                    </select>
                  </div>

                  {/* Age Filter */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Business Age (Years)
                      </label>
                      <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {ageRange[0]} - {ageRange[1]}
                      </span>
                    </div>
                    <div className="px-3">
                      <Slider
                        defaultValue={[0, 40]}
                        max={40}
                        min={0}
                        step={1}
                        value={[ageRange[0], ageRange[1]]}
                        onValueChange={(value) => setAgeRange(value as [number, number])}
                        className="my-6"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground/60 mt-1">
                      <span>Newborn</span>
                      <span>40+ Years</span>
                    </div>
                  </div>

                <button
                  className="w-full py-2.5 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-sm mb-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleApply}
                  disabled={isApplying}>
                  <span className="inline-flex items-center gap-2 justify-center">
                    {isApplying && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isApplying ? 'Applying…' : 'Apply filters'}
                  </span>
                </button>

                  <button
                    className="w-full py-2.5 border border-border text-foreground rounded-md font-medium hover:bg-muted transition-colors"
                    onClick={() => {
                      setPriceRange('all');
                      setLocation('all');
                      setIndustry('all');
                      setRevenueRange('all');
                      setAgeRange([0, 40]);
                      setAppliedFilters({ 
                        priceRange: 'all', 
                        location: 'all', 
                        industry: 'all', 
                        revenueRange: 'all',
                        ageRange: [0, 40]
                      });
                      setSortBy('Newest');
                    }}>
                    Reset filters
                </button>
              </div>
            </motion.aside>

            {/* Listings Area */}
            <div className="flex-1">
              
              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {isLoading ? 'Loading...' : `${listings.length} online businesses available`}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    All verified and ready for due diligence
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ?
                      'bg-white shadow-sm text-primary' :
                      'text-muted-foreground hover:text-foreground'}`}>
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ?
                      'bg-white shadow-sm text-primary' :
                      'text-muted-foreground hover:text-foreground'}`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-md border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground bg-background text-sm">
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Revenue: High to Low</option>
                  </select>
                </div>
              </motion.div>

{/* Active filter chips */}
                {(appliedFilters.priceRange !== 'all' || appliedFilters.location !== 'all' || appliedFilters.industry !== 'all' || appliedFilters.revenueRange !== 'all' || appliedFilters.ageRange[0] !== 0 || appliedFilters.ageRange[1] !== 40) &&
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {appliedFilters.priceRange !== 'all' &&
                  <span className="inline-flex items-center gap-1 bg-muted text-sm rounded-full px-3 py-1">
                        Price: {appliedFilters.priceRange}
                        <button onClick={() => clearFilter('priceRange')} className="ml-1 hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                  }
                    {appliedFilters.location !== 'all' &&
                  <span className="inline-flex items-center gap-1 bg-muted text-sm rounded-full px-3 py-1">
                        Location: {findLocationLabel(appliedFilters.location)}
                        <button onClick={() => clearFilter('location')} className="ml-1 hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                  }
                    {appliedFilters.industry !== 'all' &&
                  <span className="inline-flex items-center gap-1 bg-muted text-sm rounded-full px-3 py-1">
                        Industry: {appliedFilters.industry}
                        <button onClick={() => clearFilter('industry')} className="ml-1 hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                  }
                    {appliedFilters.revenueRange !== 'all' &&
                  <span className="inline-flex items-center gap-1 bg-muted text-sm rounded-full px-3 py-1">
                        Revenue: {appliedFilters.revenueRange}
                        <button onClick={() => clearFilter('revenueRange')} className="ml-1 hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                  }
                    {(appliedFilters.ageRange[0] !== 0 || appliedFilters.ageRange[1] !== 40) &&
                  <span className="inline-flex items-center gap-1 bg-muted text-sm rounded-full px-3 py-1">
                        Age: {appliedFilters.ageRange[0]} - {appliedFilters.ageRange[1]} years
                        <button onClick={() => clearFilter('ageRange')} className="ml-1 hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                  }
                    <button
                    onClick={() => {
                      setAppliedFilters({ 
                        priceRange: 'all', 
                        location: 'all', 
                        industry: 'all', 
                        revenueRange: 'all',
                        ageRange: [0, 40]
                      });
                      setPriceRange('all');
                      setLocation('all');
                      setIndustry('all');
                      setRevenueRange('all');
                      setAgeRange([0, 40]);
                    }}
                    className="text-sm underline text-muted-foreground hover:text-foreground">
                      Clear all
                    </button>
                  </div>
                }

              {/* Professional Listings Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No listings found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
                </div>
              ) : (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={
                viewMode === 'grid' ?
                'grid sm:grid-cols-2 xl:grid-cols-3 gap-6' :
                'space-y-4'
                }>
                {listings.map((listing, index) =>
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                    {/* Professional Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden border-b border-border">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                      
                      {/* Professional Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {listing.isFeatured &&
                      <span className="px-2.5 py-1 bg-accent text-white text-xs font-semibold rounded flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                      }
                        {listing.isVerified &&
                      <span className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                      }
                      </div>

                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => handleSaveToggle(listing.id, e)}
                        disabled={savingListingId === listing.id}
                        className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                          savedListingIds.has(listing.id)
                            ? 'bg-accent text-white'
                            : 'bg-white hover:bg-accent hover:text-white'
                        }`}>
                        {savingListingId === listing.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={`w-4 h-4 ${savedListingIds.has(listing.id) ? 'fill-current' : ''}`} />
                        )}
                      </button>
                    </div>

                    {/* Professional Content */}
                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {listing.location}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {listing.employees} employees
                          </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date().getFullYear() - listing.yearEstablished} years old
                            </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>

                      <div className="space-y-2 mb-4 pb-4 border-b border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Asking Price</span>
                          <span className="font-bold text-primary text-lg">
                            {formatPrice(listing.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Annual Revenue</span>
                          <span className="font-semibold text-foreground">
                            {formatPrice(listing.annualRevenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Annual Cash Flow</span>
                          <span className="font-semibold text-foreground">
                            {formatPrice(listing.annualCashFlow)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                          {listing.category}
                        </span>
                      </div>

                      <Link
                      href={`/listing/${listing.id}`}
                      className="block w-full py-2.5 bg-primary text-white text-center rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
              )}

              {/* Professional Pagination */}
              {!isLoading && listings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-2 mt-12">
                <button className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors font-medium text-sm">
                  Previous
                </button>
                {[1, 2, 3, 4, 5].map((page) =>
                <button
                  key={page}
                  className={`w-10 h-10 rounded-md font-semibold text-sm transition-colors ${
                  page === 1 ?
                  'bg-primary text-white shadow-sm' :
                  'border border-border hover:bg-muted'}`}>
                    {page}
                  </button>
                )}
                <button className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors font-medium text-sm">
                  Next
                </button>
              </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Value Proposition Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Why Our Marketplace?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional brokerage and verified online opportunities for serious buyers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: 'Digital M&A expertise',
                  description: 'We support business buyers with technical due diligence, negotiations, and the secure transfer of all digital assets – from domains and platforms to advertising and app store accounts.'
                },
                {
                  icon: BarChart3,
                  title: 'Deep analytics',
                  description: 'Conducting a mandatory consultation with the company’s CEO and key team members to prepare a detailed analysis and report on the business structure.'
                },
                  {
                    icon: Award,
                    title: 'Buyer-Side Digital Support',
                    description: 'We support business buyers with technical due diligence, negotiations, and the secure transfer of all digital assets – from domains and platforms to advertising and app store accounts.'
                  }].
            map((feature, index) =>
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-8 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Professional CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to start your search?
            </h2>
            <p className="text-xl mb-10 text-white/90">
              Join thousands of buyers who found the ideal online business through our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/join-us"
                className="inline-block px-8 py-4 bg-accent text-white rounded-md font-semibold shadow-lg hover:bg-accent/90 transition-colors">
                Create a free account
              </Link>
              <Link
                href="/reach-us"
                className="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-md font-semibold hover:bg-white/20 transition-colors">
                Schedule a consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
  </div>
  );
}
