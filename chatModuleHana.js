var emf = require("./emf.js")

module.exports = {
    startHanaBot: (client, userId) => {
        let status = "Qual login?"
        client.addMessageReceiver(true, function(message) {
            if(message.content.state == undefined) {
                switch(status) {
                    case "Qual login?":
                        emf.SendMessage(userId, "Certo, qual o seu login nesse sistema?",1000)
                        status = "Processando"
                        break;
                    case "Processando":
                        emf.SendMessage(userId, "Estou processando seu pedido, " + message.content)

                        
                        status = "Sucesso"
                        break;
                    case "Sucesso":
                        console.log("Senha trocada com sucesso")
                        emf.SendMessage(userId, "Senha trocada com sucesso")
                            .then(function() {
                                client.close()
                                    .then(function() { console.log("Disconnection successfull") })
                                    .catch(function(err) { console.log("Disconnection failed") });
                            });
                        break;
                }
            }
        });
    }
}