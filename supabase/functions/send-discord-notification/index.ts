
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, callSignCode, date, departureAirport, arrivalAirport, milestone } = await req.json()

    let webhookUrl: string
    let message: any

    if (type === 'participation') {
      webhookUrl = Deno.env.get('DISCORD_PARTICIPATION_WEBHOOK_URL') || ''
      message = {
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
      }
    } else if (type === 'milestone') {
      webhookUrl = Deno.env.get('DISCORD_MILESTONE_WEBHOOK_URL') || ''
      message = {
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
      }
    } else {
      throw new Error('Invalid notification type')
    }

    if (!webhookUrl) {
      throw new Error('Webhook URL not configured')
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending Discord notification:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
