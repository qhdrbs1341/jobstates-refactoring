const net = require('net');
const redis = require('redis');
const serviceRegister = require('../helpers/service_register');

module.exports = (app) => {
    const server = net.createServer((socket)=>{
        console.log(`Socket Client Connection : ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data',(data)=>{
            console.log(JSON.parse(data.toString()));
            console.log(`message from: ${socket.remoteAddress}:${socket.remotePort}`)
            // 서비스 처리 로직
        })
    })
    server.listen(process.env.TCP,()=>{
        console.log(`User Service TCP On ${process.env.TCP}`);
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
        serviceRegister.unRegist('/user',app.get('key'));
        server.close();
    })
    return server;
}
