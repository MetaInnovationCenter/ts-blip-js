const axios = require('axios')
const emfB = require('./emfB.js')
const color = require('chalk')

module.exports = {
    /**
     * Gets an access token and a process key to enable job starting and checking
     * @param {JSON} orchestratorInfo Orchestrator API access info
     * @param {String} processName Name of the process you want to get info from
     */
    getProcessInfo: async (orchestratorInfo, processName) => {
        return new Promise(async (resolve, reject) => {
            let processKey
            let accessToken
            //console.log(orch);

            //Authentication Body and Headers
            let axiosAuthBody = {
                grant_type: "refresh_token",
                client_id: orchestratorInfo.clientId,
                refresh_token: orchestratorInfo.userKey
            };
            let axiosAuthHeaders = {
                headers: {
                    'Content-Type' : 'application/json',
                    'X-UIPATH-TenantName' : orchestratorInfo.tenantLogicalName
                }
            };

            //Authentication Request
            await axios.post('https://account.uipath.com/oauth/token', axiosAuthBody, axiosAuthHeaders)
            .then(function (response) {
                console.log(color.green("Auth Sucessful"))
                accessToken = response.data.access_token;
            })
            .catch(function(err){
                console.log(color.red('Erro na autenticação:'))
                reject(error)
            });
            //End Auth Request

            let axiosGenericHeaders = {
                headers: {
                    'Authorization' : "Bearer " + accessToken,
                    'X-UIPATH-TenantName' : orchestratorInfo.tenantLogicalName
                }
            }; 

            //Get Releases Request
            await axios.get('https://platform.uipath.com/' + orchestratorInfo.tenantURL +'/odata/Releases?$filter=%20Name%20eq%20%27' + processName + '%27', axiosGenericHeaders) //?$filter=Id%20eq%20' + orch.ProcessId
            .then(function(response) {
                //console.log(response.data)
                processKey = response.data.value[0].Key
                console.log(color.green("Get Releases Request " + processName  + " Successful"))
            })
            .catch(function(error) {
                console.log(color.red('Erro em Get Releases:' + error))
                reject(error)
            });
            //End Get Releases Request

            resolve({
                processKey: processKey,
                accessToken: accessToken
            }) 
        })
    },
    /**
     * Adds a job with the given inputs to the orchestrator generic queue
     * @param {JSON} orchestratorInfo Orchestrator API access info
     * @param {String} userLogin SAP Login of user
     * @param {String} processStatus Process status for RPA handling
     * @param {String} userEmail User email for the RPA robot to send
     */
    startJob: async(orchestratorInfo, userLogin, processStatus, userEmail) => {
        return new Promise(async (resolve, reject) => {
            let jobId
            let inputArguments

            //No robô 1 isso faz o processo inteiro
            //No robô 2 isso faz o primeiro passo de conferir se o login existe
            if(processStatus == 'confere') {
                inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\"}"
                console.log("status: confere");
            }
            //No robô 1 esse status não existe
            //No robô 2 isso faz o segundo passo de realmente trocar a senha do usuário
            else if(processStatus == 'trocaSenha') {
                inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\", \"emailInput\":\"" + userEmail + "\"}"
                console.log("status : trocaSenha");
            }
            //status antigo, nenhum robô utiliza
            else if(processStatus == 'init') {
                inputArguments = "{\"login\":\"" + userLogin + "\", \"statusProcesso\":\"" + processStatus + "\"}"
                console.log("status: init");
            }

            let axiosStartJobBody = {
                startInfo: {
                    "ReleaseKey": orchestratorInfo.processKey,
                    "Strategy": "All",
                    "RobotIds": [],
                    "NoOfRobots": 0,
                    "InputArguments": inputArguments
                    }
            };

            let axiosStartJobHeaders = {
                headers: {
                    'Authorization' : "Bearer " + orchestratorInfo.accessToken,
                    'X-UIPATH-TenantName' : orchestratorInfo.tenantLogicalName,
                    'Content-Type': 'application/json'
                }
            }; 
            console.log('https://platform.uipath.com/' + orchestratorInfo.tenantURL + '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs')
            await axios.post('https://platform.uipath.com/' + orchestratorInfo.tenantURL + '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs', axiosStartJobBody, axiosStartJobHeaders)
            .then(function(response){
                console.log(color.green("Start Job Request Successful"));
                jobId = response.data.value[0].Id
                resolve(jobId)
            })
            .catch(err => {
                console.log(color.red('Erro em Start Job:'))
                reject(err)
            })
        })
    },
    /**
     * Deprecated function, dont use this one
     */
    getJobOutput: async(orchestratorInfo, jobId) => {
        let axiosGenericHeaders = {
            headers: {
                'Authorization' : "Bearer " + orchestratorInfo.accessToken,
                'X-UIPATH-TenantName' : orchestratorInfo.tenantLogicalName
            }
        }; 

        const response = await axios.get('https://platform.uipath.com/' 
                                            + orchestratorInfo.tenantURL 
                                            +'/odata/Jobs?$filter=Id%20eq%20' 
                                            + jobId, axiosGenericHeaders)
        return response.data.value[0]
        
        
    },
    /**
     * Returns a flag when the RPA robot starts processing
     * @param {JSON} orchestratorInfo Orchestrator API access info
     * @param {Number} jobId Id of orchestrator job started previously 
     */
    didProcessStart: async(orchestratorInfo, jobId) => {
        return new Promise((resolve, reject) => {
            let delayOutput = setInterval(
                async function getOutput() {
                    let axiosGenericHeaders = {
                        headers: {
                            'Authorization': "Bearer " + orchestratorInfo.accessToken,
                            'X-UIPATH-TenantName': orchestratorInfo.tenantLogicalName
                        }
                    }
                    const response = await axios.get('https://platform.uipath.com/'
                                                        + orchestratorInfo.tenantURL
                                                        + '/odata/Jobs?$filter=Id%20eq%20'
                                                        + jobId, axiosGenericHeaders)
    
                    if (response.data.value[0].Info == null) {
                        console.log("Job Info: Not Started")
                    }
                    else {
                        console.log("job started on maestro")
                        clearInterval(delayOutput)
                        resolve('Job Started')
                    }
                }
                , 1000);
        })
    },
    /**
     * Returns the RPA process output arguments when it finishes
     * @param {JSON} orchestratorInfo Orchestrator API access info
     * @param {Number} jobId Id of orchestrator job started previously 
     */
    didProcessFinish: async(orchestratorInfo, jobId) => {
        return new Promise((resolve, reject) => {
            let delayOutput = setInterval(
                async function getOutput() {
                    let axiosGenericHeaders = {
                        headers: {
                            'Authorization': "Bearer " + orchestratorInfo.accessToken,
                            'X-UIPATH-TenantName': orchestratorInfo.tenantLogicalName
                        }
                    }

                    const response = await axios.get('https://platform.uipath.com/'
                                                        + orchestratorInfo.tenantURL
                                                        + '/odata/Jobs?$filter=Id%20eq%20'
                                                        + jobId, axiosGenericHeaders)
                    
                    let jobInfo = response.data.value[0].Info
                   
                    if (jobInfo == 'Job completed' || jobInfo == 'Tarefa concluída') {
                        resolve(JSON.parse(response.data.value[0].OutputArguments))
                        
                    }
                    else if (jobInfo != 'Processamento de tarefa iniciado' && jobInfo != 'Job started running' &&
                             jobInfo != null) 
                    {
                         
                         reject('Faulted with: ' + jobInfo)
                    }
                    else {
               
                    }
                }
                , 1000);
        })
    }
}