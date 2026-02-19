"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Copy,
  Mail,
  Facebook,
  Linkedin,
  Send,
  MessageCircle,
  Instagram,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title,
  description,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5 text-[#0A66C2]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5 text-[#25D366]" />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
      color: "bg-[#25D366]/10 hover:bg-[#25D366]/20",
    },
    {
      name: "Telegram",
      icon: <Send className="h-5 w-5 text-[#0088CC]" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: "bg-[#0088CC]/10 hover:bg-[#0088CC]/20",
    },
    {
      name: "Viber",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-[#7360F2]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.34 3C15.91 1.74 12.01 1.5 8.1 2.27 4.19 3.03 1 6.22 1 10.13c0 2.22.95 4.39 2.66 6.08a.63.63 0 0 1 .18.44c-.03 1.07-.36 3.1-.48 4.13a.62.62 0 0 0 .89.65c.9-.43 2.76-1.4 3.73-1.95.14-.08.31-.1.46-.06 3.3.83 6.84.58 10-.71 3.16-1.29 5.56-4.04 5.56-7.58C24 7.22 22.09 4.36 19.34 3zM18.8 15.63c-.34.64-1.07 1.05-1.78.96-.9-.12-2.14-.73-3.66-2.25-1.52-1.52-2.13-2.76-2.25-3.66-.09-.71.32-1.44.96-1.78.43-.23.97-.13 1.28.25.2.24.47.66.7 1.04.18.3.18.67-.01.96l-.32.49c-.16.24-.13.56.08.77.58.58 1.15 1.15 1.73 1.73.21.21.53.24.77.08l.49-.32c.29-.19.66-.19.96-.01.38.23.8.5.1.04.7.25.31.35.85.12 1.28z" />
        </svg>
      ),
      url: `viber://forward?text=${encodeURIComponent(`${title} ${url}`)}`,
      color: "bg-[#7360F2]/10 hover:bg-[#7360F2]/20",
      fallbackUrl: `https://partners.viber.com/share?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5 text-[#E4405F]" />,
      url: "#",
      color: "bg-[#E4405F]/10 hover:bg-[#E4405F]/20",
      onClick: () => {
        handleCopy();
        toast.info("Instagram doesn't support direct links. Link copied to clipboard!");
      },
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5 text-gray-500" />,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      color: "bg-gray-500/10 hover:bg-gray-500/20",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (option: any) => {
    if (option.onClick) {
      option.onClick();
      return;
    }

    const shareUrl = option.url;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Share this post
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Choose your favorite platform to share with your network.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <AnimatePresence>
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(option)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${option.color}`}
                  >
                    {option.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                    {option.name}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <span className="flex-1 text-sm text-gray-500 truncate mr-2">
                {url}
              </span>
              <Button
                size="sm"
                onClick={handleCopy}
                className="bg-black hover:bg-gray-800 text-white rounded-lg px-4 h-9 transition-all"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
