
let usuario = null;
let socket = null;

const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8080/api/auth'
            : 'https://restserver-curso-fher.herokuapp.com/api/auth/';


// ! REFERENCIAS HTML

const txtUid = document.getElementById('txtUid');
const txtMsj = document.getElementById('txtMsj');
const ulUsuarios = document.getElementById('ulUsuarios');
const ulMensajes = document.getElementById('ulMensajes');
const btnSalir = document.getElementById('btnSalir');

const conectarSocket = async(token = '') => {
    socket = io({
        'extraHeaders': {
            'x-token': token
        }
    });

    socket.on('connect', () => {
        console.log('soccket conectado');
    });

    socket.on('disconnect', () => {
        window.location = 'index.html'
    });

    socket.on('recibir-mensajes', dibujarMensajes);

    socket.on('usuarios-activos', dibujarUsuarios);

    socket.on('mensaje-privado', (payload) => {
        console.log(payload)
    });
}

const validarJWT = async() => {

    const token = localStorage.getItem('Token') || '';
    if(token.length <= 10) throw new Error('El token no es valido');

    const resp = await fetch(url, {
        headers: { 'x-token': token }
    })

    const { usuario: usuarioDB, token: newToken } = await resp.json();
    localStorage.setItem('Token', newToken);
    usuario = usuarioDB;

    await conectarSocket(newToken);
};

const dibujarUsuarios = ( usuarios = [] ) => {

    let userHtml = '';
    usuarios.forEach(({ nombre, uid }) => {
        userHtml += `
            <li>
                <p>
                <h5 class="text-success">${nombre}</h5>
                <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `
    });

    ulUsuarios.innerHTML = userHtml;

}

const dibujarMensajes = ( usuarios = [] ) => {

    let userHtml = '';
    usuarios.forEach(({ nombre, mensaje }) => {
        userHtml += `
            <li>
                <p>
                <span class="text-primary">${nombre}</span>
                <span>${mensaje}</span>
                </p>
            </li>
        `
    });

    ulMensajes.innerHTML = userHtml;

}

const main = async() => {
    await validarJWT();
};

main();

txtMsj.addEventListener('keyup', ({ keyCode }) => {
    const mensaje = txtMsj.value;
    const uid = txtUid.value;
    
    if( keyCode !== 13 ) return;
    if( mensaje.length === 0 ) return;

    socket.emit('enviar-mensaje', { mensaje, uid });

    txtMsj.value = ''

})
