const Discord = require('discord.js');
const bot = new Discord.Client();
//appel du bot par k!{message}
const tag = "k!";

bot.on('message', (message) => {

    var content = message.content;

    if(content.indexOf(tag) == 0){
        //lorsque l'on recoit 'ping' :
        if(find(content, 'ping')){

            //on envoit 'pong'
            send(message, 'pong');

        //lorsque l'on recoit 'date' :
        }else if(find(content, 'date')){

            //on envoit la date
            var txt = "" + new Date();
            send(message, txt);

        //lorsque l'on recoit 'roll' :
        }else if(find(content, 'roll')){

            //on envoit un chiffre aléatoire entre 1 et 6
            var txt = "You roll a ";
            txt += Math.round(Math.random()*5) + 1;
            send(message, txt);

        }else if(find(content, 'me')){

            //on envoit le nom
            var txt = "You are... " + message.author.username;
            send(message, txt);

        }

    }

});

function send(message,msg){
    message.channel.send(msg);
}
function find(content, txt){
    return content.indexOf(txt)>=0;
}

bot.login('NDEzNzkyOTUxNDcxMTc3NzM5.DWd-RA.jeRkx7QHbljrzp3WgrqjdAsnKLA');