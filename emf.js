let Client

module.exports = {

    SetClient: (client) => {

        Client = client

    },

    //MandaMensagem bunita (var idUser, Mensagem, Tempo de Digitando em segundos (0 = sem digitando))
    SendMessage: (user, msg, dg) => {

        if (dg > 0) { 

            Client.sendMessage({ 
                
                type: "application/vnd.lime.chatstate+json",
                to: user,
                content: {"state": "composing"},

            })

            setTimeout(() => 
            
                Client.sendMessage({ 
                    
                    type: "text/plain", 
                    to: user,
                    content: msg
                
                })
                
            , dg)

        }
        else {

            Client.sendMessage({ 
                
                type: "text/plain", 
                to: user,
                content: msg, 
            
            })
        }
    },

    //MandaMensagem com Opções (var idUser, Mensagem, ["Opção1","Opção2","Opção3","Opção4"] (de 1 a 4 opções)) 
    SendOptions: (user, msg, ops) => {

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

    },

    //MandaMensagem Multi (var idUser, ["Men1","Men2","Men3","Men4"] (de 1 a 4 opções))
    SendMul: (user, msgs) => {

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

    },

    //MandaMensagem com Imagem (var idUser, Mensagem da Imagem ("" = nada), Url da Imagem (com .jpg no final))
    SendImg: (user, msg, img) => {

        Client.sendMessage({

            type: "application/vnd.lime.media-link+json",
            to: user,
            content: {

                text: msg,
                type: "image/jpeg",
                uri: img
                    
            }

        });

    }

    

}