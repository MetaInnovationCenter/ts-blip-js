var emf = require("./emf.js")
const axios = require('axios');
const indexModule = require('./index.js')
let processStatus = 0

module.exports = {
    startHanaBot: async (client, userId) => {
        let status = "Qual login?"
        client.addMessageReceiver((message) => message.type === 'text/plain', (message) => {
                switch(status) {
                    case "Qual login?":
                        console.log("Switch on case: Qual login?")
                        emf.SendMessage(userId, "Certo, qual o seu login nesse sistema?",1000)
                        status = "Aviso Processando"
                        console.log(status);
                        break;
                    case "Aviso Processando":
                        emf.SendMessage(userId, "Estou processando seu pedido, " + message.content)
                        let userLogin = message.content
                        status = "Start Job"
                    case "Start Job":
                        console.log("Switch on case: Start Job");
                        //Orchestrator data
                        let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
                        let orchUserKey = '2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi'
                        let orchProcessId = '67392'
                        let orchTenantLogicalName = 'MetaDefaultxi2r298584'
                        let orchTenantURL = 'metaybbsotc/MetaDefault'
                        let orchJobId
                        let orchProcessKey
                        let orchAccessToken
                        let orchOutputArgs

                        

                        //Authentication request
                        let axiosBody = {
                            grant_type: "refresh_token",
                            client_id: "8DEv1AMNXczW3y4U15LL3jYf62jK93n5",
                            refresh_token: "2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi"
                        };
                        
                        let axiosHeaders = {
                            headers: {
                                'Content-Type' : 'application/json',
                                'X-UIPATH-TenantName' : 'MetaDefaultxi2r298584'
                            }
                        };
                        
                        axios.post('https://account.uipath.com/oauth/token', axiosBody, axiosHeaders)
                        .then(function (response) {
                            //console.log(response.data.scope);
                            console.log("Request successful")
                            orchAccessToken = response.data.access_token;

                            let axiosGenericHeaders = {
                                headers: {
                                    'Authorization' : "Bearer " + orchAccessToken,
                                    'X-UIPATH-TenantName' : orchTenantLogicalName
                                }
                            }; 
                            
                            //Get Releases Request
                            axios.get('https://platform.uipath.com/' + orchTenantURL +'/odata/Releases?$filter=Id%20eq%20' + orchProcessId, axiosGenericHeaders)
                            .then(function(response) {
                                console.log("Get Releases Request Successful")
                                console.log("" + response.data.value[0].Key)
                                orchProcessKey = response.data.value[0].Key

                                //Start Job Request
                                let axiosStartJobBody = {
                                    startInfo: {
                                        "ReleaseKey": orchProcessKey,
                                        "Strategy": "All",
                                        "RobotIds": [],
                                        "NoOfRobots": 0,
                                        "InputArguments": "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\"}"
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
                                    status = "Check Output";
                                    console.log(response.data.value[0].Id);
                                    orchJobId = response.data.value[0].Id
                                    
                                    let delayOutput = setInterval(
                                        async function getOutput() {
                                            const response = await axios.get('https://platform.uipath.com/' + orchTenantURL +'/odata/Jobs?$filter=Id%20eq%20' + orchJobId, axiosGenericHeaders)
                                            
                                            let orchJobInfo = response.data.value[0].Info
                                            orchJobInfo == null ? console.log("Job Info: Not Started") : console.log("Job Info: " + orchJobInfo)
                                            
                                            if(orchJobInfo == 'Job completed') {
                                                orchOutputArgs = response.data.value[0].OutputArguments.split("\"")[3]
                                                if(orchOutputArgs == '2') {
                                                    status = "Login Errado"
                                                    console.log('Esse usuário não existe no sistema, deseja tentar novamente?')
                                                    emf.SendMessage(userId, 'Esse usuário não existe no sistema, deseja tentar novamente?')
                                                }
                                                else if(orchOutputArgs == '1') {
                                                    status = "Sucesso"
                                                    console.log("Senha trocada com sucesso")
                                                    emf.SendMessage(userId, "Senha trocada com sucesso")
                                                    indexModule.setIndexStatus('Boas Vindas')
                                                }
                                                clearInterval(delayOutput)
                                            }
                                            //console.log(orchOutputArgs);
                                            //console.log('Status login: ' + orchOutputArgs);
                                        }
                                        , 4000);

                                });
                                //End Start Job Request
                            });
                            //End Get Releases Request
                        });
                        //End Auth Request
                        break;
                    case "Login Errado":
                        console.log("Switch on Status: Login Errado");
                        if(message.content.toLowerCase() == 'sim') {
                            status = "Aviso Processando"
                            processStatus = 1
                            emf.SendMessage(userId, "Certo, qual o seu login nesse sistema?",1000)
                        }
                        else if(message.content.toLowerCase() == 'nao' ||
                                message.content.toLowerCase() == 'não') {
                                emf.SendMessage(userId ,"Certo, te vejo na próxima então")
                                indexModule.setIndexStatus('Boas Vindas')
                        }
                        break;
                }
                console.log("out of switch");
            
            
        });
        console.log("escapei")
    }
}