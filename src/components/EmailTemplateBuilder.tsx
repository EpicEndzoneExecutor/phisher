import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmailTemplateService, EmailTemplate, TemplateVariable } from '@/services/emailTemplateService';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';
import { FileManager } from './FileManager';
import { AssetSelector } from './AssetSelector';
import { FileStorageService } from '@/services/fileStorageService';
import { 
  Save, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  Download,
  FileText,
  Variable,
  Mail,
  Paperclip
} from 'lucide-react';

interface EmailTemplateBuilderProps {
  onTemplateSelect?: (template: EmailTemplate) => void;
}

export const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    senderName: '',
    senderEmail: '',
    body: '',
    attackVector: '',
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
    techniques: [] as string[],
    selectedAssets: [] as string[],
  });

  const availableVariables = EmailTemplateService.getAvailableVariables();
  const availableTechniques = [
    'Urgency', 'Authority', 'Fear', 'Social Proof', 'Scarcity', 
    'Reciprocity', 'Familiarity', 'Trust', 'Curiosity', 'Greed'
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = EmailTemplateService.getAllTemplates();
    setTemplates(loadedTemplates);
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      subject: '',
      senderName: '',
      senderEmail: '',
      body: '',
      attackVector: '',
      riskLevel: 'medium',
      techniques: [],
      selectedAssets: [],
    });
    setSelectedTemplate(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      subject: template.subject,
      senderName: template.senderName,
      senderEmail: template.senderEmail,
      body: template.body,
      attackVector: template.attackVector,
      riskLevel: template.riskLevel,
      techniques: template.techniques,
      selectedAssets: template.assets?.map(asset => asset.url) || [],
    });
    setSelectedTemplate(template);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, subject, body)",
        variant: "destructive",
      });
      return;
    }

    // Extract placeholders from the template content
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = new Set<string>();
    
    [formData.subject, formData.body, formData.senderName, formData.senderEmail].forEach(text => {
      let match;
      while ((match = placeholderRegex.exec(text)) !== null) {
        placeholders.add(`{{${match[1]}}}`);
      }
    });

    // Convert selected asset URLs to TemplateAsset objects
    const assets = formData.selectedAssets.map((url, index) => ({
      id: `asset-${Date.now()}-${index}`,
      name: url.split('/').pop() || `asset-${index}`,
      type: 'attachment' as const,
      url: url,
      size: 0, // Size not available from URL
      mimeType: 'application/octet-stream', // Default MIME type
    }));

    try {
      if (isEditing && selectedTemplate) {
        EmailTemplateService.updateTemplate(selectedTemplate.id, {
          ...formData,
          placeholders: Array.from(placeholders),
          assets,
        });
        toast({
          title: "Template Updated",
          description: `"${formData.name}" has been updated successfully.`,
        });
      } else {
        EmailTemplateService.saveTemplate({
          ...formData,
          placeholders: Array.from(placeholders),
          assets,
        });
        toast({
          title: "Template Saved",
          description: `"${formData.name}" has been saved successfully.`,
        });
      }
      
      loadTemplates();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (template: EmailTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      EmailTemplateService.deleteTemplate(template.id);
      loadTemplates();
      toast({
        title: "Template Deleted",
        description: `"${template.name}" has been deleted.`,
      });
    }
  };

  const handleInsertVariable = (variable: TemplateVariable) => {
    // This would insert the variable at the cursor position in the active textarea
    // For simplicity, we'll just add it to the end of the body
    setFormData(prev => ({
      ...prev,
      body: prev.body + ` ${variable.name}`
    }));
  };

  const handlePreview = (template: EmailTemplate) => {
    const sampleData = {
      name: 'John Doe',
      company: 'Acme Corporation',
      position: 'Manager',
      email: 'john.doe@acme.com',
      phone: '+1-555-0123',
      department: 'Sales',
      trackingLink: 'https://example.com/track/abc123'
    };
    
    const processedTemplate = EmailTemplateService.applyTemplate(template, sampleData);
    setSelectedTemplate(processedTemplate);
    setShowPreview(true);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };
    
    EmailTemplateService.saveTemplate(duplicatedTemplate as any);
    loadTemplates();
    toast({
      title: "Template Duplicated",
      description: `"${duplicatedTemplate.name}" has been created.`,
    });
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (isCreating || isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Modify the existing template' : 'Build a new email template with dynamic placeholders'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Account Security Alert"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the template"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., URGENT: Security Alert for {{firstName}} {{lastName}}"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="e.g., Security Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input
                  id="senderEmail"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
                  placeholder="e.g., security@{{company}}.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Email Body *</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVariables(!showVariables)}
                  >
                    <Variable className="h-4 w-4 mr-2" />
                    Variables
                  </Button>
                </div>
              </div>
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML Editor</TabsTrigger>
                  <TabsTrigger value="text">Plain Text</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="space-y-2">
                  <Textarea
                    id="body-html"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Write HTML email content here. Use {{variable}} for dynamic content."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Pro tip: Use complete HTML structure with inline CSS for best email client compatibility
                  </p>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-2">
                  <Textarea
                    id="body-text"
                    value={formData.body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Write plain text email content here. Use {{variable}} for dynamic content. This will be automatically wrapped in HTML structure."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Plain text will be automatically converted to professional HTML format
                  </p>
                </TabsContent>
              </Tabs>
              
              {showVariables && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Available Variables</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableVariables.map((variable, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertVariable(variable)}
                        className="justify-start text-xs"
                      >
                        {variable.name}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Template Assets Section */}
          <div className="space-y-4">
            <Label>
              <Paperclip className="h-4 w-4 mr-2 inline" />
              Template Assets
            </Label>
            <Tabs defaultValue="attachments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="attachments">Email Attachments</TabsTrigger>
                <TabsTrigger value="logos">Logos & Images</TabsTrigger>
              </TabsList>
              
              <TabsContent value="attachments" className="space-y-4">
                <AssetSelector
                  bucket="EMAIL_ATTACHMENTS"
                  title="Email Attachments"
                  folder={selectedTemplate?.id || 'templates'}
                  acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                  maxFileSize={25 * 1024 * 1024} // 25MB
                  selectedAssets={formData.selectedAssets}
                  onAssetSelect={(url) => setFormData(prev => ({
                    ...prev,
                    selectedAssets: prev.selectedAssets.includes(url) 
                      ? prev.selectedAssets.filter(asset => asset !== url)
                      : [...prev.selectedAssets, url]
                  }))}
                />
              </TabsContent>
              
              <TabsContent value="logos" className="space-y-4">
                <AssetSelector
                  bucket="TEMPLATE_ASSETS"
                  title="Template Assets"
                  folder={selectedTemplate?.id ? `templates/${selectedTemplate.id}` : 'templates'}
                  acceptedTypes="image/*"
                  maxFileSize={5 * 1024 * 1024} // 5MB
                  selectedAssets={formData.selectedAssets}
                  onAssetSelect={(url) => setFormData(prev => ({
                    ...prev,
                    selectedAssets: prev.selectedAssets.includes(url) 
                      ? prev.selectedAssets.filter(asset => asset !== url)
                      : [...prev.selectedAssets, url]
                  }))}
                />
              </TabsContent>
            </Tabs>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attackVector">Attack Vector</Label>
              <Input
                id="attackVector"
                value={formData.attackVector}
                onChange={(e) => setFormData(prev => ({ ...prev, attackVector: e.target.value }))}
                placeholder="e.g., urgency, authority"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select value={formData.riskLevel} onValueChange={(value: any) => setFormData(prev => ({ ...prev, riskLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Social Engineering Techniques</Label>
              <div className="flex flex-wrap gap-1">
                {availableTechniques.map((technique) => (
                  <Badge
                    key={technique}
                    variant={formData.techniques.includes(technique) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        techniques: prev.techniques.includes(technique)
                          ? prev.techniques.filter(t => t !== technique)
                          : [...prev.techniques, technique]
                      }));
                    }}
                  >
                    {technique}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Template' : 'Save Template'}
            </Button>
            <Button variant="outline" onClick={() => { setIsCreating(false); setIsEditing(false); }}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage reusable email templates
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge variant={getRiskBadgeVariant(template.riskLevel)}>
                  {template.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Subject:</span> {template.subject}
                </div>
                <div className="text-sm">
                  <span className="font-medium">From:</span> {template.senderName} &lt;{template.senderEmail}&gt;
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.techniques.slice(0, 3).map((technique, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {technique}
                  </Badge>
                ))}
                {template.techniques.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.techniques.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {onTemplateSelect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTemplateSelect(template)}
                  >
                    Use Template
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email template to get started
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Realistic preview of how the email will appear in email clients
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              {/* Email Client Header Simulation */}
              <div className="bg-gray-100 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {selectedTemplate.senderName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{selectedTemplate.senderName}</div>
                      <div className="text-xs text-gray-600">&lt;{selectedTemplate.senderEmail}&gt;</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="font-semibold text-lg mb-1">{selectedTemplate.subject}</div>
                <div className="text-xs text-gray-600">To: john.doe@acme.com</div>
              </div>
              
              {/* Email Content */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-white min-h-[500px] email-preview"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                  style={{
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    lineHeight: "1.6"
                  }}
                />
              </div>
              
              {/* Email Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" variant="outline">
                  📧 Reply
                </Button>
                <Button size="sm" variant="outline">
                  ↪️ Forward
                </Button>
                <Button size="sm" variant="outline">
                  🗑️ Delete
                </Button>
                <Button size="sm" variant="outline">
                  ⚠️ Report Phishing
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};