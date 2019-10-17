$('#passLogin').keyup(function(e){
    if(e.keyCode === 13) {
        $.post("/titles/sendmsg",{msgtosend:$("#comMessage").val()},function(data) {
            if(data==='done') {
                //Confirm the Message was sent
            }
        })
        $("#comMessage").val('');
        M.toast({html:'Message sent!'});
    }
})