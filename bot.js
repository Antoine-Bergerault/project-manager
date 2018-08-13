var firebase = require("firebase");

let exportsObj = module.exports = {};

const DB = require('./tools/DB.js');
let Database = new DB();

exportsObj.database = Database;

let App = [];
const Discord = require('discord.js');
const Message = require('./tools/Message.js');

const links = require('./data/links.js');
App['links'] = links;

exportsObj.app = App;

const bot = new Discord.Client();

//tag is m!
const tag = "m!";

let toCommandName = function(str){
    str = remove(str,'[',']');
    str = removeStr(str);
    str = remove(str, ' @',' ',true);
    return str.trim();
}

exportsObj.toCommandName = toCommandName;


function remove(str,begin,end,finish = false){
    let first = str.split(begin);
    first = first[0];
    let second = "";
    second = str.split(end);
    second = second[1];
    if(first != null && second != null && str.indexOf(end) > str.indexOf(begin)){
        str = first.concat(second);
    }else if(finish && first != null){
        str = first;
    }
    return str;
}

function removeStr(str){
    let a = str.split('\"');
    let first = a[0];
    if(first == null){
        return str;
    }
    let second = a[2];
    if(first != null && second != null){
        str = first.concat(second);
    }
    return str;
}

bot.on('ready', () => {
    bot.user.setStatus('available'); // Can be 'available', 'idle', 'dnd', or 'invisible'
    setInterval(function(){
        bot.user.setActivity("m!help - " + (bot.guilds.size + 5) + " project(s)");
    },60000);
});

let commands = require('./command.js');

bot.on('message', (message) => {
        if(message.author.id != '451414817069072385'){
        let content = message.content;
        let Input = new Message(message);
        Database.setServerId(Input.serverID);
        Input.setTag(tag);

        //si le message commence bien par le tag :
        if(content.indexOf(tag) === 0) {

            //pour chaque commandes
            for(let a = 0;a<commands.length;a++) {

                //la commande est mise dans une variable command
                let command = commands[a];

                //si on retrouve bien le nom de la commande
                if (find(content, toCommandName(command.name))) {

                    try{
                        Input.startAnswer();
                        Input.setActivator(command.name);

                        //on associe le texte à la fonction definie par la commande
                        let txt = command.result(Input);
                        if(txt != null){
                            Input.answer(txt);
                        }
                        Input.stopAnswer();
                    }catch(e){
                        console.log(e);
                        Input.answer('An error has occured');
                        Input.stopAnswer();
                    }

                }
            }
        }
        
    }
});

function find(content, txt){
    valid = content.indexOf(txt)==tag.length;
    return valid;
}

bot.login(process.env.BOT_TOKEN);