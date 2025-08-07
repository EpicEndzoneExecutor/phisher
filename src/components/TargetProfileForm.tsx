import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface TargetProfile {
  name: string;
  position: string;
  department: string;
  company: string;
  email: string;
  industry: string;
  context: string;
  urgencyLevel: string;
  attackVector: string;
  additionalNotes: string;
}

interface TargetProfileFormProps {
  onProfileSubmit: (profile: TargetProfile) => void;
  isGenerating: boolean;
}

export const TargetProfileForm = ({ onProfileSubmit, isGenerating }: TargetProfileFormProps) => {
  const [profile, setProfile] = useState<TargetProfile>({
    name: "",
    position: "",
    department: "",
    company: "",
    email: "",
    industry: "",
    context: "",
    urgencyLevel: "",
    attackVector: "",
    additionalNotes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileSubmit(profile);
  };

  const handleInputChange = (field: keyof TargetProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const loadPreset = (preset: string) => {
    const presets = {
      "hr-employee": {
        name: "Sarah Johnson",
        position: "HR Manager",
        department: "Human Resources",
        company: "TechCorp Solutions",
        email: "sarah.johnson@techcorp.com",
        industry: "Technology",
        context: "Recently posted about hiring initiatives on LinkedIn. Company uses Microsoft 365 and Slack.",
        urgencyLevel: "medium",
        attackVector: "credential-harvesting",
        additionalNotes: "Target is active on social media and responds quickly to urgent requests."
      },
      "finance-manager": {
        name: "Michael Chen",
        position: "Finance Manager",
        department: "Finance",
        company: "Global Industries Inc",
        email: "m.chen@globalind.com",
        industry: "Manufacturing",
        context: "Handles vendor payments and invoice processing. Often works late and responds to urgent payment requests.",
        urgencyLevel: "high",
        attackVector: "business-email-compromise",
        additionalNotes: "Has authority to approve payments up to $50,000. Uses QuickBooks and SAP."
      },
      "it-admin": {
        name: "Alex Rodriguez",
        position: "IT Administrator",
        department: "Information Technology",
        company: "MedHealth Systems",
        email: "alex.r@medhealth.com",
        industry: "Healthcare",
        context: "Manages security updates and system maintenance. Recently dealt with a minor security incident.",
        urgencyLevel: "high",
        attackVector: "malware-delivery",
        additionalNotes: "Security-conscious but under pressure to maintain system uptime. Uses multiple admin tools."
      }
    };

    const selectedPreset = presets[preset as keyof typeof presets];
    if (selectedPreset) {
      setProfile(selectedPreset);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">🎯 Target Profile</span>
        </CardTitle>
        <CardDescription>
          Define the target's profile to generate contextually relevant phishing emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => loadPreset("hr-employee")}
            >
              Load HR Preset
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => loadPreset("finance-manager")}
            >
              Load Finance Preset
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => loadPreset("it-admin")}
            >
              Load IT Preset
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Target Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position/Title</Label>
              <Input
                id="position"
                value={profile.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="e.g., HR Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profile.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="e.g., Human Resources"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="e.g., TechCorp Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="e.g., john.smith@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select onValueChange={(value) => handleInputChange("industry", value)} value={profile.industry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgencyLevel">Urgency Level</Label>
              <Select onValueChange={(value) => handleInputChange("urgencyLevel", value)} value={profile.urgencyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Routine request</SelectItem>
                  <SelectItem value="medium">Medium - Time-sensitive</SelectItem>
                  <SelectItem value="high">High - Urgent action required</SelectItem>
                  <SelectItem value="critical">Critical - Immediate response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attackVector">Attack Vector</Label>
              <Select onValueChange={(value) => handleInputChange("attackVector", value)} value={profile.attackVector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select attack type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credential-harvesting">Credential Harvesting</SelectItem>
                  <SelectItem value="malware-delivery">Malware Delivery</SelectItem>
                  <SelectItem value="business-email-compromise">Business Email Compromise</SelectItem>
                  <SelectItem value="invoice-fraud">Invoice Fraud</SelectItem>
                  <SelectItem value="social-engineering">Social Engineering</SelectItem>
                  <SelectItem value="spear-phishing">Spear Phishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context & Background</Label>
            <Textarea
              id="context"
              value={profile.context}
              onChange={(e) => handleInputChange("context", e.target.value)}
              placeholder="Describe the target's current situation, recent activities, tools they use, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={profile.additionalNotes}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              placeholder="Any additional context, vulnerabilities, or specific scenarios to consider"
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isGenerating || !profile.name || !profile.position}
          >
            {isGenerating ? "Generating Email..." : "Generate Phishing Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};