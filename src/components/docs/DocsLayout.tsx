import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, BookOpen, Search, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';
import { useIsMobile } from '@/hooks/use-mobile';

export const DocsLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Professional Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile menu button */}
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <DocsSidebar className="h-full" onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
            )}

            {/* Back to home */}
            <Link 
              to="/" 
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm hidden sm:inline">Accueil</span>
            </Link>

            <div className="h-6 w-px bg-border hidden md:block" />

            {/* Logo */}
            <Link to="/docs" className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25"
              >
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">Documentation</h1>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    v1.0
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">CityHealth</p>
              </div>
            </Link>
          </div>

          {/* Center: Search (desktop) */}
          {!isMobile && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Rechercher dans la documentation..."
                  className="pl-10 pr-20 bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded border text-muted-foreground">
                    Ctrl
                  </kbd>
                  <kbd className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded border text-muted-foreground">
                    K
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Version badge (mobile) */}
            {isMobile && (
              <Badge variant="outline" className="text-[10px]">v1.0</Badge>
            )}
            
            {/* AI Assistant indicator */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden lg:inline">IA Active</span>
            </motion.div>

            {/* External link */}
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {isMobile && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-muted/50 border-transparent"
              />
            </div>
          </div>
        )}
      </motion.header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        {!isMobile && (
          <DocsSidebar className="sticky top-16 h-[calc(100vh-4rem)]" />
        )}

        {/* Content area */}
        <DocsContent />
      </div>
    </div>
  );
};
