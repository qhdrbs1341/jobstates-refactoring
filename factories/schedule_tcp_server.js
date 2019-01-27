const net = require('net');
const serviceRegister = require('../helpers/service_register');

module.exports = (app) => {
    const server = net.createServer((socket)=>{
        console.log(`Socket Client Connection : ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data',(data)=>{
            // 서비스 처리 로직
            console.log(data.toString());
            console.log(`message from: ${socket.remoteAddress}:${socket.remotePort}`)
        })
    })
    server.listen(process.env.TCP,()=>{
        console.log(`Schedule Service TCP on ${process.env.TCP}`);
    })
    app.set('server',server);
    server.on('error',(err)=>{
        console.log("TCP Server Error");
        console.log(err);
    })
    server.on('close',()=>{
        console.log("TCP Server Closed");
    })

    process.on('exit',()=>{
        serviceRegister.unRegist('/schedule',app.get('key'));
        server.close();
    })
    return server;
}
