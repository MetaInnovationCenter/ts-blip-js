//Bibliotecas
var emfB = require("../local_modules/emfB.js")
const indexModule = require('../index.js')
const maestro = require('../local_modules/maestro.js')

//Variáveis para controle de multiplos usuários
let newUserFlag
let users = []
let current

module.exports = {
    start: async (message, sapVersion) => {
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
            users[current].try = 0

            //Info do orchestrator do server maçã
            users[current].maestro = {
                clientId: '8DEv1AMNXczW3y4U15LL3jYf62jK93n5',
                userKey: '67sFvQ61tTh8MQQg59rEef2Bcgcw-Lsef2XU4IMwJLhdM',
                tenantLogicalName: 'InovTeamDefszqw301979',
                tenantURL: 'inovteam/InovCenter'
            }

            //Adquire informações específicas de cada processo ECC/HANA e atribui a propriedades de users[current]
            if(sapVersion == 'hana') {
                console.log("sapVersion == hana");
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
                console.log("sapVersion == ecc");
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
                emfB.SendMessage(users[current].id, "Para isso, preciso que você me diga qual o seu login no sistema.",2000)
                users[current].status = "Aviso Processando"
                break;

            case "Aviso Processando":
                emfB.SendMessage(users[current].id, "Adicionei seu pedido a fila de processos, aguarde.", 2000)
                users[current].userLogin = message.content
                users[current].status = "Start Job Confere"

                //Start Job 
                let orchJobId = await maestro.startJob(users[current].maestro, 
                                                       users[current].userLogin,
                                                       users[current].processStatus)
                console.log('orchJobId: ' + orchJobId)

                //Resolves when rpa starts processing
                await maestro.didProcessStart(users[current].maestro, orchJobId)
                .then(() => {
                    emfB.SendMessage(users[current].id, "Agora estou processando, só mais um pouquinho!", 2000)
                })

                //Resolves when rpa finishes processing
                await maestro.didProcessFinish(users[current].maestro, orchJobId)
                .then((outputArguments) => {
                    if(outputArguments.statusEmail == 'enviado') {
                        emfB.SendMessage(users[current].id, "Senha trocada com sucesso 😊,\
                                                                te enviei sua senha temporária por e-mail,\
                                                                até a próxima!", 2000)
                        //Deletes user from the list
                        indexModule.spliceUser(users[current].id)
                        users.splice(current, 1)
                    }
                    else if(outputArguments.statusLogin == 'inexistente') {
                        users[current].status = "Login Errado"
                        emfB.SendOptions(users[current].id, 'Esse usuário não existe no sistema, deseja tentar novamente?', ['Sim', 'Não'], 2000)
                    }
                    console.log(outputArguments)
                })
                .catch((error) => {
                    console.log(error)
                    emfB.SendMessage(message.from, 'falha RPA', 2000)
                })
                break;

            case "Login Errado":
                console.log("Switch on Status: Login Errado");
                if(users[current].try == 2){
                    emfB.SendMessage(users[current].id, "Você excedeu o número de tentativas!", 2000)
                    //Deletes user from the list
                    indexModule.spliceUser(users[current].id)
                    users.splice(current, 1) 
                }
                else if(message.content.toLowerCase() == 'sim') {
                    users[current].try = users[current].try + 1
                    users[current].status = "Aviso Processando"
                    users[current].processStatus = 'confere'
                    emfB.SendMessage(users[current].id, "Insira o seu login nesse sistema.",2000)
                }
                else if(message.content.toLowerCase().includes('nao')||message.content.toLowerCase().includes('não')) {
                    emfB.SendMessage(users[current].id ,"Certo, te vejo na próxima então", 2000)
                    //Deletes user from the list
                    indexModule.spliceUser(users[current].id)
                    users.splice(current, 1) 
                }
                else {
                    emfB.SendOptions(users[current].id ,"Desculpe, não entendi. Você deseja tentar novamente?",['Sim','Não'], 2000)
                }
                break;
        }
    }
}