//Bibliotecas
var emfB = require("./emfB.js")
const axios = require('axios');
const indexModule = require('../index.js')
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
                console.log("User already on botCheckSAP list")
                newUserFlag = false
                current = users.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to botCheckSAP list");
            users.push(new Object)
            current = users.length - 1 //Novo usuário sempre é adicionado no fim do array

            //Dados padrão de um novo usuário
            users[current].id = message.from
            users[current].status = 'Adquirindo Login'
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
                await maestro.getProcessInfo(users[current].maestro, 'SRVC_ResetS4_2_Mestre')
                .then((response) => {
                    users[current].maestro.processKey = response.processKey
                    users[current].maestro.accessToken = response.accessToken
                    users[current].maestro.ready = true
                })
            }
            
            else if(sapVersion == 'ecc') {
                await maestro.getProcessInfo(users[current].maestro, 'SRVC_ResetECC_2_Mestre')
                .then((response) => {
                    users[current].maestro.processKey = response.processKey
                    users[current].maestro.accessToken = response.accessToken
                })
            }
        }
    
        switch(users[current].status) {
            case "Adquirindo Login":
                emfB.SendMessage(users[current].id, "Para isso, preciso que você me diga qual o seu login no sistema.", 2000)
                users[current].status = "Conferindo Login"
                break;
            case "Conferindo Login":
                emfB.SendMessage(users[current].id, "Vou conferir se seu login está correto!", 2000)
                users[current].userLogin = message.content
                users[current].status = "Start Job Confere"
                console.log("Switch on case: Start Job")

                //Start Job 
                orchJobId = await maestro.startJob(users[current].maestro, 
                                                users[current].userLogin,
                                                users[current].processStatus)
                console.log('orchJobId: ' + orchJobId)

                //Resolves when rpa starts processing
                await maestro.didProcessStart(users[current].maestro, orchJobId)
                .then(() => {
                    emfB.SendMessage(users[current].id, "Estou conferindo...")
                })

                //Resolves when rpa finishes processing
                await maestro.didProcessFinish(users[current].maestro, orchJobId)
                .then((outputArguments) => {
                    if(outputArguments.statusLogin == 'inexistente') {
                        users[current].status = "Login Errado"
                        emfB.SendMessage(users[current].id, 'Esse usuário não existe no sistema, deseja tentar novamente?', 2000)
                    }
                    else if(outputArguments.statusLogin == 'existe') {
                        users[current].status = "Login Existe"
                        users[current].codeBlip = outputArguments.codeBlip
                        users[current].email = outputArguments.emailOutput
                        
                        emfB.SendMessage(users[current].id, "Certo, seu login foi inserido corretamente.\
                                                        Te mandei um e-mail com um código de segurança,\
                                                        preciso que você digite este código aqui\
                                                        para continuar com a sua solicitação", 2000)
                    }
                    console.log(outputArguments)
                })
                .catch((error) => {
                    console.log(error)
                    emfB.SendMessage(message.from, 'Falhou rpa, porra leo', 2000)
                })
                break;
            case 'Login Existe':
                if(message.content == users[current].codeBlip) {
                    emfB.SendMessage(users[current].id, 'O código foi inserido corretamente, \
                                                         dentro de alguns instantes irei realizar o seu pedido.', 2000)
                    
                    users[current].processStatus = 'trocaSenha'

                    //Start Job Troca Senha Request
                    orchJobId = await maestro.startJob(users[current].maestro, 
                                                        users[current].userLogin,
                                                        users[current].processStatus,
                                                        users[current].email)
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
                            users[current].status = "Sucesso"
                            console.log('Senha trocada com sucesso :)')
                            emfB.SendMessage(users[current].id, 'Agora é só você acessar o e-mail cadastrado no sistema \
                                                                 que a sua nova senha vai estar lá! \
                                                                 Espero ter te ajudado 😊, até a próxima!', 2000)
                            //Deletes user from the list
                            indexModule.spliceUser(users[current].id)
                            users.splice(current, 1)
                        }
                        else {
                            emfB.SendMessage(users[current].id, 'O processo falhou :(', 2000)
                        }
                        console.log(outputArguments)
                    })
                    .catch((error) => {
                        console.log(error)
                        emfB.SendMessage(message.from, 'Falhou rpa, porra leo', 2000)
                    })
                }
                else {
                    console.log('Código errado');
                    emfB.SendMessage(users[current].id, 'Código inserido incorretamente, por favor tente novamente', 2000)
                }
                break;
            case "Login Errado":
                console.log("Switch on Status: Login Errado");
                if(message.content.toLowerCase() == 'sim') {
                    users[current].status = "Conferindo Login"
                    users[current].processStatus = 'confere'
                    emfB.SendMessage(users[current].id, "Certo, qual o seu login nesse sistema?", 2000)
                }
                else if(message.content.toLowerCase() == 'nao' ||
                        message.content.toLowerCase() == 'não') {
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