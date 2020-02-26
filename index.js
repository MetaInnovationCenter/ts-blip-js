
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
let time = new Date();
let hour = time.getHours();

// Cliente websocket para conexão entre o node e o blip
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

//Inicia a conexão entre o server node e o blip
client.connect() 
.then(async function(session) {
    console.log('Application started. Press Ctrl + c to stop.')

    //Receiver de Texto
    client.addMessageReceiver((message) => message.type === 'text/plain', async (message) => {
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

        if(message.content.toLowerCase().includes('tchau')){        // caso o usuário deseja sair do sistema
            emfB.SendMessage(message.from, "Até a próxima, tchau!")
            userList[userIndex].status = "Saiu"
        }
        else if(message.content.toLowerCase().includes('valeu'))
        {
            emfB.SendMessage(message.from, "Até mais!")
            userList[userIndex].status = "Saiu"
        }
        else if(message.content.toLowerCase().includes('bye'))
        {
            emfB.SendMessage(message.from, "See you!")
            userList[userIndex].status = "Saiu"
        }
        else if(message.content.toLowerCase().includes('oi'))
        {
            userList[userIndex].status = "Boas Vindas"
        }
        else if(message.content.toLowerCase().includes('ola'))
        {
            userList[userIndex].status = "Boas Vindas"
        }

// ----------------------------------------------------------------------------------------------------------//
        switch (userList[userIndex].status) {
            case "Boas Vindas":
                emfB.SetClient(client) //Seta o cliente para o emf ter acesso
                
                time = new Date();      
                hour = time.getHours()
                console.log("time is " + hour)

                if ( hour>5 & hour<12) {
                    emfB.SendMessage(message.from, "Bom dia, eu sou o Max Assistant 😀. Estou aqui para te ajudar!")   
                } else if(hour>12 & hour<18) {
                    emfB.SendMessage(message.from, "Boa tarde, eu sou o Max Assistant 😀. Estou aqui para te ajudar!")
                } else if(hour>18 & hour<5) {
                    emfB.SendMessage(message.from, "Boa noite, eu sou o Max Assistant 😀. Estou aqui para te ajudar!")
                }
                emfB.SendOptions(message.from, "O que você precisa?", ['Reset de senha SAP'], 3000)
                console.log("Switch on case: Boas Vindas")
                userList[userIndex].status = "Versões SAP"
                break;

            case "Versões SAP":
                console.log('Switch on case versões sap')
                if(message.content.toLowerCase().includes('reset'))
                {
                    console.log("Switch on case: Versões SAP")
                    emfB.SendOptions(message.from, "Ok, consigo te ajudar a resetar a senha do SAP com as seguintes versões:", ['SAP ECC1', 'SAP S/4 HANA1']) 
                    userList[userIndex].status = "Executa versões SAP"
                }
                else
                {
                    emfB.SendOptions(message.from, "Desculpe, não entendi, pois sou um bot treinado apenas para te ajudar com os seguintes itens:", ['Reset de senha SAP'], 2000)
                    if(message.content.toLowerCase().includes('reset'))
                    {
                        userList[userIndex].status = "Versões SAP"
                    }
                }
                break;

            case "Executa versões SAP":
                if(message.content.toLowerCase().includes('ecc1')) {
                    botSAP.start(client, message, 'ecc')
                    userList[userIndex].status = "Bot SAP ECC 1"
                }
                else if(message.content.toLowerCase().includes('hana1')) {
                    botSAP.start(client, message, 'hana')
                    userList[userIndex].status = "Bot SAP HANA 1"
                }
                else if(message.content.toLowerCase().includes('hana')){
                    //Inicia o outro arquivo
                    botCheckSAP.start(client, message, 'hana')
                    userList[userIndex].status = "Bot SAP HANA 2"
                }
                else if(message.content.toLowerCase().includes('ecc')){
                    botCheckSAP.start(client, message, 'ecc')
                    userList[userIndex].status = "Bot SAP ECC 2"
                }
                else {
                    console.log("Nenhum sistema detectado");
                    emfB.SendOptions(message.from, "Desculpe, não entendi. Posso trocar sua senha nos sistemas SAP S/4 HANA e SAP ECC, qual deles você utiliza?", ['SAP ECC', 'S/4 HANA'], 2000)
                }
                break;
            
            case "Bot SAP HANA 1":
                botSAP.start(client, message, 'hana')
                break;
            case "Bot SAP HANA 2":
                botCheckSAP.start(client, message, 'hana')
                break;
            case "Bot SAP ECC 1":
                botSAP.start(client, message, 'ecc')
                break;
            case "Bot SAP ECC 2":
                botCheckSAP.start(client, message, 'ecc')
                break;

            case "Saiu":
                userList[userIndex].status = "Boas Vindas"
                break;
        }
        console.log("User Input:" + message.content)
    });
})
.catch(function(err) { console.log("Falha na conexão, erro: " + err) });