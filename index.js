var BlipSdk = require("blip-sdk")
var WebSocketTransport = require("lime-transport-websocket")
var chatModuleHana = require("./chatModuleHana")

let IDENTIFIER = 'tssapsdk';
let ACCESS_KEY = 'b3RPRjhGbDhxYUNQY0gzZGJ2cjY=';
let idUser
let status = "Boas Vindas"

// Create a client instance passing the identifier and accessKey of your chatbot
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

client.connect() // This method return a 'promise'.
    .then(function(session) {
        console.log('Application started. Press Ctrl + c to stop.')

        //Mensagem inicial
        client.addMessageReceiver(true, function(message) {
            //console.log(message.content.state)
            //console.log(message.content)
            
            if(message.content.state == undefined) {
                console.log('user type'message.content)
                switch (status) {
                    case "Boas Vindas":
                        idUser = message.from
                        let msg = { type: "text/plain", content: "Olá!! Seja bem-vindo(a)! Deseja trocar a senha de qual sistema?", to: idUser }
                        client.sendMessage(msg)
                        console.log("case boas vindas")
                        status = "Qual sistema?"
                        break;
                    case "Qual sistema?":
                        console.log("qual sistema?")
                        if(message.content == 'sap'){
                            chatModuleHana.startHanaBot()
                        } 
                        break;  
                }
            }
        });
    })
    .catch(function(err) { /* Connection failed. */ });