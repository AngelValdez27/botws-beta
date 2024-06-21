const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const SESSION_FILE_PATH = './session.json'

const withSeesion = () => {}

/* genera el QR */
const withOutSession = () => {
  // When the client received QR-Code
  client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
  })
}

// Create a new client instance
const client = new Client({
  webVersionCache: {
    type: 'remote',
    remotePath:
      'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
})

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Client is ready!')
})

client.on('authenticated', () => {
  console.log('Authenticated')
})

client.on('message_create', message => {
  const { from, to, body } = message
  console.log(from, to, body)
  client.sendMessage(from, 'Hola !!')
})

// Start your client
client.initialize()
