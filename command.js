let main = require('./bot.js');

let App = main.app;
let Database = main.database;

const commands = [

    {//help [optional]
      name : 'help [optional]',
      description : 'say the list of functions',
      result : (message) => {
			let txt = '';
			let param = message.param;
			if(param != null){
				for(let i = 0;i<commands.length;i++){
					if(commands[i].name == param && (commands[i].visibility == null || commands[i].visibility == true)){
						txt = '  • `'+commands[i].name+'` : '+commands[i].description+'\n';;
					}
                }
                if(txt.length == 0){
                    txt = "This command doesn't exist";
                }
			}else{
				txt = 'List of functions :\n';
				for(let i = 0;i<commands.length;i++){
                    if(commands[i].visibility == null || commands[i].visibility == true){
                        txt += '  • `'+commands[i].name+'` : '+commands[i].description+'\n';
                    }
                };
                txt += "\n**TIPS :**\n";
                txt += "  • Add a ~ at the end of a command, and the bot will send the response directly to you";
			}
            return txt;
      }
    },

    {//tasks
        name : 'tasks',
        description : 'return the list of current tasks',
        result : (message) => {
            if(message.hasExtra()){return null}
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                if(tasks.length == 0){
                    txt = 'No tasks';
                }else{
                    txt += '__List of tasks :__';
                    for(var a = 0;a<tasks.length;a++){
                        let keys = Object.keys(tasks[a]);
                        txt += '\n  • **'+tasks[a][keys[0]].language+'**\n';
                        var d = new Date();
                        var n = d.getTime();
                        for(var b = 0;b<keys.length;b++){
                            let task = tasks[a][keys[b]];
                            let time = '';
                            if(task.begin != null && task.owner_id != null){
                                time = Math.round((n - task.begin)/60000);
                                if(time<60){
                                    time = '*'+time+' minute(s)*';
                                }else{
                                    time = '*'+Math.round(time/60)+' hour(s)*';
                                }
                            }
                            txt += '    • '+task.content+' [id : '+task.id+']'+((task.owner_id != null)?' (taken)':' ')+' '+time+'\n';
                        }
                    };
                }
                message.answer(txt);
            },Database.responseTime);

        }

    },

    {//me
        name : 'me',
        description : 'tasks applied to me',
        result : (message) => {
            let id = message.discord.author.id;
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });
                tasks = arr.filter(task => task.owner_id == id);
                var d = new Date();
                var n = d.getTime();
                for(var a = 0;a<tasks.length;a++){
                    let time = Math.round((n - tasks[a].begin)/60000);
                    if(time<60){
                        time = '*'+time+' minute(s)*';
                    }else{
                        time = '*'+Math.round(time/60)+' hour(s)*';
                    }
                    txt += '• **'+ tasks[a].language + '** ' + tasks[a].content + ' [id : ' + tasks[a].id + '] '+time+' \n';
                }
                if(tasks.length == 0){
                    txt = 'No tasks';
                }
                message.answer(txt);
            },Database.responseTime);

            return ;
        }
    },

    {//user @user
        name : 'user @user',
        description : 'tasks applied to the mentionned user',
        result : (message) => {
            let id = message.mentions.first().id;
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });
                tasks = arr.filter(task => task.owner_id == id);
                var d = new Date();
                var n = d.getTime();
                for(var a = 0;a<tasks.length;a++){
                    let time = Math.round((n - tasks[a].begin)/60000);
                    if(time<60){
                        time = '*'+time+' minute(s)*';
                    }else{
                        time = '*'+Math.round(time/60)+' hour(s)*';
                    }
                    txt += '• **'+ tasks[a].language + '** ' + tasks[a].content + ' [id : ' + tasks[a].id + '] '+time+' \n';
                }
                if(tasks.length == 0){
                    txt = 'No tasks';
                }
                message.answer(txt);
            },Database.responseTime);

            return ;
        }
    },

    {//new_task [language] "content"
        name : 'new_task [language] "content"',
        description : 'create a new task',
        result : (message) => {
            if(message.param == null || message.string == null){
                return "Arguments are not specified";
            }

            let languages = [];
            Database.from('languages').on('child_added',function(data) {
                languages.push(data.val());
            });

            setTimeout(function(){
                if(languages.indexOf(message.param) > -1){
                    let current_task_id = 0;
                    Database.from('current_task_id').on('value',function(snap){
                        current_task_id = snap.val();
                    });
                    setTimeout(function(){
                        if(current_task_id == 'NaN' || current_task_id == null || current_task_id == 'undefined' || current_task_id == false){
                            current_task_id = 0;
                        }
                        Database.newTask({
                            language : message.param,
                            content : message.string,
                            id: current_task_id
                        });
                        txt = `The task "${message.string}" has been added to the language : ${message.param}`;
                        message.answer(txt);
                        message.stopAnswer();
                        Database.updateCurrentTaskId(current_task_id);
                    },Database.responseTime);
                }else{
                    message.answer('The language specified does not exist.\nYou can check the existing languages by using m!getLanguages');
                }
            },Database.responseTime);

        }
    },

    {//get
        name : 'get',
        description : 'get tasks allowed to me',
        result : (message) => {
            if(message.hasExtra() == true){
                return null;
            }
            let languages = [];
            Database.from('languages').on('child_added',function(data) {
                languages.push(data.val());
            });

            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });

            let myroles = [];

            setTimeout(function(){
                for(var a = 0;a<languages.length;a++){
                    let role = message.discord.guild.roles.find("name",languages[a]);
                    if(role != null){
                        if(message.discord.member.roles.has(role.id)){
                            myroles[myroles.length] = role.name;
                        }
                    }
                }
            },Database.responseTime);

            let nbr = 0;
            let lang = 0;

            setTimeout(function(){
                var txt = '';
                tasks.forEach(element => {
                    let arr = Object.keys(element).map(function (key) { return element[key]; });
                    ctasks = arr.filter(task => myroles.indexOf(task.language) >= 0);
                    var d = new Date();
                    var n = d.getTime();
                    for(var a = 0;a<ctasks.length;a++){
                        let task = ctasks[a];
                        let time = '';
                        if(task.begin != null && task.owner_id != null){
                            time = Math.round((n - task.begin)/60000);
                            if(time<60){
                                time = '*'+time+' minute(s)*';
                            }else{
                                time = '*'+Math.round(time/60)+' hour(s)*';
                            }
                        }
                        txt += '• **'+ task.language + '** `' + task.content + '` [id : ' + task.id + ']'+((task.owner_id != null)?' (taken)':' ')+' '+time+'\n';
                    }
                    if(ctasks.length > 0){
                        nbr += ctasks.length;
                        lang++;
                    }
                });

                if(nbr == 0){
                    txt = "No tasks";
                }else{
                    txt += "\nA total of " + nbr + " task(s) with " + lang  + " language(s)";
                }
                message.answer(txt);
            },Database.responseTime * 2);
        }
    },

    {//get [param]
        name : 'get [param]',
        description : 'get tasks allowed to the specified role',
        result : (message) => {
            if(message.param == null){
                return null;
            }
            let tasks = [];
            Database.from('tasks/'+message.param).on('child_added',function(data) {
                tasks.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                if(tasks.length == 0){
                    txt = 'No tasks or this language doesn\'t exist';
                }else{
                    txt += `List of ${message.param} tasks :\n`;
                    for(var a = 0;a<tasks.length;a++){
                        let element = tasks[a];
                        txt += '• `' + element.content + '` [id : '+element.id+']'+((element.owner_id != null)?' (taken)':' ')+'\n';
                    };
                }
                message.answer(txt);
            },Database.responseTime);
        }
    },

    {//time [param]
        name : 'time [param]',
        description : 'time from the beginning of the task with the specified id',
        result : (message) => {
            if(message.param == null){
                return null;
            }
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });

            setTimeout(function(){
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });

                let task = arr.filter(task => task.id == message.param);
                let key = Object.keys(tasks).find(key => tasks[key].id == message.param);
                
                if(task.length == 0){
                    message.answer('The task with the id ' + message.param + ' is not found');
                    return null;
                }
                task = task[0];
                if(task.owner_id == null){
                    message.answer('Nobody has this task');
                    return null;
                }
                var d = new Date();
                var n = d.getTime();
                message.answer('The task has been taken '+Math.round((n - task.begin)/60000)+' minute(s) ago');
            },Database.responseTime);
        }
    },

    {//add [param]
        name : 'add [param]',
        description : 'add the task with the specified id to your personnal task list',
        result : (message) => {
            if(message.param == null || message.hasExtra(true)){
                return null;
            }
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks[tasks.length] = data.val();
            });

            setTimeout(function(){
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });

                let task = arr.filter(task => task.id == message.param);
                let key = Object.keys(tasks).find(key => tasks[key].id == message.param);
                
                if(task.length == 0){
                    message.answer('The task with the id ' + message.param + ' is not found');
                    return null;
                }
                task = task[0];
                if(task.owner_id != null){
                    message.answer('The task is already taken by <@'+task.owner_id+'>');
                    return null;
                }
                let role = message.discord.guild.roles.find("name",task.language);
                if(role == null || !message.discord.member.roles.has(role.id)){
                    message.answer('You are not allowed to add a task with the language : `' + task.language + "`");
                    message.answer("Because you don't have the role : `" + task.language + "`")
                    return null;
                }
                Database.setTaskOwner(message.discord.author.id,task,key);
                message.answer('The task with the id ' + message.param + ' has been added to you');
            },Database.responseTime);

        }
    },

    {//remove [param]
        name : 'remove [param]',
        description : 'remove the task with the specified id from your task list',
        result : (message) => {
            if(message.param == null || message.hasExtra(true)){
                return null;
            }
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });

            setTimeout(function(){
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });

                let task = arr.filter(task => task.id == message.param);
                let key = Object.keys(tasks).find(key => tasks[key].id == message.param);
                
                if(task.length == 0){
                    message.answer('The task with the id ' + message.param + ' is not found');
                    return null;
                }
                task = task[0];
                if(task.owner_id != message.discord.author.id){
                    message.answer("You don't even own this task");
                    return null;
                }
                Database.removeTaskOwner(message.discord.author.id,task,key);
                message.answer('The task with the id ' + message.param + ' has been removed from your task list');
            },Database.responseTime);
        }
    },

    {//delete [param]
        name : 'delete [param]',
        description : 'delete task with the specified id [admin]',
        result : (message) => {
            if(message.param == null || message.hasExtra(true)){
                if(message.param == null)message.answer("You need to specify the task id");
                return null;
            }
            if(message.serverID != 'users/'+message.discord.author.id){
                let role = message.discord.guild.roles.find("name","Admin");
                if(role == null){
                    message.answer('Only members with the role Admin can do this command.\nProblem : the role Admin doesn\'t not exist');
                    return null;
                }
                if(!message.discord.member.roles.has(role.id)){
                    message.answer("This command is for the admins only");
                    return null;
                }
            }
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks[tasks.length] = data.val();
            });

            setTimeout(function(){
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });

                let task = arr.filter(task => task.id == message.param);
                let key = Object.keys(tasks).find(key => tasks[key].id == message.param);
                
                if(task.length == 0){
                    message.answer('The task with the id ' + message.param + ' is not found');
                    return null;
                }
                task = task[0];
                Database.removeTask(task,key);
                message.answer('The task with the id ' + message.param + ' has been deleted from the project');
            },Database.responseTime);
        }
    },

    {//giverole [param] @user
        name : 'giverole [param] @user',
        description : 'give the role specified to the user mentionned [admin]',
        result : (message) => {
            if(message.param == null){
                return null;
            }
            if(message.serverID == 'users/'+message.discord.author.id){message.answer('Not working if you are not on a server');return null}
            let role = message.discord.guild.roles.find("name","Admin");
            if(role == null){
                message.answer('Only members with the role Admin can do this command.\nProblem : the role Admin doesn\'t not exist');
                return null;
            }
            if(!message.discord.member.roles.has(role.id)){
                message.answer("This command is for the admins only");
                return null;
            }
            role = message.discord.guild.roles.find("name", message.param);
            let member = message.mentions.first();

            if(role == null || role == 'undefined'){
                message.discord.guild.createRole({
                    name: message.param
                });
                message.answer(`The role ${message.param} has been created.\n` + "You need to write `m!giverole ["+message.param+"] <@"+member.id+">`");
                role = message.discord.guild.roles.find("name", message.param);
                return null;
            }

            // Let's pretend you mentioned the user you want to add a role to (!addrole @user Role Name):

            message.discord.guild.members.get(member.id).addRole(role);

            return `The role ${message.param} has been added to ${member.username}.`;
        }
    },

    {//removerole [param] @user
        name : 'removerole [param] @user',
        description : 'remove the specified role from the mentionned user [admin]',
        result : (message) => {
            if(message.param == null){
                return null;
            }
            if(message.serverID == 'users/'+message.discord.author.id){message.answer('Not working if you are not on a server');return null}
            let role = message.discord.guild.roles.find("name","Admin");
            if(role == null){
                message.answer('Only members with the role Admin can do this command.\nProblem : the role Admin doesn\'t not exist');
                return null;
            }
            if(!message.discord.member.roles.has(role.id)){
                message.answer("This command is for the admins only");
                return null;
            }
            role = message.discord.guild.roles.find("name", message.param);
            if(role == null || role == 'undefined'){
                message.answer('This role doesn\'t even exist');
                return null;
            }

            // Let's pretend you mentioned the user you want to add a role to (!addrole @user Role Name):
            let member = message.discord.mentions.members.first();

            if(!member.roles.has(role.id)){
                message.answer('You are trying to remove a role while <@'+member.id+'> doesn\'t not have it');
                return null;
            }

            message.discord.guild.members.get(member.id).removeRole(role);

            member = message.mentions.first();

            return `The role ${message.param} has been removed from ${member.username}.`;
        }
    },

    {//task @user
        name : 'task @user',
        description : 'get all the task of the mentionned user',
        result : (message) => {
            if(message.mentions.first() == null){
                return null;
            }
            let id = message.mentions.first().id;
            let tasks = [];
            Database.from('tasks').on('child_added',function(data) {
                tasks.push(data.val());
            });
            setTimeout(function(){
                var txt = '';
                tasks = tasks[0];
                let arr = Object.keys(tasks).map(function (key) { return tasks[key]; });
                tasks = arr.filter(task => task.owner_id == id);
                var d = new Date();
                var n = d.getTime();
                for(var a = 0;a<tasks.length;a++){
                    let time = Math.round((n - tasks[a].begin)/60000);
                    if(time<60){
                        time = '*'+time+' minute(s)*';
                    }else{
                        time = '*'+Math.round(time/60)+' hour(s)*';
                    }
                    txt += '• **'+ tasks[a].language + '** ' + tasks[a].content + ' [id : ' + tasks[a].id + '] ' + time + ' minute(s)* \n';
                }
                if(tasks.length == 0){
                    txt = 'No tasks';
                }
                message.answer(txt);
            },Database.responseTime);
        }
    },

    {//addLanguage [param]
        name : 'addLanguage [param]',
        description : 'add a language [admin]',
        result : (message) => {
            if(message.param == null){
                return 'Please, specify a language';
            }
            if(message.serverID != 'users/'+message.discord.author.id){
                let role = message.discord.guild.roles.find("name","Admin");
                if(role == null){
                    message.answer('Only members with the role Admin can do this command.\nProblem : the role Admin doesn\'t not exist');
                    return null;
                }
                if(!message.discord.member.roles.has(role.id)){
                    message.answer("This command is for the admins only");
                    return null;
                }
            }
            param = message.param;
            Database.addLanguage(param);
            return 'A new language appeared : ' + param + ' !';
        }
    },

    {//removeLanguage [param]
        name : 'removeLanguage [param]',
        description : 'remove a language [admin]',
        result : (message) => {
            if(message.param == null){
                return 'Please, specify a language';
            }
            
            if(message.serverID != 'users/'+message.discord.author.id){
                let role = message.discord.guild.roles.find("name","Admin");
                if(role == null){
                    message.answer('Only members with the role Admin can do this command.\nProblem : the role Admin doesn\'t not exist');
                    return null;
                }
                if(!message.discord.member.roles.has(role.id)){
                    message.answer("This command is for the admins only");
                    return null;
                }
            }
            param = message.param;

            let languages = [];
            Database.from('languages').on('child_added',function(data) {
                languages.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                if(languages.indexOf(param) < 0){
                    message.answer("This language does not even exist");
                    return null;
                }

                Database.removeLanguage(param,languages);
                
                message.answer('The language ' + param + ' disappeared !');
            },Database.responseTime);

        }
    },

    {//getLanguages
        name : 'getLanguages',
        description : 'get all languages',
        result : (message) => {

            let languages = [];
            Database.from('languages').on('child_added',function(data) {
                languages.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                if(languages.length == 0){
                    txt = 'No languages';
                }else{
                    txt += 'List of existing langages :\n';
                    for(var a = 0;a<languages.length;a++){
                        let element = languages[a];
                        txt += '• `' + element + '`\n';
                    };
                }
                message.answer(txt);
            },Database.responseTime);
        }
    },

    {//how [param]
        name : 'how [param]',
        description : 'get some useful links for the specified language',
        result : (message) => {
            if(message.param == null){
                return 'Please, specify a language';
            }
            let language = message.param;
            language = language.toUpperCase();
            let txt = "We don't have links for this language";
            if(App['links'] != null){
                if(App['links'][language] != null){
                    let arr = App['links'][language];
                    if(arr.length > 0){
                        txt = "";
                    }
                    for(var a = 0;a<arr.length;a++){
                        txt += "  • "+arr[a]+"\n";
                    }
                }
            }
            return txt;
        }
    },

    {//markdown
        name : 'markdown',
        description : 'basics markdown tools',
        result : (message) => {
            let txt = "- `*italic*`\n";
            txt += "- `**bold**`\n";
            txt += "- `***bold italic***`\n";
            txt += "- `~~barred~~`\n";
            txt += "- `__underline__`\n";
            txt += "- `__*italic underline*__`\n";
            txt += "- `__**bold underline**__`\n";
            txt += "- `__***bold italic underline***__`\n";
            return txt;
        }
    },

    {//new_constant [name] "content"
        name : 'new_constant [name] "content"',
        description : 'create a new constant',
        result : (message) => {
            if(message.param == null || message.string == null){
                return "Arguments are not specified";
            }
            Database.newConstant({
                name : message.param,
                value : message.string
            });
            txt = `The constant **${message.param}** has been added with a value of : ${message.string}`;
            message.answer(txt);
            message.stopAnswer();
        }
    },
    
    {//constants
        name : 'constants',
        description : 'show project constants',
        result : (message) => {
            let constants = [];
            Database.from('constants').on('child_added',function(data) {
                constants.push(data.val());
            });

            setTimeout(function(){
                var txt = '';
                if(constants.length == 0){
                    txt = 'No constants';
                }else{
                    txt += '__List of constants :__\n';
                    for(var b = 0;b<constants.length;b++){
                        let constant = constants[b];
                        txt += '    • '+constant.name+' : ' + constant.value + '\n';
                    }
                }
                message.answer(txt);
            },Database.responseTime);
        }
    },

    {//deleteConstant [name]
        name : 'deleteConstant [name]',
        description : 'delete the constant with the specified name',
        result : (message) => {
            if(message.param == null){
                message.answer("You need to specify the constant name");
                return null;
            }
            let constants = [];
            Database.from('constants').on('value',function(data) {
                constants[constants.length] = data.val();
            });

            setTimeout(function(){
                constants = constants[0];
                let key = Object.keys(constants).find(key => constants[key].name == message.param);
                if(constant.length == 0){
                    message.answer('The constant with the id ' + message.param + ' is not found');
                    return null;
                }
                Database.removeConstant(key);
                message.answer('The constant with the name ' + message.param + ' has been deleted from the project');
            },Database.responseTime);
        }
    },

    {//advert "str"
        name : 'advert "str"',
        description : 'make an advertisement',
        result : (message) => {
            if(message.string == null){
                return "Specify a message for your advertisement";
            }
            let txt = "**ADVERTISEMENT :**\n\n";
            txt += message.string + "\n\n";
            txt += "*message from : " + message.discord.author + "*";
            message.discord.delete();
            return txt;
        }
    },

    {//invite
        name : 'invite',
        description : 'get the invite link for the bot',
        result : (message) => {
            let txt = "__There is the link to invite me to your server :__ https://discordapp.com/oauth2/authorize?client_id=451414817069072385&scope=bot&permissions=2146958583";
            return txt;
        }
    },
    
    {//say "str"
        name : 'say "str" [optional]',
        visibility : false,
        result : (message) => {
            if(message.string == null){
                return null;
            }
            if(message.discord.author.id != '355389600044417025' && message.serverID != 'users/'+message.discord.author.id){
                let role = message.discord.guild.roles.find("name","Admin");
                if(role == null){
                    return null;
                }
                if(!message.discord.member.roles.has(role.id)){
                    return null;
                }
            }
            if(message.param){
                let n = message.param;
                let a = setInterval(function(){
                    n--;
                    if(n<=0){clearInterval(a)};
                    message.answer(message.string);
                },1000);
            }else{
                message.answer(message.string);
            }
            message.discord.delete();
            return null;
        }
    },

    {
        name: 'pannel',
        description: 'get the pannel informations',
        visibility: false,
        result: (message) => {
            if(message.discord.author.id != '370251996336488448' && message.discord.author.id != '316639200462241792' && message.discord.author.id != '355389600044417025'){
                return false;
            }
            let link = "http://bergerault-ant.pagesperso-orange.fr/bot/project%20manager/index.html";

            let pass = '';

            Database.from('/pass').on('value',function(data){

                data = data.val();

                if(data == null){
                    pass = Database.createPass();
                }else{
                    pass = data;
                }

                message.answer("Server ID : " + message.serverID + "\nPass : " + pass + "\n\nPannel link : " + link);
            
            });

        }
    }

];

module.exports = commands;