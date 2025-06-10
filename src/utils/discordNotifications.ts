
const getDiscordWebhookUrl = () => {
  // Try to get from environment variables first
  if (typeof window !== 'undefined') {
    // Client-side fallback - this should ideally be handled by a Supabase Edge Function
    console.warn('Discord webhooks should be handled server-side for security');
  }
  
  // This will be handled by Supabase Edge Functions in production
  return null;
};

const getMilestoneWebhookUrl = () => {
  // Try to get from environment variables first
  if (typeof window !== 'undefined') {
    // Client-side fallback - this should ideally be handled by a Supabase Edge Function
    console.warn('Discord milestone webhooks should be handled server-side for security');
  }
  
  // This will be handled by Supabase Edge Functions in production
  return null;
};

export const sendDiscordNotification = async (
  callSignCode: string,
  date: string,
  departureAirport: string,
  arrivalAirport: string
) => {
  try {
    // For now, we'll create a Supabase Edge Function to handle this securely
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase.functions.invoke('send-discord-notification', {
      body: {
        type: 'participation',
        callSignCode,
        date,
        departureAirport,
        arrivalAirport
      }
    });

    if (error) {
      console.error('Error calling edge function:', error);
      return;
    }

    console.log("Discord notification sent successfully");
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    // Don't throw the error to avoid breaking the main flow
  }
};

export const sendMilestoneNotification = async (
  callSignCode: string,
  milestone: number
) => {
  try {
    // For now, we'll create a Supabase Edge Function to handle this securely
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase.functions.invoke('send-discord-notification', {
      body: {
        type: 'milestone',
        callSignCode,
        milestone
      }
    });

    if (error) {
      console.error('Error calling edge function:', error);
      return;
    }

    console.log(`Discord milestone notification sent for ${callSignCode} reaching ${milestone} participations`);
  } catch (error) {
    console.error("Failed to send Discord milestone notification:", error);
    // Don't throw the error to avoid breaking the main flow
  }
};
