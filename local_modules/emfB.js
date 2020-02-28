let Client

let sleep = (milliseconds) => {

    const date = Date.now();
    let currentDate = null;

    do {
      currentDate = Date.now();
    } 
    while (currentDate - date < milliseconds);

}

let SendDg = (dg, user) => {

    return new Promise(async (resolve) => { 
        
        await Client.sendMessage({ 
                    
            type: "application/vnd.lime.chatstate+json",
            to: user,
            content: {"state": "composing"},

        })

        setTimeout(() => {resolve("Digitando terminado")}, dg)

    })

}

let Reset = "\x1b[0m"
let Bright = "\x1b[1m"
let Dim = "\x1b[2m"
let Underscore = "\x1b[4m"
let Blink = "\x1b[5m"
let Reverse = "\x1b[7m"
let Hidden = "\x1b[8m"

let FgBlack = "\x1b[30m"
let FgRed = "\x1b[31m"
let FgGreen = "\x1b[32m"
let FgYellow = "\x1b[33m"
let FgBlue = "\x1b[34m"
let FgMagenta = "\x1b[35m"
let FgCyan = "\x1b[36m"
let FgWhite = "\x1b[37m"

let BgBlack = "\x1b[40m"
let BgRed = "\x1b[41m"
let BgGreen = "\x1b[42m"
let BgYellow = "\x1b[43m"
let BgBlue = "\x1b[44m"
let BgMagenta = "\x1b[45m"
let BgCyan = "\x1b[46m"
let BgWhite = "\x1b[47m"

module.exports = {

    /** 
     * Define o client para a lib (deve ser usado antes do uso dos outros metodos).
     * @param {String} client - Client (bot do blip)
    */
    SetClient: (client) => {

        return new Promise(async (resolve) => {

            Client = client

            console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««««"+Reset)
            console.log(FgYellow+"  Info:"+Reset, Bright, "Client Definido", Reset)
            console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««««"+Reset)

            resolve("Cliente (Bot) definido com sucesso")

        })

    },

    /** 
     * Dorme o codigo por algum tempo.
     * @param {Number} milliseconds - Tempo de Dormida (em ms)
    */
    sleep: (milliseconds) => {

        const date = Date.now();
        let currentDate = null;
    
        do {
          currentDate = Date.now();
        } 
        while (currentDate - date < milliseconds);

        return true
    
    },    

    /** 
     * Manda uma mensagem.
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} msg - Mensagen ("" -> sem mensagem, só aparece a foto do bot)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendMessage: (user, msg, dg) => {

        return new Promise(async (resolve, reject) => {

            try{

                if (dg > 0) { 

                    await SendDg(dg, user)
                        
                    Client.sendMessage({ 
                                
                        type: "text/plain", 
                        to: user,
                        content: msg
                            
                    })

                }
                else {

                    Client.sendMessage({ 
                        
                        type: "text/plain", 
                        to: user,
                        content: msg, 
                    
                    })

                }

                if (dg == undefined) {dg = 0}

                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««««"+Reset)
                console.log(FgYellow+"  Mensagem:"+Reset, Bright+msg+Reset)
                console.log(FgYellow+"  Enviada para:"+Reset, Bright+user+Reset)
                console.log(FgYellow+"  Digitando de:"+Reset, Bright+dg, "ms"+Reset)
                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««««"+Reset)

                resolve(true)

            }
            catch (e) {

                reject(false)

            }

        })

    },

    /** 
     * Manda uma mensagem com opções (quick reply) (min 1, max ∞).
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} msg - Mensagen que fica acima das opções ("" -> sem mensagem, mas fica horrível)
     * @param {Array<String>} ops - Opções ("" -> opção sem mensagem, fica horrível)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendOptions: (user, msg, ops, dg) => {

        return new Promise(async (resolve, reject) => {
                
            try {

                if (ops.length < 1 || ops.length == undefined) {

                    console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                    console.log(FgRed+Bright+"  Onde:"+Reset, FgRed+"SendOptions("+user+","+msg+",["+ops+"],"+dg+")"+Reset)
                    console.log(FgRed+Bright+"  Erro:"+Reset, FgRed+"Numero de opções < 1"+Reset)
                    console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)  

                    resolve(false)
                    throw new Error("Numero de opções < 1")

                }

                if (dg > 0) {
                    await SendDg(dg, user)
                }

                let obj = {
                    type: "application/vnd.lime.select+json",
                    to: user,
                    content: {
                        scope:"immediate",
                        text: msg,
                        options: []
                    }
                }

                for (i in ops) {

                    obj.content.options.push({text: ops[i]})

                }

                Client.sendMessage(obj)

                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                console.log(FgYellow+"  Mensagem:"+Reset, Bright+msg+Reset)
                console.log(FgYellow+"  Opções:"+Reset, Bright+ops+Reset)
                console.log(FgYellow+"  Enviada para:"+Reset, Bright+user+Reset)
                console.log(FgYellow+"  Digitando de:"+Reset, Bright+dg, "ms"+Reset)
                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)

                resolve(true)

            }
            catch (e) {
                reject(false)
            }

        })
    },

    /** 
     * Manda multiplas mensagens (min 2, max ∞).
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {Array<String>} msgs - Mensagens 
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendMul: (user, msgs, dg) => {

        return new Promise(async (resolve, reject) => {

            try {

                console.log(msgs.length)

                if (msgs.length < 2 || msgs.length == undefined) {

                    console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                    console.log(FgRed+Bright+"  Onde:"+Reset, FgRed+"SendMul("+user+",["+msgs+"],"+dg+")"+Reset)
                    console.log(FgRed+Bright+"  Erro:"+Reset, FgRed+"Numero de mensagens < 2"+Reset)
                    console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)    

                    resolve(false)
                    throw new Error("Numero de mensagens < 2")

                }

                let o = {
                    type: "application/vnd.lime.collection+json",
                    to: user,
                    content: {
                        itemType: "text/plain",
                        items: []
                    }
                }

                for (i in msgs) {

                    o.content.items.push(msgs[i])

                }

                if (dg > 0) {
                    await SendDg(dg, user)
                }

                Client.sendMessage(o)

                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                console.log(FgYellow+"  Mensagens:"+Reset, Bright+msgs+Reset)
                console.log(FgYellow+"  Enviadas para:"+Reset, Bright+user+Reset)
                console.log(FgYellow+"  Digitando de:"+Reset, Bright+dg, "ms"+Reset)
                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)    

                resolve(true)

            }
            catch (e) {
                reject(false)
            }

        })
    },

    /** 
     * Manda uma mensagem com 1 imagem.
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - "Id do Usuario"
     * @param {String} msg - "Mensagen que fica embaixo da imagem" // ("" -> sem mensagem)
     * @param {String} img - "Link da imagem.png"
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendImg: (user, msg, img, dg) => {

        return new Promise(async (resolve, reject) => {

            try {
                if (dg > 0) {
                    await SendDg(dg, user)
                }
                Client.sendMessage({
                    type: "application/vnd.lime.media-link+json",
                    to: user,
                    content: {
                        text: msg,
                        type: "image/jpeg",
                        uri: img
                    }
                });

                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                console.log(FgYellow+"  Imagem:"+Reset, Bright+img+Reset)
                console.log(FgYellow+"  Mensagem:"+Reset, Bright+msg+Reset)
                console.log(FgYellow+"  Enviada para:"+Reset, Bright+user+Reset)
                console.log(FgYellow+"  Digitando de:"+Reset, Bright+dg, "ms"+Reset)
                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)    

                resolve(true)

            }
            catch (e) {
                reject(false)
            }

        })
    },

    /** 
     * Manda uma mensagem com 1 video.
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} img - Link do video (com .mp4)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendVideo: (user, vdo, dg) => {

        return new Promise(async (resolve, reject) => {

            try {
                if (dg > 0) {
                    await SendDg(dg, user)
                }
                Client.sendMessage({
                    type: "application/vnd.lime.media-link+json",
                    to: user,
                    content: {
                    type: "video/mp4",
                    uri: vdo,
                    }
                });

                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                console.log(FgYellow+"  Video:"+Reset, Bright+vdo+Reset)
                console.log(FgYellow+"  Enviada para:"+Reset, Bright+user+Reset)
                console.log(FgYellow+"  Digitando de:"+Reset, Bright+dg, "ms"+Reset)
                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset) 

                resolve(true)
            }
            catch (e) {
                reject(false)
            }

        })
    },

    /**
     * Manda uma mensagem com opções (persistente) (min 1, max ∞).
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} msg - Mensagen que fica acima das opções ("" -> sem mensagem, mas fica horrível)
     * @param {Array<String>} ops - Opções ("" -> opção sem mensagem, fica horrível)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendMenu: (user, msg, ops, dg) => {

        return new Promise(async (resolve, reject) => {
                
            try {

                if (ops.length < 1 || ops.length == undefined) {

                    console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                    console.log(FgRed+Bright+"  Onde:"+Reset, FgRed+"SendMenu("+user+","+msg+",["+ops+"],"+dg+")"+Reset)
                    console.log(FgRed+Bright+"  Erro:"+Reset, FgRed+"Numero de opções < 1"+Reset)
                    console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)  

                    resolve(false)
                    throw new Error("Numero de opções < 1")

                }

                if (dg > 0) {
                    await SendDg(dg, user)
                }

                let obj = {
                    type: "application/vnd.lime.select+json",
                    to: user,
                    content: {
                        scope:"persistent",
                        text: msg,
                        options: []
                    }
                }

                for (i in ops) {

                    obj.content.options.push({text: ops[i]})

                }

                Client.sendMessage(obj)

                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)
                console.log(FgYellow+"  Mensagem:"+Reset, Bright+msg+Reset)
                console.log(FgYellow+"  Opções:"+Reset, Bright+ops+Reset)
                console.log(FgYellow+"  Enviada para:"+Reset, Bright+user+Reset)
                console.log(FgYellow+"  Digitando de:"+Reset, Bright+dg, "ms"+Reset)
                console.log(FgBlue+"»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS BLIP«««««««««««««««««"+Reset)

                resolve(true)

            }
            catch (e) {
                reject(false)
            }

        })

    },

    /** 
     * Printa as cores no console.
    */
    PrintaCor: () => {

        console.log(Bright+" Bright "+Reset)
        console.log(Dim+" Dim "+Reset)
        console.log(Underscore+" Underscore "+Reset)
        console.log(Blink +" Blink "+Reset)
        console.log(Reverse +" Reverse "+Reset)
        console.log(Hidden +" Hidden "+Reset)
        
        console.log("")

        console.log(FgBlack +" FgBlack "+Reset)
        console.log(FgRed +" FgRed "+Reset)
        console.log(FgGreen +" FgGreen "+Reset)
        console.log(FgYellow +" FgYellow "+Reset)
        console.log(FgBlue +" FgBlue "+Reset)
        console.log(FgMagenta +" FgMagenta "+Reset)
        console.log(FgCyan +" FgCyan "+Reset)
        console.log(FgWhite +" FgWhite "+Reset)

        console.log("")

        console.log(BgBlack +" BgBlack "+Reset)
        console.log(BgRed +" BgRed "+Reset)
        console.log(BgGreen +" BgGreen "+Reset)
        console.log(BgYellow +" BgYellow "+Reset)
        console.log(BgBlue +" BgBlue "+Reset)
        console.log(BgMagenta +" BgMagenta "+Reset)
        console.log(BgCyan  +" BgCyan  "+Reset)
        console.log(BgWhite  +" BgWhite  "+Reset)

    },

    /** 
     * Retorna a cor pedida, se não existir retorna false
     * @param {String} cor - cor desejada
     * 
     * Cores -> [branco, vermelho, verde, amarelo, azul, magenta, ciano, preto]
     * 
     * Formatação -> [negrito, sublinhado]
     * 
     * Atras -> [abranco, avermelho, averde, aamarelo, aazul, amagenta, aciano, apreto]
     *
     * OBS: O console mantem as cores anteriores, para remover TODAS as cores use reset
    */
    Color: (cor) => {

        cor = cor.toLowerCase()

        if (cor == "reset") {return Reset}

        if (cor == "branco") {return FgWhite}
        if (cor == "vermelho") {return FgRed}
        if (cor == "verde") {return FgGreen}
        if (cor == "amarelo") {return FgYellow}
        if (cor == "azul") {return FgBlue}
        if (cor == "magenta") {return FgMagenta}
        if (cor == "ciano") {return FgCyan}
        if (cor == "preto") {return FgBlack}

        if (cor == "negrito") {return Bright}
        if (cor == "sublinhado") {return Underscore}

        if (cor == "abranco") {return BgBlack}
        if (cor == "avermelho") {return BgRed}
        if (cor == "averde") {return BgGreen}
        if (cor == "aamarelo") {return BgYellow}
        if (cor == "aazul") {return BgBlue}
        if (cor == "amagenta") {return BgMagenta}
        if (cor == "aciano") {return BgCyan}
        if (cor == "apreto") {return BgBlack}

        return false

    }

}