import { GeneratedEmail } from "@/components/EmailPreview";
import { EmailTemplateService } from "./emailTemplateService";

export interface CampaignTarget {
  id: string;
  email: string;
  name: string;
  position?: string;
  department?: string;
  customFields?: Record<string, string>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  attackVector: string;
  riskLevel: "low" | "medium" | "high";
  socialEngineeringTechniques: string[];
}

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  interval?: number; // Days between emails
  times?: string[]; // Time of day to send (HH:MM format)
  followUps?: FollowUpRule[];
}

export interface FollowUpRule {
  id: string;
  trigger: 'no_open' | 'no_click' | 'time_delay';
  delay: number; // Hours after trigger
  template: CampaignTemplate;
  maxFollowUps: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  template: CampaignTemplate;
  targets: CampaignTarget[];
  schedule: CampaignSchedule;
  settings: {
    enableTracking: boolean;
    enableFollowUps: boolean;
    maxEmailsPerTarget: number;
    unsubscribeOnClick: boolean;
  };
  stats: {
    totalTargets: number;
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
    formsSubmitted: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

export interface CampaignExecution {
  campaignId: string;
  targetId: string;
  emailsSent: number;
  lastEmailSent?: Date;
  nextEmailScheduled?: Date;
  followUpsSent: number;
  status: 'pending' | 'active' | 'completed' | 'unsubscribed' | 'failed';
}

export class CampaignService {
  private campaigns: Map<string, Campaign> = new Map();
  private executions: Map<string, CampaignExecution[]> = new Map();
  private templates: Map<string, CampaignTemplate> = new Map();

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultTemplates();
  }

  // Campaign CRUD Operations
  createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): string {
    const campaignId = this.generateCampaignId();
    
    const campaign: Campaign = {
      id: campaignId,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalTargets: campaignData.targets.length,
        emailsSent: 0,
        emailsOpened: 0,
        linksClicked: 0,
        formsSubmitted: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0
      },
      ...campaignData
    };

    this.campaigns.set(campaignId, campaign);
    this.initializeCampaignExecutions(campaign);
    this.saveToStorage();
    
    return campaignId;
  }

  updateCampaign(campaignId: string, updates: Partial<Campaign>): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedCampaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date()
    };

    this.campaigns.set(campaignId, updatedCampaign);
    this.saveToStorage();
    return true;
  }

  deleteCampaign(campaignId: string): boolean {
    const deleted = this.campaigns.delete(campaignId);
    this.executions.delete(campaignId);
    this.saveToStorage();
    return deleted;
  }

  getCampaign(campaignId: string): Campaign | undefined {
    return this.campaigns.get(campaignId);
  }

  getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  // Campaign Execution
  startCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status === 'active') return false;

    campaign.status = 'active';
    campaign.updatedAt = new Date();
    this.campaigns.set(campaignId, campaign);
    
    // Schedule immediate emails if needed
    if (campaign.schedule.frequency === 'immediate') {
      this.executeImmediateSend(campaign).catch(console.error);
    }

    this.saveToStorage();
    return true;
  }

  pauseCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.status = 'paused';
    campaign.updatedAt = new Date();
    this.campaigns.set(campaignId, campaign);
    this.saveToStorage();
    return true;
  }

  // Target Management
  addTargetsToGroup(targets: Omit<CampaignTarget, 'id'>[]): CampaignTarget[] {
    return targets.map(target => ({
      ...target,
      id: this.generateTargetId()
    }));
  }

  importTargetsFromCSV(csvData: string): CampaignTarget[] {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const target: CampaignTarget = {
        id: this.generateTargetId(),
        email: values[headers.indexOf('email')] || '',
        name: values[headers.indexOf('name')] || '',
        position: values[headers.indexOf('position')],
        department: values[headers.indexOf('department')],
        customFields: {}
      };

      // Add custom fields
      headers.forEach((header, index) => {
        if (!['email', 'name', 'position', 'department'].includes(header)) {
          target.customFields![header] = values[index] || '';
        }
      });

      return target;
    }).filter(target => target.email);
  }

  // Template Management - Now synced with EmailTemplateService
  saveTemplate(template: Omit<CampaignTemplate, 'id'>): string {
    // EmailTemplateService is already imported at the top
    
    // Save to EmailTemplateService first
    const emailTemplate = EmailTemplateService.saveTemplate({
      name: template.name,
      subject: template.subject,
      body: template.content,
      senderName: 'Campaign System',
      senderEmail: 'system@company.com',
      attackVector: template.attackVector,
      riskLevel: template.riskLevel,
      techniques: template.socialEngineeringTechniques,
      assets: [],
      description: `Campaign template: ${template.name}`,
      placeholders: []
    });
    
    // Create campaign template from email template
    const campaignTemplate: CampaignTemplate = {
      id: emailTemplate.id,
      name: emailTemplate.name,
      subject: emailTemplate.subject,
      content: emailTemplate.body,
      attackVector: emailTemplate.attackVector,
      riskLevel: emailTemplate.riskLevel,
      socialEngineeringTechniques: emailTemplate.techniques
    };
    
    this.templates.set(emailTemplate.id, campaignTemplate);
    this.saveToStorage();
    return emailTemplate.id;
  }

  getTemplates(): CampaignTemplate[] {
    // Sync with EmailTemplateService
    const emailTemplates = EmailTemplateService.getAllTemplates();
    
    // Convert email templates to campaign templates
    const campaignTemplates: CampaignTemplate[] = emailTemplates.map(et => ({
      id: et.id,
      name: et.name,
      subject: et.subject,
      content: et.body,
      attackVector: et.attackVector,
      riskLevel: et.riskLevel as "low" | "medium" | "high",
      socialEngineeringTechniques: et.techniques
    }));
    
    // Update internal storage
    this.templates.clear();
    campaignTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
    
    return campaignTemplates;
  }

  createTemplateFromEmail(email: GeneratedEmail): CampaignTemplate {
    // EmailTemplateService is already imported at the top
    
    // Save to EmailTemplateService first
    const emailTemplate = EmailTemplateService.saveGeneratedEmailAsTemplate(
      email,
      `Generated ${email.attackVector} Template`
    );
    
    // Return as campaign template
    return {
      id: emailTemplate.id,
      name: emailTemplate.name,
      subject: emailTemplate.subject,
      content: emailTemplate.body,
      attackVector: emailTemplate.attackVector,
      riskLevel: emailTemplate.riskLevel,
      socialEngineeringTechniques: emailTemplate.techniques
    };
  }

  // Scheduling and Follow-ups
  getScheduledCampaigns(): Campaign[] {
    return this.getAllCampaigns().filter(c => 
      c.status === 'scheduled' || c.status === 'active'
    );
  }

  processPendingEmails(): void {
    const now = new Date();
    const activeCampaigns = this.getAllCampaigns().filter(c => c.status === 'active');

    activeCampaigns.forEach(campaign => {
      const executions = this.executions.get(campaign.id) || [];
      
      executions.forEach(execution => {
        if (execution.status === 'pending' || execution.status === 'active') {
          if (this.shouldSendEmail(campaign, execution, now)) {
            this.sendScheduledEmail(campaign, execution).catch(console.error);
          }
        }
      });
    });
  }

  // Analytics
  getCampaignAnalytics(campaignId: string): Campaign['stats'] | undefined {
    const campaign = this.campaigns.get(campaignId);
    return campaign?.stats;
  }

  getGlobalAnalytics(): {
    totalCampaigns: number;
    activeCampaigns: number;
    totalTargets: number;
    totalEmailsSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    topPerformingCampaigns: Array<{id: string, name: string, openRate: number}>;
  } {
    const campaigns = this.getAllCampaigns();
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalTargets = campaigns.reduce((sum, c) => sum + c.stats.totalTargets, 0);
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.stats.emailsSent, 0);
    
    const campaignsWithEmails = campaigns.filter(c => c.stats.emailsSent > 0);
    const averageOpenRate = campaignsWithEmails.length > 0
      ? campaignsWithEmails.reduce((sum, c) => sum + c.stats.openRate, 0) / campaignsWithEmails.length
      : 0;
    
    const averageClickRate = campaignsWithEmails.length > 0
      ? campaignsWithEmails.reduce((sum, c) => sum + c.stats.clickRate, 0) / campaignsWithEmails.length
      : 0;

    const topPerformingCampaigns = campaigns
      .filter(c => c.stats.emailsSent > 0)
      .sort((a, b) => b.stats.openRate - a.stats.openRate)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: c.name,
        openRate: c.stats.openRate
      }));

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalTargets,
      totalEmailsSent,
      averageOpenRate,
      averageClickRate,
      topPerformingCampaigns
    };
  }

  // Private Methods
  private initializeCampaignExecutions(campaign: Campaign): void {
    const executions: CampaignExecution[] = campaign.targets.map(target => ({
      campaignId: campaign.id,
      targetId: target.id,
      emailsSent: 0,
      followUpsSent: 0,
      status: 'pending' as const,
      nextEmailScheduled: campaign.schedule.frequency === 'immediate' 
        ? new Date() 
        : campaign.schedule.startDate
    }));

    this.executions.set(campaign.id, executions);
  }

  private async executeImmediateSend(campaign: Campaign): Promise<void> {
    console.log('Starting immediate send for campaign:', campaign.id);
    const { EmailService } = await import('./emailService');
    const executions = this.executions.get(campaign.id) || [];
    console.log('Found executions:', executions.length);
    
    for (const execution of executions) {
      if (execution.status === 'pending') {
        // Get target email from campaign targets
        const target = campaign.targets.find(t => t.id === execution.targetId);
        if (!target) {
          console.error(`Target not found for execution ${execution.targetId}`);
          continue;
        }
        
        try {
          console.log('Sending email to:', target.email);
          
          // Get the full email template with assets
          const emailTemplate = EmailTemplateService.getTemplate(campaign.template.id);
          if (!emailTemplate) {
            console.error(`Email template not found: ${campaign.template.id}`);
            execution.status = 'failed';
            continue;
          }
          
          // Apply template with target data
          const processedTemplate = EmailTemplateService.applyTemplate(emailTemplate, target);
          
          const result = await EmailService.sendEmail({
            to: target.email,
            subject: processedTemplate.subject,
            html: processedTemplate.body,
            campaignId: campaign.id
          });
          
          console.log('Email send result:', result);
          if (result.success) {
            execution.emailsSent = 1;
            execution.lastEmailSent = new Date();
            execution.status = 'completed';
            campaign.stats.emailsSent++;
          } else {
            console.error(`Failed to send email to ${target.email}:`, result.error);
            execution.status = 'failed';
          }
        } catch (error) {
          console.error(`Error sending email to ${target.email}:`, error);
          execution.status = 'failed';
        }
      }
    }

    this.updateCampaignStats(campaign.id);
  }

  private shouldSendEmail(campaign: Campaign, execution: CampaignExecution, now: Date): boolean {
    if (!execution.nextEmailScheduled) return false;
    return now >= execution.nextEmailScheduled;
  }

  private async sendScheduledEmail(campaign: Campaign, execution: CampaignExecution): Promise<void> {
    const { EmailService } = await import('./emailService');
    
    // Get target email from campaign targets
    const target = campaign.targets.find(t => t.id === execution.targetId);
    if (!target) {
      console.error(`Target not found for execution ${execution.targetId}`);
      return;
    }
    
    try {
      // Get the full email template with assets
      const emailTemplate = EmailTemplateService.getTemplate(campaign.template.id);
      if (!emailTemplate) {
        console.error(`Email template not found: ${campaign.template.id}`);
        return;
      }
      
      // Apply template with target data
      const processedTemplate = EmailTemplateService.applyTemplate(emailTemplate, target);
      
      const result = await EmailService.sendEmail({
        to: target.email,
        subject: processedTemplate.subject,
        html: processedTemplate.body,
        campaignId: campaign.id
      });
      
      if (result.success) {
        execution.emailsSent++;
        execution.lastEmailSent = new Date();
        
        // Calculate next send time based on frequency
        if (execution.emailsSent < campaign.settings.maxEmailsPerTarget) {
          execution.nextEmailScheduled = this.calculateNextSendTime(campaign.schedule);
        } else {
          execution.status = 'completed';
        }

        campaign.stats.emailsSent++;
      } else {
        console.error(`Failed to send email to ${target.email}:`, result.error);
      }
    } catch (error) {
      console.error(`Error sending email to ${target.email}:`, error);
    }
    
    this.updateCampaignStats(campaign.id);
  }

  private calculateNextSendTime(schedule: CampaignSchedule): Date {
    const now = new Date();
    const nextSend = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        nextSend.setDate(now.getDate() + (schedule.interval || 1));
        break;
      case 'weekly':
        nextSend.setDate(now.getDate() + 7 * (schedule.interval || 1));
        break;
      case 'monthly':
        nextSend.setMonth(now.getMonth() + (schedule.interval || 1));
        break;
    }

    return nextSend;
  }

  private updateCampaignStats(campaignId: string): void {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    // Recalculate rates
    if (campaign.stats.emailsSent > 0) {
      campaign.stats.openRate = (campaign.stats.emailsOpened / campaign.stats.emailsSent) * 100;
      campaign.stats.clickRate = campaign.stats.emailsOpened > 0 
        ? (campaign.stats.linksClicked / campaign.stats.emailsOpened) * 100 
        : 0;
      campaign.stats.conversionRate = (campaign.stats.formsSubmitted / campaign.stats.emailsSent) * 100;
    }

    campaign.updatedAt = new Date();
    this.campaigns.set(campaignId, campaign);
  }

  private initializeDefaultTemplates(): void {
    if (this.templates.size === 0) {
      const defaultTemplates: CampaignTemplate[] = [
        {
          id: 'tpl-1',
          name: 'Password Reset',
          subject: 'Urgent: Password Reset Required',
          content: 'Your password will expire soon. Click here to reset.',
          attackVector: 'Credential Harvesting',
          riskLevel: 'high',
          socialEngineeringTechniques: ['Urgency', 'Authority']
        },
        {
          id: 'tpl-2', 
          name: 'Invoice Payment',
          subject: 'Invoice Payment Overdue',
          content: 'Please review and pay the attached invoice immediately.',
          attackVector: 'Malware Delivery',
          riskLevel: 'medium',
          socialEngineeringTechniques: ['Urgency', 'Financial pressure']
        }
      ];

      defaultTemplates.forEach(template => {
        this.templates.set(template.id, template);
      });
    }
  }

  private generateCampaignId(): string {
    return `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTargetId(): string {
    return `TGT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTemplateId(): string {
    return `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('phishing-campaigns-v2', JSON.stringify(Array.from(this.campaigns.entries())));
      localStorage.setItem('phishing-executions', JSON.stringify(Array.from(this.executions.entries())));
      localStorage.setItem('phishing-templates', JSON.stringify(Array.from(this.templates.entries())));
    } catch (error) {
      console.warn('Failed to save campaign data to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const campaignsData = localStorage.getItem('phishing-campaigns-v2');
      if (campaignsData) {
        const entries = JSON.parse(campaignsData);
        this.campaigns = new Map(entries.map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            createdAt: new Date(value.createdAt),
            updatedAt: new Date(value.updatedAt),
            schedule: {
              ...value.schedule,
              startDate: new Date(value.schedule.startDate),
              endDate: value.schedule.endDate ? new Date(value.schedule.endDate) : undefined
            }
          }
        ]));
      }

      const executionsData = localStorage.getItem('phishing-executions');
      if (executionsData) {
        const entries = JSON.parse(executionsData);
        this.executions = new Map(entries.map(([key, value]: [string, any]) => [
          key,
          value.map((exec: any) => ({
            ...exec,
            lastEmailSent: exec.lastEmailSent ? new Date(exec.lastEmailSent) : undefined,
            nextEmailScheduled: exec.nextEmailScheduled ? new Date(exec.nextEmailScheduled) : undefined
          }))
        ]));
      }

      const templatesData = localStorage.getItem('phishing-templates');
      if (templatesData) {
        const entries = JSON.parse(templatesData);
        this.templates = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load campaign data from localStorage:', error);
    }
  }
}