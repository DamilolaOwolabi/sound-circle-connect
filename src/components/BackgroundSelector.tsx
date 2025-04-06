
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface BackgroundOption {
  id: string;
  type: 'color' | 'image' | 'custom';
  value: string;
  thumbnail?: string;
}

interface BackgroundSelectorProps {
  currentBackground: BackgroundOption;
  backgrounds: BackgroundOption[];
  onBackgroundChange: (background: BackgroundOption) => void;
}

const BackgroundSelector = ({ 
  currentBackground, 
  backgrounds, 
  onBackgroundChange 
}: BackgroundSelectorProps) => {
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a valid image file.",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newBackground: BackgroundOption = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        value: dataUrl,
        thumbnail: dataUrl
      };
      
      setCustomBackgrounds(prev => [...prev, newBackground]);
      onBackgroundChange(newBackground);
      
      toast({
        title: "Background uploaded",
        description: "Your custom background has been added.",
      });
    };
    reader.readAsDataURL(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveCustomBackground = (backgroundId: string) => {
    setCustomBackgrounds(prev => prev.filter(bg => bg.id !== backgroundId));
    
    // If the removed background was active, switch to default
    if (currentBackground.id === backgroundId) {
      onBackgroundChange(backgrounds[0]);
    }
    
    toast({
      title: "Background removed",
      description: "Your custom background has been removed.",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
        >
          <Image className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <Tabs defaultValue="gallery">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery" className="mt-2">
            <div className="grid grid-cols-3 gap-2">
              {backgrounds.filter(bg => bg.type === 'image').map((bg) => (
                <button
                  key={bg.id}
                  className={`relative rounded-md overflow-hidden h-16 border-2 ${
                    currentBackground.id === bg.id
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted'
                  }`}
                  onClick={() => onBackgroundChange(bg)}
                >
                  <img 
                    src={bg.value} 
                    alt={bg.id} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="mt-2">
            <div className="grid grid-cols-4 gap-2">
              {backgrounds.filter(bg => bg.type === 'color').map((bg) => (
                <button
                  key={bg.id}
                  className={`relative rounded-md overflow-hidden h-12 border-2 ${
                    currentBackground.id === bg.id
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted'
                  }`}
                  style={{ backgroundColor: bg.value }}
                  onClick={() => onBackgroundChange(bg)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-2 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {customBackgrounds.map((bg) => (
                <div key={bg.id} className="relative group">
                  <button
                    className={`rounded-md overflow-hidden h-16 w-full border-2 ${
                      currentBackground.id === bg.id
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted'
                    }`}
                    onClick={() => onBackgroundChange(bg)}
                  >
                    <img 
                      src={bg.value} 
                      alt={`custom-${bg.id}`}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveCustomBackground(bg.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 5MB. Supported formats: JPG, PNG, WebP.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default BackgroundSelector;
