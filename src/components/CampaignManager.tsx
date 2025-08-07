import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Plus, 
  Users, 
  Mail, 
  Calendar, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Upload,
  Download,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import { CampaignService, Campaign, CampaignTarget, CampaignTemplate } from '@/services/campaignService';

interface CampaignManagerProps {
  campaignService: CampaignService;
}

export function CampaignManager({ campaignService }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    setCampaigns(campaignService.getAllCampaigns());
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowCreateForm(true);
    setActiveTab('create');
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCreateForm(true);
    setActiveTab('create');
  };

  const handleStartCampaign = (campaignId: string) => {
    if (campaignService.startCampaign(campaignId)) {
      toast.success('Campaign started successfully');
      loadCampaigns();
    } else {
      toast.error('Failed to start campaign');
    }
  };

  const handlePauseCampaign = (campaignId: string) => {
    if (campaignService.pauseCampaign(campaignId)) {
      toast.success('Campaign paused');
      loadCampaigns();
    } else {
      toast.error('Failed to pause campaign');
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (campaignService.deleteCampaign(campaignId)) {
      toast.success('Campaign deleted');
      loadCampaigns();
    } else {
      toast.error('Failed to delete campaign');
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'scheduled': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const globalAnalytics = campaignService.getGlobalAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campaign Manager</h2>
          <p className="text-muted-foreground">Create and manage multi-target phishing campaigns</p>
        </div>
        <Button onClick={handleCreateCampaign} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Global Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold text-foreground">{globalAnalytics.totalCampaigns}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">{globalAnalytics.activeCampaigns}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Targets</p>
                <p className="text-2xl font-bold text-foreground">{globalAnalytics.totalTargets}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold text-foreground">{globalAnalytics.totalEmailsSent}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">
            {showCreateForm ? (selectedCampaign ? 'Edit Campaign' : 'Create Campaign') : 'Create Campaign'}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CampaignOverview 
            campaigns={campaigns}
            onEdit={handleEditCampaign}
            onStart={handleStartCampaign}
            onPause={handlePauseCampaign}
            onDelete={handleDeleteCampaign}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="create">
          <CampaignCreateForm 
            campaignService={campaignService}
            editingCampaign={selectedCampaign}
            onSave={() => {
              loadCampaigns();
              setShowCreateForm(false);
              setSelectedCampaign(null);
              setActiveTab('overview');
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setSelectedCampaign(null);
              setActiveTab('overview');
            }}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager campaignService={campaignService} />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalytics campaigns={campaigns} globalAnalytics={globalAnalytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CampaignOverview({ 
  campaigns, 
  onEdit, 
  onStart, 
  onPause, 
  onDelete, 
  getStatusColor 
}: {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: Campaign['status']) => string;
}) {
  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">Create your first campaign to start managing phishing simulations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline">{campaign.template.riskLevel}</Badge>
                </div>
                
                {campaign.description && (
                  <p className="text-muted-foreground mb-3">{campaign.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Targets</p>
                    <p className="font-semibold text-foreground">{campaign.stats.totalTargets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emails Sent</p>
                    <p className="font-semibold text-foreground">{campaign.stats.emailsSent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="font-semibold text-foreground">{campaign.stats.openRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Click Rate</p>
                    <p className="font-semibold text-foreground">{campaign.stats.clickRate.toFixed(1)}%</p>
                  </div>
                </div>

                {campaign.stats.emailsSent > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{campaign.stats.emailsSent}/{campaign.stats.totalTargets * campaign.settings.maxEmailsPerTarget}</span>
                    </div>
                    <Progress 
                      value={(campaign.stats.emailsSent / (campaign.stats.totalTargets * campaign.settings.maxEmailsPerTarget)) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => onEdit(campaign)}>
                  <Edit className="h-4 w-4" />
                </Button>
                
                {campaign.status === 'draft' || campaign.status === 'paused' ? (
                  <Button variant="outline" size="sm" onClick={() => onStart(campaign.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                ) : campaign.status === 'active' ? (
                  <Button variant="outline" size="sm" onClick={() => onPause(campaign.id)}>
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : null}
                
                <Button variant="outline" size="sm" onClick={() => onDelete(campaign.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CampaignCreateForm({ 
  campaignService, 
  editingCampaign, 
  onSave, 
  onCancel 
}: {
  campaignService: CampaignService;
  editingCampaign: Campaign | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: '',
    targets: [] as CampaignTarget[],
    frequency: 'immediate' as 'immediate' | 'daily' | 'weekly' | 'monthly',
    interval: 1,
    maxEmailsPerTarget: 1,
    enableTracking: true,
    enableFollowUps: false
  });

  const [targetInput, setTargetInput] = useState('');
  const [csvInput, setCsvInput] = useState('');

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        name: editingCampaign.name,
        description: editingCampaign.description || '',
        template: editingCampaign.template.id,
        targets: editingCampaign.targets,
        frequency: editingCampaign.schedule.frequency,
        interval: editingCampaign.schedule.interval || 1,
        maxEmailsPerTarget: editingCampaign.settings.maxEmailsPerTarget,
        enableTracking: editingCampaign.settings.enableTracking,
        enableFollowUps: editingCampaign.settings.enableFollowUps
      });
    }
  }, [editingCampaign]);

  const handleAddTarget = () => {
    if (!targetInput.trim()) return;
    
    const [email, name] = targetInput.split(',').map(s => s.trim());
    if (!email) return;

    const newTarget: CampaignTarget = {
      id: `TGT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name: name || email.split('@')[0]
    };

    setFormData(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget]
    }));
    setTargetInput('');
  };

  const handleImportCSV = () => {
    if (!csvInput.trim()) return;
    
    try {
      const importedTargets = campaignService.importTargetsFromCSV(csvInput);
      setFormData(prev => ({
        ...prev,
        targets: [...prev.targets, ...importedTargets]
      }));
      setCsvInput('');
      toast.success(`Imported ${importedTargets.length} targets`);
    } catch (error) {
      toast.error('Failed to import CSV data');
    }
  };

  const handleRemoveTarget = (targetId: string) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.filter(t => t.id !== targetId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.template || formData.targets.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const template = campaignService.getTemplates().find(t => t.id === formData.template);
    if (!template) {
      toast.error('Selected template not found');
      return;
    }

    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        status: 'draft' as const,
        template,
        targets: formData.targets,
        schedule: {
          startDate: new Date(),
          frequency: formData.frequency,
          interval: formData.interval
        },
        settings: {
          enableTracking: formData.enableTracking,
          enableFollowUps: formData.enableFollowUps,
          maxEmailsPerTarget: formData.maxEmailsPerTarget,
          unsubscribeOnClick: false
        }
      };

      if (editingCampaign) {
        campaignService.updateCampaign(editingCampaign.id, campaignData);
        toast.success('Campaign updated successfully');
      } else {
        campaignService.createCampaign(campaignData);
        toast.success('Campaign created successfully');
      }
      
      onSave();
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const templates = campaignService.getTemplates();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</CardTitle>
        <CardDescription>
          Set up a multi-target phishing simulation campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Q1 Security Awareness Training"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the campaign goals..."
              />
            </div>

            <div>
              <Label htmlFor="template">Email Template *</Label>
              <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.attackVector})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Targets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Target Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-input">Add Individual Target</Label>
                <div className="flex gap-2">
                  <Input
                    id="target-input"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="email@example.com, John Doe"
                  />
                  <Button type="button" onClick={handleAddTarget}>Add</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Format: email, name (optional)</p>
              </div>

              <div>
                <Label htmlFor="csv-input">Import from CSV</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="csv-input"
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="email,name,position,department&#10;john@company.com,John Doe,Manager,IT"
                    rows={3}
                  />
                  <Button type="button" onClick={handleImportCSV}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {formData.targets.length > 0 && (
              <div>
                <Label>Targets ({formData.targets.length})</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {formData.targets.map((target) => (
                    <div key={target.id} className="flex items-center justify-between bg-muted p-2 rounded">
                      <div>
                        <span className="font-medium text-foreground">{target.name}</span>
                        <span className="text-muted-foreground ml-2">({target.email})</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTarget(target.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Schedule & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Schedule & Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Send Immediately</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.frequency !== 'immediate' && (
                <div>
                  <Label htmlFor="interval">Interval</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={formData.interval}
                    onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="max-emails">Max Emails per Target</Label>
                <Input
                  id="max-emails"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxEmailsPerTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxEmailsPerTarget: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="tracking"
                  checked={formData.enableTracking}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableTracking: checked }))}
                />
                <Label htmlFor="tracking">Enable Tracking</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="followups"
                  checked={formData.enableFollowUps}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableFollowUps: checked }))}
                />
                <Label htmlFor="followups">Enable Follow-ups</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TemplateManager({ campaignService }: { campaignService: CampaignService }) {
  const templates = campaignService.getTemplates();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Email Templates</h3>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge variant="outline">{template.riskLevel}</Badge>
              </div>
              <CardDescription>{template.attackVector}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Subject:</p>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Techniques:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.socialEngineeringTechniques.map((technique, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CampaignAnalytics({ campaigns, globalAnalytics }: { campaigns: Campaign[], globalAnalytics: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Open Rate</span>
                <span className="font-semibold text-foreground">{globalAnalytics.averageOpenRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Click Rate</span>
                <span className="font-semibold text-foreground">{globalAnalytics.averageClickRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Emails Sent</span>
                <span className="font-semibold text-foreground">{globalAnalytics.totalEmailsSent}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {globalAnalytics.topPerformingCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{campaign.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{campaign.openRate.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['draft', 'scheduled', 'active', 'paused', 'completed'].map((status) => {
              const count = campaigns.filter(c => c.status === status).length;
              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{status}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}