module.exports = {
    setIndexStatus: (indexStatus) => {
        status = indexStatus
    },
    spliceUser:  (user) => {
        let userIndex = userList.indexOf(user)
        userList.splice(userIndex, 1)
        userStatus.splice(userIndex, 1)
    }
}
var BlipSdk = require("blip-sdk")
var WebSocketTransport = require("lime-transport-websocket")
var chatModuleHana = require("./chatModuleHana")
var emf = require("./emf.js")

let IDENTIFIER = 'tssapsdk';
let ACCESS_KEY = 'b3RPRjhGbDhxYUNQY0gzZGJ2cjY=';

let userList = []
let userStatus = []
let newUserFlag = true
let currentUserIndex

// Create a client instance passing the identifier and accessKey of your chatbot
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

client.connect() // This method return a 'promise'.
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
                emf.SetClient(client)
                emf.SendMessage(message.from, "Olá!! Seja bem-vindo(a)! Deseja trocar a senha de qual sistema?", 1000)
                console.log("Switch on case: Boas Vindas")
                userStatus[currentUserIndex] = "Qual sistema?"
                break;
            case "Qual sistema?":
                console.log("Switch on case: Qual sistema?")
                if(message.content.toLowerCase() == 'sap'){
                    chatModuleHana.startHanaBot(client, message.from, message)
                    //.then(botStatus => console.log(botStatus))
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