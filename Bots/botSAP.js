//Bibliotecas
var emfB = require("../local_modules/emfB.js")
const axios = require('axios');
const indexModule = require('../index.js')
const maestro = require('../local_modules/maestro.js')
var botCheckSAP = require("./botResetSAP")
var botCheckSAP = require("./botResetCheckSAP")

let status

module.exports = {
    startSAP: async (message) => {

    switch (key) {
        case "atividades SAP":
            console.log("Switch on case:sistema SAP")
            if(message.content.toLowerCase().includes('reset'))
            {
                emfB.SendMenu(message.from,"Posso te ajudar a resetar a senha do SAP em duas versões, qual você deseja?", ['SAP ECC', 'SAP S/4 HANA '], 1000)
                users[current].status = "Versões SAP"
            }
            else 
            {
                emfB.SendMenu(message.from, "Desculpe, não entendi, pois sou um bot em treinamento, no momento posso te ajudar com as seguintes atividades:", ['Reset de Senha'], 1000)
                users[current].status = "atividades SAP"
            }
        break;
// --------------------------------------- case versões SAP --------------------------------------------- //
        case "Versões SAP":
            console.log('Switch on case versões sap')
            if(message.content.toLowerCase().includes('ecc')) 
            {
                emfB.SendOptions(message.from, "Ok, Você sabe a sua senha atual?", ['Sim', 'Não'], 1000)
                users[current].status = "senha ecc"
            }
            else if(message.content.toLowerCase().includes('hana')) {
                emfB.SendOptions(message.from, "Ok, Você sabe a sua senha atual?", ['Sim', 'Não'], 1000)
                users[current].status = "senha hana"
            }
            
            else {
                console.log("Nenhum sistema detectado");
                emfB.SendOptions(message.from, "Desculpe, não entendi. Posso trocar sua senha nos sistemas SAP S/4 HANA e SAP ECC, qual deles você utiliza?", ['SAP ECC', 'S/4 HANA'], 2000)
                users[current].status = "Versões SAP"
            }
        break;
// ----------------------------------------- case senha ecc ----------------------------------------------- //
        case "senha ecc":
            if(message.content.toLowerCase().includes('nao')) 
            {
                botSAP.start(client, message, 'ecc')
            }
            else if (message.content.toLowerCase().includes('sim')) 
            {
                emfB.SendMessage(message.from, "Dessa forma, irei te dar algumas informações para que você possa realizar este reset.")
                emfB.SendImg(message.from, "Primeiro você precisa abrir o SAP na versão que você deseja e entrar no ambiente desejado como mostra figura acima:", "https://i.ibb.co/Vwx5wh8/ecc.jpg",50)
                console.log("GET IN")
                //emfB.SendImg(message.from, "Após entrar no ambiente você será direcionado para uma página semelhante a esta:","http://ti.meta.com.br/MAIN_LOGO.png",100)
            }
            else
            {
                emfB.SendOptions(message.from, "Desculpe, não entendi. Você sabe a sua senha atual?", ['Sim', 'Não'], 1000)
                users[current].status = "ecc"
            }
        break;
// ----------------------------------------- case senha ecc ----------------------------------------------- //
        case "senha hana":
            if(message.content.toLowerCase().includes('nao')) 
            {
                botSAP.start(client, message, 'hana')
            }
            else if (message.content.toLowerCase().includes('sim')) 
            {
            
            }
            else
            {
                emfB.SendOptions(message.from, "Desculpe, não entendi. Você sabe a sua senha atual?", ['Sim', 'Não'], 1000)
                users[current].status = "senha hana"
            }
        break;
    }
        
    }
}