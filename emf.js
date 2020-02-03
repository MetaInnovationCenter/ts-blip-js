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

    Client.sendMessage({ 
                
        type: "application/vnd.lime.chatstate+json",
        to: user,
        content: {"state": "composing"},

    })

    sleep(dg)

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

        Client = client

        console.log("Client Definido")

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

        try{

            if (dg > 0) { 

                SendDg(dg, user)
                    
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

            console.log("»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS«««««««««««««««")
            console.log("Mengagem:", msg)
            console.log("enviada para:", user)
            console.log("digitando de:", dg, "ms")
            console.log("»»»»»»»»»»»»»»»»EMANUEL MASTER FUNCTIONS«««««««««««««««")

            return true

        }
        catch {

            return false

        }

    },

    /** 
     * Manda uma mensagem com opções (quick reply) (min 1, max 4).
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} msg - Mensagen que fica acima das opções ("" -> sem mensagem, mas fica horrível)
     * @param {Array<String>} ops - Opções ("" -> opção sem mensagem, fica horrível)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendOptions: (user, msg, ops, dg) => {
        try {
            if (dg > 0) {
                SendDg(dg, user)
            }
            if (ops.length == 1) {
                Client.sendMessage({
                    type: "application/vnd.lime.select+json",
                    to: user,
                    content: {
                        scope:"immediate",
                        text: msg,
                        options: [
                            {
                                text: ops[0]
                            }
                        ]
                    }
                })
            }
            if (ops.length == 2) {
                Client.sendMessage({
                    type: "application/vnd.lime.select+json",
                    to: user,
                    content: {
                        scope:"immediate",
                        text: msg,
                        options: [
                            {
                                text: ops[0]
                            },
                            {
                                text: ops[1]
                            }
                        ]
                    }
                })
            }
            if (ops.length == 3) {

                Client.sendMessage({
                    type: "application/vnd.lime.select+json",
                    to: user,
                    content: {
                        scope:"immediate",
                        text: msg,
            
                        options: [
                            {
                                text: ops[0]
                            },
                            {
                                text: ops[1]
                            },
                            {
                                text: ops[2]
                            }
                        ]
                    }
                })
            }
            if (ops.length == 4) {
                Client.sendMessage({
                    type: "application/vnd.lime.select+json",
                    to: user,
                    content: {
                        scope:"immediate",
                        text: msg,
                        options: [
                            {
                                text: ops[0]
                            },
                            {
                                text: ops[1]
                            },
                            {
                                text: ops[2]
                            },
                            {
                                text: ops[3]
                            }
                        ]
                    }
                })
            }
            return true
        }
        catch {
            return false
        }
    },

    /** 
     * Manda multiplas mensagens (min 1, max 4).
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {Array<String>} msgs - Mensagens 
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendMul: (user, msgs, dg) => {
        try {
            if (dg > 0) {
                SendDg(dg, user)
            }
            if (msgs.length == 2) {
                Client.sendMessage({
                    type: "application/vnd.lime.collection+json",
                    to: user,
                    content: {
                        itemType: "text/plain",
                        items: [
                            msgs[0],
                            msgs[1]
                        ]
                    }
                });
            }
            if (msgs.length == 3) {
                Client.sendMessage({
                    type: "application/vnd.lime.collection+json",
                    to: user,
                    content: {
                        itemType: "text/plain",
                        items: [
                            msgs[0],
                            msgs[1],
                            msgs[2]
                        ]
                    }
                });
            }
            if (msgs.length == 4) {
                Client.sendMessage({
                    type: "application/vnd.lime.collection+json",
                    to: user,
                    content: {
                        itemType: "text/plain",
                        items: [
                            msgs[0],
                            msgs[1],
                            msgs[2],
                            msgs[3]
                        ]
                    }
                });
            }
            return true
        }
        catch {
            return false
        }
    },

    /** 
     * Manda uma mensagem com 1 imagem.
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} msg - Mensagen que fica embaixo da imagem ("" -> sem mensagem)
     * @param {String} img - Link da imagem (com .jpeg)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendImg: (user, msg, img, dg) => {
        try {
            if (dg > 0) {
                SendDg(dg, user)
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
            return true
        }
        catch {
            return false
        }
    },

    /** 
     * Manda uma mensagem com 1 video.
     * Retorna true quando tudo certo, false quando não
     * @param {String} user - Id do Usuario
     * @param {String} img - Link do video (com .mp4)
     * @param {Number} dg - Tempo de "Digitando" (dg <= 0 -> sem digitando) (em milisegundos)
    */
    SendVideo: (user, vdo, dg) => {
        try {
            if (dg > 0) {
                SendDg(dg, user)
            }
            Client.sendMessage({
                type: "application/vnd.lime.media-link+json",
                to: user,
                content: {
                type: "video/mp4",
                uri: vdo,
                }
            });
            return true
        }
        catch {
            return false
        }
    },

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

    }

}