let messageBtn = document.getElementById("sendMessage");
let messageInput = document.getElementById("message");
let chat = document.getElementById("chat");
let users = document.getElementById("users");
let messageId = document.getElementById("messageId");
let updateSend = document.getElementById("updateSend");
let updateDecline = document.getElementById("updateDecline");
let idInput = document.getElementById("messageId");

class Message {

    static setPrimus(id, type) {
        let that = this;
        let message = messageInput.value;
        let cookie = new Cookie();
        let user = Cookie.getCookie("username");

        this.primus = Primus.connect('/', {
            reconnect: {
                 max: Infinity // Number: The max delay before we try to reconnect.
                , min: 500 // Number: The minimum delay before we try reconnect.
                , retries: 10 // Number: How many times we should try to reconnect.
            }
        });

        that.primus.write({
            "user": user,
            "message": message,
            "id": id,
            "type": type
        });

        messageInput.value = "";
    }

    createMessage() {
        let message = messageInput.value;
        let user = Cookie.getCookie("username");
        let id;

        let url = "./api/v1/messages";
        let data = {text: message, user: user};
        
        fetch(url,{
            method:'post',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => {
            return response.json();
        }).then(json => {
            id = json.id;
            Message.setPrimus(id, "create");
        }).catch(err => {
            console.log(err);
        });
    }

    getMessages() {
        let url = "./api/v1/messages";
        
        fetch(url,{
            method:'get',
            headers: {
                "Content-type": "application/json"
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            let i = 0;
            let timeStamp = new Array();
            json.message.forEach(element => {
                timeStamp.push(this.getTime(element.timestamp));

                if (timeStamp.length >= 2) {
                    let j = i - 1;
                    let difference = timeStamp[i] - timeStamp[j];
                    if (difference >= 216000*5) {
                        chat.innerHTML += `<div class="message__date"><span class="message__date--text">${element.timestamp}</span></div>`;
                    }
                }

                if (Cookie.getCookie("username") == element.user) {
                    chat.innerHTML += `<div class="message" onclick="changeMessage(this)" data-id="${element._id}">${element.text}</div>`;
                } else {
                    chat.innerHTML += `<div class="message message--red" data-id="${element._id}"><span class="message__user">${element.user}: </span>${element.text}</div>`;
                }

                i++;
            });
            chat.scrollTop = chat.scrollHeight;
        }).catch(err => {
            console.log(err);
        });
    }

    updateMessage() {
        let id = idInput.value;
        let message = messageInput.value;

        let url = `./api/v1/messages/${id}`;
        let data = {text: message};
        
        fetch(url,{
            method:'put',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => {
            return response.json();
        }).then(json => {
            Message.setPrimus(id, "update");
            addMessage();
        }).catch(err => {
            console.log(err);
        });
    }

    getTime(timestamp) {
        let dateString = timestamp;
        let dateTimeParts = dateString.split(' ');
        let timeParts = dateTimeParts[1].split(':');
        let dateParts = dateTimeParts[0].split('/');
        let date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);

        return date.getTime();
    }
}

class User {
    setPrimus(username) {
        let that = this;

        this.primus = Primus.connect('/', {
            reconnect: {
                 max: Infinity // Number: The max delay before we try to reconnect.
                , min: 500 // Number: The minimum delay before we try reconnect.
                , retries: 10 // Number: How many times we should try to reconnect.
            }
        });

        that.primus.write({
            "username": username
        });
    }

    getUsers() {
        let url = "./api/v1/user";
        
        fetch(url,{
            method:'get',
            headers: {
                "Content-type": "application/json"
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            json.message.forEach(element => {
                users.innerHTML += `<li class="user"><div class="user--center"><div class="user__picture"></div><span class="user__name">${element.username}</span><span class="user_status">Online</span></div></li>`
            });
        }).catch(err => {
            console.log(err);
        });
    }
}

class Cookie {
    static setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    static getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
}

if (Cookie.getCookie("username") == null) {
    location.href = 'index.html';
}

let m = new Message();
m.getMessages();
let u = new User();
u.getUsers();

messageBtn.addEventListener('click', e => {
    if (message.value != "") {
        let m = new Message();
        m.createMessage();
    }

    e.preventDefault();
});

messageInput.addEventListener('keypress', e => {
    if (e.keyCode == 13 && message.value != "") {
        let m = new Message();
        m.createMessage(this);

        e.preventDefault();
    }
});

let primus = Primus.connect('/', {
    reconnect: {
        max: Infinity // Number: The max delay before we try to reconnect.
        , min: 500 // Number: The minimum delay before we try reconnect.
        , retries: 10 // Number: How many times we should try to reconnect.
    }
});

primus.on("data", (data)=>{
    if (data.username != null) {
        users.innerHTML += `<li class="user"><div class="user--center"><div class="user__picture"></div><span class="user__name">${data.username}</span><span class="user_status">Online</span></div></li>`;
    } else {
        if (data.type == "create") {
            if (Cookie.getCookie("username") == data.user) {
                chat.innerHTML += `<div class="message" onclick="changeMessage(this)" data-id="${data.id}">${data.message}</div>`;
            } else {
                chat.innerHTML += `<div class="message message--red" data-id="${data.id}"><span class="message__user">${data.user}: </span>${data.message}</div>`;
            }
        } else if (data.type == "update") {
            let element = document.querySelector(`[data-id="${data.id}"]`);
            if(Cookie.getCookie("username") == data.user){
                element.innerHTML = data.message;
            }else{
                element.innerHTML = `<span class="message__user">${data.user}: </span> ${data.message}`;
            }
            
        }
    }
});

function changeMessage(element) {
    messageBtn.style.display = "none";
    updateDecline.style.display = "inline-block";
    updateSend.style.display = "inline-block";
    let message = element.innerHTML;
    messageInput.value = message;
    let id = element.getAttribute("data-id");
    messageId.value = id;
    element.classList.add('message--selected');
}

updateDecline.addEventListener('click', e => {
    addMessage();
    e.preventDefault();
});

updateSend.addEventListener('click', e => {
    let m = new Message();
    m.updateMessage();
    e.preventDefault();
});

function addMessage() {
    messageBtn.style.display = "inline-block";
    updateDecline.style.display = "none";
    updateSend.style.display = "none";
    messageInput.value = "";
    messageId.value = "";
}