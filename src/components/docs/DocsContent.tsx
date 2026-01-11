import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, ExternalLink, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { docsStructure, findDocPage, getAllDocPages } from '@/data/docsStructure';
import { cn } from '@/lib/utils';

// Simple markdown-like renderer for our doc content
const renderContent = (content: string) => {
  const lines = content.trim().split('\n');
  const elements: JSX.Element[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  
  const processLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-bold mb-6 text-foreground">{line.slice(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-foreground" id={line.slice(3).toLowerCase().replace(/\s+/g, '-')}>{line.slice(3)}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-medium mt-6 mb-3 text-foreground">{line.slice(4)}</h3>;
    }
    
    // Lists
    if (line.startsWith('- ')) {
      const content = line.slice(2);
      // Parse bold text
      const parsed = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return (
        <li 
          key={index} 
          className="ml-6 mb-2 text-muted-foreground list-disc"
          dangerouslySetInnerHTML={{ __html: parsed }}
        />
      );
    }
    
    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      const content = numberedMatch[2];
      const parsed = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return (
        <li 
          key={index} 
          className="ml-6 mb-2 text-muted-foreground list-decimal"
          dangerouslySetInnerHTML={{ __html: parsed }}
        />
      );
    }
    
    // Warning/Info blocks
    if (line.startsWith('⚠️')) {
      return (
        <div key={index} className="my-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400 font-medium">{line}</p>
        </div>
      );
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // Regular paragraph
    const parsed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm">$1</code>');
    
    return (
      <p 
        key={index} 
        className="mb-4 text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    );
  };
  
  // Process tables separately
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.startsWith('|') && line.endsWith('|')) {
      // Start of table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      // Parse table
      const rows = tableLines.filter(l => !l.includes('---'));
      if (rows.length > 0) {
        const headers = rows[0].split('|').filter(c => c.trim());
        const dataRows = rows.slice(1).map(r => r.split('|').filter(c => c.trim()));
        
        elements.push(
          <div key={`table-${i}`} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left p-3 font-medium text-foreground bg-muted/50">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-3 text-muted-foreground">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }
    
    elements.push(processLine(line, i));
    i++;
  }
  
  return elements;
};

export const DocsContent = () => {
  const { sectionId, pageId } = useParams();
  const navigate = useNavigate();
  
  const allPages = getAllDocPages();
  const currentPage = sectionId && pageId ? findDocPage(sectionId, pageId) : null;
  const currentSection = docsStructure.find(s => s.id === sectionId);
  
  // Find prev/next pages
  const currentIndex = allPages.findIndex(p => p.sectionId === sectionId && p.id === pageId);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  // Welcome page when no section/page selected
  if (!currentPage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-6"
              >
                <Home className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-4">Documentation CityHealth</h1>
              <p className="text-xl text-muted-foreground">
                Tout ce que vous devez savoir pour utiliser CityHealth
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {docsStructure.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={`/docs/${section.id}/${section.pages[0]?.id}`}
                    className="block p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-all hover:shadow-lg group"
                  >
                    <div className={cn("p-3 rounded-lg bg-background w-fit mb-4", section.color)}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {section.description}
                    </p>
                    <Badge variant="secondary">{section.pages.length} articles</Badge>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`${sectionId}-${pageId}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col"
    >
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              to={`/docs/${sectionId}/${currentSection?.pages[0]?.id}`}
              className="hover:text-foreground transition-colors"
            >
              {currentSection?.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{currentPage.title}</span>
          </nav>

          {/* Tags */}
          {currentPage.tags && currentPage.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {currentPage.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content */}
          <article className="prose prose-slate dark:prose-invert max-w-none">
            {renderContent(currentPage.content)}
          </article>

          <Separator className="my-8" />

          {/* Navigation */}
          <div className="flex justify-between items-center gap-4">
            {prevPage ? (
              <Link
                to={`/docs/${prevPage.sectionId}/${prevPage.id}`}
                className="flex items-center gap-2 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors flex-1"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Précédent</p>
                  <p className="font-medium">{prevPage.title}</p>
                </div>
              </Link>
            ) : <div className="flex-1" />}
            
            {nextPage ? (
              <Link
                to={`/docs/${nextPage.sectionId}/${nextPage.id}`}
                className="flex items-center gap-2 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors flex-1 justify-end text-right"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Suivant</p>
                  <p className="font-medium">{nextPage.title}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ) : <div className="flex-1" />}
          </div>

          {/* Feedback */}
          <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="font-medium mb-4">Cet article vous a-t-il été utile ?</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                Oui
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsDown className="h-4 w-4" />
                Non
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
