var emf = require("./emf.js")
const axios = require('axios');

module.exports = {
    startHanaBot: (client, userId) => {
        let status = "Qual login?"
        client.addMessageReceiver(true, function(message) {
            if(message.content.state == undefined) {
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
                        status = "Processando"
                    case "Processando":
                        //Orchestrator data
                        let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
                        let orchUserKey = '2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi'
                        let orchProcessId = '67392'
                        let orchTenantLogicalName = 'MetaDefaultxi2r298584'
                        let orchTenantURL = 'metaybbsotc/MetaDefault'

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
                            let orchAccessToken = response.data.access_token;

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
                                let orchProcessKey = response.data.value[0].Key

                                //Start Job Request
                                let axiosStartJobBody = {
                                    startInfo: {
                                        "ReleaseKey": orchProcessKey,
                                        "Strategy": "All",
                                        "RobotIds": [],
                                        "NoOfRobots": 0,
                                        "InputArguments": "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"0\"}"
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
                                })
                                //End Start Job Request
                            });
                            //End Get Releases Request
                        });
                        //End Auth Request
                
                        status = "Sucesso"
                        break;
                    case "Sucesso":
                        console.log("Senha trocada com sucesso")
                        emf.SendMessage(userId, "Senha trocada com sucesso")
                            .then(function() {
                                client.close()
                                    .then(function() { console.log("Disconnection successfull") })
                                    .catch(function(err) { console.log("Disconnection failed") });
                            });
                        break;
                }
            }
        });
    }
}