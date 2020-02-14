//Secure

//Módulos para manipulação de variáveis por outro arquivo
module.exports = {
    spliceUser:  (userId) => {
        userList.forEach(user => {
            if(user.id == userId)
                userIndex = userList.indexOf(user)
        });
        userList.splice(userIndex, 1)
    }
}
//Bibliotecas
var BlipSdk = require("blip-sdk")
var WebSocketTransport = require("lime-transport-websocket")
var botCheckSAP = require("./botCheckSAP")
var botSAP = require('./botSAP')
var emfB = require("./emfB.js")

//Dados do robo no portal.blip.ai
let IDENTIFIER = 'tssapsdk';
let ACCESS_KEY = 'b3RPRjhGbDhxYUNQY0gzZGJ2cjY=';

//Variáveis para controle de multiplos usuários
let userList = []
let newUserFlag = true
let userIndex

// Cliente websocket para conexão entre o node e o blip
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

//Inicia a conexão entre o server node e o blip
client.connect() 
.then(function(session) {
    console.log('Application started. Press Ctrl + c to stop.')

    //Receiver de Texto
    client.addMessageReceiver((message) => message.type === 'text/plain', (message) => {
        newUserFlag = true
        //Confere se a mensagem atual é de um usuário novo ou um que já está na lista
        userList.forEach(user => {
            console.log(user)
            //Se o usuário está na lista
            if(user.id == message.from) {
                console.log("User already on index list");
                newUserFlag = false
                userIndex = userList.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to index list");
            userList.push(new Object)
            userIndex = userList.length - 1
            userList[userIndex].id = message.from
            userList[userIndex].status = 'Boas Vindas'
        }
        switch (userList[userIndex].status) {
            case "Boas Vindas":
                emfB.SetClient(client) //Seta o cliente para o emf ter acesso
                emfB.SendMessage(message.from, "Olá!! Seja bem-vindo(a)! Deseja trocar a senha de qual sistema?", 1000)
                console.log("Switch on case: Boas Vindas")
                userList[userIndex].status = "Qual sistema?"
                break;
            case "Qual sistema?":
                console.log("Switch on case: Qual sistema?")
                if(message.content.toLowerCase().includes('hana')){
                    //Inicia o outro arquivo
                    botCheckSAP.start(client, message, 'hana')
                    userList[userIndex].status = "Bot SAP HANA"
                }
                else if(message.content.toLowerCase().includes('ecc')){
                    botCheckSAP.start(client, message, 'ecc')
                    userList[userIndex].status = "Bot SAP ECC"
                }
                else {
                    console.log("Nenhum sistema detectado");
                    emfB.SendMessage(message.from, "Desculpe, não entendi. Posso trocar sua senha nos sistemas SAP S/4 HANA e SAP ECC, qual deles você utiliza?", 1000)
                }
                break;
            case "Bot SAP HANA":
                console.log("Switch on case: Bot SAP HANA")
                botCheckSAP.start(client, message, 'hana')
                break;
            case "Bot SAP ECC":
                botCheckSAP.start(client, message, 'ecc')
                break;
        }
        console.log("User Input:" + message.content)
        
    });
})
.catch(function(err) { console.log("Falha na conexão, erro: " + err) });