var active = false;
$(document).ready(function(){
    $('.sidenav').sidenav();
    $('.modal').modal();
    $('.fixed-action-btn').floatingActionButton();
    getSettings();
});

firebase.initializeApp({
    apiKey: "AIzaSyCylS1_DgXzSVP4fQ9PYh2v1jO1jtQO5iU",
    authDomain: "protocolbot-560fc.firebaseapp.com",
    databaseURL: "https://protocolbot-560fc.firebaseio.com",
    projectId: "protocolbot-560fc",
    storageBucket: "protocolbot-560fc.appspot.com",
    messagingSenderId: "1032898358298",
    appId: "1:1032898358298:web:e268a44a97f39129"
  });
var db = firebase.firestore();
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
var conferred = {
    "builder":"",
    "coin":"",
    "devout":"",
    "hand": "",
    "laws":"",
    "lordcommander":"",
    "maester":"",
    "ships":"",
    "whisperers":""
}

//CLICK HANDLERS
$("button#clearQueue").on('click', function(event) {
    M.toast({html:'Deleting the Queue'});
    $.get("/titles/delete")
        .done(function() {
            M.toast({html:'Queue(s) deleted!'})
        })
        .fail(function() {
            M.toast({html:'Could not delete Queue!'})
        })
    return false;
})

function copyToClipboard(el) {
    var text = $(el).contents().get(0).nodeValue
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    M.toast({html:"Copied to Clipboard!"})
}
//ACTIVATION
$("button#activatebtn").click(function() {
    if(active) {
        $("span#availability").text("TITLES: OFF");
        $("button#activatebtn").removeClass("green pulse").addClass("red");
        active = false;
        $.get("/titles/status/off");
        M.toast({html: "Titles are now UNAVAILABLE!"})
    } else {
        $("span#availability").text("TITLES: ON");
        $("button#activatebtn").removeClass("red").addClass("green pulse");
        $.get("/titles/status/on")
        active = true;
        M.toast({html: "Titles are now AVAILABLE!"})
    }
})

//#region SETTINGS
//Handle Settings
$("input#chkBuilder").change(function() {chgSettings("builder",$("input#chkBuilder").prop("checked"),this)})
$("input#chkMaester").change(function() {chgSettings("maester",$("input#chkMaester").prop("checked"),this)})
$("input#chkShips").change(function() {chgSettings("ships",$("input#chkShips").prop("checked"),this)})
$("input#chkLaws").change(function() {chgSettings("laws",$("input#chkLaws").prop("checked"),this)})
$("input#chkDevout").change(function() {chgSettings("devout",$("input#chkDevout").prop("checked"),this)})
$("input#chkWhisperers").change(function() {chgSettings("whisperers",$("input#chkWhisperers").prop("checked"),this)})
$("input#chkCommander").change(function() {chgSettings("lordcommander",$("input#chkCommander").prop("checked"),this)})
$("input#chkCoin").change(function() {chgSettings("coin",$("input#chkCoin").prop("checked"),this)})
$("input#chkHand").change(function() {chgSettings("hand",$("input#chkHand").prop("checked"),this)})


//Get Settings
function getSettings() {
    let settings = db.collection("settings").doc("titleavailable");
    settings.get().then(function(doc) {
        if(doc.exists) {
            var chkBuilder = (doc.data().builder) ? ($("input#chkBuilder").prop("checked",true),$("ul#builder_queue").show()) : $("ul#builder_queue").hide();
            var chkMaester =(doc.data().maester) ? ($("input#chkMaester").prop("checked",true),$("ul#maester_queue").show()) : $("ul#maester_queue").hide();
            var chkShips = (doc.data().ships) ? ($("input#chkShips").prop("checked",true),$("ul#ships_queue").show() ): $("ul#ships_queue").hide();
            var chkLaws = (doc.data().laws) ? ($("input#chkLaws").prop("checked",true),$("ul#laws_queue").show() ): $("ul#laws_queue").hide();
            var chkDevout = (doc.data().devout) ? ($("input#chkDevout").prop("checked",true),$("ul#devout_queue").show() ): $("ul#devout_queue").hide();
            var chkWhisperers = (doc.data().whisperers) ? ($("input#chkWhisperers").prop("checked",true),$("ul#whisperers_queue").show() ): $("ul#whisperers_queue").hide();
            var chkCommander = (doc.data().lordcommander) ? ($("input#chkCommander").prop("checked",true),$("ul#lordcommander_queue").show() ): $("ul#lordcommander_queue").hide();
            var chkCoin = (doc.data().coin) ? ($("input#chkCoin").prop("checked",true),$("ul#coin_queue").show() ): $("ul#coin_queue").hide();
            var chkHand = (doc.data().hand) ? ($("input#chkHand").prop("checked",true),$("ul#hand_queue").show() ): $("ul#hand_queue").hide();
        } else {
            alert("Settings not found!")
        }
    })
    let gensettings = db.collection("settings").doc("general");
    gensettings.get().then(function(doc) {
        if(doc.exists) {
            active = doc.data().available;
            if(active) {
                $("span#availability").text("TITLES: ON");
                $("button#activatebtn").removeClass("red").addClass("green pulse");
            } else {
                $("span#availability").text("TITLES: OFF");
                $("button#activatebtn").removeClass("green pulse").addClass("red");
            }            
        } else {
            alert("Settings not found!")
        }
    })
}

//Change Settings
function chgSettings(setting,val,el) {
    var updsetting = {}
    updsetting[setting] = val;
    return db.collection("settings").doc("titleavailable").update(updsetting)
      .then(function() {
        if(val == true) {
            $("ul#" + setting + "_queue").show()
        } else {
            $("ul#" + setting + "_queue").hide()
        }
        M.toast({html: "Settings changed!"})
    })
}
//#endregion SETTINGS

//Confer Title
function confer(el,title) {
    if(conferred[title].length === 0) {
        var pid = $(el).attr("data-ng");//Send a Message to this
        var pnm = $("span[data-ng='" + pid + "'").contents().get(0).nodeValue
        console.log(pnm)
        let qry = db.collection("queue").doc(pnm);
        qry.get().then(function(doc){
            qry.update({conferred: true});
            conferred[doc.data().title] = pnm;
            $.get("/titles/confer/" + pid + "/title/" + doc.data().title)
        });
        M.toast({html: "Title Conferred!"})
    } else {
        M.toast({html:'You must revoke/delete the current title'})
    }
    return false;
}

//UnConfer Title
function unconfer(el) {
    var pid = $(el).attr("data-ng");
    var pnm = $("span[data-ng='" + pid + "'").contents().get(0).nodeValue;
    let qry = db.collection("queue").doc(pnm);
    qry.get().then(function(doc){
        qry.update({conferred:false})
        conferred[doc.data().title] = "";
        $.get("/titles/unconfer/" + pid + "/title/" + doc.data().title)
    });
    M.toast({html: "Title revoked!"})
    return false;
}

function delqueue(el) {
    var pid = $(el).attr("data-ng");
    var pnm = $("span[data-ng='" + pid + "'").contents().get(0).nodeValue;
    console.log()
    let qry = db.collection("queue").doc(pnm);
    let keys = Object.keys(conferred)
    for(const key of keys) {
        if(conferred[key] == pnm) {
            conferred[key] = ''
        }
    }
    M.toast({html: pnm + " removed from the queue!"})
    qry.delete()
}

//SEND A MESSAGE (from UI)
$("#msgForm").submit(function() {return false})
$('#comMessage').keyup(function(e){
    if(e.keyCode === 13) {
        $.post("/titles/sendmsg",{msgtosend:$("#comMessage").val()},function(data) {
            if(data==='done') {
                //Confirm the Message was sent
            }
        })
        $("#comMessage").val('');
        M.toast({html:'Message sent!'});
        return false;
    }
})

//QUEUE LISTENER
db.collection("queue").orderBy('timestamp')
    .onSnapshot({includeMetadataChanges: true},function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if(change.type === "added") {
                var pname = change.doc.id;
                var pid = change.doc.data().playerid;
                var ptitle = change.doc.data().title;
                $("ul#" + ptitle + "_queue").append('<li class="collection-item" data-ng="' + pid + '"><div><span data-ng="'+ pid +'" onclick="copyToClipboard(this)" class="linked">' + pname + '</span><a href="#!" class="secondary-content delqueue" data-ng="'+ pid + '" onclick="delqueue(this);"><i class="material-icons">highlight_off</i></a>')
                if(change.doc.data().conferred) {
                    conferred[ptitle] = pname;
                    $("li[data-ng='"+pid+"'] > div > a.confer").remove();
                    $("li[data-ng='"+pid+"'] > div").prepend('<a href="#" class="secondary-content unconfer left" data-ng="'+pid+'" onclick="unconfer(this);"><i class="material-icons">done_outline</i></span>');
                } else {
                    $("li[data-ng='"+pid+"'] > div > a.unconfer").remove();
                    $("li[data-ng='"+pid+"'] > div").prepend('<a href="#" class="secondary-content confer left" data-ng="'+pid+'" onclick="confer(this,\'' + ptitle + '\');"><i class="material-icons">add_box</i></span>');
                }
            }
            if(change.type === "modified") {
                //Change Queue List
                var pname = change.doc.id;
                var pid = change.doc.data().playerid;
                var ptitle = change.doc.data().title;
                $("li[data-ng='"+pid+"']").remove();
                $("ul#" + ptitle + "_queue").append('<li class="collection-item" data-ng="' + pid + '"><div><span data-ng="'+ pid +'" onclick="copyToClipboard(this)" class="linked">' + pname + '</span><a href="#!" class="secondary-content" data-ng="'+ pid + '" onclick="delqueue(this);"><i class="material-icons">highlight_off</i></a>')
                if(change.doc.data().conferred) {
                    conferred[ptitle] = pname;
                    console.log("Changing a Conferred")
                    $("li[data-ng='"+pid+"'] > div > a.confer").remove();
                    $("li[data-ng='"+pid+"'] > div").prepend('<a href="#" class="secondary-content unconfer left" data-ng="'+pid+'" onclick="unconfer(this);"><i class="material-icons">done_outline</i></span>');
                } else {
                    console.log("Changing a non-Conferred")
                    $("li[data-ng='"+pid+"'] > div > a.unconfer").remove();
                    $("li[data-ng='"+pid+"'] > div").prepend('<a href="#" class="secondary-content confer left" data-ng="'+pid+'" onclick="confer(this,\'' + ptitle + '\');"><i class="material-icons">add_box</i></span>');
                }
            }
            if(change.type === "removed") {
                //Remove from Queue
                var pid = change.doc.data().playerid;
                if(change.doc.data().conferred) {
                    conferred[change.doc.data().title] = "";
                }
                console.log("Deleting:" + pid)
                $("li[data-ng='"+pid+"']").remove();
            } else {}
        })
    })
