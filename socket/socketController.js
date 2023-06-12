const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require('../models');

const chatMsj = new ChatMensajes();

const socketController = async ( socket = new Socket(), io ) => {
    const token = socket.handshake.headers['x-token'];
    const usuario = await comprobarJWT( token );
    if( !usuario ) return socket.disconnect();
    
    chatMsj.agregarUsuario( usuario );
    io.emit('usuarios-activos', chatMsj.usuariosArr );
    io.emit('recibir-mensajes', chatMsj.lastThen );

    // conectar socket a una sala especial
    socket.join( usuario.id )


    socket.on( 'disconnect', () => {
        chatMsj.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos', chatMsj.usuariosArr );
    });

    socket.on('enviar-mensaje', ({ mensaje, uid }) => {

        if( uid ) {
            socket.to( uid ).emit('mensaje-privado', {
                from: usuario.nombre,
                mensaje
            })
        } else {
            chatMsj.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMsj.lastThen );
        }
    })
}

module.exports = {
    socketController
}