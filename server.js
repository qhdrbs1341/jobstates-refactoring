const zmq = require('zeromq');
const portfinder = require('portfinder');

class Server {
    constructor(uri){
        this.services = {};
        this.uri = uri;
    }

    // enrol Service to Distributor
    async registService(uri,port){
        try{
        const result = await fetch('http://localhost:3000/distributor',{
            method: 'POST',
            credentials: 'omit',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: {
                uri,
                port
            }
        }).then(res => res.json());

        console.log("Service Registered!!");

        // get Service Key from Distributor
        console.log("This is key... ", result.key);
        this.key = result.key;
        }catch(err){
            console.log("Service Regist Error::::::",err);
        }
    }

    // get Service List from Distributor
    async getService(){
        try{
            const result = await fetch('http://localhost:3000/distributor',{
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Content-Type' : 'application/json'
            }
            }).then(res => res.json());
            this.services = result.services;
            console.log("Receive Success Service List");
            console.log(this.services);
        }catch(err){
            console.log("Service Get Error::::::",err);
        }
    }

    // connect TCP(using zeromq) to Distributor
    async connectDistributor(){
        try{
            portfinder.getPort((err,port)=>{
                if(err){
                    return console.log("Not Find Empty Port");
                }

                //  create Distributor Subscribe Socket
                this.distributorSub = zmq.socket('sub');
                this.distributorSub.connect('tcp://localhost:3001');
                this.distributorSub.subscribe('distributor');

                // create Distributor Public Socket
                this.distributorPub = zmq.socket('pub');
                this.distributorPub.bind(`tcp://127.0.0.1:${port}`);
                this.port = port;

                // regist Service to Distributor
                registService(this.uri,port);
            })
        }catch(err){
            console.log("Connect to Distributor Error::::::",err);
        }
    }

    // connect TCP(using zeromq) to Each Other Services
    // Except this Service URI
    async connectService(exceptUri){
        try{
            this.serviceSub = zmq.socket('sub');
            for(var service of this.services){
                if(service === exceptUri){
                    continue;
                }
                service.servers.map(server => {
                    this.serviceSub.connect(`tcp://${server.url}:${port}`);
                })
            }
            this.serviceSub.subscribe('services');
            console.log("Connect Success to Other Services!!");
        }catch(err){
            console.log("Connect Fail to Other Services!!");
        }
    }
}

module.exports = Server;
