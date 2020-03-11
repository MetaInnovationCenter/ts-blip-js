axios = require('axios')

debugFunction = async () => {
  let access_token
  console.log('entered get jobs');
  //Info do orchestrator do server maçã
  orchestratorInfo = {
      clientId: '8DEv1AMNXczW3y4U15LL3jYf62jK93n5',
      userKey: '67sFvQ61tTh8MQQg59rEef2Bcgcw-Lsef2XU4IMwJLhdM',
      tenantLogicalName: 'InovTeamDefszqw301979',
      tenantURL: 'inovteam/InovCenter'
  }

  //Authentication Body and Headers
  let axiosAuthBody = {
      grant_type: "refresh_token",
      client_id: orchestratorInfo.clientId,
      refresh_token: orchestratorInfo.userKey
  };
  let axiosAuthHeaders = {
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type' : 'application/json',
          'X-UIPATH-TenantName' : orchestratorInfo.tenantLogicalName
      }
  };

  console.log('Auth Request Started');
  //Authentication Request
  await axios.post('https://account.uipath.com/oauth/token', axiosAuthBody, axiosAuthHeaders)
  .then(function (response) {
      console.log("Auth Sucessful")
      accessToken = response.data.access_token;
  })
  .catch(function(err){
      console.log('Erro na autenticação:')
      console.log(error);
  });
  //End Auth Request

  let axiosGenericHeaders = {
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Authorization' : "Bearer " + accessToken,
          'X-UIPATH-TenantName' : orchestratorInfo.tenantLogicalName
      }
  }; 

  console.log('Get Jobs Request Started');
  //Get Releases Request
  await axios.get('https://platform.uipath.com/inovteam/InovCenter/odata/Jobs', axiosGenericHeaders)
  .then(function(response) {
      //console.log(response.data)
      console.log('Total: ' + response.data['@odata.count'])
  })
  .catch(function(error) {
      console.log('Erro em Get Jobs:' + error)
      console.log(error);
  });

  //Get Sucessful jobs
  await axios.get('https://platform.uipath.com/inovteam/InovCenter/odata/Jobs?$filter=State%20eq%20%27Successful%27', axiosGenericHeaders)
  .then(function(response) {
      //console.log(response.data)
      console.log('Sucessful: ' + response.data['@odata.count'])
  })
  .catch(function(error) {
      console.log('Erro em Get Jobs:' + error)
      console.log(error)
  });

   //Get Faulted jobs
   await axios.get('https://platform.uipath.com/inovteam/InovCenter/odata/Jobs?$filter=State%20eq%20%27Faulted%27', axiosGenericHeaders)
   .then(function(response) {
       //console.log(response.data)
       console.log('Faulted: ' + response.data['@odata.count'])
   })
   .catch(function(error) {
       console.log('Erro em Get Jobs:' + error)
       console.log(error);
   });

  //End Get Releases Request
}

debugFunction()
