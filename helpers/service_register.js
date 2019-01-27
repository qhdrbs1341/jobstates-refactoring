const serviceManager = require('./service_manager');
const fetch = require('node-fetch');
const redis = require('redis');
const uuid = require('uuid/v1');
const net = require('net');
const {sendMessage} = require('./tcp_manger');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    no_ready_check: true,
    auth_pass: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
});

const redisSub = redis.createClient({
    host: process.env.REDIS_HOST,
    no_ready_check: true,
    auth_pass: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
});

exports.regist = async (uri, app) => {
    try {
        const port = process.env.TCP;

        // 1. Get ServiceList From Redis
        const keysArray = await getKey();
        console.log("keysArray : ", keysArray);
        var serviceList = {}
        for (var index in keysArray) {
            if (!serviceList[keysArray[index]]) {
                serviceList[keysArray[index]] = {};
                serviceList[keysArray[index]]['index'] = 0;
                serviceList[keysArray[index]]['services'] = [];
            }
            const services = await getObj(keysArray[index]);
            console.log("Services get Redis Success", services);
            for (var serviceKey in services) {
                const key = serviceKey;
                const {
                    url,
                    port
                } = JSON.parse(services[serviceKey]);
                createClient(url, port, key, keysArray[index]);
            }
        }
        console.log("Setting Complete ServiceList");
        console.log(serviceManager.setServiceList(serviceList));

        // 2. Set This Service Key
        const key = uuid();
        console.log(`Generate Key : ${key}`);
        app.set('key', key);


        // 3. Regist This Service To Distributor
        const result = await fetch('http://localhost:3000', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key,
                uri,
                port
            })
        }).then(res => res.json());
        console.log(result);

        redisSub.subscribe('services');
        redisSub.on('message', (channel, data) => {
            data = JSON.parse(data);
            const {
                url,
                port,
                key,
                uri
            } = data;
            if(key !== app.get('key')){
            addClient(url, port, key, uri);
            }
        })
    } catch (err) {
        console.log("Service Regist Error");
        console.log(err);
    }
}

exports.unRegist = async (uri, key) => {
    try {
        console.log(`${uri}, ${key} Service Try DisConnect...`);
        client.hdel(uri, key);
        console.log("Redis Service Delete");
    } catch (err) {
        console.log("DisConnect Error : ")
        console.log(err);
    }
}

const getKey = () => {
    return new Promise((resolve, reject) => {
        client.keys('*', async (err, obj) => {
            if (err) {
                throw new Error();
            }
            resolve(obj);
        })
    })
}

const getObj = (key) => {
    return new Promise((resolve, reject) => {
        client.hgetall(key, (err, obj) => {
            resolve(obj);
        })
    })
}

const createClient = async (url, port, key, uri) => {
    try {
        console.log(`Try Create Client Connect ${url}:${port}`)
        const socket = await net.connect({
            host: url,
            port: port
        });
        socket.on('close', () => {
            serviceManager.removeService(uri, key, socket);
        })
        socket.on('connect',()=>{
            console.log(`Connect To ${socket.remoteAddress}:${socket.remotePort} TCP Server`);
            serviceManager.serviceList[uri]['services'].push({
                key,
                socket
            });
            console.log(`Create Client Success ${socket.remoteAddress}:${socket.remotePort}`);
        })
        return socket;
    } catch (err) {
        console.log("Create Net Client Error");
        console.log(err);
    }
}

const addClient = async (url, port, key, uri) => {
    try {
        console.log(`Try Add Client Connect ${url}:${port}`);
        const socket = await net.connect({
            host: url,
            port: port
        })
        socket.on('close',()=>{
            serviceManager.removeService(uri, key, socket);
        })
        socket.on('connect',()=>{
            console.log(`Connect To ${socket.remoteAddress}:${socket.remotePort} TCP Server`)
            serviceManager.addService(uri,key,socket);
        })
    } catch (err) {
        console.log("Add Net Client Error");
        console.log(err);
    }
}
