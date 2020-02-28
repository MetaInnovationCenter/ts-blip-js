var bayes = require('bayes')

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

app = async () => {
    classifyMessage('Ok', {Certo: ['Beleza', 'Tranquilo', 'Ok']})
    .then((response) => {
        console.log(response)
    })
}

app()








// let str = '500 erro 82ue555jihf902 524 je09djwaposd kao koad 0w 500'
// let str2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
// let regex = /\b(5)(\d{2})\b/i

// console.log(str2.match(regex))

// if(str2.match(regex) == null) {console.log('tudo certo')}

// if(str.match(regex) != null) {console.log('erro')}
