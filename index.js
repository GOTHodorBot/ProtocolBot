//#region ******** REQUIREMENTS & SETUP **********
const Discord = require('discord.js');
const firebase = require('firebase');
const express = require('express');
const bodyParser = require('body-parser')
const os = require('os');
const closeimg = "https://media.giphy.com/media/L464aJ9EO5ziifAMDD/giphy.gif";
const openimg = "https://thumbs.gfycat.com/ElementaryTerrificAmericanalligator-size_restricted.gif";

const client = new Discord.Client();
const myembed = new Discord.RichEmbed();
const app = express();
app.set('view engine','pug');
app.use(express.static(__dirname + '/public'));
var log = console.log;
const arrQueues = ['builder','maester','ships','devout','whisperers','laws','hand','lordcommander','coin']
//K12
const defaultChannel = '584661842677465090'
//MYSERVER
//const defaultChannel = '634021945226166302';
//UBERDRAGON'S SERVER
//const defaultChannel = '636382407712440332';


const evryone = "@everyone" //change this to @everyone to enable the notifications
//JSON Components
const help = require('./help.json')
const auth = require('./auth.json')

const firebaseConfig = {
    apiKey: "AIzaSyCylS1_DgXzSVP4fQ9PYh2v1jO1jtQO5iU",
    authDomain: "protocolbot-560fc.firebaseapp.com",
    databaseURL: "https://protocolbot-560fc.firebaseio.com",
    projectId: "protocolbot-560fc",
    storageBucket: "protocolbot-560fc.appspot.com",
    messagingSenderId: "1032898358298",
    appId: "1:1032898358298:web:e268a44a97f39129"
  };

firebase.initializeApp(firebaseConfig);
var firedb = firebase.firestore();
//#endregion REQUIREMENTS
//#region ************** VARIABLES ***************
var titles_avail = false;
var avail = {
    "builder":false,
    "coin": false,
    "devout": false,
    "hand": false,
    "laws": false,
    "lordcommander":false,
    "maester": false,
    "ships": false,
    "whisperers": false
}

var translate = {
    "builder":"Chief Builder",
    "coin":"Master of Coins",
    "devout":"Most Devout",
    "hand": "Hand of the King",
    "laws":"Master of Laws",
    "lordcommander":"Lord Commander",
    "maester":"Grand Maester",
    "ships":"Master of Ships",
    "whisperers":"Master of Whisperers"
}

let currQueue = {
    "builder": [],
    "maester": [],
    "ships": [],
    "laws" : [],
    "devout": [],
    "whisperers": [],
    "coin": [],
    "lordcommander": [],
    "hand": []
}
//#endregion VARIABLES
//#region ************WEB UI ROUTING *************
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/titles/', (req,res) => {
    res.render('index', {title:'K12 Title Queue'})
})

app.post('/titles/sendmsg', (req,res) => {
    client.channels.get(defaultChannel).send(req.body.msgtosend);
    res.end('{"success" : "Updated Successfully", "status" : 200}');
})

app.get('/titles/status/:onoroff', (req,res) => {
    if(req.params.onoroff == "on") {
        client.channels.get(defaultChannel).send(evryone + " Titles are now **AVAILABLE**! (use `!help`)")
        client.channels.get(defaultChannel).send({embed: {image: {url: openimg}}})
        firedb.collection("settings").doc("general").update({available:true})
    } else if(req.params.onoroff == "off") {
        client.channels.get(defaultChannel).send(evryone + " Titles are now **UNAVAILABLE**!")
        client.channels.get(defaultChannel).send({embed: {image: {url: closeimg}}})
        firedb.collection("settings").doc("general").update({available:false})
    }
    res.end('{"success" : "Updated Successfully", "status" : 200}');
})

//Conferring a Title
app.get('/titles/confer/:recip/title/:titleName', (req,res) => {
    client.channels.get(defaultChannel).send("<@" + req.params.recip + "> : " + translate[req.params.titleName] + " has been conferred.");
    res.end('{"success" : "Updated Successfully", "status" : 200}');
    console.log('Conferred!');
})

app.get('/titles/unconfer/:recip/title/:titleName', (req,res) => {
    client.channels.get(defaultChannel).send("<@" + req.params.recip + "> : " + translate[req.params.titleName] + " has been revoked.");
    res.end('{"success" : "Updated Successfully", "status" : 200}');
    console.log('Revoked!');
})

const server = app.listen(3000, () => {
    log(`Express running → PORT ${server.address().port}`);
})
//#endregion ROUTING
//#region **************** QUEUE *****************
//Show the Queue
function showQueue(msg) {
    currQueue = {
        "builder": [],
        "maester": [],
        "ships": [],
        "laws" : [],
        "devout": [],
        "whisperers": [],
        "coin": [],
        "lordcommander": [],
        "hand": []
    }
    firedb.collection("queue").orderBy("timestamp").get().then(snapshot => {
        if(snapshot.empty) {
          msg.channel.send("The K12 Title Queue is empty.")
          return;  
        }
        snapshot.forEach(doc => {
            currQueue[doc.data().title].push(doc.id)
        })
        console.log(currQueue['builder'].join('\n'))
        let embed = new Discord.RichEmbed()
            .setColor(16767619)
            .setDescription('Use `!help` for more information')
            .setFooter("ProtocolBot by (k12)[FDH]Hodor xD","https://cdn.discordapp.com/app-icons/607018430721425445/3841c888889ac9ae194280b0a9db348d.png")
        if(avail['builder']) {
            embed.addField("Chief Builder", (currQueue['builder'].length > 0) ? currQueue['builder'].join('\n') : '[EMPTY]', true)
        }
        if(avail['maester']) {
            embed.addField("Grand Maester", (currQueue['maester'].length > 0) ? currQueue['maester'].join('\n') : '[EMPTY]', true)
        }
        if(avail['ships']) {
            embed.addField("Master of Ships:", (currQueue['builder'].ships > 0) ? currQueue['builder'].join('\n') : '[EMPTY]', true)
        }
        if(avail['laws']) {
            embed.addField("Master of Laws:", (currQueue['laws'].length > 0) ? currQueue['laws'].join('\n') : '[EMPTY]', true)
        }
        if(avail['devout']) {
            embed.addField("Most Devout:", (currQueue['devout'].length > 0) ? currQueue['devout'].join('\n') : '[EMPTY]', true)
        }
        if(avail['whisperers']) {
            embed.addField("Master of Whisperers:", (currQueue['whisperers'].length > 0) ? currQueue['whisperers'].join('\n') : '[EMPTY]', true)
        }
        if(avail['coin']) {
            embed.addField("Master of Coin:", (currQueue['coin'].length > 0) ? currQueue['coin'].join('\n') : '[EMPTY]', true)
        }
        if(avail['lordcommander']) {
            embed.addField("Lord Commander:", (currQueue['lordcommander'].length > 0) ? currQueue['lordcommander'].join('\n') : '[EMPTY]', true)
        }
        if(avail['hand']) {
            embed.addField("Hand of the King:", (currQueue['hand'].length > 0) ? currQueue['hand'].join('\n') : '[EMPTY]', true)
        }
        msg.channel.send("**K12 Title Queue**", { embed });
    })      
}

//Leave the Queue (!done)
function leaveQueue(msg) {
    firedb.collection('queue').where('playerid','==',msg.author.id).get()
        .then(snapshot => {
            if(snapshot.empty) {
                msg.reply("You aren't in a queue, silly.")
            } else {
                snapshot.forEach(doc=>{
                    firedb.collection("queue").doc(doc.id).delete()
                    msg.reply("Thanks!")
                })
            }
        })
}


//Deleting the Queue
app.get('/delete', (req,res) => {
    let batchSize = 100;
    let collectionRef = firedb.collection("queue");
    let query = collectionRef.orderBy('__name__').limit(batchSize);
    return new Promise((resolve, reject) => {
        deleteQueryBatch(firedb, query, batchSize, resolve, reject);
    });
    res.statusCode = 201;
})

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
          return 0;
        }
  
        // Delete documents in a batch
        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
  
        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }
  
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
      })
      .catch(reject);
  }
//#endregion QUEUES
//#region *************** COMMANDS ***************
//#region MAIN CHAT COMMANDS
client.on('message', msg => {
    /*if (msg.channel.type != 'text' || msg.channel.type != 'dm')  {
        return;
    }
    */
    if (msg.channel.name !== 'kingdom-title-requests') {
        return false;
    }
    if (msg.content.toLowerCase() === "hold the door") {
        msg.channel.send(":door:");
    }
    var command = msg.content.split(" ");
    var params = command.slice(1,command.length).join(" ");
    var secondparams = command.slice(2,command.length).join(" ");
    var thirdparams = command.slice(3,command.length).join(" ");
    switch(command[0].toLowerCase()) {
        //#region EASTER EGGS
        case "hodor?":
            msg.react('🚪');
            break;
        //#endregion
        //#region GENERAL COMMANDS
        case "!help":
            let helpmsg = help.commands.header.join('\n');
            if(avail['builder']) {helpmsg = helpmsg + '\n' + help.commands.builder}
            if(avail['maester']) {helpmsg = helpmsg + '\n' + help.commands.maester}
            if(avail['ships']) {helpmsg = helpmsg + '\n' + help.commands.ships}
            if(avail['whisperers']) {helpmsg = helpmsg + '\n' + help.commands.whisperers}
            helpmsg = helpmsg + '\n' + help.commands.footer.join('\n')
            msg.channel.send(helpmsg);
            break;
        case "!changelog":
        case "!whatsnew":
            msg.channel.send(help.changelog.join('\n'));
            break;
        case "!about":
            msg.channel.send(help.about.join('\n'));
            break;
        case "!version":
            msg.channel.send(help.version.join('\n'));
            break;
        //#endregion
        //#region TITLE COMMANDS
        case "!title":
            if(titles_avail) {
                queueTitle(msg,command[1],secondparams);
            } else {
                msg.reply(":warning: Sorry, Titles are currently unavailable.")
            }
            //queueTitle(msg,command[1])
            break;
        case "!done":
            leaveQueue(msg)
            break;
        case "!queue":
            showQueue(msg)
            break;
        case "!myip":
            var networkInterfaces = os.networkInterfaces()
            let nonLocalInterfaces = {};
            for (let inet in networkInterfaces) {
                let addresses = networkInterfaces[inet];
                for (let i=0; i<addresses.length; i++) {
                    let address = addresses[i];
                    if (!address.internal && address.family == 'IPv4') {
                        if (!nonLocalInterfaces[inet]) {
                            nonLocalInterfaces[inet] = [];
                        }
                        var myip  = address.address;
                    }
                }
            }
            console.log(myip);
            break;
        case "!testopen":
            client.channels.get(defaultChannel).send({embed: {image: {url: openimg}}})
            break;
        case "!testclose":
            client.channels.get(defaultChannel).send({embed: {image: {url: closeimg}}})
        default:
            logChat(msg)
            break;
        //#endregion
    }
});
//#endregion
//#region ***************LOG CHAT*****************
function logChat(msg) {

}
//#endregion
//#region ************TITLE COMMANDS**************
function queueTitle(msg,title,person) { 
    switch(title.toLowerCase()) {
        //#region EasterEgg Titles
        case "king":
        case "queen":
            msg.react('👑');
            break;
        case "imp": //just for Val!
            msg.react('🍷');
            break;
        case "hodor":
            ['🇭','0⃣','🇩','🇴','🇷'].reduce((promise, emoji) => promise.then(() => msg.react(emoji)), Promise.resolve());
            break;
        //#endregion
        case "chiefbuilder":
        case "builder":
        case "cb":
            addToQueue(msg,'builder',person);
            break;
        case "maester":
        case "research":
        case "gm":
            addToQueue(msg,'maester',person);
            break;
        case "ship":
        case "ships":
        case "mos":
            addToQueue(msg,'ships',person);
            break;
        case "mostdevout":
        case "devout":
        case "md":
            addToQueue(msg,'devout',person);
            break;
        case "spy":
        case "masterofwhisperers":
        case "whisper":
        case "whisperer":
        case "whispers":
        case "whisperers":
        case "mow":
            addToQueue(msg,'whisperers',person);
            break;
        case "masteroflaws":
        case "law":
        case "laws":
        case "mol":
            addToQueue(msg,'laws',person);
            break;
        case "hand":
            addToQueue(msg,'hand',person);
            break;
        case "lordcommander":
            addToQueue(msg,'lordcommander',person);
            break;
        case "masterofcoin":
        case "coins":
        case "coin":
        case "moc":
            addToQueue(msg,'coin',person);
            break;
        default:
            console.log(msg.author.avatarURL);    
            msg.reply("Invalid Title Name (try !help)");
            break;
    }
}

function addToQueue(msg,title,person) {
    //Ignore words in Person
    var ignorewords = ["pls","please","ty","thx","thanks","thank you"]
    isignored = (ignorewords.includes(person,0)) ? person = "" : person = person;
    //Check if Already in the Queue
    firedb.collection('queue').where('playerid','==',msg.author.id).get()
        .then(snapshot => {
            if(snapshot.empty) {
                //Not in the Queue
                let playername = ''
                if(!person || person.length == 0){
                    playername = msg.member.displayName;
                } else {
                    playername = person;
                }
                if(avail[title.toLowerCase()]) {
                    let stamp = new Date().getTime();
                    console.log("Time:"+ stamp);
                    let queue = firedb.collection('queue').doc(playername);
                    let meta = queue.set({
                        title: title.toLowerCase(),
                        timestamp: stamp,
                        playerid: msg.author.id,
                        conferred: false
                    })
                    msg.reply(playername + " added to the " + translate[title.toLowerCase()] +" queue.")
                } else {
                    msg.reply(":warning: Sorry, the `" + translate[title.toLowerCase()] + "` title is currently unavailable.")
                }
                return;
            } else {
                snapshot.forEach(doc=>{
                    msg.reply(":warning: You are already in the " + translate[doc.data().title.toLowerCase()] + " queue (" + doc.id + "). Type `!queue` to see the queue or `!done` if you wish to be removed.");
                })
                //Is in the Queue
                
                return;
            }
        })    
}
//#endregion TITLE COMMANDS
//#endregion COMMANDS
//#region *************** SETTINGS ***************
//SETTINGS HANDLER
function getSettings() {
    firedb.collection("settings").doc("general").get().then(results => {
        titles_avail = results.data().available;
    });
    firedb.collection("settings").doc("titleavailable").get().then(results => {
        avail["builder"] = results.data().builder;
        avail["coin"] = results.data().coin;
        avail["devout"] = results.data().devout;
        avail["hand"] = results.data().hand;
        avail["laws"] = results.data().laws;
        avail["lordcommander"] = results.data().lordcommander;
        avail["maester"] = results.data().maester;
        avail["ships"] = results.data().ships;
        avail["whisperers"] = results.data().whisperers;
    })
}

//SETTINGS LISTENER
firedb.collection("settings")
    .onSnapshot({includeMetadataChanges: true},function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if(change.type === "modified") {
                getSettings();
            }
        })
    })
//#endregion SETTINGS

//PROTOCOLBOT ONLINE
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('#' + defaultChannel +' | use !help', { type: 'WATCHING' });
    client.users.get("386200837896011776").send("Awaiting Commands");
    getSettings();
    /*setTimeout((function() {
        client.guilds.forEach(guild => {
            guild.channels.find(t => t.name == 'general').send('ProtocolBot is now online.');
        })
    }), 5000);
    */
});

client.login(auth.token);