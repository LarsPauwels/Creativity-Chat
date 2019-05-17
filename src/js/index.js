let toggle = document.querySelector('.card__toggle');
let container = document.querySelector('.container');
let close = document.querySelector('.card__close');
let register = document.getElementById('register');
let username = document.getElementById('usernameRegister');
let login = document.getElementById('login');

toggle.addEventListener('click', () => {
	container.id = "active";
});

close.addEventListener('click', () => {
	container.id = "";
});

class Cookie {
	static setCookie(name, value, days) {
		let expires = "";
		if (days) {
			let date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}

	static getCookie(name) {
		let nameEQ = name + "=";
		let ca = document.cookie.split(';');
		for(let i=0;i < ca.length;i++) {
			let c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
}

if (Cookie.getCookie("username") != null) {
    location.href = 'chat.html';
}

register.addEventListener('click', e => {
	let user = new User;
	user.usernameExists(username.value);
	e.preventDefault();
});

login.addEventListener('click', e => {
	let user = new User;
	user.login();
	e.preventDefault();
});

class User {
	createUser() {
		let user = username.value;
		let password = document.getElementById("passwordRegister").value;
		let passwordConfirm = document.getElementById("passwordConfirm").value;
		this.setPrimus(user);

		if(this.emptyFields(user, password, passwordConfirm)) {
			if (this.passwordEqual(password, passwordConfirm)) {
				password = sha1(password);
				let url = "./api/v1/user";
				let data = {username: user, password: password, timestamp: getTimestamp()};

				fetch(url,{
					method:'post',
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify(data)
				}).then(response => {
					return response.json();
				}).then( json => {
					Cookie.setCookie("username", user, 10);
					location.href = 'chat.html';
				}).catch(err => {
					console.log(err);
				});
			} else {
				console.log("Your password and cofirm password are not the same.");
			}
		} else {
			console.log("You need to fill in all required fields.");
		}
	}

	emptyFields(username, password, confirm) {
		if (username != "" && password != "" && confirm != "") {
			return true;
		}
		return false;
	}

	passwordEqual(password, confirm) {
		if (password === confirm) {
			return true;
		}
		return false;
	}

	usernameExists(username) {
		let url = `./api/v1/user?user=${username}`;

		fetch(url,{
			method:'get',
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => {
			return response.json();
		}).then( json => {
			if (json.status == "success") {
				console.log("This username is already in use.");
			} else if (json.status == "error") {
				this.createUser();
			}
		}).catch(err => {
			console.log(err);
		});
	}

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

	login() {
		let username = document.getElementById("usernameLogin").value;
		let password = sha1(document.getElementById("passwordLogin").value);

		if (this.emptyFields(username, password, "empty")) {

			let url = `./api/v1/user?user=${username}`;

			fetch(url,{
				method:'get',
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => {
				return response.json();
			}).then( json => {
				if (json.status == "success") {
					if (json.message.password == password) {
						Cookie.setCookie("username", username, 10);
						location.href = 'chat.html';
					} else {
						console.log("Your username or password is incorrect.");
					}
				} else if (json.status == "error") {
					console.log("Your username or password is incorrect.");
				}
			}).catch(err => {
				console.log(err);
			});
		}
	}
}

function getTimestamp(){
	let d = new Date();
	let year = d.getFullYear();
	let month = d.getMonth()+1;
	let day = d.getDate();
	let hour = d.getHours();
	let minutes = d.getMinutes();

	if( hour < 10){
		hour = "0" + hour;
	}

	if(minutes < 10){
		minutes = "0" + minutes;
	}

	return `${day}/${month}/${year} ${hour}:${minutes}`;

}