import { supabase } from "@/integrations/supabase/client";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  trackingPixelUrl?: string;
  campaignId?: string;
}

export class EmailService {
  static async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-smtp', {
        body: emailData
      });

      if (error) {
        console.error('Error invoking email function:', error);
        return { success: false, error: error.message };
      }

      if (data?.success === false) {
        console.error('Email sending failed:', data.error);
        return { success: false, error: data.error };
      }

      console.log('Email sent successfully:', data);
      return { success: true };

    } catch (error) {
      console.error('Unexpected error sending email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}