module.exports = {

    SendMessage: (client, user, msg, dg) => {

        if (dg > 0) { 

            client.sendMessage({ 
                
                type: "application/vnd.lime.chatstate+json",
                to: user,
                content: {"state": "composing"},

            })

            setTimeout(() => 
            
                client.sendMessage({ 
                    
                    type: "text/plain", 
                    to: user,
                    content: msg
                
                })
                
            , dg)

        }
        else {

            client.sendMessage({ 
                
                type: "text/plain", 
                to: user,
                content: msg, 
            
            })
        }
    },

    SendOptions: (client, user, msg, ops) => {

        if (ops.length == 2) {

            client.sendMessage({

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

            client.sendMessage({

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

            client.sendMessage({

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

    }
}