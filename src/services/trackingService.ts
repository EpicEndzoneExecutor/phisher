import { GeneratedEmail } from "@/components/EmailPreview";

export interface TrackingEvent {
  id: string;
  campaignId: string;
  eventType: 'email_sent' | 'email_opened' | 'link_clicked' | 'form_submitted' | 'attachment_downloaded';
  timestamp: Date;
  targetEmail: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  metadata?: Record<string, any>;
}

export interface CampaignStats {
  id: string;
  name: string;
  createdAt: Date;
  totalSent: number;
  emailsOpened: number;
  linksClicked: number;
  formsSubmitted: number;
  attachmentsDownloaded: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  targets: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  attackVector: string;
}

export class TrackingService {
  private campaigns: Map<string, CampaignStats> = new Map();
  private events: TrackingEvent[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Create a new campaign
  createCampaign(email: GeneratedEmail, targets: string[] = [email.recipientEmail]): string {
    const campaignId = email.trackingId || this.generateCampaignId();
    
    const campaign: CampaignStats = {
      id: campaignId,
      name: `${email.attackVector} - ${email.recipient}`,
      createdAt: new Date(),
      totalSent: targets.length,
      emailsOpened: 0,
      linksClicked: 0,
      formsSubmitted: 0,
      attachmentsDownloaded: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      targets,
      riskLevel: email.riskLevel,
      attackVector: email.attackVector
    };

    this.campaigns.set(campaignId, campaign);
    
    // Record email sent events
    targets.forEach(target => {
      this.trackEvent({
        campaignId,
        eventType: 'email_sent',
        targetEmail: target,
        metadata: { 
          subject: email.subject,
          sender: email.senderEmail,
          attackVector: email.attackVector
        }
      });
    });

    this.saveToStorage();
    return campaignId;
  }

  // Track an event
  trackEvent(event: Omit<TrackingEvent, 'id' | 'timestamp'>): void {
    const trackingEvent: TrackingEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event
    };

    // Add geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        trackingEvent.location = {
          // In a real app, you'd use a geolocation service to convert coords to location
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      });
    }

    this.events.push(trackingEvent);
    this.updateCampaignStats(event.campaignId);
    this.saveToStorage();
  }

  // Generate tracking URL for links
  generateTrackingUrl(campaignId: string, originalUrl: string, linkType: string = 'general'): string {
    const baseUrl = window.location.origin;
    const trackingParams = new URLSearchParams({
      c: campaignId,
      u: btoa(originalUrl), // Base64 encode the original URL
      t: linkType,
      ts: Date.now().toString()
    });
    
    return `${baseUrl}/track/click?${trackingParams.toString()}`;
  }

  // Generate pixel tracking URL for email opens
  generatePixelUrl(campaignId: string, targetEmail: string): string {
    const baseUrl = window.location.origin;
    const trackingParams = new URLSearchParams({
      c: campaignId,
      e: btoa(targetEmail),
      ts: Date.now().toString()
    });
    
    return `${baseUrl}/track/pixel?${trackingParams.toString()}`;
  }

  // Process tracking URL click (simulate backend)
  processTrackingClick(campaignId: string, encodedUrl: string, linkType: string, targetEmail?: string): string {
    if (targetEmail) {
      this.trackEvent({
        campaignId,
        eventType: 'link_clicked',
        targetEmail,
        metadata: { linkType, timestamp: new Date().toISOString() }
      });
    }

    try {
      return atob(encodedUrl); // Decode and return original URL
    } catch {
      return '/'; // Fallback to home page
    }
  }

  // Update campaign statistics
  private updateCampaignStats(campaignId: string): void {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    const campaignEvents = this.events.filter(e => e.campaignId === campaignId);
    
    campaign.emailsOpened = campaignEvents.filter(e => e.eventType === 'email_opened').length;
    campaign.linksClicked = campaignEvents.filter(e => e.eventType === 'link_clicked').length;
    campaign.formsSubmitted = campaignEvents.filter(e => e.eventType === 'form_submitted').length;
    campaign.attachmentsDownloaded = campaignEvents.filter(e => e.eventType === 'attachment_downloaded').length;
    
    campaign.openRate = campaign.totalSent > 0 ? (campaign.emailsOpened / campaign.totalSent) * 100 : 0;
    campaign.clickRate = campaign.emailsOpened > 0 ? (campaign.linksClicked / campaign.emailsOpened) * 100 : 0;
    campaign.conversionRate = campaign.totalSent > 0 ? (campaign.formsSubmitted / campaign.totalSent) * 100 : 0;

    this.campaigns.set(campaignId, campaign);
  }

  // Get all campaigns
  getCampaigns(): CampaignStats[] {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Get campaign by ID
  getCampaign(campaignId: string): CampaignStats | undefined {
    return this.campaigns.get(campaignId);
  }

  // Get events for a campaign
  getCampaignEvents(campaignId: string): TrackingEvent[] {
    return this.events
      .filter(e => e.campaignId === campaignId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get aggregated analytics
  getAnalytics(): {
    totalCampaigns: number;
    totalEmailsSent: number;
    totalOpens: number;
    totalClicks: number;
    averageOpenRate: number;
    averageClickRate: number;
    riskDistribution: Record<string, number>;
    recentActivity: TrackingEvent[];
  } {
    const campaigns = this.getCampaigns();
    const totalCampaigns = campaigns.length;
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + c.emailsOpened, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.linksClicked, 0);
    
    const averageOpenRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length 
      : 0;
    
    const averageClickRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length 
      : 0;
    
    const riskDistribution = campaigns.reduce((dist, c) => {
      dist[c.riskLevel] = (dist[c.riskLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    const recentActivity = this.events
      .slice(-10)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      totalCampaigns,
      totalEmailsSent,
      totalOpens,
      totalClicks,
      averageOpenRate,
      averageClickRate,
      riskDistribution,
      recentActivity
    };
  }

  // Simulate email open tracking
  simulateEmailOpen(campaignId: string, targetEmail: string): void {
    this.trackEvent({
      campaignId,
      eventType: 'email_opened',
      targetEmail,
      userAgent: navigator.userAgent,
      metadata: { timestamp: new Date().toISOString() }
    });
  }

  // Simulate form submission (credential harvesting)
  simulateFormSubmission(campaignId: string, targetEmail: string, formData: Record<string, any>): void {
    this.trackEvent({
      campaignId,
      eventType: 'form_submitted',
      targetEmail,
      userAgent: navigator.userAgent,
      metadata: { 
        formData: formData, // In production, never log actual credentials
        timestamp: new Date().toISOString() 
      }
    });
  }

  // Export data for analysis
  exportData(): { campaigns: CampaignStats[], events: TrackingEvent[] } {
    return {
      campaigns: this.getCampaigns(),
      events: this.events
    };
  }

  // Clear all data
  clearAllData(): void {
    this.campaigns.clear();
    this.events = [];
    this.saveToStorage();
  }

  private generateCampaignId(): string {
    return `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('phishing-campaigns', JSON.stringify(Array.from(this.campaigns.entries())));
      localStorage.setItem('phishing-events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save tracking data to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const campaignsData = localStorage.getItem('phishing-campaigns');
      if (campaignsData) {
        const entries = JSON.parse(campaignsData);
        this.campaigns = new Map(entries.map(([key, value]: [string, any]) => [
          key, 
          { ...value, createdAt: new Date(value.createdAt) }
        ]));
      }

      const eventsData = localStorage.getItem('phishing-events');
      if (eventsData) {
        this.events = JSON.parse(eventsData).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load tracking data from localStorage:', error);
    }
  }
}