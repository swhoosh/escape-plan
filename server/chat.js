export const chatLogic = (io) => {
  var chatRooms = {}

  io.of('/chat').on('connection', (socket) => {
    // console.log(socket.id + ' connected to /chat')

    socket.on(
      'join chat room',
      (scope, dateTime = 'None', name = socket.id) => {
        const socid = socket.id
        if (name === '') name = socid
        if (chatRooms[scope] === undefined)
          chatRooms[scope] = { nameList: {}, chatRoomData: [] }
        chatRooms[scope].nameList[socid] = name

        socket.join(scope)

        if (dateTime !== 'None') {
          if (dateTime === 'all')
            socket.emit('set chat', chatRooms[scope]['chatRoomData'], scope)
          else
            socket.emit(
              'set chat',
              chatRooms[scope]['chatRoomData'].filter((chatEntry) => {
                return chatEntry.dateTime >= dateTime
              }),
              scope
            )
        }

        // console.log(socid + ' joined /chat ' + scope)
      }
    )

    socket.on('leave chat room', (scope) => {
      socket.leave(scope)
      if (
        scope !== 'global' &&
        io.of('/chat').sockets.adapter.rooms.get(scope).size === 0
      )
        delete chatRooms[scope]
      console.log(socket.id + ' left /chat ' + scope)
    })

    socket.on('disconnect', () => {
      // console.log(socket.id + ' disconnected from /chat')
    })

    socket.on('request chat log', (scope, dateTime = 'all') => {
      if (socket.rooms.has(scope)) {
        if (dateTime === 'all')
          socket.emit('set chat', chatRooms[scope]['chatRoomData'], scope)
        else
          socket.emit(
            'set chat',
            chatRooms[scope]['chatRoomData'].map((chatEntry) => {
              return chatEntry.dateTime >= dateTime
            }),
            scope
          )
      }
    })

    socket.on('send message', (message, scope) => {
      if (socket.rooms.has(scope)) {
        //check if joined room
        const messageData = {
          message: message,
          user: socket.id,
          dateTime: new Date(),
          name: chatRooms[scope].nameList[socket.id],
        }
        io.of('/chat').to(scope).emit('append chat', messageData, scope)
        chatRooms[scope].chatRoomData.push(messageData)
        console.log('recieved message : ' + message)
      }
    })

    socket.on('set name', (scope, name) => {
      if (
        chatRooms[scope] !== undefined &&
        Object.keys(chatRooms[scope].nameList).indexOf(socket.id) !== -1
      )
        //chat room exist and client in room
        chatRooms[scope].nameList[socket.id] = name
    })
  })
}

// structure of chat rooms
// chatRooms = {
//   scope1 : {
//     nameList : {
//       'soc a' : 'le',
//       'soc b' : '5555'
//       'soc c' : 'soc c'
//     },
//     chatRoomData : [
//       {
//         message : 'aaa',
//         user : 'soc a',
//         name : 'le'
//         dateTime : new Date()
//       },
//       {
//         message : 'bbb',
//         user : 'soc b',
//         name : '5555'
//         dateTime : new Date()
//       }
//     ]
//   },
//   scope2 : {
//     ...
//   }
// }
