const AssistantV2 = require('ibm-watson/assistant/v2');
const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const emfb = require('./emfB.js')

let assistant1
let assistant2

let IdAssistant

let PrintError = (e) => {

    console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
    console.log(emfb.Color("vermelho")+"  Erro:", emfb.Color("negrito")+e+emfb.Color("reset"))
    console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))

}

let GetIntent = async (sID, intent) => {

    let r

    const params = {
        workspaceId: sID,
        intent: intent,
        _export: true
    };
      
    await assistant1.getIntent(params)
        .then(res => {
          r = res.result;
        })
        .catch(err => {
          r = err
        });

    return r

}

let GetEntity = async (sID, entity) => {

    let r
    
    const params = {
        workspaceId: sID,
        entity: entity,
        _export: true
    };
      
    assistant1.getEntity(params)
        .then(res => {
          r = res.result
        })
        .catch(err => {
          r = err
        });

    return r

}

module.exports = {

    /** 
     * Conecta com o IBM Watson Assistant. (deve ser usado antes do uso dos outros metodos)
     * 
     * Retorna true quando tudo certo, false quando não
     * 
     * @param {String} apikey - A ApiKey do Watson
     * @param {String} url - A Url do Watson
     * @param {String} url - O Id o Assistente
    */
    SetWatson: (apikey, url, assistantId) => {

        try {

            assistant1 = new AssistantV1({
                version: '2019-02-28',
                authenticator: new IamAuthenticator({
                apikey: apikey,
                }),
                url: url,
            });

            assistant2 = new AssistantV2({
                version: '2019-02-28',
                authenticator: new IamAuthenticator({
                apikey: apikey,
                }),
                url: url,
            });

            IdAssistant = assistantId

            console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
            console.log(emfb.Color("amarelo")+"  Info:"+emfb.Color("reset"), emfb.Color("negrito"), "Watson Assistent Conectado", emfb.Color("reset"))
            console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))

            return true

        }
        catch (e) {

            PrintError(e)
            
            return false

        }

    },

    /**
     * Define a Sessão dentro do Watson (Deve ser usado DEPOIS de SetWatson e ANTES dos outros metodos)
     * 
     * DEVE ser executado com await
     * 
     * Retorna o Id da sessão do Watson (Ela é unica para cada pessoa)
    */
    GetSessao: async () => {

        let r

        await assistant2.createSession({
            assistantId: IdAssistant
        })
        .then(res => {
            r = res.result.session_id;
        })
        .catch(err => {
            r = err;
        });

        return r

    },

    /**
     * Pega a resposta do Watson com base na fala do usuario
     * DEVE ser executado com await
     * Retorna a resposta do Watson 
     * 
     * @param {String} input - fala do usuario
     * @param {String} sessao - sessão do usuario
    */
    GetMessagem: async (input, sessao) => {

        let r

        await assistant2.message({
            assistantId: IdAssistant,
            sessionId: sessao,
            input: {
              'message_type': 'text',
              'text': input
              }
            })
            .then(res => {
                r = res.result.output.generic[0].text;
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Input do Usuario:"+emfb.Color("reset"), emfb.Color("negrito"), input, emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Resposta para Usuario:"+emfb.Color("reset"), emfb.Color("negrito"), r, emfb.Color("reset"))
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))    
            })
            .catch(err => {
              r = err;
              PrintError(r)
            });

        return r

    },

    /**
     * Lista as Skills do Watson
     * 
     * DEVE ser usado com await
     * 
     * Returna um Objeto com as os nomes das skills e os ids:
     * 
     * Exemplo:
     * {
     *      Skills: [ 'My first skill', 'Skill' ],
     *      Ids: ['a368b41e-157a-4047-a46d-b1be9a11cb05','fe2ef82b-ed66-4a86-9584-507a81c0d5bb']
     *  }
    */
    ListIdSkills: async () => {

        let r = {Skills: [], Ids: []}

        await assistant1.listWorkspaces()
        .then(res => {

            res.result.workspaces.forEach((v, i) => {

                r.Skills.push(v.name)
                r.Ids.push(v.workspace_id)

            });

        })
        .catch(err => {
            console.log(err)
        });

        return r

    },

    /** 
     * Cria uma nova intenção dentro do Watson
     * 
     * DEVE ser executado com await
     * 
     * Retorna True quando da certo, False quando da erro
     * 
     * @param {String} sID - Id da Skill
     * @param {String} intent - Nome da nova intenção
     * @param {Array<String>} exemplos - Exemplos de palavras e/ou frazes que remetem a esse intenção
    */
    AddIntent: async (sID, intent, exemplos) => {

        let params = {
            workspaceId: sID,
            intent: intent,
            examples: []
        };
        
        for (e in exemplos) {

            let o = {text : exemplos[e]}

            params.examples.push(o)

        }

        await assistant1.createIntent(params)
            .then(res => {
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Sucesso:"+emfb.Color("reset"), emfb.Color("negrito"), "Intenção", emfb.Color("amarelo"), intent, emfb.Color("reset"), emfb.Color("negrito")+"criada com sucesso", emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Exemplos:"+emfb.Color("reset"), emfb.Color("negrito"), exemplos, emfb.Color("reset"))
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))    
                return true
            })
            .catch(err => {
                PrintError(err)
                return false
            });

    },

    /** 
     * Cria uma nova entidade dentro do Watson
     * 
     * DEVE ser executado com await
     * 
     * Retorna True quando da certo, False quando da erro
     * 
     * @param {String} sID - Id da Skill
     * @param {String} entity - Nome da nova entidade
     * @param {Array<String>} valores - sinonimos dessa entidade
    */
    AddEntity: async (sID, entity, valores) => {

        let params = {
            workspaceId: sID,
            entity: entity,
            values: []
        };
          
        for (v in valores) {

            let o = { value : valores[v] }

            params.values.push(o)

        } 

        await assistant1.createEntity(params)
            .then(res => {
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Sucesso:"+emfb.Color("reset"), emfb.Color("negrito"), "Entidade", emfb.Color("amarelo"), entity, emfb.Color("reset"), emfb.Color("negrito")+"criada com sucesso", emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Valores:"+emfb.Color("reset"), emfb.Color("negrito"), valores, emfb.Color("reset"))
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))    
                return true
            })
            .catch(err => {
              PrintError(err)
              return false
            });

    },

    /**
     * Pega a intenção expecificada da skill
     * 
     * DEVE ser executado com await
     * 
     * Retorna a intenção (nome e exemplos)
     * 
     * @param {String} wID - ID da Skill 
     * @param {String} intent - Nome da Intenção
    */
    GetIntent: async (wID, intent) => {return await GetIntent(wID, intent)},

    /**
     * Adciona um ou mais novo(s) exemplo(s) para a intenção
     * 
     * DEVE ser executado com await
     * 
     * Retorna True quando da certo, False quando não
     * 
     * @param {String} sID - ID da Skill
     * @param {String} intent - Nome da Intenção
     * @param {Array<String>} exemplos - Novo(s) exemplo(s) da intenção
    */
    AddExempleIntent: async (sID, intent, exemplos) => {

        let r

        let params = {
            workspaceId: sID,
            intent: intent,
            newExamples: [],
        };
          
        list = await GetIntent(sID, intent)

        ex = list.examples

        for (e in ex) {

            exemplos.push(ex[e].text)

        }

        for (e in exemplos) {

            let o = {text : exemplos[e]}

            params.newExamples.push(o)

        }

        await assistant1.updateIntent(params)
            .then(res => {
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Sucesso:"+emfb.Color("reset"), emfb.Color("negrito"), "Intenção", emfb.Color("amarelo"), intent, emfb.Color("reset"), emfb.Color("negrito")+"modificada com sucesso", emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Exemplos:"+emfb.Color("reset"), emfb.Color("negrito"), exemplos, emfb.Color("reset"))
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                r = true    
            })
            .catch(err => {
              PrintError(err)
              r = false
            });

        return r

    },

    /**
     * Pega a entidade da Skill
     * 
     * DEVE ser executado com await
     * 
     * Retorna a entidade expecificada (nome e sinonimos)
     * 
     * @param {String} wID - ID da Skill 
     * @param {String} entity - Nome da Entidade
    */
    GetEntity: async (wID, entity) => {return await GetEntity(wID, entity)},

    /** 
     * Adiciona um ou mais novo(s) sinonimo(s) para a entidade
     * 
     * DEVE ser excutado com await
     * 
     * Retorna True quando da certo, False quando não
     * 
     * @param {String} wID - ID da Skill
     * @param {String} entity - Nome da Entidade
     * @param {Array<String>} valores - Novo(s) sinonimo(s) da entidade 
    */
    AddSynonymusEntity: async (wID, entity, valores) => {

        let r

        const params = {
            workspaceId: wID,
            entity: entity,
            newValues: [],
        };
          
        list = GetEntity(wID, entity)

        vl = list.values

        for (v in vl) {

            valores.push(vl[v].text)

        }

        for (e in valores) {

            let o = {text : valores[e]}

            params.newValues.push(o)

        }

        await assistant1.updateEntity(params)
            .then(res => {
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Sucesso:"+emfb.Color("reset"), emfb.Color("negrito"), "Entidade", emfb.Color("amarelo"), entity, emfb.Color("reset"), emfb.Color("negrito")+"modificada com sucesso", emfb.Color("reset"))
                console.log(emfb.Color("amarelo")+"  Sinonimos:"+emfb.Color("reset"), emfb.Color("negrito"), valores, emfb.Color("reset"))
                console.log(emfb.Color("azul")+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS WATSON«««««««««««««««««««"+emfb.Color("reset"))
                r = true  
            })
            .catch(err => {
                PrintError(err)
                r = false
            });

        return r

    },

    /**
     * Remove uma entidade da Skill
     * 
     * DEVE ser excutado com await
     * 
    */
    RemoveIntent: async () => {



    },

    /**
     * 
    */
    RemoveEntity: () => {



    },

    /**
     * 
    */
    RemoveExempleIntent: () => {



    },

    /**
     * 
    */
    RemoveSynonymusEntity: () => {



    },

}