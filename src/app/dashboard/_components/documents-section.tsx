"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  FileCheck,
  Clock,
  CheckCircle,
  TrendingUp,
  FileSpreadsheet,
  FileSignature,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Document = {
  id: number;
  userId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: "finances" | "traffic" | "contracts" | "other";
  esignatureStatus: "none" | "pending" | "signed";
  esignatureSentAt: string | null;
  esignatureSignedAt: string | null;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
};

type NDADocument = {
  id: number;
  listingId: number;
  agreedAt: string | number | Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | number | Date;
  listingTitle: string | null;
  listingStatus: string | null;
};

export const DocumentsSection: React.FC = () => {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [ndaDocuments, setNdaDocuments] = React.useState<NDADocument[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingNDAs, setLoadingNDAs] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const fetchDocuments = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const url = selectedCategory === "all" 
        ? "/api/documents?limit=100"
        : `/api/documents?category=${selectedCategory}&limit=100`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      
      if (!res.ok) return;
      const data = (await res.json()) as Document[];
      setDocuments(data);
    } catch (e) {
      console.error("Failed to fetch documents:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchNDADocuments = React.useCallback(async () => {
    try {
      setLoadingNDAs(true);
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/nda", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as NDADocument[];
      setNdaDocuments(data);
    } catch (e) {
      console.error("Failed to fetch NDA documents:", e);
    } finally {
      setLoadingNDAs(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDocuments();
    fetchNDADocuments();
  }, [fetchDocuments, fetchNDADocuments]);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;

    if (!file || !name || !category) {
      toast.error("Please fill all fields");
      return;
    }

    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 25MB");
      return;
    }

    try {
      setUploading(true);

      // For demo purposes, create a mock file URL
      // In production, upload to actual file storage (S3, Supabase, etc.)
      const mockFileUrl = `https://storage.example.com/documents/${Date.now()}_${file.name}`;

      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          name,
          fileUrl: mockFileUrl,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          category,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload document");
      }

      const newDoc = await res.json();
      setDocuments((prev) => [newDoc, ...prev]);
      setUploadDialogOpen(false);
      toast.success("Document uploaded successfully");
      
      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const sendForESignature = async (id: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/documents/${id}/send-esignature`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send for e-signature");
      }

      const updatedDoc = await res.json();
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? updatedDoc : doc))
      );
      toast.success("Document sent for e-signature");
    } catch (error) {
      console.error("E-signature error:", error);
      toast.error("Failed to send for e-signature");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | number | Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "finances":
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case "traffic":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "contracts":
        return <FileSignature className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getESignatureStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return (
          <Badge variant="default" className="bg-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Signed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Signature
          </Badge>
        );
      default:
        return null;
    }
  };

  const userDocuments = documents.filter(doc => 
    selectedCategory === "all" || doc.category === selectedCategory
  );

  return (
    <Tabs defaultValue="my-documents" className="w-full">
      <TabsList>
        <TabsTrigger value="my-documents">My Documents</TabsTrigger>
        <TabsTrigger value="nda-agreements">NDA Agreements</TabsTrigger>
      </TabsList>

      {/* My Documents Tab */}
      <TabsContent value="my-documents" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Management
              </CardTitle>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-hover-effect">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                    <DialogDescription>
                      Upload documents up to 25MB. Organize by category for easy access.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Document Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Q4 Financial Report"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finances">Finances</SelectItem>
                          <SelectItem value="traffic">Traffic</SelectItem>
                          <SelectItem value="contracts">Contracts</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">File (Max 25MB)</Label>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="mb-6">
              <Label className="mb-2 block">Filter by Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="finances">Finances</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : userDocuments.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">No documents uploaded yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload and organize your financial documents, traffic reports, and contracts
                  </p>
                </div>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  You have {userDocuments.length} document{userDocuments.length !== 1 ? "s" : ""} 
                  {selectedCategory !== "all" && ` in ${selectedCategory} category`}.
                </p>
                <div className="space-y-3">
                  {userDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getCategoryIcon(doc.category)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-base truncate">
                                {doc.name}
                              </h4>
                              <Badge variant="outline" className="capitalize">
                                {doc.category}
                              </Badge>
                              {getESignatureStatusBadge(doc.esignatureStatus)}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>•</span>
                                <span>{doc.fileType}</span>
                                <span>•</span>
                                <span>Uploaded {formatDate(doc.createdAt)}</span>
                              </div>
                              {doc.esignatureSentAt && (
                                <div className="text-xs">
                                  Sent for signature: {formatDateTime(doc.esignatureSentAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.esignatureStatus === "none" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendForESignature(doc.id)}
                              title="Send for e-signature (placeholder)"
                            >
                              <FileCheck className="w-4 h-4 mr-2" />
                              Send for e-sign
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDocument(doc.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* NDA Agreements Tab */}
      <TabsContent value="nda-agreements" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              NDA Agreements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNDAs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : ndaDocuments.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <FileSignature className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">No NDA agreements signed yet</p>
                  <p className="text-sm text-muted-foreground">
                    When you sign an NDA to access confidential listing information, it will appear here
                  </p>
                </div>
                <Link href="/listings">
                  <Button>Browse Listings</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  You have signed {ndaDocuments.length} NDA agreement{ndaDocuments.length !== 1 ? "s" : ""}. 
                  All agreements are recorded with timestamp, version, and IP address for legal purposes.
                </p>
                <div className="space-y-3">
                  {ndaDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <h4 className="font-semibold text-base truncate">
                              {doc.listingTitle || `Listing #${doc.listingId}`}
                            </h4>
                            {doc.listingStatus && (
                              <Badge variant="secondary" className="capitalize">
                                {doc.listingStatus}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground ml-7">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Signed:</span>
                              <span>{formatDateTime(doc.agreedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">IP Address:</span>
                              <span className="font-mono text-xs">{doc.ipAddress || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Document ID:</span>
                              <span className="font-mono text-xs">NDA-{doc.id}</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/listing/${doc.listingId}`}>
                          <Button variant="outline" size="sm">
                            View Listing
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
