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
var chatModuleHana = require("./chatModuleHana")
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
                console.log("User already on the list");
                newUserFlag = false
                userIndex = userList.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to the list");
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
                if(message.content.toLowerCase() == 'sap'){
                    //Inicia o outro arquivo
                    chatModuleHana.startHanaBot(client, message.from, message)
                    userList[userIndex].status = "Bot SAP"
                }
                break;
            case "Bot SAP":
                console.log("Switch on case: Bot SAP")
                chatModuleHana.startHanaBot(client, message.from, message)
                break;
        }
        console.log("User Input:" + message.content)
        
    });
})
.catch(function(err) { console.log("Falha na conexão, erro: " + err) });