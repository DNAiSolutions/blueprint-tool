import { AppLayout } from '@/components/layout/AppLayout';
import { GraduationCap, PlayCircle, FileText, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  {
    title: 'Getting Started',
    description: 'Learn how to use your dashboard and manage your services',
    icon: GraduationCap,
    items: [
      { title: 'How to approve content in your portal', type: 'video' },
      { title: 'Understanding your health score', type: 'article' },
      { title: 'Connecting your social media accounts', type: 'guide' },
    ],
  },
  {
    title: 'Marketing Tips',
    description: 'Strategies to grow your business alongside our services',
    icon: Lightbulb,
    items: [
      { title: 'Why consistency beats perfection in content', type: 'article' },
      { title: 'The power of before-and-after posts', type: 'video' },
      { title: 'How to leverage reviews for more leads', type: 'article' },
    ],
  },
  {
    title: 'Your Systems',
    description: 'How your automations and tools work behind the scenes',
    icon: FileText,
    items: [
      { title: 'How your booking calendar works', type: 'guide' },
      { title: 'Understanding your lead pipeline', type: 'video' },
      { title: 'What happens when a new lead comes in', type: 'article' },
    ],
  },
];

export default function PortalEducation() {
  return (
    <AppLayout>
      <header className="flex items-center h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Education</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        {categories.map(cat => {
          const CatIcon = cat.icon;
          return (
            <div key={cat.title}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">{cat.title}</h3>
                <span className="text-xs text-muted-foreground">— {cat.description}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {cat.items.map((item, i) => (
                  <button
                    key={i}
                    className="group rounded-lg bg-card border border-border/50 p-4 text-left hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {item.type === 'video' ? (
                        <PlayCircle className="h-4 w-4 text-accent/60" />
                      ) : (
                        <FileText className="h-4 w-4 text-accent/60" />
                      )}
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.type}</span>
                    </div>
                    <h4 className="text-xs font-medium group-hover:text-accent transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/50 group-hover:text-accent/50 transition-colors">
                      <span>Read more</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
