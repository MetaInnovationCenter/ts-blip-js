//Módulos para manipulação de variáveis por outro arquivo
module.exports = {
    spliceUser:  (userId) => {
        users.forEach(user => {
            if(user.id == userId)
                current = users.indexOf(user)
        });
        users.splice(current, 1)
    }
}
//Bibliotecas
var BlipSdk = require("blip-sdk")
var WebSocketTransport = require("lime-transport-websocket")
var botCheckSAP = require("./Bot/botCheckSAP")
var botSAP = require('./botSAP')
var emfB = require("./emfB.js")

//Dados do robo no portal.blip.ai
let IDENTIFIER = 'tssapsdk';
let ACCESS_KEY = 'b3RPRjhGbDhxYUNQY0gzZGJ2cjY=';

//Variáveis para controle de multiplos usuários
let users = []
let newUserFlag = true
let current
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
        users.forEach(user => {
            console.log(user)
            //Se o usuário está na lista
            if(user.id == message.from) {
                console.log("User already on index list");
                newUserFlag = false
                current = users.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to index list");
            users.push(new Object)
            current = users.length - 1
            users[current].id = message.from
            users[current].status = 'Boas Vindas'
        }

        if(message.content.toLowerCase().includes('tchau')){        // caso o usuário deseja sair do sistema
            emfB.SendMessage(message.from, "Até a próxima, tchau!")
            users[current].status = "Saiu"
        }
        else if(message.content.toLowerCase().includes('valeu'))
        {
            emfB.SendMessage(message.from, "Até mais!")
            users[current].status = "Saiu"
        }
        else if(message.content.toLowerCase().includes('bye'))
        {
            emfB.SendMessage(message.from, "See you!")
            users[current].status = "Saiu"
        }
        else if(message.content.toLowerCase().includes('oi'))
        {
            users[current].status = "Boas Vindas"
        }
        else if(message.content.toLowerCase().includes('ola'))
        {
            users[current].status = "Boas Vindas"
        }

// ----------------------------------------------------------------------------------------------------------//
        switch (users[current].status) {
            case "Boas Vindas":
                emfB.SetClient(client) //Seta o cliente para o emf ter acesso
                console.log("Switch on case:Boas Vindas")
                time = new Date();      
                hour = time.getHours()
            
                if ( hour>5 & hour<12) {  
                    emfB.SendMessage(message.from, "Bom dia, eu sou o Max Assistant 😀, um assistente virtual e estou aqui para te ajudar!")   
                } else if(hour>12 & hour<18) {
                    emfB.SendMessage(message.from, "Boa tarde, eu sou o Max Assistant 😀, um assistente virtual e estou aqui para te ajudar!")
                } else if(hour>18 & hour<5) {
                    emfB.SendMessage(message.from, "Boa noite, eu sou o Max Assistant 😀, um assistente virtual e estou aqui para te ajudar!")
                }
                emfB.SendMenu(message.from,"Com qual dos sistemas eu posso te auxiliar?", ['SAP','Microsoft','TraceGP'],1000)
                users[current].status = "Escolhe Sistemas"
                break;
// ------------------------------------- case confere sistemas ------------------------------------------- //
                case "Escolhe Sistemas":
                console.log("Switch on case:confere sistemas")
                if (message.content.toLowerCase().includes('sap'))
                {
                    emfB.SendMenu(message.from, "O que você precisa?", ['Reset de Senha','FOLHA TOTVS','FOLHA MS','Solução Fiscal','GRC In/Outbound'], 1000)
                    
                }
                else if (message.content.toLowerCase().includes('microsoft'))
                {
                    emfB.SendMenu(message.from, "Desculpe, não entendi, pois sou um bot em treinamento, no momento posso te ajudar com os seguintes sistemas", ['SAP'],1000)
                    users[current].status = "confere sistemas"
                }
                else if (message.content.toLowerCase().includes('tracegp'))
                {
                    emfB.SendMenu(message.from, "Desculpe, não entendi, pois sou um bot em treinamento, no momento posso te ajudar com os seguintes sistemas:", ['SAP'],1000)
                    users[current].status = "confere sistemas"
                }
                else 
                {
                    emfB.SendMenu(message.from, "Desculpe, não entendi, pois sou um bot em treinamento, no momento posso te ajudar com os seguintes sistemas:", ['SAP'],1000)
                    users[current].status = "confere sistemas"
                }
            break;
// -------------------------------------- case atividades SAP -------------------------------------------- //
            
            
            /*case "Bot SAP HANA 1":
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
                break;*/

            case "Saiu":
                users[current].status = "Boas Vindas"
                break;
        }
        console.log("User Input:" + message.content)
    });
})
.catch(function(err) { console.log("Falha na conexão, erro: " + err) });