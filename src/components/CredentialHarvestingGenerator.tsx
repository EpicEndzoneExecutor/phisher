import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, Eye, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { CredentialHarvestingService, HarvestingPageConfig, LoginPageTemplate } from "@/services/credentialHarvestingService";

interface CredentialHarvestingGeneratorProps {
  harvestingService: CredentialHarvestingService;
}

export const CredentialHarvestingGenerator = ({ harvestingService }: CredentialHarvestingGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LoginPageTemplate | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("https://example.com/training-complete");
  const [customBranding, setCustomBranding] = useState({
    companyName: "",
    logoUrl: ""
  });
  const [generatedPage, setGeneratedPage] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("code");

  const templates = harvestingService.getTemplates();

  const handleGeneratePage = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    const config: HarvestingPageConfig = {
      template: selectedTemplate,
      redirectUrl,
      trackingId: harvestingService.generateTrackingId(),
      customBranding: customBranding.companyName ? customBranding : undefined
    };

    const pageHtml = harvestingService.generatePage(config);
    setGeneratedPage(pageHtml);
    toast.success("Credential harvesting page generated successfully!");
  };

  const handleDownloadPage = () => {
    if (!generatedPage) {
      toast.error("No page generated yet");
      return;
    }

    const blob = new Blob([generatedPage], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.service.toLowerCase()}-login-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Page downloaded successfully!");
  };

  const handlePreviewPage = () => {
    if (!generatedPage) {
      toast.error("No page generated yet");
      return;
    }
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatedPage);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Card className="border-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <h3 className="font-semibold text-warning-foreground">Ethical Use Only</h3>
              <p className="text-sm text-warning-foreground/80 mt-1">
                This tool generates fake login pages for cybersecurity training and authorized penetration testing only. 
                Unauthorized use is illegal and unethical.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Template Selection
              </CardTitle>
              <CardDescription>
                Choose a login page template to mimic popular services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Badge variant={selectedTemplate?.id === template.id ? "default" : "secondary"}>
                        {template.service}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Options */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Customize the generated page settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redirectUrl">Redirect URL (after submission)</Label>
                <Input
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com/training-complete"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Custom Branding (Optional)</h4>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={customBranding.companyName}
                    onChange={(e) => setCustomBranding(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={customBranding.logoUrl}
                    onChange={(e) => setCustomBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGeneratePage} className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Generated Page
                </span>
                {generatedPage && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handlePreviewPage}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={handleDownloadPage}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                View and download the generated credential harvesting page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPage ? (
                <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as "code" | "preview")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code">HTML Code</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code" className="mt-4">
                    <Textarea
                      value={generatedPage}
                      readOnly
                      className="font-mono text-xs min-h-[400px]"
                      placeholder="Generated HTML will appear here..."
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={generatedPage}
                        className="w-full h-[400px]"
                        title="Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a template and generate a page to see the preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Usage Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">For Training Purposes:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Deploy on internal training servers only</li>
                  <li>Always include clear training indicators</li>
                  <li>Inform participants this is an exercise</li>
                  <li>Review submissions for training feedback</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Security Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Warning banners indicate training mode</li>
                  <li>Submissions logged for analysis</li>
                  <li>No real credentials are processed</li>
                  <li>Automatic redirect after submission</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};