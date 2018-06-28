var firebase = require("firebase");

class DB {

    constructor(config = false){
        if(config == false){
            config = {
                apiKey: process.env.API_KEY,
                authDomain: process.env.AUTH_DOMAIN,
                databaseURL: process.env.DATABASE_URL,
                projectId: process.env.PROJECT_ID,
                storageBucket: "",
                messagingSenderId: process.env.MESSAGING_SENDER_ID
            };
        }
        firebase.initializeApp(config);
        let database = firebase.database();
        this.database = database;
        this.serverID = 0;
        this.responseTime = 1500;
    }

    setServerId(nbr){
        this.serverID = nbr;
    }

    mistake(error = false){
        if (error) {
            return false;
        } else {
            return true;
        }
    }

    setCurrentTaskId(nbr = 0){
        return this.database.ref(this.serverID+'/current_task_id').set(nbr, function(error) {
            if (error) {
                return false;
            } else {
                return true;
            }
        });
    }

    updateCurrentTaskId(current_id){
        this.from('current_task_id').set(parseInt(current_id) + 1, function(error) {
            if (error) {
                console.log(error);
                return false;
            } else {
                return true;
            }
        });
    }

    CurrentTaskId(){
        var starCountRef = this.database.ref(this.serverID+'/current_task_id');
        let current_id = 0;
        starCountRef.on('value', function(snapshot) {
            return snapshot.val();
        });
        if(current_id == null){
            this.setCurrentTaskId(0);
            current_id = 0;
        }
        return current_id;
    }

    newTask(args){
        let d = this;
        setTimeout(function(){
            return d.database.ref(d.serverID+'/tasks/' + args.language).push({
                content: args.content,
                language: args.language,
                id: args.id,
                owner_id : null
            }, function(error) {
                if (error) {
                    return false;
                } else {
                    d.updateCurrentTaskId(args.id);
                    return true;
                }
            });
        },this.responseTime);
    }

    newConstant(args){
        this.from('constants').push(args);
    }

    setTaskOwner(id,task,index){
        var d = new Date();
        task.begin = d.getTime();
        task.owner_id = id;
        this.from('/tasks/'+task.language+'/'+index).set(task);
    }

    removeTaskOwner(id,task,index){
        task.owner_id = null;
        this.from('/tasks/'+task.language+'/'+index).set(task);
    }

    removeTask(task,index){
        this.from('/tasks/'+task.language+'/'+index).set(null);
    }

    removeConstant(index){
        this.from('/constants/'+index).set(null);
    }

    addLanguage(name){
        return this.database.ref(this.serverID+'/languages').push(name, function(error){
            if (error) {
                return false;
            } else {
                return true;
            }
        });
    }

    removeLanguage(name,languages){
        var index = languages.indexOf(name);
        if (index !== -1) languages.splice(index, 1);
        this.from('/languages').set(languages);
    }

    get languages(){

        var ref = this.database.ref(this.serverID+'/languages');
        var array = [];
        ref.on('child_added',function(data) {
            array.push(data.val());
        });
        setTimeout(function(){
            return array;
        },2000);
        return array;

    }

    getLanguages(){
        
        var ref = this.database.ref(this.serverID+'/languages');
        var array = [];
        ref.on('child_added',function(data) {
            array.push(data.val());
        });
        setTimeout(function(){
            console.log('1 : ' + array);
            return array;
        },10000);

    }

    from(str){
        return this.database.ref(this.serverID+'/'+str);
    }

}

module.exports = DB;