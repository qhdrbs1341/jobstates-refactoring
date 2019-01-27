const serviceManager = require('./service_manager');
exports.sendMessage = (uri, message) => {
    const serviceList = serviceManager.getServiceList();
    if (!serviceList[uri]) {
        return false;
    }
    console.log(serviceList[uri]['services']);
    serviceList[uri]['index'] = (serviceList[uri]['index'] + 1) % serviceList[uri]['services'].length;
    serviceList[uri]['services'][serviceList[uri]['index']].socket.write(JSON.stringify(message));
    return true;
}
