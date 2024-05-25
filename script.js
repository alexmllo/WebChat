const socket = io('http://localhost:3000')

const nameModal = document.getElementById('name-window')
const nameInput = document.getElementById('name-input')
const roomInput = document.getElementById('room-input')
const submitButton = document.getElementById('join-button')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')


nameModal.style.display = 'block'
submitButton.addEventListener('click', e => {
    e.preventDefault()
    const name = nameInput.value
    const room = roomInput.value
    while(name == null || name == ''){
        name = nameInput.value
    }    
    nameModal.style.display = 'none'
    appendMessage(`You joined the chat room <strong>${room}</strong>`, '#30ff24')  
    socket.emit('name-user', name, room)
    nameInput.value = ''
    roomInput.value = ''  
})

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`, '#000000')
})

socket.on('user-connected', name => {
    appendMessage(`<strong>${name}</strong> connected`, '#30ff24')    
})

socket.on('user-disconnect', name => {
    appendMessage(`<strong>${name}</strong> disconnected`, '#ff0000')
})

socket.on('update-users', roomUsers => {
    updateUsers(roomUsers)
})

/* Agregamos el evento submit al formulario send-container que contiene los campos de entrada de texto y el boton de envio de mensajes */
messageForm.addEventListener('click', e => {
    e.preventDefault()  /* Para que no se recargue la pagina */
    const message = messageInput.value
    if (message == '') return
    appendMessage(`<strong>You</strong>: ${message}`, '#00d7ff')
    socket.emit('send-chat-message', message)
    messageInput.value = ''
})

/* Para mostrar los mensajes por pantalla */
function appendMessage(message, color) {
    /* Creamos elemento div en el dominio del html */
    const messageElement = document.createElement('div')
    /* Le asignamos el mensage recivido como HTML interno */
    /* <span> Hace de <p> pero sin margenes al acabar la linea */    
    messageElement.innerHTML = '<span>' + message + '</span>'
    /* Agragamos el elemento al contenedor de mensages */
    messageElement.style.color = color
    messageContainer.append(messageElement)
    /* Baja automaticamente hasta el último mensaje enviado */
    messageElement.scrollIntoView()

}

/* Actualiza la lista de usuarios conectados en la sala */
function updateUsers(roomUsers) {
    const usersContainer = document.getElementById('users-container')
    /* Limpia la lista de usuarios del chat */
    usersContainer.innerHTML = ''
    /* Ordena los usuarios alfabéticamente */
    roomUsers.sort((a,b) => a.name.localeCompare(b.name))
    /* Crea un elemento div en el dominio html con cada usuario conectado */
    roomUsers.forEach(user => {
        if (user.id != socket.id) {
            const userElement = document.createElement('div')
            userElement.textContent = user.name
            usersContainer.append(userElement)  
        }
    });
}