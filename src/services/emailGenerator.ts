import { TargetProfile } from "@/components/TargetProfileForm";
import { AIConfig } from "@/components/AIConfiguration";
import { GeneratedEmail } from "@/components/EmailPreview";

export class EmailGeneratorService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  updateConfig(config: AIConfig) {
    this.config = config;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.provider === "Ollama") {
        const response = await fetch(this.config.apiEndpoint.replace('/generate', '/tags'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          return { success: false, error: `Ollama server error: ${response.statusText}. Make sure Ollama is running with CORS enabled.` };
        }
        return { success: true };
      } else {
        // Validate API key first
        if (!this.config.apiKey || this.config.apiKey.trim() === '') {
          return { success: false, error: 'API key is required. Please enter your API key.' };
        }
        
        // Simple test request
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            return { success: false, error: 'Invalid API key. Please check your API key.' };
          } else if (response.status === 429) {
            return { success: false, error: 'API quota exceeded. Please check your billing.' };
          } else if (response.status === 404) {
            return { success: false, error: 'Model not found. Please check your model name.' };
          }
          return { success: false, error: `API error (${response.status}): ${errorData.error?.message || response.statusText}` };
        }
        
        return { success: true };
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        return { success: false, error: 'Cannot reach server. For Ollama, ensure it\'s running and CORS is enabled.' };
      }
      return { success: false, error: `Connection failed: ${error.message}` };
    }
  }

  private generatePrompt(profile: TargetProfile): string {
    const basePrompt = `You are a cybersecurity researcher creating realistic phishing emails for security testing and training purposes. Generate a convincing phishing email based on the target profile.

IMPORTANT: This is for legitimate security testing only. Include realistic but harmless content.

Target Profile:
- Name: ${profile.name}
- Position: ${profile.position}
- Department: ${profile.department}
- Company: ${profile.company}
- Email: ${profile.email}
- Industry: ${profile.industry}
- Context: ${profile.context}
- Urgency Level: ${profile.urgencyLevel}
- Attack Vector: ${profile.attackVector}
- Additional Notes: ${profile.additionalNotes}

${this.getAttackVectorInstructions(profile.attackVector)}

Requirements:
1. Create a realistic email subject line
2. Choose an appropriate sender (e.g., IT department, HR, external vendor)
3. Write the email body using social engineering techniques
4. Include subtle urgency without being overly obvious
5. Use company-specific terminology when possible
6. Make it contextually relevant to the target's role

Output format:
SUBJECT: [email subject]
FROM: [sender name] <[sender email]>
BODY:
[email content]

TECHNIQUES: [list social engineering techniques used]
RISK_LEVEL: [low/medium/high/critical]`;

    if (this.config.customInstructions) {
      return `${basePrompt}\n\nAdditional Instructions: ${this.config.customInstructions}`;
    }

    return basePrompt;
  }

  private getAttackVectorInstructions(attackVector: string): string {
    const instructions = {
      "credential-harvesting": "Focus on creating urgency around account security, password expiration, or login verification. Include a fake link to a credential harvesting page.",
      "malware-delivery": "Create a scenario requiring the target to download and open an attachment or click a malicious link. Frame it as a necessary business document or software update.",
      "business-email-compromise": "Impersonate a CEO, manager, or vendor requesting urgent financial action, payment, or sensitive information transfer.",
      "invoice-fraud": "Create a fake invoice or payment request that appears legitimate, targeting the finance department or someone with payment authority.",
      "social-engineering": "Use personal information and social context to build trust and manipulate the target into taking a specific action.",
      "spear-phishing": "Highly targeted attack using specific information about the target, their role, and recent company activities or events."
    };

    return `Attack Vector Focus: ${instructions[attackVector as keyof typeof instructions] || instructions["credential-harvesting"]}`;
  }

  async generateEmail(profile: TargetProfile): Promise<GeneratedEmail | null> {
    try {
      const prompt = this.generatePrompt(profile);
      let response;

      if (this.config.provider === "Ollama") {
        response = await this.callOllamaAPI(prompt);
      } else if (this.config.provider === "OpenAI") {
        response = await this.callOpenAIAPI(prompt);
      } else if (this.config.provider === "Perplexity") {
        response = await this.callPerplexityAPI(prompt);
      } else {
        response = await this.callCustomAPI(prompt);
      }

      if (!response) {
        throw new Error("No response from AI model");
      }

      return this.parseEmailResponse(response, profile);
    } catch (error) {
      console.error("Failed to generate email:", error);
      throw error;
    }
  }

  private async callOllamaAPI(prompt: string): Promise<string> {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: prompt,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}. Make sure Ollama is running with CORS enabled: OLLAMA_ORIGINS=* ollama serve`);
    }

    const data = await response.json();
    return data.response || data.text || '';
  }

  private async callOpenAIAPI(prompt: string): Promise<string> {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: "You are a cybersecurity researcher creating phishing emails for security testing." },
          { role: "user", content: prompt }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('API quota exceeded. Please check your OpenAI billing.');
      }
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callPerplexityAPI(prompt: string): Promise<string> {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: "You are a cybersecurity researcher creating phishing emails for security testing." },
          { role: "user", content: prompt }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Perplexity API key.');
      }
      throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callCustomAPI(prompt: string): Promise<string> {
    // Implement custom API call logic here
    // This is a placeholder for other AI providers
    throw new Error("Custom API implementation needed");
  }

  private parseEmailResponse(response: string, profile: TargetProfile): GeneratedEmail {
    // Parse the AI response to extract email components
    const lines = response.split('\n');
    let subject = '';
    let sender = '';
    let senderEmail = '';
    let body = '';
    let techniques: string[] = [];
    let riskLevel: "low" | "medium" | "high" | "critical" = "medium";

    let currentSection = '';
    let bodyLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('SUBJECT:')) {
        subject = line.replace('SUBJECT:', '').trim();
      } else if (line.startsWith('FROM:')) {
        const fromMatch = line.match(/FROM:\s*(.+?)\s*<(.+?)>/);
        if (fromMatch) {
          sender = fromMatch[1].trim();
          senderEmail = fromMatch[2].trim();
        } else {
          sender = line.replace('FROM:', '').trim();
          senderEmail = `noreply@${this.generateFakeDomain(profile.company)}`;
        }
      } else if (line.startsWith('BODY:')) {
        currentSection = 'body';
      } else if (line.startsWith('TECHNIQUES:')) {
        const techniquesList = line.replace('TECHNIQUES:', '').trim();
        techniques = techniquesList.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else if (line.startsWith('RISK_LEVEL:')) {
        const level = line.replace('RISK_LEVEL:', '').trim().toLowerCase();
        if (['low', 'medium', 'high', 'critical'].includes(level)) {
          riskLevel = level as "low" | "medium" | "high" | "critical";
        }
      } else if (currentSection === 'body' && !line.startsWith('TECHNIQUES:') && !line.startsWith('RISK_LEVEL:')) {
        bodyLines.push(line);
      }
    }

    body = bodyLines.join('\n').trim();

    // Fallbacks if parsing fails
    if (!subject) {
      subject = this.generateFallbackSubject(profile.attackVector);
    }
    if (!sender) {
      sender = this.generateFallbackSender(profile.attackVector);
      senderEmail = `noreply@${this.generateFakeDomain(profile.company)}`;
    }
    if (!body) {
      body = this.generateFallbackBody(profile);
    }
    if (techniques.length === 0) {
      techniques = this.getDefaultTechniques(profile.attackVector);
    }

    return {
      subject,
      sender,
      senderEmail,
      recipient: profile.name,
      recipientEmail: profile.email,
      body,
      attackVector: profile.attackVector,
      riskLevel,
      techniques,
      trackingId: this.generateTrackingId()
    };
  }

  private generateFakeDomain(company: string): string {
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = ['com', 'net', 'org', 'co'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return `${cleanCompany}.${randomDomain}`;
  }

  private generateFallbackSubject(attackVector: string): string {
    const subjects = {
      "credential-harvesting": "Urgent: Account Security Verification Required",
      "malware-delivery": "Important: Software Update Available",
      "business-email-compromise": "URGENT: Payment Authorization Needed",
      "invoice-fraud": "Outstanding Invoice - Immediate Payment Required",
      "social-engineering": "Quick Question - Need Your Help",
      "spear-phishing": "RE: Your Recent Project Update"
    };
    return subjects[attackVector as keyof typeof subjects] || subjects["credential-harvesting"];
  }

  private generateFallbackSender(attackVector: string): string {
    const senders = {
      "credential-harvesting": "IT Security Team",
      "malware-delivery": "System Administrator",
      "business-email-compromise": "Executive Assistant",
      "invoice-fraud": "Accounts Payable",
      "social-engineering": "HR Department",
      "spear-phishing": "Project Manager"
    };
    return senders[attackVector as keyof typeof senders] || senders["credential-harvesting"];
  }

  private generateFallbackBody(profile: TargetProfile): string {
    return `Dear ${profile.name},

We need your immediate attention regarding a security matter related to your account.

Please verify your credentials as soon as possible to maintain access to company systems.

If you have any questions, please contact our support team.

Best regards,
IT Security Team

---
This email was generated for security testing purposes.`;
  }

  private getDefaultTechniques(attackVector: string): string[] {
    const techniques = {
      "credential-harvesting": ["Urgency", "Authority", "Fear", "Fake Links"],
      "malware-delivery": ["Trust Building", "Legitimacy", "Necessity", "Attachments"],
      "business-email-compromise": ["Authority", "Urgency", "Financial Pressure", "Impersonation"],
      "invoice-fraud": ["Legitimacy", "Business Context", "Payment Pressure", "Vendor Impersonation"],
      "social-engineering": ["Personal Information", "Trust Building", "Reciprocity", "Help Requests"],
      "spear-phishing": ["Personalization", "Context Awareness", "Timing", "Relationship Building"]
    };
    return techniques[attackVector as keyof typeof techniques] || techniques["credential-harvesting"];
  }

  private generateTrackingId(): string {
    return `PST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}