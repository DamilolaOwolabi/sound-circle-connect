
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
    <div className="bg-card rounded-lg shadow-lg p-4 h-full">
      <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <User className="w-4 h-4" />
        Participants ({participants.length})
      </h2>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
            >
              <span className="font-medium">{participant.name}</span>
              <div className="flex items-center gap-2">
                {participant.isAudioOn ? 
                  <Mic className="w-4 h-4 text-green-500" /> : 
                  <MicOff className="w-4 h-4 text-muted-foreground" />
                }
                {participant.isVideoOn !== undefined && (
                  participant.isVideoOn ? 
                    <Video className="w-4 h-4 text-green-500" /> : 
                    <VideoOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ParticipantsList;
