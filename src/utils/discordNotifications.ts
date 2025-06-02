
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/939879808274403338/oPKZHqM0L8RFfTQ1aOOWPnQvL-tpWcBrkvnSNWpBRk-hNhqagHKdBK52hcS0iQi0xzFN";

export const sendDiscordNotification = async (
  callSignCode: string,
  date: string,
  departureAirport: string,
  arrivalAirport: string
) => {
  try {
    const message = {
      embeds: [
        {
          title: "🛩️ Nuova Partecipazione Evento",
          color: 3447003, // Blue color
          fields: [
            {
              name: "Callsign",
              value: callSignCode,
              inline: true
            },
            {
              name: "Data",
              value: new Date(date).toLocaleDateString('it-IT'),
              inline: true
            },
            {
              name: "Rotta",
              value: `${departureAirport} ✈️ ${arrivalAirport}`,
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Sistema Gestione Eventi ASX"
          }
        }
      ]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    console.log("Discord notification sent successfully");
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    // Don't throw the error to avoid breaking the main flow
  }
};
