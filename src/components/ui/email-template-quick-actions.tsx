import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickActionProps {
  onCreateTemplate: (templateType: string) => void;
}

export const EmailTemplateQuickActions: React.FC<QuickActionProps> = ({ onCreateTemplate }) => {
  const quickTemplates = [
    {
      type: 'security-alert',
      title: '🔒 Security Alert',
      description: 'Urgent security notification template',
      riskLevel: 'high',
      techniques: ['Urgency', 'Fear', 'Authority']
    },
    {
      type: 'it-update',
      title: '💻 IT System Update',
      description: 'System maintenance notification',
      riskLevel: 'medium',
      techniques: ['Authority', 'Social Proof']
    },
    {
      type: 'hr-document',
      title: '👥 HR Document Review',
      description: 'Employee document verification',
      riskLevel: 'medium',
      techniques: ['Authority', 'Urgency']
    },
    {
      type: 'finance-invoice',
      title: '💰 Invoice Payment',
      description: 'Payment request notification',
      riskLevel: 'high',
      techniques: ['Urgency', 'Authority']
    },
    {
      type: 'social-invitation',
      title: '🎉 Event Invitation',
      description: 'Social engineering via events',
      riskLevel: 'low',
      techniques: ['Social Proof', 'Curiosity']
    },
    {
      type: 'account-verification',
      title: '✅ Account Verification',
      description: 'Account verification request',
      riskLevel: 'medium',
      techniques: ['Authority', 'Trust']
    }
  ];

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Quick Start Templates</h4>
        <p className="text-sm text-muted-foreground">
          Choose from pre-designed templates to get started quickly
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickTemplates.map((template) => (
          <Card key={template.type} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">{template.title}</h5>
                  <Badge variant={getRiskBadgeVariant(template.riskLevel)} className="text-xs">
                    {template.riskLevel}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {template.techniques.slice(0, 2).map((technique, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {technique}
                    </Badge>
                  ))}
                  {template.techniques.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.techniques.length - 2}
                    </Badge>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => onCreateTemplate(template.type)}
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};