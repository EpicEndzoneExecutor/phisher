export const quickTemplateData = {
  'security-alert': {
    name: 'Security Alert - Suspicious Activity',
    description: 'Urgent security notification with threat indicators',
    subject: 'CRITICAL: Unauthorized Access Attempt - {{firstName}} {{lastName}}',
    senderName: 'Security Operations Center',
    senderEmail: 'security-alerts@{{company}}.com',
    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; line-height: 1.6; }
        .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 6px; }
        .btn { display: inline-block; background-color: #dc2626; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .urgent { color: #dc2626; font-weight: bold; background-color: #fef2f2; padding: 3px 8px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🛡️ {{company}} Security</div>
            <h1 style="margin: 0; font-size: 20px;">SECURITY INCIDENT DETECTED</h1>
        </div>
        <div class="content">
            <h2 style="color: #dc2626; margin-top: 0;">Immediate Action Required</h2>
            
            <p>Dear {{firstName}},</p>
            
            <div class="alert-box">
                <strong>🚨 THREAT ALERT</strong><br>
                Multiple unauthorized access attempts detected on your {{company}} corporate account from IP address: 185.220.101.42 (TOR Network)
            </div>
            
            <p><strong>Incident Summary:</strong></p>
            <ul>
                <li>📅 Time: ${new Date().toLocaleString()}</li>
                <li>🌍 Location: Eastern Europe (High Risk)</li>
                <li>💻 Device: Linux/Firefox (Unrecognized)</li>
                <li>🎯 Target: {{email}}</li>
                <li>🔢 Attempts: 47 failed login attempts</li>
            </ul>
            
            <p class="urgent">Your account will be suspended in 2 hours unless you verify your identity.</p>
            
            <center>
                <a href="{{trackingLink}}" class="btn">🔐 VERIFY IDENTITY NOW</a>
            </center>
            
            <p><strong>⚠️ WARNING:</strong> Do not ignore this alert. Failure to respond may result in:</p>
            <ul>
                <li>Complete account lockout</li>
                <li>Loss of access to company systems</li>
                <li>Potential data compromise</li>
                <li>IT security investigation</li>
            </ul>
            
            <p>This alert was generated automatically by our AI-powered threat detection system.</p>
            
            <p>Security Team<br>
            <strong>{{company}} Cybersecurity Division</strong><br>
            SOC Hotline: +1-800-SEC-HELP | security@{{company}}.com</p>
        </div>
        <div class="footer">
            <p><strong>{{company}} Security Operations Center</strong></p>
            <p>This is an automated security alert. Incident ID: SEC-${Date.now()}</p>
        </div>
    </div>
</body>
</html>`,
    attackVector: 'urgency',
    riskLevel: 'high' as const,
    techniques: ['Urgency', 'Fear', 'Authority', 'Technical Jargon']
  },

  'finance-invoice': {
    name: 'Urgent Invoice Payment Request',
    description: 'Finance department payment notification',
    subject: 'OVERDUE: Invoice Payment Required - {{company}} Account #{{firstName}}',
    senderName: 'Accounts Payable',
    senderEmail: 'finance@{{company}}.com',
    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Payment</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #fafafa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e1e5e9; }
        .header { background: linear-gradient(135deg, #0f766e, #134e4a); color: white; padding: 25px; }
        .content { padding: 30px; line-height: 1.6; }
        .invoice-box { background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .btn { display: inline-block; background-color: #0f766e; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; font-size: 12px; color: #64748b; text-align: center; }
        .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        .table th { background-color: #f1f5f9; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">💼 {{company}} Finance</div>
            <h1 style="margin: 0; font-size: 18px;">Payment Overdue Notice</h1>
        </div>
        <div class="content">
            <h2 style="color: #0f766e; margin-top: 0;">Payment Required: Invoice #INV-${Date.now()}</h2>
            
            <p>Dear {{firstName}},</p>
            
            <div class="invoice-box">
                <strong>📋 PAYMENT OVERDUE</strong><br>
                Your invoice payment is now <span style="color: #dc2626; font-weight: bold;">15 days overdue</span>. Immediate payment is required to avoid service interruption.
            </div>
            
            <table class="table">
                <tr>
                    <th>Invoice Details</th>
                    <th>Amount</th>
                </tr>
                <tr>
                    <td>Invoice Number</td>
                    <td>INV-${Date.now()}</td>
                </tr>
                <tr>
                    <td>Due Date</td>
                    <td>${new Date(Date.now() - 15*24*60*60*1000).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td>Services</td>
                    <td>{{department}} Consulting Services</td>
                </tr>
                <tr>
                    <td><strong>Total Amount Due</strong></td>
                    <td class="amount">$4,847.32</td>
                </tr>
            </table>
            
            <p><strong>⚠️ URGENT:</strong> Payment must be processed within 48 hours to avoid:</p>
            <ul>
                <li>Service suspension</li>
                <li>Late payment fees ($250)</li>
                <li>Collection agency referral</li>
                <li>Account closure</li>
            </ul>
            
            <center>
                <a href="{{trackingLink}}" class="btn">💳 PAY INVOICE NOW</a>
            </center>
            
            <p><strong>Payment Methods Accepted:</strong></p>
            <ul>
                <li>Online portal (secure payment)</li>
                <li>Wire transfer</li>
                <li>ACH payment</li>
                <li>Corporate credit card</li>
            </ul>
            
            <p>For questions about this invoice, contact our finance team immediately.</p>
            
            <p>Best regards,<br>
            <strong>{{company}} Finance Department</strong><br>
            Email: billing@{{company}}.com | Phone: (555) 123-4567</p>
        </div>
        <div class="footer">
            <p><strong>{{company}} Accounts Payable</strong></p>
            <p>This invoice was sent to {{email}}. Payment terms: Net 30 days.</p>
        </div>
    </div>
</body>
</html>`,
    attackVector: 'urgency',
    riskLevel: 'high' as const,
    techniques: ['Urgency', 'Authority', 'Fear', 'Scarcity']
  },

  'social-invitation': {
    name: 'Company Event Invitation',
    description: 'Social engineering through event invitations',
    subject: '🎉 You\'re Invited: {{company}} Annual Awards Ceremony',
    senderName: 'Event Planning Committee',
    senderEmail: 'events@{{company}}.com',
    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Invitation</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #fefefe; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; line-height: 1.7; }
        .event-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
        .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
        .footer { background-color: #f8fafc; padding: 25px; font-size: 13px; color: #64748b; text-align: center; }
        .highlight { background-color: #fef3c7; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 28px; margin-bottom: 10px;">🏆</div>
            <h1 style="margin: 0; font-size: 24px;">{{company}} Annual Awards</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Celebrating Excellence Together</p>
        </div>
        <div class="content">
            <h2 style="color: #7c3aed; margin-top: 0;">You're Invited to an Exclusive Celebration!</h2>
            
            <p>Dear {{firstName}},</p>
            
            <p>We're thrilled to invite you to the <strong>{{company}} Annual Awards Ceremony</strong> – our most prestigious event of the year!</p>
            
            <div class="event-box">
                <h3 style="margin-top: 0; color: #7c3aed;">🎊 Special Recognition Event</h3>
                <p><strong>Date:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                <p><strong>Time:</strong> 7:00 PM - 11:00 PM</p>
                <p><strong>Venue:</strong> Grand Ballroom, Downtown Marriott</p>
                <p><strong>Dress Code:</strong> Business Formal</p>
            </div>
            
            <p>This year's theme is <span class="highlight">"Innovation & Excellence"</span> and we'll be recognizing outstanding achievements across all departments including {{department}}.</p>
            
            <p><strong>Event Highlights:</strong></p>
            <ul>
                <li>🥂 Cocktail reception & networking</li>
                <li>🍽️ Three-course gourmet dinner</li>
                <li>🏅 Awards ceremony</li>
                <li>🎵 Live entertainment</li>
                <li>🎁 Exclusive door prizes</li>
            </ul>
            
            <p><strong>RSVP Required:</strong> Please confirm your attendance by clicking below. <span style="color: #dc2626;">Limited seating available!</span></p>
            
            <center>
                <a href="{{trackingLink}}" class="btn">🎫 CONFIRM ATTENDANCE</a>
            </center>
            
            <p><strong>Special Note:</strong> This event is by invitation only and includes recognition for employees who have demonstrated exceptional performance this year.</p>
            
            <p>We're looking forward to celebrating with you!</p>
            
            <p>Warmest regards,<br>
            <strong>{{company}} Event Planning Committee</strong><br>
            Email: events@{{company}}.com | Phone: (555) 789-0123</p>
        </div>
        <div class="footer">
            <p><strong>{{company}} Special Events</strong></p>
            <p>This invitation was sent to {{email}}. Event details subject to change.</p>
        </div>
    </div>
</body>
</html>`,
    attackVector: 'social_proof',
    riskLevel: 'low' as const,
    techniques: ['Social Proof', 'Curiosity', 'Exclusivity', 'FOMO']
  },

  'account-verification': {
    name: 'Account Verification Required',
    description: 'Corporate account verification request',
    subject: 'Action Required: Verify Your {{company}} Account - {{firstName}}',
    senderName: 'Account Security Team',
    senderEmail: 'account-security@{{company}}.com',
    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; line-height: 1.6; }
        .verify-box { background-color: #eff6ff; border: 1px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .btn { display: inline-block; background-color: #1e40af; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; font-size: 12px; color: #64748b; text-align: center; }
        .steps { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 24px; margin-bottom: 10px;">🔐</div>
            <h1 style="margin: 0; font-size: 20px;">{{company}} Account Security</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Verification Required</p>
        </div>
        <div class="content">
            <h2 style="color: #1e40af; margin-top: 0;">Account Verification Required</h2>
            
            <p>Hello {{firstName}},</p>
            
            <p>As part of our enhanced security measures, we need to verify your {{company}} account information to ensure continued access to company resources.</p>
            
            <div class="verify-box">
                <h3 style="margin-top: 0; color: #1e40af;">✅ Verification Needed</h3>
                <p>Your account: <strong>{{email}}</strong></p>
                <p>Department: <strong>{{department}}</strong></p>
                <p>Status: <span style="color: #dc2626; font-weight: bold;">Pending Verification</span></p>
            </div>
            
            <div class="steps">
                <h4 style="margin-top: 0;">Verification Process (2-3 minutes):</h4>
                <ol>
                    <li>Click the verification button below</li>
                    <li>Confirm your identity with current credentials</li>
                    <li>Review and update account information</li>
                    <li>Receive confirmation email</li>
                </ol>
            </div>
            
            <p><strong>Why is this needed?</strong></p>
            <ul>
                <li>Recent security policy updates</li>
                <li>Compliance with new regulations</li>
                <li>Enhanced protection against threats</li>
                <li>Improved access management</li>
            </ul>
            
            <center>
                <a href="{{trackingLink}}" class="btn">🔐 VERIFY ACCOUNT NOW</a>
            </center>
            
            <p><strong>Important:</strong> Accounts not verified within 7 days will have limited access to:</p>
            <ul>
                <li>Email systems</li>
                <li>File shares</li>
                <li>VPN access</li>
                <li>Internal applications</li>
            </ul>
            
            <p>This is a one-time verification process to maintain the security of your account and company data.</p>
            
            <p>Thank you for your cooperation,<br>
            <strong>{{company}} Account Security Team</strong><br>
            Email: security@{{company}}.com | Support: ext. 8888</p>
        </div>
        <div class="footer">
            <p><strong>{{company}} Information Security</strong></p>
            <p>This verification request was sent to {{email}} for security compliance.</p>
        </div>
    </div>
</body>
</html>`,
    attackVector: 'authority',
    riskLevel: 'medium' as const,
    techniques: ['Authority', 'Trust', 'Compliance', 'Social Proof']
  }
};