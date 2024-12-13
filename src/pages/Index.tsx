import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Video, Users } from "lucide-react";
import RadiusIcon from '@/components/RadiusIcon';

const Index = () => {
  const [radiusMode, setRadiusMode] = React.useState(false);

  console.log('Radius Mode:', radiusMode);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-primary">Sound Radius</h1>
            <RadiusIcon />
          </div>
          <p className="text-muted-foreground">
            Connect and collaborate with natural, spatial audio conversations
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button 
            size="lg" 
            className="h-24 text-lg"
            onClick={() => console.log('Host meeting clicked')}
          >
            <Video className="mr-2 h-5 w-5" />
            Host a Meeting
          </Button>
          <Button 
            size="lg" 
            className="h-24 text-lg"
            variant="secondary"
            onClick={() => console.log('Join meeting clicked')}
          >
            <Users className="mr-2 h-5 w-5" />
            Join a Meeting
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