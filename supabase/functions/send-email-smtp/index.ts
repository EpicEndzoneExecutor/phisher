import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
  trackingPixelUrl?: string;
  campaignId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from, trackingPixelUrl }: EmailRequest = await req.json();

    // Ensure proper HTML structure
    let finalHtml = html;
    
    // If HTML doesn't start with DOCTYPE, it might be plain text - wrap it properly
    if (!finalHtml.includes('<!DOCTYPE html>') && !finalHtml.includes('<html')) {
      finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        ${finalHtml.replace(/\n/g, '<br>')}
    </div>
</body>
</html>`;
    }
    
    // Add tracking pixel to HTML if provided
    if (trackingPixelUrl) {
      // Insert tracking pixel before closing body tag for better compatibility
      finalHtml = finalHtml.replace('</body>', `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" /></body>`);
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: from || "Security Testing <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: finalHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipient: to,
        subject: subject,
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);