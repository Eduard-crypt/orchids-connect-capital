"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ArrowLeft, Paperclip, X, File, Download, User, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: number;
  threadId: number;
  senderId: string;
  messageBody: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  attachments: Attachment[];
}

interface Attachment {
  id: number;
  messageId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

interface Thread {
  id: number;
  listingId: number;
  subject: string;
  lastMessageAt: string | null;
  listing: {
    id: number;
    title: string;
    status: string;
    askingPrice: number | null;
    businessType: string | null;
  } | null;
  buyer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  seller: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  messages: Message[];
}

interface PendingAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export default function ThreadChatContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const threadId = params.id as string;
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=' + encodeURIComponent(`/messages/${threadId}`));
    }
  }, [session, isPending, router, threadId]);

  useEffect(() => {
    if (session?.user) {
      fetchThread();
    }
  }, [session, threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThread = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/messages/threads/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('You do not have access to this conversation');
          router.push('/messages');
          return;
        }
        throw new Error('Failed to fetch thread');
      }

      const data = await response.json();
      setThread(data);
    } catch (error) {
      console.error('Error fetching thread:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setIsUploading(true);

    try {
      // For demo purposes, we'll create a data URL
      // In production, you would upload to a file storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        
        setPendingAttachments(prev => [...prev, {
          fileName: file.name,
          fileUrl: fileUrl,
          fileType: file.type,
          fileSize: file.size
        }]);
        
        toast.success('File attached');
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling file:', error);
      toast.error('Failed to attach file');
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && pendingAttachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/messages/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText.trim(),
          attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear form
      setMessageText('');
      setPendingAttachments([]);
      
      // Refresh thread
      await fetchThread();
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !thread) {
    return null;
  }

  const otherParticipant = thread.buyer?.id === session.user.id ? thread.seller : thread.buyer;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        {/* Header */}
        <Card className="mb-4 p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/messages')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant?.image || undefined} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground">
                  {otherParticipant?.name || 'Unknown User'}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {thread.listing?.title || 'Listing'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/listings/${thread.listingId}`)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Listing
              </Button>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="mb-4 p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {thread.messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              thread.messages.map((message) => {
                const isOwnMessage = message.senderId === session.user.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender?.image || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.messageBody}
                        </p>

                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  isOwnMessage ? 'bg-primary-foreground/10' : 'bg-background'
                                }`}
                              >
                                <File className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {attachment.fileName}
                                  </p>
                                  <p className="text-xs opacity-70">
                                    {formatFileSize(attachment.fileSize)}
                                  </p>
                                </div>
                                <a
                                  href={attachment.fileUrl}
                                  download={attachment.fileName}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-shrink-0"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Message Input */}
        <Card className="p-4">
          {pendingAttachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {pendingAttachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted rounded-lg p-2 pr-1"
                >
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate max-w-[150px]">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading || isSending}
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSending}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>

            <Textarea
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <Button
              onClick={handleSendMessage}
              disabled={isSending || (!messageText.trim() && pendingAttachments.length === 0)}
              className="self-end"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line. Max file size: 25MB
          </p>
        </Card>
      </div>
    </div>
  );
}
