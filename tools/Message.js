class Message {

    constructor(message){
        this.discord = message;
        this.content = message.content;
        this.activator = '';
        this.tag = '';
        this.serverID = this.discord.author.id;
        try{
            this.serverID = this.discord.guild.id;
        }catch(err){
            this.content = this.content + ' ~';
        }
    }

    setActivator(cmd){
        this.activator = cmd;
    }

    setTag(tag){
        this.tag = tag;
    }

    get param(){
        return this.select('[',']');
    }

    get string(){
        return this.select('"','"');
    }

    select(begin,end){
        let param = this.content;
        param = param.split(begin);
        param = param[1];
        if(param == null){return null}
        param = param.split(end);
        param = param[0];
        return param;
    }

    get mentions(){
        return this.getMentions();
    }

    getMentions(){
        var userlist = this.discord.mentions.users; // Saving userlist to a variable
        return userlist;
    }

    end(search){
        return this.content.substring(this.content.length - search.length, this.content.length) === search;
    }

    private(){
        return this.end('~');
    }

    answer(txt){
        if(txt != null){
            if(this.private()){
                let msg = txt;
                if(this.serverID != this.discord.author.id){
                    msg = "__Responding to :__ `"+this.discord.content+"`\n\n"+txt;
                }
                this.discord.author.send(msg);
                if(this.serverID != this.discord.author.id){
                    this.discord.channel.send('The message has been sent to you');
                }
            }else{
                this.discord.channel.send(txt);
            }
        }
    }

    startAnswer(){
        this.discord.channel.startTyping();
    }

    stopAnswer(){
        this.discord.channel.stopTyping();
    }

    hasExtra(p = false){
        let activator = this.activator;
        let content = this.content.replace('~','');
        if(p == true){
            activator = this.remove(activator,'[',']').trim();
        }
        if(p == false){
            return (this.tag + activator).length != content.trim().length;
        }
        return (this.tag + activator +' ['+ this.param + ']').length != content.trim().length;
    }

    remove(str,begin,end,finish = false){
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

}

module.exports = Message;