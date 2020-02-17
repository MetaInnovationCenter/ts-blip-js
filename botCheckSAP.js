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

            // if(sapVersion == 'hana') {
            //     //Stores orchestrator info in the user object
            //     users[current].maestro = {
            //         clientId: '8DEv1AMNXczW3y4U15LL3jYf62jK93n5',
            //         userKey: '2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi',
            //         tenantLogicalName: 'MetaDefaultxi2r298584',
            //         tenantURL: 'metaybbsotc/MetaDefault'
            //     }
            //     await maestro.getProcessInfo(users[current].maestro, 'SRVC_ResetS4_2_Leo')
            //     .then((response) => {
            //         users[current].maestro.processKey = response.processKey
            //         users[current].maestro.accessToken = response.accessToken
            //         users[current].maestro.ready = true
            //     })
            // }
            // else if(sapVersion == 'ecc') {
            //     //Stores orchestrator info in the user object
            //     users[current].maestro = {
            //         clientId: '8DEv1AMNXczW3y4U15LL3jYf62jK93n5',
            //         userKey: 'Z8VQl1PmNDYT5fJkFpYjDLE1c1rdZffhjFN2yBxr0MkI4',
            //         tenantLogicalName: 'MetaDefaultaldz298583',
            //         tenantURL: 'metayofvcgb/MetaDefault'
            //     }
            //     //Gets process info by process name
            //     await maestro.getProcessInfo(users[current].maestro, 'SRVC_ResetECC_2_Maki')
            //     .then((response) => {
            //         users[current].maestro.processKey = response.processKey
            //         users[current].maestro.accessToken = response.accessToken
            //     })
            // }
        }
    
        switch(users[current].status) {
            case "Qual login?":
                console.log("Switch on case: Qual login?")
                emfB.SendMessage(users[current].id, "Certo, qual o seu login nesse sistema?",1000)
                users[current].status = "Aviso Processando"
                break;
            case "Aviso Processando":
                emfB.SendMessage(users[current].id, "Vou conferir se seu login está correto, " + message.content)
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
                    emfB.SendMessage(users[current].id, "Estou conferindo")
                })

                //Resolves when rpa finishes processing
                await maestro.didProcessFinish(users[current].maestro, orchJobId)
                .then((outputArguments) => {
                    if(outputArguments.statusLogin == 'inexistente') {
                        users[current].status = "Login Errado"
                        console.log('Esse usuário não existe no sistema, deseja tentar novamente?')
                        emfB.SendMessage(users[current].id, 'Esse usuário não existe no sistema, deseja tentar novamente?')
                    }
                    else if(outputArguments.statusLogin == 'existe') {
                        users[current].status = "Login Existe"
                        users[current].codeBlip = outputArguments.codeBlip
                        users[current].email = outputArguments.emailOutput
                        console.log("Login existe")
                        console.log('Codigo: ' + users[current].codeBlip)
                        
                        emfB.SendMessage(users[current].id, "Certo, seu login foi inserido corretamente.\
                                                        Te mandei um e-mail com um código de segurança,\
                                                        pode digitar esse código aqui pra mim?")
                    }
                    
                })
                break;
            case 'Login Existe':
                if(message.content == users[current].codeBlip) {
                    console.log('Código correto')
                    emfB.SendMessage(users[current].id, 'Código inserido corretamente,\
                                             coloquei seu pedido de troca de senha na fila')
                    
                    users[current].processStatus = 'trocaSenha'

                    console.log(users[current].email)

                    //Start Job Troca Senha Request
                    orchJobId = await maestro.startJob(users[current].maestro, 
                                                        users[current].userLogin,
                                                        users[current].processStatus,
                                                        users[current].email)
                    console.log('orchJobId: ' + orchJobId)

                    let flagProcessStarted = false
                    //Async loop to check output
                    let delayOutput = setInterval(
                        async function getOutput() {
                            let orchJobOutput = await maestro.getJobOutput(users[current].maestro, orchJobId)
                            console.log(orchJobOutput.Info)

                            let orchJobInfo = orchJobOutput.Info
                            orchJobInfo == null ? console.log("Job Info: Not Started") : console.log("Job Info: " + orchJobInfo)
                            
                            if(orchJobInfo == 'Job completed') {
                                let orchOutputArgs = JSON.parse(orchJobOutput.OutputArguments)
                                console.log(orchOutputArgs)

                                if(orchOutputArgs.statusEmail == 'enviado') {
                                    users[current].status = "Sucesso"
                                    console.log('Senha trocada com sucesso :)')
                                    emfB.SendMessage(users[current].id, 'Senha trocada com sucesso :),\
                                                                te enviei sua senha temporária por e-mail,\
                                                                até a próxima')
                                    //Deletes user from the list
                                    indexModule.spliceUser(users[current].id)
                                    users.splice(current, 1)
                                    
                                }
                                else if(orchOutputArgs.statusEmail == 'FALTA ESSA FLAG') {
                                    //???
                                }
                                clearInterval(delayOutput)
                            }
                            else if(orchJobInfo == 'Job started processing' && flagProcessStarted == false) {
                                emfB.SendMessage(users[current].id, "Estou trocando sua senha")
                                flagProcessStarted = true
                            }
                        }
                    , 4000);

                }
                else {
                    console.log('Código errado');
                    emfB.SendMessage(users[current].id, 'Código inserido incorretamente, por favor tente novamente')
                }
                break;
            case "Login Errado":
                console.log("Switch on Status: Login Errado");
                if(message.content.toLowerCase() == 'sim') {
                    users[current].status = "Aviso Processando"
                    users[current].processStatus = 'retentativa'
                    emfB.SendMessage(users[current].id, "Certo, qual o seu login nesse sistema?",1000)
                }
                else if(message.content.toLowerCase() == 'nao' ||
                        message.content.toLowerCase() == 'não') {
                        emfB.SendMessage(users[current].id ,"Certo, te vejo na próxima então")
                        //Deletes user from the list
                        indexModule.spliceUser(users[current].id)
                        users.splice(current, 1) 
                }
                break;
            case 'Sucesso':
                //Deletes user from the list
                indexModule.spliceUser(users[current].id)
                users.splice(current, 1)
                break;
        }
    }
}