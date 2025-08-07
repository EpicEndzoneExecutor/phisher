import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrackingService, CampaignStats, TrackingEvent } from "@/services/trackingService";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye, 
  AlertTriangle,
  Download,
  RefreshCw,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface TrackingDashboardProps {
  trackingService: TrackingService;
}

export const TrackingDashboard = ({ trackingService }: TrackingDashboardProps) => {
  const [analytics, setAnalytics] = useState(trackingService.getAnalytics());
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [campaignEvents, setCampaignEvents] = useState<TrackingEvent[]>([]);

  const refreshData = () => {
    setAnalytics(trackingService.getAnalytics());
    setCampaigns(trackingService.getCampaigns());
    if (selectedCampaign) {
      setCampaignEvents(trackingService.getCampaignEvents(selectedCampaign));
    }
  };

  useEffect(() => {
    refreshData();
    // Set up periodic refresh
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [trackingService, selectedCampaign]);

  const exportData = () => {
    const data = trackingService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phishing-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported successfully');
  };

  const clearData = () => {
    if (confirm('Are you sure you want to clear all tracking data? This action cannot be undone.')) {
      trackingService.clearAllData();
      refreshData();
      setSelectedCampaign(null);
      setCampaignEvents([]);
      toast.success('All tracking data cleared');
    }
  };

  const simulateActivity = (campaignId: string) => {
    const campaign = trackingService.getCampaign(campaignId);
    if (!campaign) return;

    // Simulate some opens and clicks
    const openCount = Math.floor(Math.random() * campaign.targets.length);
    const clickCount = Math.floor(Math.random() * openCount);

    for (let i = 0; i < openCount; i++) {
      const target = campaign.targets[Math.floor(Math.random() * campaign.targets.length)];
      trackingService.simulateEmailOpen(campaignId, target);
    }

    for (let i = 0; i < clickCount; i++) {
      const target = campaign.targets[Math.floor(Math.random() * campaign.targets.length)];
      trackingService.trackEvent({
        campaignId,
        eventType: 'link_clicked',
        targetEmail: target,
        metadata: { linkType: 'credential_harvest', simulated: true }
      });
    }

    refreshData();
    toast.success(`Simulated ${openCount} opens and ${clickCount} clicks for testing`);
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

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "low": return "secondary";
      case "medium": return "default";
      case "high": return "destructive";
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">📊 Tracking & Analytics</h2>
          <p className="text-muted-foreground">Monitor phishing campaign performance and engagement metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="destructive" size="sm" onClick={clearData}>
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">Active phishing tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEmailsSent}</div>
            <p className="text-xs text-muted-foreground">Total targets reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageOpenRate.toFixed(1)}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(analytics.averageOpenRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageClickRate.toFixed(1)}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-destructive h-2 rounded-full transition-all"
                style={{ width: `${Math.min(analytics.averageClickRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Track individual phishing campaign metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet. Generate your first phishing email to start tracking.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Attack Vector</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Targets</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{campaign.attackVector}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(campaign.riskLevel)} className={getRiskColor(campaign.riskLevel)}>
                            {campaign.riskLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.totalSent}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{campaign.openRate.toFixed(1)}%</span>
                            <Progress value={campaign.openRate} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{campaign.clickRate.toFixed(1)}%</span>
                            <Progress value={campaign.clickRate} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{campaign.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCampaign(campaign.id);
                                setCampaignEvents(trackingService.getCampaignEvents(campaign.id));
                              }}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => simulateActivity(campaign.id)}
                            >
                              Simulate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Campaign Details */}
          {selectedCampaign && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Events</CardTitle>
                <CardDescription>Detailed activity log for selected campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No events recorded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge variant="outline">{formatEventType(event.eventType)}</Badge>
                          </TableCell>
                          <TableCell>{event.targetEmail}</TableCell>
                          <TableCell>{event.timestamp.toLocaleString()}</TableCell>
                          <TableCell>
                            {event.metadata && (
                              <span className="text-sm text-muted-foreground">
                                {JSON.stringify(event.metadata)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest tracking events across all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {analytics.recentActivity.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{formatEventType(event.eventType)}</Badge>
                        <span className="text-sm">{event.targetEmail}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {event.timestamp.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Campaign breakdown by risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.riskDistribution).map(([risk, count]) => (
                    <div key={risk} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(risk)} className={getRiskColor(risk)}>
                          {risk.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Insights</CardTitle>
                <CardDescription>Key metrics for security assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="font-medium">Vulnerability Score</span>
                    </div>
                    <Progress value={analytics.averageClickRate} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {analytics.averageClickRate.toFixed(1)}% of users clicked malicious links
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium">Engagement Rate</span>
                    </div>
                    <Progress value={analytics.averageOpenRate} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {analytics.averageOpenRate.toFixed(1)}% of emails were opened
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};