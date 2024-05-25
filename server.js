const { Socket } = require("socket.io")

const io = require("socket.io")(3000, {
    cors: {
        origin: "*"
    }
})

/* Users array */
let users = []

io.on('connection', (socket) => {
    socket.on('name-user', (name, room) => {
        users.push({id: socket.id, name: name, room: room})
        /* Se une el socket a la sala solicitada */
        socket.join(room)
        const roomUsers = usersInRoom(room)
        /* Envia a todos los usuarios de la sala menos al que ha solicitado la conexión */
        socket.to(room).emit('user-connected', name)
        /* Envia a todos los de la sala */
        io.in(room).emit('update-users', roomUsers)         
    })
    socket.on('send-chat-message', message => {
        socket.to(users.find(a => a.id === socket.id).room).emit('chat-message', { message: message, name: users.find(a => a.id === socket.id).name })
    })
    socket.on('disconnect', () => {
        if (socket.id && users.find(a => a.id === socket.id)) {
            /* Guardamos la sala del usuario a desconectar */
            let room = users.find(a => a.id === socket.id).room
            /* Informamos a los demás de la desconexión */
            socket.to(room).emit('user-disconnect', users.find(a => a.id === socket.id).name)
            /* Desconectamos al usuario de la sala*/
            socket.leave(room)
            /* Eliminamos al usuario de la lista */
            users = users.filter((user) => {return user.id != socket.id })
            /* Generamos una lista de los usuarios en la sala del usuario desconectado*/
            const roomUsers = usersInRoom(room)
            /* La enviamos a los demás usuarios para que actualizen su lista */
            socket.to(room).emit('update-users', roomUsers)                     
        }
    })
})

 /* Devuelve una lista de todos los usuarios conectados a una sala */
function usersInRoom(room) {
    cont = 0;
    const usersList = []
    users.forEach(user => {
        if(user.room == room) {
            usersList[cont] = user; 
            cont++
        }
    });
    return usersList
}
