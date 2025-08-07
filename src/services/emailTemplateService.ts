export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  body: string;
  attackVector: string;
  riskLevel: 'low' | 'medium' | 'high';
  techniques: string[];
  placeholders: string[];
  assets?: TemplateAsset[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateAsset {
  id: string;
  name: string;
  type: 'logo' | 'attachment' | 'image';
  url: string;
  size: number;
  mimeType: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

export class EmailTemplateService {
  private static readonly STORAGE_KEY = 'phishing_email_templates';
  
  private static defaultVariables: TemplateVariable[] = [
    { name: '{{firstName}}', description: 'Target\'s first name', example: 'John' },
    { name: '{{lastName}}', description: 'Target\'s last name', example: 'Doe' },
    { name: '{{company}}', description: 'Target\'s company', example: 'Acme Corp' },
    { name: '{{position}}', description: 'Target\'s job title', example: 'Manager' },
    { name: '{{email}}', description: 'Target\'s email address', example: 'john.doe@company.com' },
    { name: '{{phone}}', description: 'Target\'s phone number', example: '+1-555-0123' },
    { name: '{{department}}', description: 'Target\'s department', example: 'Sales' },
    { name: '{{trackingLink}}', description: 'Tracking link for analytics', example: 'https://tracking.example.com/abc123' },
  ];

  static getAvailableVariables(): TemplateVariable[] {
    return this.defaultVariables;
  }

  static getAllTemplates(): EmailTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return this.getDefaultTemplates();
      
      const templates = JSON.parse(stored);
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading templates:', error);
      return this.getDefaultTemplates();
    }
  }

  static saveTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): EmailTemplate {
    const templates = this.getAllTemplates();
    const newTemplate: EmailTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    templates.push(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  static updateTemplate(id: string, updates: Partial<EmailTemplate>): EmailTemplate | null {
    const templates = this.getAllTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveTemplates(templates);
    return templates[index];
  }

  static deleteTemplate(id: string): boolean {
    const templates = this.getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);
    
    if (filtered.length === templates.length) return false;
    
    this.saveTemplates(filtered);
    return true;
  }

  static getTemplate(id: string): EmailTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find(t => t.id === id) || null;
  }

  static saveGeneratedEmailAsTemplate(
    generatedEmail: any,
    templateName: string,
    description: string = 'Generated from AI'
  ): EmailTemplate {
    const template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: templateName,
      description,
      subject: generatedEmail.subject,
      senderName: generatedEmail.senderName,
      senderEmail: generatedEmail.senderEmail,
      body: generatedEmail.body,
      attackVector: generatedEmail.attackVector || 'social_engineering',
      riskLevel: generatedEmail.riskLevel || 'medium',
      techniques: generatedEmail.techniques || [],
      placeholders: this.extractPlaceholders(generatedEmail.body + ' ' + generatedEmail.subject),
      assets: []
    };
    
    return this.saveTemplate(template);
  }

  static extractPlaceholders(text: string): string[] {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;
    
    while ((match = placeholderRegex.exec(text)) !== null) {
      const placeholder = `{{${match[1]}}}`;
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }
    
    return placeholders;
  }

  static applyTemplate(template: EmailTemplate, targetData: any): EmailTemplate {
    let processedSubject = template.subject;
    let processedBody = template.body;
    let processedSenderName = template.senderName;
    let processedSenderEmail = template.senderEmail;

    // Replace placeholders with actual data
    this.defaultVariables.forEach(variable => {
      const placeholder = variable.name;
      let value = '';

      switch (placeholder) {
        case '{{firstName}}':
          value = targetData.name?.split(' ')[0] || 'User';
          break;
        case '{{lastName}}':
          value = targetData.name?.split(' ').slice(1).join(' ') || '';
          break;
        case '{{company}}':
          value = targetData.company || 'YourCompany';
          break;
        case '{{position}}':
          value = targetData.position || 'Employee';
          break;
        case '{{email}}':
          value = targetData.email || '';
          break;
        case '{{phone}}':
          value = targetData.phone || '';
          break;
        case '{{department}}':
          value = targetData.department || 'General';
          break;
        case '{{trackingLink}}':
          value = targetData.trackingLink || '#';
          break;
      }

      processedSubject = processedSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      processedBody = processedBody.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      processedSenderName = processedSenderName.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      processedSenderEmail = processedSenderEmail.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Ensure proper HTML structure and formatting
    if (!processedBody.includes('<!DOCTYPE html>')) {
      // If it's plain text, wrap it in proper HTML email structure
      processedBody = this.wrapInEmailHTML(processedBody);
    }

    // Process assets - embed images in email HTML
    let finalBody = processedBody;
    if (template.assets && template.assets.length > 0) {
      template.assets.forEach(asset => {
        if (asset.mimeType?.startsWith('image/')) {
          // Create a proper image placeholder in the email
          const imageTag = `<div style="text-align: center; margin: 20px 0;">
            <img src="${asset.url}" alt="${asset.name}" style="max-width: 100%; height: auto; max-height: 300px; border-radius: 4px;" />
          </div>`;
          
          // If the body contains the asset URL, replace it with proper img tag
          const assetRegex = new RegExp(asset.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          if (finalBody.includes(asset.url)) {
            finalBody = finalBody.replace(assetRegex, imageTag);
          } else {
            // Insert image before the closing content div
            finalBody = finalBody.replace('</div>\s*<div class="footer">', `${imageTag}</div><div class="footer"`);
          }
        }
      });
    }

    return {
      ...template,
      subject: processedSubject,
      body: finalBody,
      senderName: processedSenderName,
      senderEmail: processedSenderEmail,
    };
  }

  private static wrapInEmailHTML(content: string): string {
    // Convert plain text to HTML email with proper structure
    const htmlContent = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
            line-height: 1.6;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border: 1px solid #e1e5e9;
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
        .content { 
            padding: 30px; 
        }
        .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280; 
        }
        a { 
            color: #3b82f6; 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 20px;">Email Communication</h1>
        </div>
        <div class="content">
            <p>${htmlContent}</p>
        </div>
        <div class="footer">
            <p>This email was sent for business purposes.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private static saveTemplates(templates: EmailTemplate[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Account Security Alert',
        description: 'Urgent security notification template',
        subject: 'URGENT: Account Security Alert - Immediate Action Required',
        senderName: 'Security Operations Center',
        senderEmail: 'security-alerts@{{company}}.com',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 30px; }
        .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .btn { display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .warning { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔒 {{company}} Security Center</div>
            <h1 style="margin: 0; font-size: 20px;">SECURITY ALERT</h1>
        </div>
        <div class="content">
            <h2 style="color: #dc2626; margin-top: 0;">Suspicious Activity Detected</h2>
            
            <p>Dear {{firstName}},</p>
            
            <div class="alert-box">
                <strong>⚠️ IMMEDIATE ACTION REQUIRED</strong><br>
                We've detected multiple unauthorized login attempts on your {{company}} account from an unrecognized device.
            </div>
            
            <p><strong>Incident Details:</strong></p>
            <ul>
                <li>Time: ${new Date().toLocaleString()}</li>
                <li>Location: Unknown IP address</li>
                <li>Device: Unrecognized browser</li>
                <li>Account: {{email}}</li>
            </ul>
            
            <p class="warning">To secure your account and prevent data breach, immediate verification is required.</p>
            
            <center>
                <a href="{{trackingLink}}" class="btn">🔐 SECURE MY ACCOUNT NOW</a>
            </center>
            
            <p><strong>Important:</strong> If you don't verify your identity within <span style="color: #dc2626;">24 hours</span>, your account will be temporarily suspended as a security measure.</p>
            
            <p>If you did not attempt to access your account, please contact our security team immediately.</p>
            
            <p>Best regards,<br>
            <strong>{{company}} Security Operations Center</strong><br>
            Email: security@{{company}}.com<br>
            Phone: 1-800-SECURITY</p>
        </div>
        <div class="footer">
            <p>This is an automated security alert from {{company}}. Please do not reply to this email.</p>
            <p>© 2024 {{company}}. All rights reserved. | Privacy Policy | Security Center</p>
        </div>
    </div>
</body>
</html>`,
        attackVector: 'urgency',
        riskLevel: 'high',
        techniques: ['Urgency', 'Authority', 'Fear'],
        placeholders: ['{{firstName}}', '{{lastName}}', '{{company}}', '{{trackingLink}}', '{{email}}'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'template-2',
        name: 'IT System Update',
        description: 'Corporate system maintenance notification',
        subject: 'MANDATORY: {{company}} System Maintenance - Action Required',
        senderName: 'IT Operations Team',
        senderEmail: 'it-operations@{{company}}.com',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Maintenance</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 25px; }
        .logo { font-size: 22px; font-weight: bold; margin-bottom: 8px; }
        .content { padding: 30px; line-height: 1.6; }
        .notice-box { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .btn { display: inline-block; background-color: #2563eb; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 25px; font-size: 13px; color: #64748b; }
        .highlight { background-color: #fef3c7; padding: 2px 6px; border-radius: 3px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💻 {{company}} IT Operations</div>
            <h1 style="margin: 0; font-size: 20px;">System Maintenance Notice</h1>
        </div>
        <div class="content">
            <h2 style="color: #1e40af; margin-top: 0;">Mandatory System Update Required</h2>
            
            <p>Hello {{firstName}},</p>
            
            <div class="notice-box">
                <strong>📋 COMPLIANCE NOTICE</strong><br>
                As part of our quarterly security compliance update, all employees in the <strong>{{department}}</strong> department must update their system credentials before <span class="highlight">${new Date(Date.now() + 48*60*60*1000).toLocaleDateString()}</span>.
            </div>
            
            <p><strong>Update Requirements:</strong></p>
            <ul>
                <li>✅ Password reset for enhanced security</li>
                <li>✅ Multi-factor authentication setup</li>
                <li>✅ Security policy acknowledgment</li>
                <li>✅ System access verification</li>
            </ul>
            
            <p><strong>Deadline:</strong> This update must be completed within <span style="color: #dc2626; font-weight: bold;">48 hours</span> to maintain system access.</p>
            
            <center>
                <a href="{{trackingLink}}" class="btn">🔄 UPDATE MY CREDENTIALS</a>
            </center>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
                <li>Failure to complete this update may result in temporary account suspension</li>
                <li>This affects all {{department}} team members</li>
                <li>The process takes approximately 5-10 minutes</li>
            </ul>
            
            <p>If you experience any issues during the update process, please contact the IT Help Desk immediately.</p>
            
            <p>Thank you for your cooperation,<br>
            <strong>{{company}} IT Operations Team</strong><br>
            Email: it-support@{{company}}.com<br>
            Help Desk: ext. 4357 | Ticket System: helpdesk.{{company}}.com</p>
        </div>
        <div class="footer">
            <p><strong>{{company}} Information Technology Department</strong></p>
            <p>This email was sent to {{email}} as part of mandatory system maintenance procedures.</p>
            <p>© 2024 {{company}}. All rights reserved. | IT Policies | Security Guidelines</p>
        </div>
    </div>
</body>
</html>`,
        attackVector: 'authority',
        riskLevel: 'medium',
        techniques: ['Authority', 'Social Proof', 'Urgency'],
        placeholders: ['{{firstName}}', '{{company}}', '{{department}}', '{{trackingLink}}', '{{email}}'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'template-3',
        name: 'HR Document Review',
        description: 'Human resources document verification request',
        subject: 'Action Required: Annual Employee Document Review - {{firstName}}',
        senderName: 'Human Resources',
        senderEmail: 'hr@{{company}}.com',
        body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Document Review</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fafafa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e1e5e9; }
        .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; }
        .logo { font-size: 22px; font-weight: bold; margin-bottom: 8px; }
        .content { padding: 30px; line-height: 1.6; }
        .urgent-box { background-color: #fef7cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
        .footer { background-color: #f7fafc; padding: 20px; font-size: 12px; color: #718096; text-align: center; }
        .deadline { color: #dc2626; font-weight: bold; background-color: #fef2f2; padding: 3px 8px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👥 {{company}} Human Resources</div>
            <h1 style="margin: 0; font-size: 18px;">Annual Document Review</h1>
        </div>
        <div class="content">
            <h2 style="color: #047857; margin-top: 0;">Employee Document Verification Required</h2>
            
            <p>Dear {{firstName}},</p>
            
            <p>As part of our annual compliance audit and employee record updates, we need you to review and verify your current employment documents.</p>
            
            <div class="urgent-box">
                <strong>⏰ DEADLINE APPROACHING</strong><br>
                Please complete your document review by <span class="deadline">${new Date(Date.now() + 72*60*60*1000).toLocaleDateString()}</span> to ensure compliance with company policies and legal requirements.
            </div>
            
            <p><strong>Documents requiring verification:</strong></p>
            <ul>
                <li>📋 Personal Information Form</li>
                <li>🏦 Banking & Direct Deposit Details</li>
                <li>🆔 Emergency Contact Information</li>
                <li>📄 Tax Withholding (W-4) Documents</li>
                <li>🏥 Benefits Enrollment Status</li>
            </ul>
            
            <p>This review is <strong>mandatory</strong> for all employees and takes approximately 10-15 minutes to complete.</p>
            
            <center>
                <a href="{{trackingLink}}" class="btn">📝 START DOCUMENT REVIEW</a>
            </center>
            
            <p><strong>Important:</strong> Failure to complete this review by the deadline may affect:</p>
            <ul>
                <li>Payroll processing</li>
                <li>Benefits coverage</li>
                <li>Access to HR systems</li>
            </ul>
            
            <p>If you have any questions about this process, please don't hesitate to contact our HR team.</p>
            
            <p>Best regards,<br>
            <strong>{{company}} Human Resources Department</strong><br>
            Email: hr@{{company}}.com<br>
            Phone: (555) 123-4567 | Employee Portal: portal.{{company}}.com</p>
        </div>
        <div class="footer">
            <p><strong>{{company}} Human Resources</strong></p>
            <p>This email was sent to {{email}} regarding mandatory annual document review.</p>
            <p>© 2024 {{company}}. Confidential HR Communication. | Employee Handbook | HR Policies</p>
        </div>
    </div>
</body>
</html>`,
        attackVector: 'authority',
        riskLevel: 'medium',
        techniques: ['Authority', 'Urgency', 'Social Proof'],
        placeholders: ['{{firstName}}', '{{company}}', '{{email}}', '{{trackingLink}}'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }
}