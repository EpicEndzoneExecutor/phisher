import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Eye, Shield, AlertTriangle, Link, Activity, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { TrackingService } from "@/services/trackingService";
import { EmailTemplateService } from "@/services/emailTemplateService";
import { useState } from "react";

export interface GeneratedEmail {
  subject: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  recipientEmail: string;
  body: string;
  htmlBody?: string;
  attackVector: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  techniques: string[];
  trackingId?: string;
}

interface EmailPreviewProps {
  email: GeneratedEmail | null;
  isGenerating: boolean;
  trackingService?: TrackingService;
}

export const EmailPreview = ({ email, isGenerating, trackingService }: EmailPreviewProps) => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadEmail = () => {
    if (!email) return;

    const emailContent = `Subject: ${email.subject}
From: ${email.sender} <${email.senderEmail}>
To: ${email.recipient} <${email.recipientEmail}>
Date: ${new Date().toLocaleString()}

${email.body}

---
Generated for security testing purposes only.
Attack Vector: ${email.attackVector}
Risk Level: ${email.riskLevel.toUpperCase()}
Techniques: ${email.techniques.join(", ")}
Tracking ID: ${email.trackingId || "N/A"}
`;

    const blob = new Blob([emailContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishing-email-${email.trackingId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Email downloaded successfully");
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "low": return "secondary";
      case "medium": return "default";
      case "high": return "destructive";
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const generateTrackingLinks = () => {
    if (!email || !trackingService) return;

    const campaignId = email.trackingId || 'unknown';
    
    // Example tracking URLs
    const credentialUrl = trackingService.generateTrackingUrl(campaignId, 'https://fake-login.example.com', 'credential_harvest');
    const attachmentUrl = trackingService.generateTrackingUrl(campaignId, 'https://fake-file.example.com/document.pdf', 'malware_delivery');
    const pixelUrl = trackingService.generatePixelUrl(campaignId, email.recipientEmail);

    const trackingInfo = `
TRACKING LINKS FOR CAMPAIGN: ${campaignId}

1. Credential Harvesting Link:
${credentialUrl}

2. Malware Delivery Link:
${attachmentUrl}

3. Email Tracking Pixel:
<img src="${pixelUrl}" width="1" height="1" style="display:none;">

4. Email Body with Tracking:
${email.body.replace(/https?:\/\/[^\s]+/g, (url) => trackingService.generateTrackingUrl(campaignId, url, 'general'))}

---
Use these links in your phishing simulation to track user engagement.
IMPORTANT: Only use for authorized security testing!
    `;

    copyToClipboard(trackingInfo, "Tracking information");
  };

  const simulateEmailOpen = () => {
    if (!email || !trackingService) return;
    trackingService.simulateEmailOpen(email.trackingId || 'unknown', email.recipientEmail);
    toast.success("Simulated email open event");
  };

  const simulateLinkClick = () => {
    if (!email || !trackingService) return;
    trackingService.trackEvent({
      campaignId: email.trackingId || 'unknown',
      eventType: 'link_clicked',
      targetEmail: email.recipientEmail,
      metadata: { linkType: 'credential_harvest', simulated: true }
    });
    toast.success("Simulated link click event");
  };

  const saveAsTemplate = () => {
    if (!email || !templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      const generatedEmailForTemplate = {
        subject: email.subject,
        senderName: email.sender,
        senderEmail: email.senderEmail,
        body: email.body,
        attackVector: email.attackVector,
        riskLevel: email.riskLevel,
        techniques: email.techniques
      };

      EmailTemplateService.saveGeneratedEmailAsTemplate(
        generatedEmailForTemplate,
        templateName,
        templateDescription || "Saved from AI generated email"
      );

      toast.success("Email saved as template successfully!");
      setIsDialogOpen(false);
      setTemplateName("");
      setTemplateDescription("");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <CardDescription>Generating phishing email...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!email) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <CardDescription>Generated email will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Complete the target profile to generate a phishing email</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <Card className="border-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-warning-foreground">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">⚠️ FOR SECURITY TESTING ONLY</p>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            This email is generated for cybersecurity training and testing purposes. 
            Unauthorized use for malicious activities is strictly prohibited and illegal.
          </p>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Generated Phishing Email
              </CardTitle>
              <CardDescription>
                Attack Vector: {email.attackVector} • Tracking ID: {email.trackingId || "N/A"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getRiskBadgeVariant(email.riskLevel)} className={getRiskColor(email.riskLevel)}>
                {email.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email Headers */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span>{email.sender} &lt;{email.senderEmail}&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span>{email.recipient} &lt;{email.recipientEmail}&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">{email.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            {/* Email Body */}
            <div className="bg-card border rounded-lg p-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {email.body}
              </div>
            </div>

            {/* Techniques Used */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Social Engineering Techniques:</h4>
              <div className="flex flex-wrap gap-2">
                {email.techniques.map((technique, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {technique}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(email.subject, "Subject")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Subject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(email.body, "Email body")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Body
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadEmail}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                    >
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Email as Template</DialogTitle>
                      <DialogDescription>
                        Save this generated email as a reusable template with custom assets.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateName">Template Name *</Label>
                        <Input
                          id="templateName"
                          placeholder="e.g., Security Alert Template"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateDescription">Description</Label>
                        <Input
                          id="templateDescription"
                          placeholder="Describe this template..."
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={saveAsTemplate}>
                          Save Template
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {trackingService && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Tracking & Simulation
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={generateTrackingLinks}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Generate Tracking Links
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={simulateEmailOpen}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Simulate Open
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={simulateLinkClick}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Simulate Click
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};