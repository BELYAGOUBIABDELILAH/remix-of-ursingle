import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';
import { useIsMobile } from '@/hooks/use-mobile';

export const DocsLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <DocsSidebar className="h-full" />
                </SheetContent>
              </Sheet>
            )}

            {/* Back to home */}
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Retour</span>
            </Link>
          </div>

          {/* Logo */}
          <Link to="/docs" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold hidden sm:inline">CityHealth Docs</span>
          </Link>

          {/* Placeholder for future search/actions */}
          <div className="w-20" />
        </div>
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
