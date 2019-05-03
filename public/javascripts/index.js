    let $messageBtn = $("#sendMessage");
    let $message = $('#message');
    let $messageArea = $('#messageArea');
    let $userFormArea = $('#userFormArea');
    let $chat = $('#chat');
    let $userForm = $("#sendUser");
    let $username = $('#user')
    let $users = $('#users');

    class Message {
        constructor() {
            let that = this;
            let message = $('#message').val();
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
                "message": message
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

    $messageBtn.click(function(e){
        let app = new Message();
        $('#message').val('');
        e.preventDefault();
    });

    this.primus = Primus.connect('/', {
        reconnect: {
            max: Infinity // Number: The max delay before we try to reconnect.
            , min: 500 // Number: The minimum delay before we try reconnect.
            , retries: 10 // Number: How many times we should try to reconnect.
        }
    });

    this.primus.on("data", (data)=>{
        $chat.append('<div class="well"><strong>'+ data.user + ': </strong>' + data.message + "</div>");
    });

    $userForm.click(function(e){
        Cookie.setCookie("username", $username.val(), 10);
        $userFormArea.hide();
        $messageArea.show();
        e.preventDefault();
    });

    if (Cookie.getCookie("username") != null) {
        $userFormArea.hide();
        $messageArea.show();
    }