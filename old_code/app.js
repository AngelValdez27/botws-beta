const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const fs = require('fs')
const ExcelJs = require('exceljs')
const moment = require('moment')
const qrcode = require('qrcode-terminal')

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

console.log('Sin sesión guardada')
// When the client received QR-Code
client = new Client({
  authStrategy: new LocalAuth(),

  webVersionCache: {
    type: 'remote',
    remotePath:
      'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
})

client.on('qr', qr => {
  qrcode.generate(qr, { small: true })
})

// When the client is ready, run this code (only once)
client.on('ready', () => {
  console.log('Client is ready!', now)
  numberHost = `${client.info.wid.user}@c.us`
  listenMessage()
})

client.on('authenticated', () => {
  console.log('Authenticated')
})

// Start your client
client.initialize()

// Eventos adicionales para monitorear la conexión del cliente
client.on('disconnected', reason => {
  console.log('Cliente desconectado:', reason)
  // Puedes intentar reiniciar el cliente aquí
  client.initialize()
})

client.on('auth_failure', msg => {
  console.error('Autenticación fallida:', msg)
  // Maneja la falla de autenticación
})

client.on('change_state', state => {
  console.log('Estado del cliente cambiado a:', state)
})

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
/* const saveHistorial = (phoneNumber, msg) => {
  const pathChat = `./chats/${phoneNumber}.xlsx`
  const workBook = new ExcelJs.Workbook()
  const today = moment().format('DD-MM-YYYY hh:mm')

  if (fs.existsSync(pathChat)) {
    workBook.xlsx.readFile(pathChat).then(() => {
      const workSheet = workBook.getWorksheet(1)
      //tomar el ultimo registro
      const lastRow = workSheet.lastRow
      //obtener la fila siguiente después del último registro
      let getRowInsert = workSheet.getRow(++lastRow.number)
      getRowInsert.getCell('A').value = today
      getRowInsert.getCell('B').value = msg
      getRowInsert.commit()
      workBook.xlsx
        .writeFile(pathChat)
        .then(() => {
          console.log('Registro agregado')
        })
        .catch(() => {
          console.log('Algo salió mal...')
        })
    })
  } else {
    //crear
    const workSheet = workBook.addWorksheet('chats')
    workSheet.columns = [
      { header: 'Fecha', key: 'date' },
      { header: 'Mensaje', key: 'message' }
    ]
    workSheet.addRow([today, msg])
    workBook.xlsx
      .writeFile(pathChat)
      .then(() => {
        console.log('historial creado')
      })
      .catch(() => {
        console.log('Algo salió mal...')
      })
  }
} */
// Create a new client instance
/* const client = new Client({
    webVersionCache: {
      type: 'remote',
      remotePath:
        'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
  }) */

/* client.on('message_create', message => {
    const { from, to, body } = message
    console.log(from, to, body)
    client.sendMessage(from, 'Hola !!')
  }) */
