class ServerList {
    constructor(){
        this.serviceList = {};
    }
    // get All Service List
    getServiceList(){
        return this.serviceList;
    }
    // set All Service List
    setServiceList(serviceList){
        this.serviceList = serviceList;
        return this.serviceList;
    }
    // add Service
    addService(uri,key,socket){
        // 맨 처음엔 없을 수도 있음
        if(!this.serviceList[uri]){
            this.serviceList[uri] = {index:0, services:[]}
        }
        this.serviceList[uri]['services'].push({key,socket});
        console.log("Add Service Success");
        console.log(this.serviceList[uri].services);
    }

    // remove Service
    removeService(uri,key,socket){
        const index = this.serviceList[uri]['services'].indexOf({key,socket});
        this.serviceList[uri]['services'].splice(index,1);
        console.log("Remove Service Success");
        console.log(this.serviceList[uri].services);
    }
   
}

module.exports = new ServerList;
