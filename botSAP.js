//Bibliotecas
var emfB = require("./emfB.js")
const axios = require('axios');
const indexModule = require('./index.js')
const maestro = require('./maestro.js')

//Variáveis para controle de multiplos usuários
let newUserFlag
let users = []

module.exports = {
    start: async (client, message, sapVersion) => {
        newUserFlag = true
        //Confere se a mensagem atual é de um usuário novo ou um que já está na lista
        users.forEach(user => {
            console.log(user)
            //Se o usuário está na lista
            if(user.id == message.from) {
                console.log("User already on botSAP list")
                newUserFlag = false
                current = users.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to botSAP list");
            users.push(new Object)
            current = users.length - 1 //Novo usuário sempre é adicionado no fim do array

            //Dados padrão de um novo usuário
            users[current].id = message.from
            users[current].status = 'Qual login?'
            users[current].processStatus = 'confere'
            users[current].sapVersion = sapVersion

            //Info do orchestrator do server maçã
            users[current].maestro = {
                clientId: '8DEv1AMNXczW3y4U15LL3jYf62jK93n5',
                userKey: '67sFvQ61tTh8MQQg59rEef2Bcgcw-Lsef2XU4IMwJLhdM',
                tenantLogicalName: 'InovTeamDefszqw301979',
                tenantURL: 'inovteam/InovCenter'
            }

            //Adquire informações específicas de cada processo ECC/HANA
            if(sapVersion == 'hana') {
                await maestro.getProcessInfo(users[current].maestro, 'SRVC_ResetS4_1_Mestre')
                .then((response) => {
                    users[current].maestro.processKey = response.processKey
                    users[current].maestro.accessToken = response.accessToken
                    users[current].maestro.ready = true
                })
                .catch((error) => {
                    let regexError = /\b(5)(\d{2})\b/i
                    console.log(error.match(regexError))
                    console.log(error)
                });
            } 
            
            else if(sapVersion == 'ecc') {
                await maestro.getProcessInfo(users[current].maestro, 'SRVC_ResetECC_1_Mestre')
                .then((response) => {
                    users[current].maestro.processKey = response.processKey
                    users[current].maestro.accessToken = response.accessToken
                })
                .catch((error) => {
                    let regexError = /\b(5)(\d{2})\b/i
                    console.log(error.match(regexError))
                    console.log(error)
                });
            }
        }
    
        switch(users[current].status) {
            case "Qual login?":
                emfB.SendMessage(users[current].id, "Certo, qual o seu login nesse sistema?",2000)
                users[current].status = "Aviso Processando"
                break;

            case "Aviso Processando":
                emfB.SendMessage(users[current].id, "Ok, adicionei seu pedido de troca de senha na minha fila, " + message.content, 2000)
                users[current].userLogin = message.content
                users[current].status = "Start Job Confere"

                //Start Job 
                orchJobId = await maestro.startJob(users[current].maestro, 
                                                users[current].userLogin,
                                                users[current].processStatus)
                console.log('orchJobId: ' + orchJobId)

                //Resolves when rpa starts processing
                await maestro.didProcessStart(users[current].maestro, orchJobId)
                .then(() => {
                    emfB.SendMessage(users[current].id, "Estou trocando sua senha...", 2000)
                })

                //Resolves when rpa finishes processing
                await maestro.didProcessFinish(users[current].maestro, orchJobId)
                .then((outputArguments) => {
                    if(outputArguments.statusEmail == 'enviado') {
                        emfB.SendMessage(users[current].id, "Senha trocada com sucesso :),\
                                                                te enviei sua senha temporária por e-mail,\
                                                                até a próxima", 2000)
                        //Deletes user from the list
                        indexModule.spliceUser(users[current].id)
                        users.splice(current, 1)
                    }
                    else if(outputArguments.statusLogin == 'inexistente') {
                        users[current].status = "Login Errado"
                        emfB.SendMessage(users[current].id, 'Esse usuário não existe no sistema, deseja tentar novamente?', 2000)
                    }
                    console.log(outputArguments)
                })
                .catch((error) => {
                    console.log(error)
                    emfB.SendMessage(message.from, 'Falhou rpa, porra leo', 2000)
                })
                break;

            case "Login Errado":
                console.log("Switch on Status: Login Errado");
                if(message.content.toLowerCase() == 'sim') {
                    users[current].status = "Aviso Processando"
                    users[current].processStatus = 'confere'
                    emfB.SendMessage(users[current].id, "Certo, qual o seu login nesse sistema?",2000)
                }
                else if(message.content.toLowerCase().includes('nao') ||
                        message.content.toLowerCase().includes('não')) {

                    emfB.SendMessage(users[current].id ,"Certo, te vejo na próxima então", 2000)
                    //Deletes user from the list
                    indexModule.spliceUser(users[current].id)
                    users.splice(current, 1) 
                }
                else {
                    emfB.SendMessage(users[current].id ,"Desculpe, não entendi. Você deseja tentar novamente?", 2000)
                }
                break;
        }
    }
}