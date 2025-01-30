import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  UserX, 
  MicOff, 
  VideoOff,
  Users,
  Shield
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
}

interface HostControlsProps {
  participants: Participant[];
  onMuteAll: () => void;
  onDisableAllVideos: () => void;
  onRemoveParticipant: (id: string) => void;
}

const HostControls = ({
  participants,
  onMuteAll,
  onDisableAllVideos,
  onRemoveParticipant
}: HostControlsProps) => {
  const handleMuteAll = () => {
    onMuteAll();
    toast({
      title: "All Participants Muted",
      description: "You have muted all participants in the meeting.",
    });
  };

  const handleDisableAllVideos = () => {
    onDisableAllVideos();
    toast({
      title: "All Videos Disabled",
      description: "You have disabled video for all participants.",
    });
  };

  const handleRemoveParticipant = (id: string, name: string) => {
    onRemoveParticipant(id);
    toast({
      title: "Participant Removed",
      description: `${name} has been removed from the meeting.`,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Host Controls
        </h3>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            {participants.length} participants
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleMuteAll}
        >
          <MicOff className="w-4 h-4 mr-2" />
          Mute All Participants
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleDisableAllVideos}
        >
          <VideoOff className="w-4 h-4 mr-2" />
          Disable All Videos
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Participant Management</h4>
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-lg border"
          >
            <span className="text-sm">{participant.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveParticipant(participant.id, participant.name)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <UserX className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostControls;