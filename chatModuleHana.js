//Bibliotecas
var emfB = require("./emfB.js")
const axios = require('axios');
const indexModule = require('./index.js')

//Variáveis para controle de multiplos usuários
let newUserFlag
let userList = []

module.exports = {
    startHanaBot: async (client, userId, message) => {
        newUserFlag = true
        //Confere se a mensagem atual é de um usuário novo ou um que já está na lista
        userList.forEach(user => {
            console.log(user)
            //Se o usuário está na lista
            if(user.id == message.from) {
                console.log("User already on the list");
                newUserFlag = false
                userIndex = userList.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to the list");
            userList.push(new Object)
            userIndex = userList.length - 1
            userList[userIndex].id = message.from
            userList[userIndex].status = 'Qual login?'
            userList[userIndex].processStatus = 0
        }
        switch(userList[userIndex].status) {
            case "Qual login?":
                console.log("Switch on case: Qual login?")
                emfB.SendMessage(userId, "Certo, qual o seu login nesse sistema?",1000)
                userList[userIndex].status = "Aviso Processando"
                break;
            case "Aviso Processando":
                emfB.SendMessage(userId, "Seu pedido foi adicionado à fila, " + message.content)
                let userLogin = message.content
                userList[userIndex].status = "Start Job"
            case "Start Job":
                console.log("Switch on case: Start Job");

                //Orchestrator data Léo
                let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
                let orchUserKey = '2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi'
                let orchTenantLogicalName = 'MetaDefaultxi2r298584'
                let orchTenantURL = 'metaybbsotc/MetaDefault'
                let orchProcessName = 'SAP_DemoRobots'

                // //Orchestrator data Nicolas
                // let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
                // let orchUserKey = '8ZQ2vjK1vMnfqVD3HwLsJdp_xbovxwFOVlQmftjmkpE7r'
                // let orchTenantLogicalName = 'MetaInnovatj65c298574'
                // let orchTenantURL = 'metainnovationt/MetaInnovationTeamDefault'
                // let orchProcessName = 'Desafio.Blip.RPA'

                //Authentication request
                let axiosBody = {
                    grant_type: "refresh_token",
                    client_id: orchClientId,
                    refresh_token: orchUserKey
                };
                
                let axiosHeaders = {
                    headers: {
                        'Content-Type' : 'application/json',
                        'X-UIPATH-TenantName' : orchTenantLogicalName
                    }
                };
                
                //Request de autenticação
                axios.post('https://account.uipath.com/oauth/token', axiosBody, axiosHeaders)
                .then(function (response) {
                    console.log("Request successful")
                    let orchAccessToken = response.data.access_token;

                    let axiosGenericHeaders = {
                        headers: {
                            'Authorization' : "Bearer " + orchAccessToken,
                            'X-UIPATH-TenantName' : orchTenantLogicalName
                        }
                    }; 
                    console.log(orchProcessName)
                    //Get Releases Request
                    axios.get('https://platform.uipath.com/' + orchTenantURL +'/odata/Releases?$filter=%20Name%20eq%20%27' + orchProcessName + '%27', axiosGenericHeaders) //?$filter=Id%20eq%20' + orchProcessId
                    .then(function(response) {
                        console.log("Get Releases Request Successful")
                        console.log(response.data)
                        let orchProcessKey = response.data.value[0].Key

                        //Start Job Request
                        let axiosStartJobBody = {
                            startInfo: {
                                "ReleaseKey": orchProcessKey,
                                "Strategy": "All",
                                "RobotIds": [],
                                "NoOfRobots": 0,
                                "InputArguments": "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + userList[userIndex].processStatus + "\"}"
                                }
                        };
                        let axiosStartJobHeaders = {
                            headers: {
                                'Authorization' : "Bearer " + orchAccessToken,
                                'X-UIPATH-TenantName' : orchTenantLogicalName,
                                'Content-Type': 'application/json'
                            }
                        }; 
                        axios.post('https://platform.uipath.com/' + orchTenantURL + '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs', axiosStartJobBody, axiosStartJobHeaders)
                        .then(function(response){
                            console.log("Start Job Request Successful");
                            userList[userIndex].status = "Check Output";
                            console.log(response.data.value[0].Id);
                            let orchJobId = response.data.value[0].Id
                            
                            let flagProcessStarted = false
                            //Loop que confere se o rpa já finalizou seu processo
                            let delayOutput = setInterval(
                                async function getOutput() {
                                    const response = await axios.get('https://platform.uipath.com/' + orchTenantURL +'/odata/Jobs?$filter=Id%20eq%20' + orchJobId, axiosGenericHeaders)
                                    
                                    let orchJobInfo = response.data.value[0].Info
                                    orchJobInfo == null ? console.log("Job Info: Not Started") : console.log("Job Info: " + orchJobInfo)
                                    
                                    if(orchJobInfo == 'Job completed') {
                                        let orchOutputArgs = response.data.value[0].OutputArguments.split("\"")[3]
                                        if(orchOutputArgs == '2') {
                                            userList[userIndex].status = "Login Errado"
                                            console.log('Esse usuário não existe no sistema, deseja tentar novamente?')
                                            emfB.SendMessage(userId, 'Esse usuário não existe no sistema, deseja tentar novamente?')
                                        }
                                        else if(orchOutputArgs == '1') {
                                            userList[userIndex].status = "Sucesso"
                                            console.log("Senha trocada com sucesso")
                                            emfB.SendMessage(userId, "Senha trocada com sucesso")

                                            //Deletes user from the list
                                            userList.splice(userIndex, 1)
                                            indexModule.spliceUser(userId)
                                        }
                                        clearInterval(delayOutput)
                                    }
                                    else if(orchJobInfo == 'Job started processing' && flagProcessStarted == false) {
                                        emfB.SendMessage(userId, "Estou processando seu pedido")
                                        flagProcessStarted = true
                                    }
                                }
                                , 4000);
                        });
                        //End Start Job Request
                    })
                    .catch(function(error) {
                        console.log(error)
                    });
                    //End Get Releases Request
                });
                //End Auth Request
                break;
            case "Login Errado":
                console.log("Switch on Status: Login Errado");
                if(message.content.toLowerCase() == 'sim') {
                    userList[userIndex].status = "Aviso Processando"
                    userList[userIndex].processStatus = 1
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
        }
    }
}