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

            console.log("-----------------------------EMANUEL MASTER FUNCTIONS--------------------------------")
            console.log("Mengagem:", msg)
            console.log("enviada para:", user)
            console.log("digitando de:", dg, "ms")
            console.log("-----------------------------EMANUEL MASTER FUNCTIONS--------------------------------")

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
    }
}