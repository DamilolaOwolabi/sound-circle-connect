import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
    <div className="w-64 bg-card rounded-lg shadow-lg p-4">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <User className="w-4 h-4" />
        Participants ({participants.length})
      </h2>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
            >
              <span>{participant.name}</span>
              <span className="text-xs text-muted-foreground">
                {participant.isAudioOn ? 'Speaking' : 'Muted'}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ParticipantsList;