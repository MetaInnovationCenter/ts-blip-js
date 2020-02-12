//Bibliotecas
var emfB = require("./emfB.js")
const axios = require('axios');
const indexModule = require('./index.js')
const maestro = require('./maestro.js')

//Variáveis para controle de multiplos usuários
let newUserFlag
let userList = []

module.exports = {
    start: async (client, userId, message) => {
        newUserFlag = true
        //Confere se a mensagem atual é de um usuário novo ou um que já está na lista
        userList.forEach(user => {
            console.log(user)
            //Se o usuário está na lista
            if(user.id == message.from) {
                console.log("User already on botCheckSAP list");
                newUserFlag = false
                userIndex = userList.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to botCheckSAP list");
            userList.push(new Object)
            userIndex = userList.length - 1
            userList[userIndex].id = message.from
            userList[userIndex].status = 'Qual login?'
            userList[userIndex].processStatus = 'confere'
        }

        //Acquiring Process Info to start jobs
        let orchProcessInfo = await maestro.getProcessInfo('SAP_sap') 
        //SAP.S4HANA_DemoRobots Leo
        //
        let orchProcessKey = orchProcessInfo.processKey
        let orchAccessToken = orchProcessInfo.accessToken
        
        switch(userList[userIndex].status) {
            case "Qual login?":
                console.log("Switch on case: Qual login?")
                emfB.SendMessage(userId, "Certo, qual o seu login nesse sistema?",1000)
                userList[userIndex].status = "Aviso Processando"
                break;
            case "Aviso Processando":
                emfB.SendMessage(userId, "Vou conferir se seu login está correto, " + message.content)
                userList[userIndex].userLogin = message.content
                userList[userIndex].status = "Start Job"
            case "Start Job Confere":
                console.log("Switch on case: Start Job");

                //Start Job Confere Request
                orchJobId = await maestro.startJob(orchProcessKey, orchAccessToken, 
                                                userList[userIndex].userLogin,
                                                userList[userIndex].processStatus)
                console.log('orchJobId: ' + orchJobId)

                let flagProcessStarted = false
                //Async loop to check output
                let delayOutput = setInterval(
                    async function getOutput() {
                        let orchJobOutput = await maestro.getJobOutput(orchJobId, orchAccessToken)
                        console.log(orchJobOutput.Info)

                        let orchJobInfo = orchJobOutput.Info
                        orchJobInfo == null ? console.log("Job Info: Not Started") : console.log("Job Info: " + orchJobInfo)
                        
                        if(orchJobInfo == 'Job completed') {
                            let orchOutputArgs = JSON.parse(orchJobOutput.OutputArguments)
                            console.log(orchOutputArgs)

                            if(orchOutputArgs.statusLogin == 'inexistente') {
                                userList[userIndex].status = "Login Errado"
                                console.log('Esse usuário não existe no sistema, deseja tentar novamente?')
                                emfB.SendMessage(userId, 'Esse usuário não existe no sistema, deseja tentar novamente?')
                                clearInterval(delayOutput)
                            }
                            else if(orchOutputArgs.statusLogin == 'existe') {
                                userList[userIndex].status = "Login Existe"
                                userList[userIndex].codeBlip = orchOutputArgs.codeBlip
                                userList[userIndex].email = orchOutputArgs.emailOutput
                                console.log("Login existe")
                                
                                emfB.SendMessage(userId, "Certo, seu login foi inserido corretamente.\
                                                                Te mandei um e-mail com um código de segurança,\
                                                                pode digitar esse código aqui pra mim?")
                            }
                            clearInterval(delayOutput)
                        }
                        else if(orchJobInfo == 'Job started processing' && flagProcessStarted == false) {
                            emfB.SendMessage(userId, "Estou conferindo")
                            flagProcessStarted = true
                        }
                    }
                    , 4000);

                break;
            case 'Login Existe':
                if(message.content == userList[userIndex].codeBlip) {
                    console.log('Código correto')
                    emfB.SendMessage(userId, 'Código inserido corretamente,\
                                             coloquei seu pedido de troca de senha na fila')
                    
                    userList[userIndex].processStatus = 'trocaSenha'

                    console.log(userList[userIndex].email)

                    //Start Job Troca Senha Request
                    orchJobId = await maestro.startJob(orchProcessKey, orchAccessToken, 
                                                        userList[userIndex].userLogin,
                                                        userList[userIndex].processStatus,
                                                        userList[userIndex].email)
                    console.log('orchJobId: ' + orchJobId)

                    let flagProcessStarted = false
                    //Async loop to check output
                    let delayOutput = setInterval(
                        async function getOutput() {
                            let orchJobOutput = await maestro.getJobOutput(orchJobId, orchAccessToken)
                            console.log(orchJobOutput.Info)

                            let orchJobInfo = orchJobOutput.Info
                            orchJobInfo == null ? console.log("Job Info: Not Started") : console.log("Job Info: " + orchJobInfo)
                            
                            if(orchJobInfo == 'Job completed') {
                                let orchOutputArgs = JSON.parse(orchJobOutput.OutputArguments)
                                console.log(orchOutputArgs)

                                if(orchOutputArgs.statusEmail == 'senhatrocada') {
                                    userList[userIndex].status = "Sucesso"
                                    console.log('Senha trocada com sucesso :)')
                                    emfB.SendMessage(userId, 'Senha trocada com sucesso :),\
                                                                te enviei sua senha temporária por e-mail,\
                                                                até a próxima')
                                }
                                else if(orchOutputArgs.statusEmail == 'FALTA ESSA FLAG') {
                                    //???
                                }
                                clearInterval(delayOutput)
                            }
                            else if(orchJobInfo == 'Job started processing' && flagProcessStarted == false) {
                                emfB.SendMessage(userId, "Estou trocando sua senha")
                                flagProcessStarted = true
                            }
                        }
                    , 4000);

                }
                else {
                    console.log('Código errado');
                    emfB.SendMessage(userId, 'Código inserido incorretamente, por favor tente novamente')
                }
                break;
            case "Login Errado":
                console.log("Switch on Status: Login Errado");
                if(message.content.toLowerCase() == 'sim') {
                    userList[userIndex].status = "Aviso Processando"
                    userList[userIndex].processStatus = 'retentativa'
                    emfB.SendMessage(userId, "Certo, qual o seu login nesse sistema?",1000)
                }
                else if(message.content.toLowerCase() == 'nao' ||
                        message.content.toLowerCase() == 'não') {
                        emfB.SendMessage(userId ,"Certo, te vejo na próxima então")
                        userList.splice(userIndex, 1)
                        userStatus.splice(userIndex, 1)
                        indexModule.spliceUser(userId)
                }
                break;
            case 'Sucesso':
                //Deletes user from the list
                userList.splice(userIndex, 1)
                indexModule.spliceUser(userList[userIndex].id)
                break;
        }
    }
}