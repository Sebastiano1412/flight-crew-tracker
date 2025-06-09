
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/939879808274403338/oPKZHqM0L8RFfTQ1aOOWPnQvL-tpWcBrkvnSNWpBRk-hNhqagHKdBK52hcS0iQi0xzFN";
const MILESTONE_WEBHOOK_URL = "https://discord.com/api/webhooks/1381712365602738186/6HZNZaJ5jU4_k0Ehyp9-XyYou8xe3ZHyGqvo3BiRobic3yCuzOL2Ga__rlRRmziJfd_w";

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

export const sendMilestoneNotification = async (
  callSignCode: string,
  milestone: number
) => {
  try {
    const message = {
      embeds: [
        {
          title: "🏆 Traguardo Raggiunto!",
          color: 16766720, // Gold color
          fields: [
            {
              name: "Pilota",
              value: callSignCode,
              inline: true
            },
            {
              name: "Traguardo",
              value: `${milestone} partecipazioni`,
              inline: true
            }
          ],
          description: `Il pilota **${callSignCode}** ha raggiunto il traguardo di **${milestone}** partecipazioni agli eventi! 🎉`,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Sistema Gestione Eventi ASX"
          },
          thumbnail: {
            url: "https://cdn.discordapp.com/emojis/1234567890123456789.png" // Trophy emoji placeholder
          }
        }
      ]
    };

    const response = await fetch(MILESTONE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord milestone webhook failed: ${response.status}`);
    }

    console.log(`Discord milestone notification sent for ${callSignCode} reaching ${milestone} participations`);
  } catch (error) {
    console.error("Failed to send Discord milestone notification:", error);
    // Don't throw the error to avoid breaking the main flow
  }
};
