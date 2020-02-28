const bayes = require('bayes')
const emfB = require("../local_modules/emfB.js")

module.exports = {
    talk: (message) => {
        classifyMessage(message.content, {
            Chuva: ['Será que vai chover hoje?', 'Será que hoje chove?', 'Chuva essa semana?', 'amanha vai chover?']
        })
        .then((category) => {
            switch (category) {
                case 'Chuva':
                    emfB.SendMessage(message.from, 'Acho que não', 1000)
                    break;
            
                default:
                    emfB.SendMessage(message.from, 'Desculpe não entendi', 1000)
                    break;
            }
        })
    }
}

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