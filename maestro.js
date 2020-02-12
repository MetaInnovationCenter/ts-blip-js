const axios = require('axios')
const emfB = require('./emfB.js')

// //Orchestrator data Léo
// let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
// let orchUserKey = '2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi'
// let orchTenantLogicalName = 'MetaDefaultxi2r298584'
// let orchTenantURL = 'metaybbsotc/MetaDefault'

//Orchestrator data Mak
let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
let orchUserKey = 'Z8VQl1PmNDYT5fJkFpYjDLE1c1rdZffhjFN2yBxr0MkI4'
let orchTenantLogicalName = 'MetaDefaultaldz298583'
let orchTenantURL = 'metayofvcgb/MetaDefault'

// //Orchestrator data Nicolas
// let orchClientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
// let orchUserKey = '8ZQ2vjK1vMnfqVD3HwLsJdp_xbovxwFOVlQmftjmkpE7r'
// let orchTenantLogicalName = 'MetaInnovatj65c298574'
// let orchTenantURL = 'metainnovationt/MetaInnovationTeamDefault'
// let orchProcessName = 'Desafio.Blip.RPA'

module.exports = {
    getProcessInfo: async (orchProcessName) => {
        let orchProcessKey
        let orchAccessToken

        //Authentication Body and Headers
        let axiosAuthBody = {
            grant_type: "refresh_token",
            client_id: orchClientId,
            refresh_token: orchUserKey
        };
        let axiosAuthHeaders = {
            headers: {
                'Content-Type' : 'application/json',
                'X-UIPATH-TenantName' : orchTenantLogicalName
            }
        };

        //Authentication Request
        await axios.post('https://account.uipath.com/oauth/token', axiosAuthBody, axiosAuthHeaders)
        .then(function (response) {
            console.log(emfB.Color('verde') + "Auth Sucessful" + emfB.Color('reset'))
            orchAccessToken = response.data.access_token;
        })
        .catch(function(err){
            console.log(emfB.Color('vermelho') + 'Erro na autenticação:' + err)
        });
        //End Auth Request

        let axiosGenericHeaders = {
            headers: {
                'Authorization' : "Bearer " + orchAccessToken,
                'X-UIPATH-TenantName' : orchTenantLogicalName
            }
        }; 

        //Get Releases Request
        await axios.get('https://platform.uipath.com/' + orchTenantURL +'/odata/Releases?$filter=%20Name%20eq%20%27' + orchProcessName + '%27', axiosGenericHeaders) //?$filter=Id%20eq%20' + orchProcessId
        .then(function(response) {
            console.log(emfB.Color('verde') + "Get Releases Request Successful" + emfB.Color('reset'))
            //console.log(response.data)
            orchProcessKey = response.data.value[0].Key
        })
        .catch(function(error) {
            console.log(emfB.Color('vermelho') + 'Erro em Get Releases:' + error + emfB.Color('reset'))
        });
        //End Get Releases Request

        return {
            processKey: orchProcessKey,
            accessToken: orchAccessToken
        }
    },
    startJob: async(orchProcessKey, orchAccessToken, userLogin, processStatus, userEmail) => {
        //Start Job Request
        let orchJobId
        let inputArguments

        if(processStatus == 'confere') {
            inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\"}"
            console.log("status: confere");
        }
        else if(processStatus == 'trocaSenha') {
            inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\", \"emailInput\":\"" + userEmail + "\"}"
            console.log("status : trocaSenha");
        }

        let axiosStartJobBody = {
            startInfo: {
                "ReleaseKey": orchProcessKey,
                "Strategy": "All",
                "RobotIds": [],
                "NoOfRobots": 0,
                "InputArguments": inputArguments
                }
        };

        let axiosStartJobHeaders = {
            headers: {
                'Authorization' : "Bearer " + orchAccessToken,
                'X-UIPATH-TenantName' : orchTenantLogicalName,
                'Content-Type': 'application/json'
            }
        }; 
        await axios.post('https://platform.uipath.com/' + orchTenantURL + '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs', axiosStartJobBody, axiosStartJobHeaders)
        .then(function(response){
            console.log("Start Job Request Successful");
            orchJobId = response.data.value[0].Id
        })
        .catch(err => {
            console.log(emfB.Color('vermelho') + 'Erro em Start Job:' + err)
        })
        return orchJobId
        //End Start Job Request
    },
    getJobOutput: async(orchJobId, orchAccessToken) => {
        let axiosGenericHeaders = {
            headers: {
                'Authorization' : "Bearer " + orchAccessToken,
                'X-UIPATH-TenantName' : orchTenantLogicalName
            }
        }; 

        const response = await axios.get('https://platform.uipath.com/' 
                                            + orchTenantURL 
                                            +'/odata/Jobs?$filter=Id%20eq%20' 
                                            + orchJobId, axiosGenericHeaders)
        return response.data.value[0]
        
        
    }
}