let status = "Boas Vindas"
module.exports = {
    setIndexStatus: (indexStatus) => {
        status = indexStatus
    }
}
var BlipSdk = require("blip-sdk")
var WebSocketTransport = require("lime-transport-websocket")
var chatModuleHana = require("./chatModuleHana")
var emf = require("./emf.js")

let IDENTIFIER = 'tssapsdk';
let ACCESS_KEY = 'b3RPRjhGbDhxYUNQY0gzZGJ2cjY=';

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
                switch (status) {
                    case "Boas Vindas":
                        emf.SetClient(client)
                        emf.SendMessage(message.from, "Olá!! Seja bem-vindo(a)! Deseja trocar a senha de qual sistema?", 1000)
                        console.log("Switch on case: Boas Vindas")
                        status = "Qual sistema?"
                        break;
                    case "Qual sistema?":
                        console.log("Switch on case: Qual sistema?")
                        if(message.content.toLowerCase() == 'sap'){
                            chatModuleHana.startHanaBot(client, message.from)
                            //.then(botStatus => console.log(botStatus))
                            status = "Bot SAP"
                        }
                        break;
                    case "Bot SAP":
                        console.log("Switch on case: Bot SAP")
                        break;
                }
                console.log("User Input:" + message.content)
            }
        });
    })
    .catch(function(err) { /* Connection failed. */ });