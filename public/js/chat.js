const socket = io()

socket.on('message', (data) => {
    console.log(data)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.message.value

    socket.emit('sendMessage', message, (error) => {
        if  (error) {
            return console.log(error)
        }

        console.log('message delivered')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
   if(!navigator.geolocation) {
       return alert('Geolocation not supported by your browser')
   }

   navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared')
        })
   })

    socket.emit('sendMessage', message)
})