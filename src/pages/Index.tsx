
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Video, Users } from "lucide-react";
import RadiusIcon from '@/components/RadiusIcon';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [radiusMode, setRadiusMode] = React.useState(false);
  const navigate = useNavigate();

  console.log('Radius Mode:', radiusMode);

  const handleNavigateToPreMeeting = () => {
    console.log('Navigating to pre-meeting page');
    navigate('/pre-meeting');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header with Logo */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <img 
              src="/lovable-uploads/efac273c-f666-48c6-aa08-e42558a7b939.png" 
              alt="SoundRadius Logo" 
              className="w-48 h-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-primary">Sound Radius</h1>
          </div>
          <p className="text-muted-foreground">
            Connect and collaborate with natural, spatial audio conversations
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button 
            size="lg" 
            className="h-24 text-lg bg-[#9b87f5] hover:bg-[#8b77e5]"
            onClick={handleNavigateToPreMeeting}
          >
            <Video className="mr-2 h-5 w-5" />
            Start or Join Meeting
          </Button>
          <Button 
            size="lg" 
            className="h-24 text-lg bg-[#D946EF] hover:bg-[#C936DF]"
            variant="secondary"
            onClick={() => {
              toast({
                title: "View Past Meetings",
                description: "This feature is coming soon!",
              });
            }}
          >
            <Users className="mr-2 h-5 w-5" />
            View Past Meetings
          </Button>
        </div>

        {/* Settings and Radius Mode */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => console.log('Settings clicked')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">Settings</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Radius Mode</span>
            <Switch
              checked={radiusMode}
              onCheckedChange={setRadiusMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
