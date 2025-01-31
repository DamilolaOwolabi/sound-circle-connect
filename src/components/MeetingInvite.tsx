import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share, Copy, Mail } from 'lucide-react';

interface MeetingInviteProps {
  meetingId: string;
  isHost: boolean;
}

const MeetingInvite = ({ meetingId, isHost }: MeetingInviteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const getMeetingLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/meeting?id=${meetingId}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getMeetingLink());
      toast({
        title: "Link Copied!",
        description: "Meeting link has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link. Please try again.",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address.",
      });
      return;
    }

    try {
      // TODO: Integrate with email service
      console.log('Sending invite to:', email, 'for meeting:', meetingId);
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${email}`,
      });
      setEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please try again.",
      });
    }
  };

  if (!isHost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share className="w-4 h-4" />
          Invite Participants
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Participants</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={getMeetingLink()}
              readOnly
              className="flex-1"
            />
            <Button onClick={handleCopyLink} size="icon">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingInvite;