import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Paintbrush } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const backgrounds = [
  {
    id: 'blur',
    name: 'Blur',
    type: 'effect',
  },
  {
    id: 'office',
    name: 'Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
  },
  {
    id: 'nature',
    name: 'Nature',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  },
  {
    id: 'library',
    name: 'Library',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
  },
];

interface BackgroundSelectorProps {
  onSelectBackground: (background: { id: string; url?: string; type?: string }) => void;
}

const BackgroundSelector = ({ onSelectBackground }: BackgroundSelectorProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onSelectBackground({ id: 'custom', url });
        toast({
          title: "Background Updated",
          description: "Custom background has been applied.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload an image file.",
        });
      }
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Paintbrush className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Choose Background</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              className="relative aspect-video overflow-hidden rounded-lg border-2 border-muted hover:border-primary transition-colors"
              onClick={() => {
                onSelectBackground(bg);
                toast({
                  title: "Background Updated",
                  description: `${bg.name} background has been applied.`,
                });
              }}
            >
              {bg.url ? (
                <img
                  src={bg.url}
                  alt={bg.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {bg.name}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            id="background-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('background-upload')?.click()}
          >
            Upload Custom Background
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BackgroundSelector;