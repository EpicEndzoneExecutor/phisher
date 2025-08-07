import { useState } from "react";
import { TargetProfileForm, TargetProfile } from "./TargetProfileForm";
import { EmailPreview, GeneratedEmail } from "./EmailPreview";
import { AIConfiguration, AIConfig } from "./AIConfiguration";
import { TrackingDashboard } from "./TrackingDashboard";
import { CampaignManager } from "./CampaignManager";
import { CredentialHarvestingGenerator } from "./CredentialHarvestingGenerator";
import { EmailTemplateBuilder } from "./EmailTemplateBuilder";
import { EmailGeneratorService } from "@/services/emailGenerator";
import { TrackingService } from "@/services/trackingService";
import { CampaignService } from "@/services/campaignService";
import { CredentialHarvestingService } from "@/services/credentialHarvestingService";
import { EmailService } from "@/services/emailService";
import { FileManager } from "./FileManager";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Zap, BookmarkPlus, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export const PhishingDashboard = () => {
  const { user, signOut } = useAuth();
  
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: "Ollama",
    model: "llama3.1:8b",
    apiEndpoint: "http://localhost:11434/api/generate",
    apiKey: "",
    temperature: 0.7,
    maxTokens: 1000,
    customInstructions: ""
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [emailGenerator] = useState(() => new EmailGeneratorService(aiConfig));
  const [trackingService] = useState(() => new TrackingService());
  const [campaignService] = useState(() => new CampaignService());
  const [harvestingService] = useState(() => new CredentialHarvestingService());

  const handleConfigChange = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    emailGenerator.updateConfig(newConfig);
    setIsConnected(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionError('');
    try {
      const result = await emailGenerator.testConnection();
      setIsConnected(result.success);
      if (result.success) {
        toast.success("AI service connected successfully!");
      } else {
        setConnectionError(result.error || 'Unknown error');
        toast.error(result.error || "Failed to connect to AI service.");
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setIsConnected(false);
      const errorMsg = error.message || "Failed to connect to AI service.";
      setConnectionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleProfileSubmit = async (profile: TargetProfile) => {
    if (!isConnected) {
      toast.error("Please configure and test your AI connection first.");
      return;
    }

    setIsGenerating(true);
    try {
      const email = await emailGenerator.generateEmail(profile);
      setGeneratedEmail(email);
      
      // Create tracking campaign
      if (email) {
        trackingService.createCampaign(email);
      }
      
      toast.success("Phishing email generated successfully!");
    } catch (error) {
      console.error("Email generation error:", error);
      toast.error("Failed to generate email. Please check your AI configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                🎣 Phishing Email Generator
              </h1>
              <p className="text-muted-foreground mt-2">
                Cybersecurity Training & Defense Testing Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Ethical Use Only</span>
              </div>
              <ThemeToggle />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">Security Analyst</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-warning/10 border-b border-warning/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-warning-foreground">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">
              ⚠️ SECURITY RESEARCH TOOL - This application is designed for cybersecurity professionals, 
              researchers, and organizations to test their defenses against phishing attacks. 
              Unauthorized use for malicious purposes is strictly prohibited and illegal.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="generator" className="flex-shrink-0">Email Generator</TabsTrigger>
            <TabsTrigger value="templates" className="flex-shrink-0">Email Templates</TabsTrigger>
            <TabsTrigger value="campaigns" className="flex-shrink-0">Campaign Manager</TabsTrigger>
            <TabsTrigger value="harvesting" className="flex-shrink-0">Credential Pages</TabsTrigger>
            <TabsTrigger value="files" className="flex-shrink-0">File Storage</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-shrink-0">Tracking & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Configuration */}
              <div className="lg:col-span-1 space-y-6">
                <AIConfiguration
                  config={aiConfig}
                  onConfigChange={handleConfigChange}
                  onTestConnection={handleTestConnection}
                  isConnected={isConnected}
                  isTesting={isTesting}
                  connectionError={connectionError}
                />

                {/* Stats Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Zap className="h-8 w-8 mx-auto text-primary" />
                      <h3 className="font-medium">Ready for Testing</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your AI model and create realistic phishing emails for security training
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column - Target Profile */}
              <div className="lg:col-span-1">
                <TargetProfileForm
                  onProfileSubmit={handleProfileSubmit}
                  isGenerating={isGenerating}
                />
              </div>

              {/* Right Column - Email Preview */}
              <div className="lg:col-span-1">
                <EmailPreview
                  email={generatedEmail}
                  isGenerating={isGenerating}
                  trackingService={trackingService}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="mb-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-primary">
                    <BookmarkPlus className="h-5 w-5" />
                    <p className="font-medium">Template Management</p>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Create custom email templates or save AI-generated emails as templates. 
                    Add custom assets like logos and attachments to make your templates more realistic.
                  </p>
                </CardContent>
              </Card>
            </div>
            <EmailTemplateBuilder />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignManager campaignService={campaignService} />
          </TabsContent>

          <TabsContent value="harvesting" className="space-y-6">
            <CredentialHarvestingGenerator harvestingService={harvestingService} />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FileManager
                bucket="EMAIL_ATTACHMENTS"
                title="Email Attachments"
                acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
                maxFileSize={25 * 1024 * 1024} // 25MB
              />
              <FileManager
                bucket="TEMPLATE_ASSETS"
                title="Template Assets"
                acceptedTypes="image/*,.svg"
                maxFileSize={5 * 1024 * 1024} // 5MB
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FileManager
                bucket="LOGOS"
                title="Company Logos"
                acceptedTypes="image/*,.svg"
                maxFileSize={2 * 1024 * 1024} // 2MB
              />
              <FileManager
                bucket="REPORTS"
                title="Generated Reports"
                acceptedTypes=".pdf,.csv,.xlsx,.json"
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <TrackingDashboard trackingService={trackingService} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Built for cybersecurity professionals • Use responsibly • 
            Report issues to your security team
          </p>
        </div>
      </div>
    </div>
  );
};