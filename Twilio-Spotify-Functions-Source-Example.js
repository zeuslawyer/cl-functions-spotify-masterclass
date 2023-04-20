// This example shows how to make a fetch Artist monthly listener counts and trigger an email if
// the artist is due a payment for every additional 1000 streams.

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
const artistId = args[0]
const artistName = args[1]
const lastListenerCount = parseInt(args[2])
const artistEmail = args[3]
const VERIFIED_SENDER = args[4]

// Ref: https://doc.api.soundcharts.com/api/v2/doc/reference/path/artist/get-latest-spotify-monthly-listeners
const URL = `https://sandbox.api.soundcharts.com/api/v2/artist/${artistId}/streaming/spotify/listeners`

// Get Listener Count Data.
if (!artistId) {
  throw new Error("No artistId provided.")
}
if (isNaN(lastListenerCount)) {
  throw new Error(`Listener Count is NaN: ${lastListenerCount}`)
}

// TODO #2: Implement logic to calculate payment due

// ====================
// Helper Functions
// ====================
async function getLatestMonthlyListenerCount() {
  // TODO #1: implement getLatestMonthlyListenerCount()
}

// Use Twilio Sendgrid API to send emails.
// https://sendgrid.com/solutions/email-api
async function sendEmail(latestListenerCount, amountDue) {
  if (!secrets.twilioApiKey) {
    return
  }
  // TODO #3:  Your Stretch Assignment!
}
