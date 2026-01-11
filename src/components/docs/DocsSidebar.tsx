import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { docsStructure, searchDocs, DocSection } from '@/data/docsStructure';
import { cn } from '@/lib/utils';

interface DocsSidebarProps {
  className?: string;
}

export const DocsSidebar = ({ className }: DocsSidebarProps) => {
  const { sectionId, pageId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = searchQuery.length >= 2 ? searchDocs(searchQuery) : [];
  const showSearchResults = searchQuery.length >= 2;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-72 border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col",
        className
      )}
    >
      {/* Search */}
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la doc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Search Results */}
          {showSearchResults ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((result) => (
                <Link
                  key={`${result.sectionId}-${result.id}`}
                  to={`/docs/${result.sectionId}/${result.id}`}
                  onClick={() => setSearchQuery('')}
                  className="block p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm font-medium">{result.title}</p>
                  <p className="text-xs text-muted-foreground">{result.sectionTitle}</p>
                </Link>
              ))}
              {searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun résultat trouvé
                </p>
              )}
            </div>
          ) : (
            /* Navigation Tree */
            <Accordion
              type="multiple"
              defaultValue={sectionId ? [sectionId] : ['getting-started']}
              className="space-y-2"
            >
              {docsStructure.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-none"
                >
                  <AccordionTrigger className="py-2 px-3 rounded-lg hover:bg-accent/50 hover:no-underline [&[data-state=open]]:bg-accent/30">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-md bg-background", section.color)}>
                        <section.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{section.title}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {section.pages.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <ul className="space-y-1 ml-6 border-l border-border/50 pl-4">
                      {section.pages.map((page) => {
                        const isActive = sectionId === section.id && pageId === page.id;
                        return (
                          <li key={page.id}>
                            <Link
                              to={`/docs/${section.id}/${page.id}`}
                              className={cn(
                                "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-all",
                                isActive
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              )}
                            >
                              {page.icon && <page.icon className="h-3.5 w-3.5" />}
                              <span className="truncate">{page.title}</span>
                              {isActive && (
                                <ChevronRight className="h-3 w-3 ml-auto" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground text-center">
          <p>Documentation CityHealth</p>
          <p className="mt-1">Version 1.0</p>
        </div>
      </div>
    </motion.aside>
  );
};
