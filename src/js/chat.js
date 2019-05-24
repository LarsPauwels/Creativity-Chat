let dayArray = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
let monthArray = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];

let messageBtn = document.getElementById("sendMessage");
let messageInput = document.getElementById("message");
let chat = document.getElementById("chat");
let users = document.getElementById("users");
let messageId = document.getElementById("messageId");
let updateSend = document.getElementById("updateSend");
let updateDecline = document.getElementById("updateDecline");
let idInput = document.getElementById("messageId");
let logout = document.getElementById("logout");

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
            Message.setPrimus(id, "createMessage");
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

                if (element.device == "beamer" && Cookie.getCookie("username") == "admin"
                    || element.device == "computer" && Cookie.getCookie("username") == element.requester) {
                    chat.innerHTML += `<div class="message message--red" data-id="${element._id}"><span class="message__user">${element.user}: </span>${element.text}</div>`;
            } else if (element.device == undefined) {
                if (Cookie.getCookie("username") == element.user) {
                    chat.innerHTML += `<div class="message--right"><span class="message__delete fa fa-trash" onclick="removeMessage()"></span><div class="message" onclick="changeMessage(this)" data-id="${element._id}">${element.text}</div><div>`;
                } else {
                    chat.innerHTML += `<div class="message message--red" data-id="${element._id}"><span class="message__user">${element.user}: </span>${element.text}</div>`;
                }
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
            Message.setPrimus(id, "updateMessage");
            addMessage();
        }).catch(err => {
            console.log(err);
        });
    }

    deleteMessage() {
        let id = idInput.value;
        let url = `./api/v1/messages/${id}`;
        
        fetch(url,{
            method:'delete',
            headers: {
                "Content-type": "application/json"
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            Message.setPrimus(id, "deleteMessage");
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

class IMDBot {
    static setPrimus(id, type, user, message, device, requester) {
        let that = this;

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
            "type": type,
            "device": device,
            "requester": requester
        });
    }

    botRequest() {
        let requester = Cookie.getCookie("username");
        let messageText = message.value.replace('@IMDBot','');
        let url = `https://api.wit.ai/message?v=20190518&q=${messageText}`;

        fetch(url,{
            method:'get',
            headers: {
                'Authorization': 'Bearer LDAHTGYL7ZM3Y636JBPSA5XTXYVYHEVA', 
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            IMDBot.checkIntent(json, requester);
        }).catch(err => {
            console.log(err);
        });
    }

    static checkIntent(json, requester) {
        let device;

        if(json.entities.device != undefined) {
            device = json.entities.device[0].value;
        } else {
            device = "computer";
        }

        switch (json.entities.intent[0].value) {
            case "play_clip":
                IMDBot.youtubeRequest(json, device, requester);
            break;
            case "get_weather":
                let date = json.entities.datetime[0].value;
                IMDBot.getMyLocation(date, device, requester);
        }
    }

    static youtubeRequest(json, device, requester) {
        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&order=rating&q=${json.entities.query[0].value}&type=video&videoEmbeddable=true&key=AIzaSyCq26SiNiH7Qcec_xKTF5NB06VBdvteFE0`;

        fetch(url,{
            method:'get'
        }).then(response => {
            return response.json();
        }).then(json => {
            let text = `Enjoy your video ${requester}!`;
            let iframe = `<iframe class="message__iframe" width="560" height="315" src="https://www.youtube.com/embed/${json.items[0].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            let messageIframe = text + iframe;
            IMDBot.createMessage(messageIframe, device, requester);
        }).catch(err => {
            console.log(err);
        });
    }

    static getMyLocation(date, device, requester) {
        navigator.geolocation.getCurrentPosition(position => {
            let lat = position.coords.latitude;
            let long = position.coords.longitude;
            IMDBot.weatherRequest(lat, long, date, device, requester);
        }, err => {
            console.log("Location: " + err);
        });

        return location;
    }

    static weatherRequest(lat, long, date, device, requester) {
        let timestamp = date.split("T");
        let day = new Date(timestamp).getDay();
        let dayNumber = new Date(timestamp).getDate();
        let month = new Date(timestamp).getMonth();
        let unix = new Date(timestamp[0]).getTime() / 1000;
        let url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/c0c83edd4a137df284ba6175ae9976af/${lat}, ${long}, ${unix}?units=si`;

        fetch(url,{
            method:'get'
        }).then(response => {
            return response.json();
        }).then(json => {
            let message = `${dayArray[day]}, ${dayNumber} ${monthArray[month]} zal het '${json.currently.summary}' zijn met een temperatuur van ${json.currently.temperature}°C.`;
            IMDBot.createMessage(message, device, requester);
        }).catch(err => {
            console.log(err);
        });
    }

    static createMessage(message, device, requester) {
        let user = "IMDBot";
        let id;

        let url = "./api/v1/messages";
        let data = {text: message, user: user, device: device, requester: requester};
        
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
            IMDBot.setPrimus(id, "createMessageBot", user, message, device, requester);
        }).catch(err => {
            console.log(err);
        });
    }
}

class User {
    static setPrimus(user, status, type) {
        let that = this;

        this.primus = Primus.connect('/', {
            reconnect: {
                 max: Infinity // Number: The max delay before we try to reconnect.
                , min: 500 // Number: The minimum delay before we try reconnect.
                , retries: 10 // Number: How many times we should try to reconnect.
            }
        });

        that.primus.write({
            "user": user,
            "type": type,
            "status": status
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
                if (element.active == 1) {
                    users.innerHTML += `<li class="user" data-user="${element.username}"><div class="user--center"><div class="user__picture"></div><span class="user__name">${element.username}</span><span class="user__status">Online</span></div></li>`
                } else {
                    users.innerHTML += `<li class="user" data-user="${element.username}"><div class="user--center"><div class="user__picture"></div><span class="user__name">${element.username}</span><span class="user__status user__status--red">Online</span></div></li>`
                }
            });
        }).catch(err => {
            console.log(err);
        });
    }

    logout() {
        let username = Cookie.getCookie("username");
        let url = `./api/v1/user?user=${username}`;
        
        fetch(url,{
            method:'put',
            headers: {
                "Content-type": "application/json"
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            if (json.status == "success" && username != null) {
                User.setPrimus(username, "Offline", "userStatus");
            }
        }).catch(err => {
            console.log(err);
        });
    }

    login() {
        let username = Cookie.getCookie("username");
        let url = `./api/v1/user?user=${username}`;

        fetch(url,{
            method:'get',
            headers: {
                "Content-type": "application/json"
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            if (json.status == "error") {
                Cookie.deleteCookie("username");
                location.href = 'index.html';
            } else {
                User.setPrimus(username, "Online", "userStatus");
            }
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

    static deleteCookie(name) {   
        document.cookie = name+'=; Max-Age=-99999999;';  
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
    messagePlaced();
    e.preventDefault();
});

messageInput.addEventListener('keypress', e => {
    if (e.keyCode == 13) {
        messagePlaced();
        e.preventDefault();
    }
});

logout.addEventListener('click', e => {
    let u = new User();
    u.logout();
    e.preventDefault();
});

window.onbeforeunload = () => {
    let u = new User();
    u.logout();
};

window.onload = () => {
    let u = new User();
    u.login();
}

function messagePlaced() {
    let messageValue = message.value;
    if (messageValue != "") {
        let botCommant = messageValue.search("@IMDBot");
        if (botCommant != -1) {
            let b = new IMDBot();
            b.botRequest();
        }
        let m = new Message();
        m.createMessage();
    }
}

let primus = Primus.connect('/', {
    reconnect: {
        max: Infinity // Number: The max delay before we try to reconnect.
        , min: 500 // Number: The minimum delay before we try reconnect.
        , retries: 10 // Number: How many times we should try to reconnect.
    }
});

primus.on("data", (data)=>{
    let element;

    switch (data.type) {
        case "addUser":
            users.innerHTML += `<li class="user" data-user="${data.username}"><div class="user--center"><div class="user__picture"></div><span class="user__name">${data.username}</span><span class="user__status">Online</span></div></li>`;
            break;
        case "createMessage":
            if (Cookie.getCookie("username") == data.user) {
                chat.insertAdjacentHTML("beforeend", `<div class="message--right"><span class="message__delete fa fa-trash" onclick="removeMessage()"></span><div class="message" onclick="changeMessage(this)" data-id="${data.id}">${data.message}</div></div>`);
            } else {
                chat.insertAdjacentHTML("beforeend", `<div class="message message--red" data-id="${data.id}"><span class="message__user">${data.user}: </span>${data.message}</div>`);
            }
        break;
        case "updateMessage":
            element = document.querySelector(`[data-id="${data.id}"]`);
            if(Cookie.getCookie("username") == data.user){
                element.innerHTML = data.message;
            }else{
                element.innerHTML = `<span class="message__user">${data.user}: </span> ${data.message}`;
            }
        break;
        case "deleteMessage":
            element = document.querySelector(`[data-id="${data.id}"]`);
            element.parentElement.removeChild(element);
            break;
        case "createMessageBot":
            if (data.device == "computer" && Cookie.getCookie("username") == data.requester 
                || data.device == "beamer" && Cookie.getCookie("username") == "admin") {
                let lastElment;
                let iframes = document.querySelectorAll("iframe").forEach(element => {
                    let src = element.getAttribute("src");
                    if (src.includes("?autoplay=1")) {
                        let split = src.split("?");
                        element.setAttribute("src", split[0]);
                        lastElment = element;
                    }
                });

                chat.insertAdjacentHTML("beforeend", `<div class="message message--red" data-id="${data.id}"><span class="message__user">${data.user}: </span>${data.message}</div>`);

                if(document.querySelector(`[data-id="${data.id}"]`) == undefined) {
                    let iframe = document.querySelector(`[data-id="${data.id}"]`).lastChild;

                    if (lastElment != iframe) {
                        let iframeSrc = iframe.getAttribute("src") + "?autoplay=1";
                        iframe.setAttribute("src", iframeSrc);
                    }
                }
            }
            break;
        case "userStatus":
            element = document.querySelector(`[data-user="${data.user}"]`);
            let userStatus = element.children[0].children[2];
            userStatus.innerHTML = data.status;
            if (data.status == "Online") {
                userStatus.classList.remove("user__status--red");
            } else {
                userStatus.classList.add("user__status--red");
                Cookie.deleteCookie("username");
            location.href = 'index.html';
            }
            break;
    }
    chat.scrollTop = chat.scrollHeight;
});

function changeMessage(element) {
    messageBtn.style.display = "none";
    updateDecline.style.display = "inline-block";
    updateSend.style.display = "inline-block";
    let message = element.innerHTML;
    messageInput.value = message;
    let id = element.getAttribute("data-id");
    messageId.value = id;
    element.previousSibling.style.display = "inline-block";
}

function removeMessage() {
    let m = new Message();
    m.deleteMessage();
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

function addMessage(element) {
    let message = document.querySelector(`[data-id="${messageId.value}"]`);

    messageBtn.style.display = "inline-block";
    updateDecline.style.display = "none";
    updateSend.style.display = "none";
    message.previousSibling.style.display = "none";
    messageInput.value = "";
    messageId.value = "";
}