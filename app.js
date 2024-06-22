const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const fs = require('fs')
const moment = require('moment')
const qrcode = require('qrcode-terminal')
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const QRCode = require('qrcode')

let client

let sessionData
const MEDIA_PDF = 'PropuestaAVBOTWS.pdf'
const MEDIA_IMG = 'AV.png'
let res = 'na'
const phoneNumber = '5218711164914@c.us'

const now = moment() // Obtener la fecha y hora actual
const workStartTime = moment('09:00', 'HH:mm') // Hora de inicio del horario laboral (ejemplo: 09:00)
const workEndTime = moment('17:18', 'HH:mm') // Hora de fin del horario laboral (ejemplo: 17:00)

const SESSION_FILE_PATH = './.wwebjs_auth/session'
// Use PORT provided in environment or default to 3000
const port = process.env.PORT || 3001

// Inicializar Express y el servidor HTTP
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

//// Middleware para servir archivos estáticos
app.use(express.static('/public'))

// Ruta principal que sirve el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

// Ruta para servir otros recursos estáticos como CSS y JS
// Ejemplo para CSS
app.get('/src/styles/styles.css', (req, res) => {
  res.sendFile(__dirname + '/src/styles/styles.css')
})

// Ejemplo para JS
app.get('/js/socketApp.js', (req, res) => {
  res.sendFile(__dirname + '/js/socketApp.js')
})

console.log('Sin sesión guardada')
// When the client received QR-Code
/* client = new Client({
  authStrategy: new LocalAuth(),

  webVersionCache: {
    type: 'remote',
    remotePath:
      'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
}) */

// Manejar la conexión de WebSocket
io.on('connection', socket => {
  console.log('Nuevo cliente conectado')

  // Enviar el código QR cuando se genere
  /*   client.on('qr', async qr => {
    const qrCodeUrl = await qrcode.toDataURL(qr)
    socket.emit('qr', qrCodeUrl)
  }) */

  // Enviar el código QR cuando se genere
  client.on('qr', qr => {
    QRCode.toDataURL(qr, (err, url) => {
      if (err) {
        console.error('Error generando el QR: ', err)
        return
      }
      socket.emit('qr', url)
    })
  })

  // Notificar cuando el cliente esté listo
  client.on('ready', () => {
    socket.emit('ready', 'Cliente de WhatsApp listo')
    listenMessage()
    console.log('client ready!')
  })

  // Notificar cuando se autentique correctamente
  client.on('authenticated', () => {
    socket.emit('authenticated', 'Autenticado correctamente')
    console.log('authenticated')
    // fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
  })

  // Manejar la falla de autenticación
  client.on('auth_failure', msg => {
    socket.emit('auth_failure', 'Error de autenticación')
    /*  if (fs.existsSync(SESSION_FILE_PATH)) {
      fs.unlinkSync(SESSION_FILE_PATH);
    } */
    console.log('auth_failure', msg)
    setTimeout(() => {
      console.log('Reiniciando cliente de WhatsApp...')
      initializeClient()
    }, 5000)
  })

  // Manejar la desconexión
  client.on('disconnected', reason => {
    socket.emit('disconnected', 'Desconectado')
    /*  if (fs.existsSync(SESSION_FILE_PATH)) {
      fs.unlinkSync(SESSION_FILE_PATH);
    } */
    console.log('disconnected reason', reason)
    // Esperar 5 segundos antes de intentar reiniciar
    setTimeout(() => {
      console.log('Reiniciando cliente de WhatsApp...')
      clientInitialized = false // Marcar que el cliente no está inicializado correctamente
      initializeClient()
    }, 5000)
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
  })
})

// Inicializar el cliente de WhatsApp
// Función para inicializar el cliente de WhatsApp

const initializeClient = () => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },

    webVersionCache: {
      type: 'remote',
      remotePath:
        'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
  })

  // Inicializar eventos del cliente
  client.initialize()
}
//client.initialize()
initializeClient()

//TODO: MESSAGE FLOW

const listenMessage = () => {
  client.on('message_create', message => {
    const { from, to, body } = message
    console.log(from, to, body)
    if (body.toLowerCase() == 'prueba') {
      res = 'respuesta, en un momento se contactarán contigo'
      customer = from.split('@c.us')
      customer2 = from.split('@c.us')[0]
      console.log(customer, customer2)

      if (isWorkingHours()) {
        client.sendMessage(from, 'En un momento te responden.')
      } else {
        client.sendMessage(
          from,
          'En estos momentos estamos fuera de horario, espera a mañana'
        )
      }

      /*  client.sendMessage(
          phoneNumber,
          `Enviar mensaje a: ${customer}, ${customer2}`
        ) */
      sendMessage(from, res)
    }

    if (body.toLocaleLowerCase() == 'file') {
      sendMedia(from, MEDIA_PDF)
    }
    //client.sendMessage(from, 'Hola !!')
    /* saveHistorial(from, body) */
  })
}

const sendMedia = (to, file) => {
  const mediaFile = MessageMedia.fromFilePath(`./media/${file}`)
  //console.log(mediaFile)
  client.sendMessage(to, mediaFile, { caption: 'Te adjunto archivo' })
}

const sendMessage = (to, message) => {
  client.sendMessage(to, message)
}

const isWorkingHours = () => {
  // Comparar la hora actual con el horario laboral
  if (now.isBetween(workStartTime, workEndTime)) {
    return true // Estamos dentro del horario laboral
  } else {
    return false // Estamos fuera del horario laboral
  }
}

//TODO: MESSAGE FLOW ENDS

// Iniciar el servidor
server.listen(port, '0.0.0.0', () => {
  console.log('Servidor iniciado en http://localhost:3001')
})
