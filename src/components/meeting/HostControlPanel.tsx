import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  UserX, 
  MicOff, 
  VideoOff,
  Users,
  Shield,
  UserPlus
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
}

interface HostControlPanelProps {
  participants: Participant[];
  onMuteAll: () => void;
  onDisableAllVideos: () => void;
  onRemoveParticipant: (id: string) => void;
  onInviteParticipant: () => void;
}

const HostControlPanel = ({
  participants,
  onMuteAll,
  onDisableAllVideos,
  onRemoveParticipant,
  onInviteParticipant
}: HostControlPanelProps) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <h3 className="text-lg font-semibold">Host Controls</h3>
        </div>
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
          className="justify-start"
          onClick={onMuteAll}
        >
          <MicOff className="w-4 h-4 mr-2" />
          Mute All
        </Button>

        <Button
          variant="outline"
          className="justify-start"
          onClick={onDisableAllVideos}
        >
          <VideoOff className="w-4 h-4 mr-2" />
          Disable All Videos
        </Button>

        <Button
          variant="outline"
          className="justify-start"
          onClick={onInviteParticipant}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Participants
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Participants</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <div>
                  <span className="text-sm font-medium">{participant.name}</span>
                  <div className="flex gap-2 mt-1">
                    {!participant.isAudioOn && (
                      <MicOff className="w-3 h-3 text-muted-foreground" />
                    )}
                    {!participant.isVideoOn && (
                      <VideoOff className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <UserX className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HostControlPanel;