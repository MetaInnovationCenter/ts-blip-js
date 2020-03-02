//Bibliotecas
var emfB = require("../local_modules/emfB.js")
const axios = require('axios');
const indexModule = require('../index.js')
const maestro = require('../local_modules/maestro.js')
var botResetSAP = require("./botResetSAP.js")
var botCheckSAP = require("./botResetCheckSAP.js")

//Variáveis para controle de multiplos usuários
let users = []
let newUserFlag = true
let current

module.exports = {
    startSAP: async (message) => {

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
            users[current].status = 'Versões SAP'
        }
    
    switch (users[current].status) {
// --------------------------------------- case versões SAP --------------------------------------------- //
        case "Versões SAP":
            console.log("Switch on case: Versões SAP")
            if(message.content.toLowerCase().includes('reset'))
            {
                emfB.SendOptions(message.from,"Posso te ajudar a resetar a senha do SAP em duas versões, qual você deseja?", ['SAP ECC', 'SAP S/4 HANA '], 1000)
                users[current].status = "Inicia botResetSAP"
            } else if (message.content.toLowerCase().includes('trocar')) {
                emfB.SendOptions(message.from,"Posso te ajudar a trocar a senha do SAP em duas versões, qual você deseja?", ['SAP ECC', 'SAP S/4 HANA '], 1000)
                users[current].status = "tutorial"
            } 
            else 
            {
                emfB.SendOptions(message.from, "Desculpe, não entendi, pois sou um bot em treinamento, no momento posso te ajudar com as seguintes versões:", ['SAP ECC', 'SAP S/4 HANA '], 1000)
                users[current].status = "Versões SAP"
            }
        break;

        case "Inicia botResetSAP":
            console.log('Switch on case: Inicia botResetSAP')
            if(message.content.toLowerCase().includes('ecc')) 
            {
                botResetSAP.start(message, "ecc")
                users[current].status = "Reset sap ecc"
            }
            else if(message.content.toLowerCase().includes('hana')) 
            {
                botResetSAP.start(message, "hana")
                users[current].status = "Reset sap hana"
            }
            else
            {
                emfB.SendOptions(message.from, "Desculpe, não entendi. Posso trocar sua senha nos sistemas SAP S/4 HANA e SAP ECC, qual deles você utiliza?", ['SAP ECC', 'S/4 HANA'], 2000)
                users[current].status = "Inicia botResetSAP"
            }
        break;
// ----------------------------------------- case senha ecc ----------------------------------------------- //
        case "tutorial":
            console.log('ENTROU NO TUTORIAL')
            if (message.content.toLowerCase().includes('ecc')) 
            {
                emfB.SendMessage(message.from, "Dessa forma, irei te dar algumas informações para que você possa realizar este reset.")
                emfB.SendImg(message.from, "Primeiro você precisa abrir o SAP na versão que você deseja e entrar no ambiente desejado como mostra figura acima:", "https://i.ibb.co/6nm4GjC/ambiente.jpg",500)
                emfB.SendImg(message.from, "Após entrar no ambiente você será direcionado para uma página semelhante a esta.", "https://i.ibb.co/9cZPgfk/ecc-inicial.jpg",1000)
                emfB.SendOptions(message.from, "Você deve preencher os campos solicitados, mandante,usuário e senha como se fosse logar no sistema.",['Prosseguir'], 1500)
                users[current].status = "Prossiga ecc"

            } else if (message.content.toLowerCase().includes('hana')) 
            {
                emfB.SendMessage(message.from, "Dessa forma, irei te dar algumas informações para que você possa realizar esta troca.")
                emfB.SendImg(message.from, "Primeiro você precisa abrir o SAP na versão que você deseja e entrar no ambiente desejado como mostra figura acima:", "https://i.ibb.co/6nm4GjC/ambiente.jpg",50)
                emfB.SendImg(message.from, "Após entrar no ambiente você será direcionado para uma página semelhante a esta.", "https://i.ibb.co/YyxJ07t/hana-inicial-1.jpg",50)
                emfB.SendMessage(message.from, "Você deve preencher os campos solicitados, mandante,usuário e senha como se fosse logar no sistema.")
                emfB.SendImg(message.from, "Após isso você deve clicar onde diz Nova Senha, conforme imagem acima:", "https://i.ibb.co/4sbT4Gz/hana-senha.jpg",50)
                emfB.SendImg(message.from, "Após clicar neste botão irá aparecer a seguinte tela:", "https://i.ibb.co/Tm3FN8f/nova-senha-hana.jpg",50)
                emfB.SendMessage(message.from, "Agora você precisa digitar a sua nova senha, ela precisa ser maior que 6 digitos, após a criação da nova senha você deve confirmar o processo.")
                emfB.SendOptions(message.from, "Essas informações te ajudaram a trocar a sua senha?", ['Sim', 'Não'], 1000)
                // users[current].status = "senha trocada hana"
            }
            else
            {
                //emfB.SendOptions(message.from, "Desculpe, não entendi. Você sabe a sua senha atual?", ['Sim', 'Não'], 1000)
                //users[current].status = "senha hana"
            }
        break;

         // --------------------------------------- case versões SAP --------------------------------------------- //
        /*case "Versões SAP":
            console.log('Switch on case: versões sap')
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
        break;*/
        case "Reset sap hana":
            botResetSAP.start(message, 'hana')
        break;
        case "Reset sap ecc":
            botResetSAP.start(message, 'ecc')
        break;
         // --------------------------------------- case Prossiga ecc - Instruções --------------------------------------------- //
        case "Prossiga ecc":
            console.log('Switch on case: versões sap')
            if(message.content.toLowerCase().includes('prosseguir')) 
            {
                emfB.SendImg(message.from, "Após inserir esses dados você deve clicar onde diz Nova Senha, conforme imagem acima:", "https://i.ibb.co/mhtx35w/ecc-senha.jpg",2000)
                emfB.SendImg(message.from, "Após isso aparecerá uma tela semelhante a essa a seguinte tela:", "https://i.ibb.co/x1PB6jB/novasenha-ecc.jpg", 2500)
                emfB.SendMessage(message.from, "Agora você precisa digitar a sua nova senha, ela precisa ser maior que 6 digitos, após a criação da nova senha você deve confirmar o processo.",3000)
                emfB.SendOptions(message.from, "Essas informações te ajudaram a resetar a sua senha?", ['Sim', 'Não'], 3500)
                users[current].status = "Senha trocada"
            }
            else {
                console.log("Usuario não apertou o botão de prosseguir");
                emfB.SendOptions(message.from, "Desculpe, não entendi. Aperte aqui para continuarmos:", ['Prosseguir'], 2000)
                users[current].status = "Prossiga ecc"
            }
        break;    
        
        }
   
    }
}