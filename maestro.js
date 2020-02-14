const axios = require('axios')
const emfB = require('./emfB.js')

// //Orchestrator data Léo
// let orch.clientID = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
// let orch.userKey = '2YnYIsSRY4TXSVxKXjHIdR8Wsv9CIN6ChP4fb4SfgTYdi'
// let orch.tenantLogicalName = 'MetaDefaultxi2r298584'
// let orch.tenantURL = 'metaybbsotc/MetaDefault'

// //Orchestrator data Mak
// let orchclientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
// let orchuserKey = 'Z8VQl1PmNDYT5fJkFpYjDLE1c1rdZffhjFN2yBxr0MkI4'
// let orchtenantLogicalName = 'MetaDefaultaldz298583'
// let orchTenantURL = 'metayofvcgb/MetaDefault'

// //Orchestrator data Nicolas
// let orchclientId = '8DEv1AMNXczW3y4U15LL3jYf62jK93n5'
// let orchuserKey = '8ZQ2vjK1vMnfqVD3HwLsJdp_xbovxwFOVlQmftjmkpE7r'
// let orchtenantLogicalName = 'MetaInnovatj65c298574'
// let orchTenantURL = 'metainnovationt/MetaInnovationTeamDefault'
// let orchProcessName = 'Desafio.Blip.RPA'

module.exports = {
    getProcessInfo: async (orch, processName) => {
        let processKey
        let accessToken
        //console.log(orch);

        //Authentication Body and Headers
        let axiosAuthBody = {
            grant_type: "refresh_token",
            client_id: orch.clientId,
            refresh_token: orch.userKey
        };
        let axiosAuthHeaders = {
            headers: {
                'Content-Type' : 'application/json',
                'X-UIPATH-TenantName' : orch.tenantLogicalName
            }
        };

        //Authentication Request
        await axios.post('https://account.uipath.com/oauth/token', axiosAuthBody, axiosAuthHeaders)
        .then(function (response) {
            console.log(emfB.Color('verde') + "Auth Sucessful" + emfB.Color('reset'))
            accessToken = response.data.access_token;
        })
        .catch(function(err){
            console.log(emfB.Color('vermelho') + 'Erro na autenticação:' + err)
        });
        //End Auth Request

        let axiosGenericHeaders = {
            headers: {
                'Authorization' : "Bearer " + accessToken,
                'X-UIPATH-TenantName' : orch.tenantLogicalName
            }
        }; 

        //Get Releases Request
        await axios.get('https://platform.uipath.com/' + orch.tenantURL +'/odata/Releases?$filter=%20Name%20eq%20%27' + processName + '%27', axiosGenericHeaders) //?$filter=Id%20eq%20' + orch.ProcessId
        .then(function(response) {
            //console.log(response.data)
            processKey = response.data.value[0].Key
            console.log(emfB.Color('verde') + "Get Releases Request " + processName  + " Successful" + emfB.Color('reset'))
        })
        .catch(function(error) {
            console.log(emfB.Color('vermelho') + 'Erro em Get Releases:' + error + emfB.Color('reset'))
        });
        //End Get Releases Request

        return {
            processKey: processKey,
            accessToken: accessToken
        }
    },
    startJob: async(orch, userLogin, processStatus, userEmail) => {
        //Start Job Request
        let jobId
        let inputArguments
        //console.log(orch)

        if(processStatus == 'confere') {
            inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\"}"
            console.log("status: confere");
        }
        else if(processStatus == 'trocaSenha') {
            inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\", \"emailInput\":\"" + userEmail + "\"}"
            console.log("status : trocaSenha");
        }
        else if(processStatus == 'init') {
            inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\"}"
            console.log("status: init");
        }

        let axiosStartJobBody = {
            startInfo: {
                "ReleaseKey": orch.processKey,
                "Strategy": "All",
                "RobotIds": [],
                "NoOfRobots": 0,
                "InputArguments": inputArguments
                }
        };

        let axiosStartJobHeaders = {
            headers: {
                'Authorization' : "Bearer " + orch.accessToken,
                'X-UIPATH-TenantName' : orch.tenantLogicalName,
                'Content-Type': 'application/json'
            }
        }; 
        console.log('https://platform.uipath.com/' + orch.tenantURL + '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs')
        await axios.post('https://platform.uipath.com/' + orch.tenantURL + '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs', axiosStartJobBody, axiosStartJobHeaders)
        .then(function(response){
            console.log("Start Job Request Successful");
            jobId = response.data.value[0].Id
        })
        .catch(err => {
            console.log(emfB.Color('vermelho') + 'Erro em Start Job:' + err + emfB.Color('reset'))
            return err
        })
        return jobId
        //End Start Job Request
    },
    getJobOutput: async(orch, jobId) => {
        let axiosGenericHeaders = {
            headers: {
                'Authorization' : "Bearer " + orch.accessToken,
                'X-UIPATH-TenantName' : orch.tenantLogicalName
            }
        }; 

        const response = await axios.get('https://platform.uipath.com/' 
                                            + orch.tenantURL 
                                            +'/odata/Jobs?$filter=Id%20eq%20' 
                                            + jobId, axiosGenericHeaders)
        return response.data.value[0]
        
        
    }
}