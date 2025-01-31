import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Room {
  id: string;
  name: string;
  participants: string[];
}

interface BreakoutRoomsProps {
  participants: { id: string; name: string }[];
  onCreateRoom: (roomName: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onAssignParticipant: (roomId: string, participantId: string) => void;
}

const BreakoutRooms = ({
  participants,
  onCreateRoom,
  onDeleteRoom,
  onAssignParticipant
}: BreakoutRoomsProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a room name.",
      });
      return;
    }

    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: newRoomName,
      participants: []
    };

    setRooms([...rooms, newRoom]);
    setNewRoomName('');
    onCreateRoom(newRoomName);
    
    toast({
      title: "Room Created",
      description: `Breakout room "${newRoomName}" has been created.`,
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
    onDeleteRoom(roomId);
    
    toast({
      title: "Room Deleted",
      description: "The breakout room has been removed.",
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <h3 className="text-lg font-semibold">Breakout Rooms</h3>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <Button onClick={handleCreateRoom}>
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <span className="font-medium">{room.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {room.participants.length} participants
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BreakoutRooms;