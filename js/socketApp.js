const socket = io()
let spinnerState = document.getElementById('spinner')

socket.on('qr', qrCodeUrl => {
  spinnerState.style.display = 'none'
  const qrCodeImg = document.getElementById('qr-code')
  qrCodeImg.src = qrCodeUrl
})

socket.on('ready', message => {
  document.getElementById('status').innerText = message
  document.getElementById('qr-container').style.display = 'none'
})

socket.on('authenticated', message => {
  document.getElementById('status').innerText = message
  document.getElementById('qr-container').style.display = 'none'
})

socket.on('auth_failure', message => {
  document.getElementById('status').innerText = message
  document.getElementById('qr-container').style.display = 'block'
})

socket.on('disconnected', message => {
  document.getElementById('status').innerText = message
  document.getElementById('qr-container').style.display = 'block'
})
