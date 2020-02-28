//Delete users from other files
module.exports = {
    spliceUser:  (userId) => {
        users.forEach(user => {
            if(user.id == userId)
                current = users.indexOf(user)
        });
        users.splice(current, 1)
    }
}

//Libraries
const BlipSdk = require("blip-sdk")
const WebSocketTransport = require("lime-transport-websocket")
const bayes = require('bayes')

//Chatbots

//Local libraries
const emfB = require("../local_modules/emfB.js")
const smtalk = require('./small-talk')

//Chatbot API Auth Info
const IDENTIFIER = 'tsblipjsdev';
const ACCESS_KEY = 'QjhPdmxZMzlxWGJUaVg1MlBUdjc=';

//Multiple users control variables
let users = []
let newUserFlag = true
let current

//Establish websocket connection to blip
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

//Connects to blip
client.connect() 
.then(async function(session) {
    console.log('Application started. Press Ctrl + c to stop.')

    //Sets which client to send messages to
    emfB.SetClient(client)

    //Plaintext receiver
    client.addMessageReceiver((message) => message.type === 'text/plain', async (message) => {

        /*------------------------User Handling------------------------ */
        newUserFlag = true
        //Confere se a mensagem atual é de um usuário novo ou um que já está na lista
        users.forEach(user => {
            console.log(user)
            //Se o usuário está na lista
            if(user.id == message.from) {
                console.log("User already on index list");
                newUserFlag = false
                current = users.indexOf(user)
            }
        });
        //Se o usuário não está na lista
        if(newUserFlag == true) {
            console.log("New user added to index list");
            users.push(new Object)
            current = users.length - 1
            users[current].id = message.from
            users[current].status = 'Boas Vindas'
        }
        /*------------------------End User Handling------------------------ */

        //Normal Dialog Flow
        switch (users[current].status) {
            case 'Boas Vindas':
                emfB.SendMessage(message.from, "Bem vindo ao chatbot template :), como está seu dia?", 1000)
                users[current].status = 'Resposta Boas Vindas'
                break;
        
            case 'Resposta Boas Vindas':
                classifyMessage(message.content, {
                    Bom: ['Meu dia está Bom', 'Hoje foi Legal', 'to Tranquilo', 'Suave', 'Positivo', 'Ótimo'],
                    Ruim: ['Meu dia está Ruim', 'Hoje foi Péssimo', 'não to legal', 'Triste', 'não foi']
                })
                .then((category) => {
                    switch (category) {
                        case 'Bom':
                            emfB,SendMessage(message.from, 'Legal, espero que seu dia continue assim :)', 1000)
                            break;
                    
                        case 'Ruim':
                            emfB.SendMessage(message.from, 'Oh não! Espero que seu dia melhore.', 1000)
                            break;

                        default:
                            smtalk.talk(message)
                            break;
                    }
                })
                break;

            default:
                console.log('Wrong user status')
                break;
        }
    })
})    
.catch(function(err) { console.log("Falha na conexão, erro: " + err) });

/**
 * Classifies an input phrase based on the categories and training phrases provided in a JavaScript Object format
 * @param {JSON} catsAndPhrases JavaScript Object containing the categories and phrases that will be classified  
 * @param {String} message The message that needs to be classified
 */
const classifyMessage = async (message, catsAndPhrases) => {
    let classifier = bayes()

    //Default category activated when no other is matched
    await classifier.learn('', 'No Category Found')

    //Learning to match all the phrases with their respective categories//
    //For each category
    for (category in catsAndPhrases) {
        let phrases = catsAndPhrases[category]

        //For each phrase in a category: learn it
        phrases.forEach(async phrase => {
            await classifier.learn(phrase, category)
        });
    }

    //Categorize input message
    return classifier.categorize(message)
}