export interface LoginPageTemplate {
  id: string;
  name: string;
  service: string;
  description: string;
  template: string;
  styles: string;
  logoUrl?: string;
}

export interface HarvestingPageConfig {
  template: LoginPageTemplate;
  redirectUrl: string;
  trackingId: string;
  customBranding?: {
    companyName: string;
    logoUrl: string;
  };
}

export interface CredentialSubmission {
  id: string;
  timestamp: Date;
  trackingId: string;
  username: string;
  password: string;
  userAgent: string;
  ipAddress: string;
  service: string;
}

export class CredentialHarvestingService {
  private submissions: CredentialSubmission[] = [];
  private templates: LoginPageTemplate[] = [
    {
      id: 'google',
      name: 'Google Sign-in',
      service: 'Google',
      description: 'Mimics Google authentication page',
      logoUrl: 'https://accounts.google.com/favicon.ico',
      template: `
        <div class="login-container">
          <div class="login-card">
            <div class="logo-section">
              <img src="{{LOGO_URL}}" alt="Google" class="google-logo">
              <h1 class="signin-title">Sign in</h1>
              <p class="signin-subtitle">Use your Google Account</p>
            </div>
            <form class="login-form" onsubmit="handleSubmit(event)">
              <div class="input-group">
                <input type="email" id="email" name="email" placeholder="Email or phone" required>
              </div>
              <div class="input-group">
                <input type="password" id="password" name="password" placeholder="Password" required>
              </div>
              <div class="form-actions">
                <a href="#" class="forgot-link">Forgot password?</a>
                <button type="submit" class="signin-btn">Next</button>
              </div>
            </form>
            <div class="footer-links">
              <p>Not your computer? Use Guest mode to sign in privately.</p>
              <a href="#">Learn more</a>
            </div>
          </div>
        </div>`,
      styles: `
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
          background-color: #f5f5f5;
        }
        .login-card {
          background: white;
          border-radius: 8px;
          padding: 48px 40px 36px;
          box-shadow: 0 2px 10px 0 rgba(0,0,0,0.2);
          max-width: 450px;
          width: 100%;
        }
        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }
        .google-logo {
          width: 75px;
          height: 24px;
          margin-bottom: 16px;
        }
        .signin-title {
          font-size: 24px;
          font-weight: 400;
          margin: 0 0 8px;
          color: #202124;
        }
        .signin-subtitle {
          font-size: 16px;
          color: #5f6368;
          margin: 0;
        }
        .input-group {
          margin-bottom: 24px;
        }
        .input-group input {
          width: 100%;
          padding: 13px 15px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          font-size: 16px;
          outline: none;
        }
        .input-group input:focus {
          border-color: #1a73e8;
        }
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .forgot-link {
          color: #1a73e8;
          text-decoration: none;
          font-size: 14px;
        }
        .signin-btn {
          background: #1a73e8;
          color: white;
          border: none;
          padding: 9px 23px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }
        .footer-links {
          text-align: left;
          font-size: 14px;
          color: #5f6368;
        }
        .footer-links a {
          color: #1a73e8;
          text-decoration: none;
        }`
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      service: 'Microsoft',
      description: 'Mimics Microsoft 365 login page',
      logoUrl: 'https://logincdn.msauth.net/shared/1.0/content/images/microsoft_logo_564db913a7fa0ca42727161c6d031bef.svg',
      template: `
        <div class="ms-login-container">
          <div class="ms-login-card">
            <div class="ms-logo-section">
              <img src="{{LOGO_URL}}" alt="Microsoft" class="ms-logo">
            </div>
            <h1 class="ms-signin-title">Sign in</h1>
            <form class="ms-login-form" onsubmit="handleSubmit(event)">
              <div class="ms-input-group">
                <input type="email" id="email" name="email" placeholder="Email, phone, or Skype" required>
              </div>
              <div class="ms-input-group">
                <input type="password" id="password" name="password" placeholder="Password" required>
              </div>
              <div class="ms-form-options">
                <label class="ms-checkbox">
                  <input type="checkbox" name="keepSignedIn">
                  <span>Keep me signed in</span>
                </label>
              </div>
              <button type="submit" class="ms-signin-btn">Sign in</button>
            </form>
            <div class="ms-footer-links">
              <a href="#">Can't access your account?</a>
              <a href="#">Sign-in options</a>
            </div>
          </div>
        </div>`,
      styles: `
        .ms-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .ms-login-card {
          background: white;
          border-radius: 2px;
          padding: 44px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .ms-logo-section {
          text-align: left;
          margin-bottom: 24px;
        }
        .ms-logo {
          height: 24px;
        }
        .ms-signin-title {
          font-size: 24px;
          font-weight: 600;
          color: #1b1b1b;
          margin: 0 0 24px;
        }
        .ms-input-group {
          margin-bottom: 16px;
        }
        .ms-input-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #8a8886;
          font-size: 15px;
          outline: none;
        }
        .ms-input-group input:focus {
          border-color: #0078d4;
        }
        .ms-form-options {
          margin: 24px 0;
        }
        .ms-checkbox {
          display: flex;
          align-items: center;
          font-size: 15px;
          color: #323130;
        }
        .ms-checkbox input {
          margin-right: 8px;
        }
        .ms-signin-btn {
          background: #0078d4;
          color: white;
          border: none;
          padding: 12px 32px;
          font-size: 15px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 24px;
        }
        .ms-signin-btn:hover {
          background: #106ebe;
        }
        .ms-footer-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ms-footer-links a {
          color: #0078d4;
          text-decoration: none;
          font-size: 13px;
        }`
    },
    {
      id: 'github',
      name: 'GitHub Sign in',
      service: 'GitHub',
      description: 'Mimics GitHub authentication page',
      logoUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      template: `
        <div class="gh-login-container">
          <div class="gh-login-card">
            <div class="gh-logo-section">
              <img src="{{LOGO_URL}}" alt="GitHub" class="gh-logo">
              <h1 class="gh-signin-title">Sign in to GitHub</h1>
            </div>
            <form class="gh-login-form" onsubmit="handleSubmit(event)">
              <div class="gh-input-group">
                <label for="email">Username or email address</label>
                <input type="text" id="email" name="email" required>
              </div>
              <div class="gh-input-group">
                <div class="gh-password-header">
                  <label for="password">Password</label>
                  <a href="#" class="gh-forgot-link">Forgot password?</a>
                </div>
                <input type="password" id="password" name="password" required>
              </div>
              <button type="submit" class="gh-signin-btn">Sign in</button>
            </form>
            <div class="gh-footer">
              <p>New to GitHub? <a href="#">Create an account</a></p>
            </div>
          </div>
        </div>`,
      styles: `
        .gh-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #0d1117;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .gh-login-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 32px;
          max-width: 340px;
          width: 100%;
        }
        .gh-logo-section {
          text-align: center;
          margin-bottom: 24px;
        }
        .gh-logo {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          filter: invert(1);
        }
        .gh-signin-title {
          font-size: 24px;
          font-weight: 300;
          color: #f0f6fc;
          margin: 0;
        }
        .gh-input-group {
          margin-bottom: 16px;
        }
        .gh-input-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #f0f6fc;
          margin-bottom: 8px;
        }
        .gh-password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .gh-forgot-link {
          color: #58a6ff;
          text-decoration: none;
          font-size: 12px;
        }
        .gh-input-group input {
          width: 100%;
          padding: 12px;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #f0f6fc;
          font-size: 14px;
          outline: none;
        }
        .gh-input-group input:focus {
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
        }
        .gh-signin-btn {
          width: 100%;
          background: #238636;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin: 16px 0;
        }
        .gh-signin-btn:hover {
          background: #2ea043;
        }
        .gh-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #30363d;
        }
        .gh-footer p {
          color: #7d8590;
          font-size: 14px;
        }
        .gh-footer a {
          color: #58a6ff;
          text-decoration: none;
        }`
    }
  ];

  getTemplates(): LoginPageTemplate[] {
    return [...this.templates];
  }

  generatePage(config: HarvestingPageConfig): string {
    let html = config.template.template;
    let styles = config.template.styles;

    // Replace placeholders
    html = html.replace(/{{LOGO_URL}}/g, config.template.logoUrl || '');
    
    if (config.customBranding) {
      html = html.replace(/{{COMPANY_NAME}}/g, config.customBranding.companyName);
      if (config.customBranding.logoUrl) {
        html = html.replace(/{{LOGO_URL}}/g, config.customBranding.logoUrl);
      }
    }

    // Add tracking and submission handling
    const fullPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in - ${config.template.service}</title>
    <style>
        ${styles}
        
        /* Training watermark */
        .training-watermark {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(255, 0, 0, 0.1);
          color: #ff0000;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          border: 1px solid #ff0000;
          z-index: 9999;
        }
        
        .warning-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff4444;
          color: white;
          text-align: center;
          padding: 8px;
          font-size: 14px;
          z-index: 10000;
        }
    </style>
</head>
<body>
    <!-- Training Warning Banner -->
    <div class="warning-banner">
        🚨 TRAINING SIMULATION - This is a phishing awareness exercise
    </div>
    <div class="training-watermark">
        TRAINING MODE
    </div>
    
    ${html}
    
    <script>
        // Track page load
        console.log('Credential harvesting page loaded - Training ID: ${config.trackingId}');
        
        function handleSubmit(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const credentials = {
                trackingId: '${config.trackingId}',
                service: '${config.template.service}',
                email: formData.get('email'),
                password: formData.get('password'),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            // Log submission (in real scenario, this would be sent to tracking server)
            console.log('Credential submission captured:', credentials);
            
            // Show training message
            alert('🎯 PHISHING AWARENESS TRAINING\\n\\nYou have successfully identified and fallen for a simulated phishing attempt!\\n\\nThis was a training exercise. In a real attack, your credentials would have been compromised.\\n\\nKey indicators this was fake:\\n- URL didn\\'t match the real service\\n- Training warnings were displayed\\n- Certificate/security indicators\\n\\nAlways verify URLs and look for security indicators before entering credentials.');
            
            // Redirect to training completion page
            window.location.href = '${config.redirectUrl}';
        }
        
        // Track time spent on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            const timeSpent = Date.now() - startTime;
            console.log('Time spent on harvesting page:', timeSpent + 'ms');
        });
    </script>
</body>
</html>`;

    return fullPage;
  }

  generateTrackingId(): string {
    return 'harvest_' + Math.random().toString(36).substr(2, 9);
  }

  logSubmission(submission: CredentialSubmission): void {
    this.submissions.push(submission);
    console.log('Credential submission logged:', submission);
  }

  getSubmissions(): CredentialSubmission[] {
    return [...this.submissions];
  }

  clearSubmissions(): void {
    this.submissions = [];
  }
}