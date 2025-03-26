
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Users, LogIn } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ResponsiveImage from '@/components/ResponsiveImage';

const PreMeeting = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("host");
  
  // Host meeting state
  const [hostMeetingName, setHostMeetingName] = useState("");
  const [hostPassword, setHostPassword] = useState("");
  const [generatedMeetingId, setGeneratedMeetingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  
  // Join meeting state
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const handleCreateMeeting = () => {
    // Validate inputs
    if (!hostMeetingName.trim()) {
      toast({
        title: "Meeting name required",
        description: "Please enter a name for your meeting",
        variant: "destructive",
      });
      return;
    }

    // Generate a unique meeting ID
    const newMeetingId = crypto.randomUUID().substring(0, 8);
    setGeneratedMeetingId(newMeetingId);
    
    toast({
      title: "Meeting created!",
      description: "Your meeting has been created successfully.",
    });
  };

  const handleCopyLink = () => {
    if (!generatedMeetingId) return;
    
    const meetingLink = `${window.location.origin}/meeting?id=${generatedMeetingId}${hostPassword ? `&password=${hostPassword}` : ''}`;
    navigator.clipboard.writeText(meetingLink)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Meeting link has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy the link manually",
          variant: "destructive",
        });
      });
  };

  const handleSendInvite = () => {
    if (!generatedMeetingId || !email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the invite",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would connect to an email service
    toast({
      title: "Invitation sent!",
      description: `Invitation has been sent to ${email}`,
    });
    setEmail("");
  };

  const handleJoinMeeting = () => {
    if (!joinMeetingId.trim()) {
      toast({
        title: "Meeting ID required",
        description: "Please enter a meeting ID to join",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, you would validate the meeting ID/password against a database
    // For this demo, we'll simply redirect to the meeting page
    navigate(`/meeting?id=${joinMeetingId}${joinPassword ? `&password=${joinPassword}` : ''}`, { 
      state: { isHost: false, meetingId: joinMeetingId } 
    });
  };

  const handleHostMeeting = () => {
    if (!generatedMeetingId) return;
    
    navigate('/meeting', { 
      state: { 
        isHost: true, 
        meetingId: generatedMeetingId,
        meetingName: hostMeetingName,
        password: hostPassword 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header with Logo */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <ResponsiveImage 
              src="/lovable-uploads/efac273c-f666-48c6-aa08-e42558a7b939.png" 
              alt="SoundRadius Logo" 
              className="w-48 h-auto mb-4"
              priority={true}
            />
            <h1 className="text-4xl font-bold text-primary">Sound Radius</h1>
          </div>
          <p className="text-muted-foreground">
            Connect and collaborate with natural, spatial audio conversations
          </p>
        </div>

        {/* Tabs for Host/Join */}
        <Tabs defaultValue="host" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="host" className="flex items-center gap-2">
              <Users size={18} />
              <span>Host a Meeting</span>
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-2">
              <LogIn size={18} />
              <span>Join a Meeting</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Host Meeting Tab */}
          <TabsContent value="host">
            <Card>
              <CardHeader>
                <CardTitle>Host a New Meeting</CardTitle>
                <CardDescription>
                  Create a meeting and invite others to join
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedMeetingId ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-name">Meeting Name</Label>
                      <Input 
                        id="meeting-name" 
                        placeholder="Team Standup"
                        value={hostMeetingName}
                        onChange={(e) => setHostMeetingName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password (Optional)</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Meeting password"
                        value={hostPassword}
                        onChange={(e) => setHostPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleCreateMeeting}
                    >
                      Create Meeting
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-muted rounded-md">
                      <p className="font-medium">Meeting ID:</p>
                      <p className="text-xl font-mono mt-1">{generatedMeetingId}</p>
                      {hostPassword && (
                        <>
                          <p className="font-medium mt-2">Password:</p>
                          <p className="text-xl font-mono mt-1">{hostPassword}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="outline" 
                        onClick={handleCopyLink}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleHostMeeting}
                      >
                        Start Meeting
                      </Button>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="invite-email">Invite via Email</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="invite-email" 
                          type="email" 
                          placeholder="colleague@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button 
                          variant="secondary"
                          onClick={handleSendInvite}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Join Meeting Tab */}
          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join an Existing Meeting</CardTitle>
                <CardDescription>
                  Enter the meeting details to connect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-id">Meeting ID</Label>
                  <Input 
                    id="meeting-id" 
                    placeholder="Enter meeting ID"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-password">Password (if required)</Label>
                  <Input 
                    id="join-password" 
                    type="password" 
                    placeholder="Meeting password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleJoinMeeting}
                >
                  Join Meeting
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PreMeeting;
