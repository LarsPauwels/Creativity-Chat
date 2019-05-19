"use strict";var _this2=void 0;function _classCallCheck(e,s){if(!(e instanceof s))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,s){for(var t=0;t<s.length;t++){var n=s[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,s,t){return s&&_defineProperties(e.prototype,s),t&&_defineProperties(e,t),e}var messageBtn=document.getElementById("sendMessage"),messageInput=document.getElementById("message"),chat=document.getElementById("chat"),users=document.getElementById("users"),messageId=document.getElementById("messageId"),updateSend=document.getElementById("updateSend"),updateDecline=document.getElementById("updateDecline"),idInput=document.getElementById("messageId"),Message=function(){function a(){_classCallCheck(this,a)}return _createClass(a,[{key:"createMessage",value:function(){var s,e={text:messageInput.value,user:Cookie.getCookie("username")};fetch("./api/v1/messages",{method:"post",headers:{"Content-type":"application/json"},body:JSON.stringify(e)}).then(function(e){return e.json()}).then(function(e){s=e.id,a.setPrimus(s,"create")}).catch(function(e){console.log(e)})}},{key:"getMessages",value:function(){var a=this;fetch("./api/v1/messages",{method:"get",headers:{"Content-type":"application/json"}}).then(function(e){return e.json()}).then(function(e){var t=0,n=new Array;e.message.forEach(function(e){if(n.push(a.getTime(e.timestamp)),2<=n.length){var s=t-1;108e4<=n[t]-n[s]&&(chat.innerHTML+='<div class="message__date"><span class="message__date--text">'.concat(e.timestamp,"</span></div>"))}Cookie.getCookie("username")==e.user?chat.innerHTML+='<div class="message" onclick="changeMessage(this)" data-id="'.concat(e._id,'">').concat(e.text,"</div>"):chat.innerHTML+='<div class="message message--red" data-id="'.concat(e._id,'"><span class="message__user">').concat(e.user,": </span>").concat(e.text,"</div>"),t++}),chat.scrollTop=chat.scrollHeight}).catch(function(e){console.log(e)})}},{key:"updateMessage",value:function(){var s=idInput.value,e=messageInput.value,t="./api/v1/messages/".concat(s),n={text:e};fetch(t,{method:"put",headers:{"Content-type":"application/json"},body:JSON.stringify(n)}).then(function(e){return e.json()}).then(function(e){a.setPrimus(s,"update"),addMessage()}).catch(function(e){console.log(e)})}},{key:"getTime",value:function(e){var s=e.split(" "),t=s[1].split(":"),n=s[0].split("/");return new Date(n[2],parseInt(n[1],10)-1,n[0],t[0],t[1]).getTime()}}],[{key:"setPrimus",value:function(e,s){var t=messageInput.value,n=(new Cookie,Cookie.getCookie("username"));this.primus=Primus.connect("/",{reconnect:{max:1/0,min:500,retries:10}}),this.primus.write({user:n,message:t,id:e,type:s}),messageInput.value=""}}]),a}(),User=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"setPrimus",value:function(e){this.primus=Primus.connect("/",{reconnect:{max:1/0,min:500,retries:10}}),this.primus.write({username:e})}},{key:"getUsers",value:function(){fetch("./api/v1/user",{method:"get",headers:{"Content-type":"application/json"}}).then(function(e){return e.json()}).then(function(e){e.message.forEach(function(e){users.innerHTML+='<li class="user"><div class="user--center"><div class="user__picture"></div><span class="user__name">'.concat(e.username,'</span><span class="user_status">Online</span></div></li>')})}).catch(function(e){console.log(e)})}}]),e}(),Cookie=function(){function e(){_classCallCheck(this,e)}return _createClass(e,null,[{key:"setCookie",value:function(e,s,t){var n="";if(t){var a=new Date;a.setTime(a.getTime()+24*t*60*60*1e3),n="; expires="+a.toUTCString()}document.cookie=e+"="+(s||"")+n+"; path=/"}},{key:"getCookie",value:function(e){for(var s=e+"=",t=document.cookie.split(";"),n=0;n<t.length;n++){for(var a=t[n];" "==a.charAt(0);)a=a.substring(1,a.length);if(0==a.indexOf(s))return a.substring(s.length,a.length)}return null}}]),e}();null==Cookie.getCookie("username")&&(location.href="index.html");var m=new Message;m.getMessages();var u=new User;u.getUsers(),messageBtn.addEventListener("click",function(e){""!=message.value&&(new Message).createMessage();e.preventDefault()}),messageInput.addEventListener("keypress",function(e){13==e.keyCode&&""!=message.value&&((new Message).createMessage(_this2),e.preventDefault())});var primus=Primus.connect("/",{reconnect:{max:1/0,min:500,retries:10}});function changeMessage(e){messageBtn.style.display="none",updateDecline.style.display="inline-block",updateSend.style.display="inline-block";var s=e.innerHTML;messageInput.value=s;var t=e.getAttribute("data-id");messageId.value=t}function addMessage(){messageBtn.style.display="inline-block",updateDecline.style.display="none",updateSend.style.display="none",messageInput.value="",messageId.value=""}primus.on("data",function(e){if(null!=e.username)users.innerHTML+='<li class="user"><div class="user--center"><div class="user__picture"></div><span class="user__name">'.concat(e.username,'</span><span class="user_status">Online</span></div></li>');else if("create"==e.type)Cookie.getCookie("username")==e.user?chat.innerHTML+='<div class="message" onclick="changeMessage(this)" data-id="'.concat(e.id,'">').concat(e.message,"</div>"):chat.innerHTML+='<div class="message message--red" data-id="'.concat(e.id,'"><span class="message__user">').concat(e.user,": </span>").concat(e.message,"</div>");else if("update"==e.type){document.querySelector('[data-id="'.concat(e.id,'"]')).innerHTML=e.message}}),updateDecline.addEventListener("click",function(e){addMessage(),e.preventDefault()}),updateSend.addEventListener("click",function(e){(new Message).updateMessage(),e.preventDefault()});