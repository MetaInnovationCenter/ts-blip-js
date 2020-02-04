//Módulos para manipulação de variáveis por outro arquivo
module.exports = {
    spliceUser:  (user) => {
        let userIndex = userList.indexOf(user)
        userList.splice(userIndex, 1)
        userStatus.splice(userIndex, 1)
    }
}
//Bibliotecas
var BlipSdk = require("blip-sdk")
var WebSocketTransport = require("lime-transport-websocket")
var chatModuleHana = require("./chatModuleHana")
var emf = require("./emf.js")

//Dados do robo no portal.blip.ai
let IDENTIFIER = 'tssapsdk';
let ACCESS_KEY = 'b3RPRjhGbDhxYUNQY0gzZGJ2cjY=';

//Variáveis para controle de multiplos usuários
let userList = []
let userStatus = []
let newUserFlag = true
let currentUserIndex

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
            if(user == message.from) {
                console.log("User already on the list");
                newUserFlag = false
                currentUserIndex = userList.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to the list");
            userList.push(message.from)
            userStatus.push('Boas Vindas')
            currentUserIndex = userList.indexOf(message.from)
        }
        switch (userStatus[currentUserIndex]) {
            case "Boas Vindas":
                emf.SetClient(client) //Seta o cliente para o emf ter acesso
                emf.SendMessage(message.from, "Olá!! Seja bem-vindo(a)! Deseja trocar a senha de qual sistema?", 1000)
                console.log("Switch on case: Boas Vindas")
                userStatus[currentUserIndex] = "Qual sistema?"
                break;
            case "Qual sistema?":
                console.log("Switch on case: Qual sistema?")
                if(message.content.toLowerCase() == 'sap'){
                    //Inicia o outro arquivo
                    chatModuleHana.startHanaBot(client, message.from, message)
                    userStatus[currentUserIndex] = "Bot SAP"
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