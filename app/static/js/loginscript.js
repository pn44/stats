APIURL = `http://${window.location.hostname}:${window.location.port}/api`

function checkLoginStatus() {
    document.title = "Log in";
    document.getElementById("title").innerHTML = "";
    if (window.localStorage.getItem("token")) {
        loadInterface();
    } else {
        createLoginScreen();
    }
}

function createLoginScreen() {
    var login_modal = document.createElement('div');
    login_modal.id = "tn__loginModal";
    login_modal.classList.add("modal");
    login_modal.classList.add("fade");
    // data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true"
    login_modal.setAttribute("data-bs-backdrop", "static");
    login_modal.setAttribute("data-bs-keyboard", "false");
    login_modal.setAttribute("tabindex", "-1");
    login_modal.setAttribute("aria-labelledby", "tn__loginModal__label");
    login_modal.setAttribute("aria-hidden", "true");
    login_modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
    <form class="modal-content needs-validation" id="tn__loginModal_formLogin" novalidate>
        <div class="modal-header">
        <h1 class="modal-title fs-5" id="tn__loginModal__label">Log In</h1>
        </div>
        <div class="modal-body">
            <div id="tn__loginModal__alertspace"></div>
            <div class="row g-3">
                <div class="col-md-12">
                    <label for="tn__loginModal__inputEmail">Email</label>
                    <input type="email" class="form-control" id="tn__loginModal__inputEmail" required>
                    <div class="invalid-feedback">
                        Enter a valid email address.
                    </div>
                </div>
                <div class="col-md-12">
                    <label for="tn__loginModal__inputPassword">Password</label>
                    <input type="password" class="form-control" id="tn__loginModal__inputPassword" required>
                    <div class="invalid-feedback">
                        Enter your password
                    </div>
                </div>
            </div>
            <br>
            <div class="accordion" id="tn__loginModal_accordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#tn__loginModal__advancedAccordion" aria-expanded="false" aria-controls="tn__loginModal__advancedAccordion">
                        Advanced
                        </button>
                    </h2>
                    <div id="tn__loginModal__advancedAccordion" class="accordion-collapse collapse" data-bs-parent="#tn__loginModal_accordion">
                        <div class="accordion-body">
                            <div class="col-md-12">
                                <label for="tn__loginModal__inputOTP">One-Time Password (for accounts with 2FA only)</label>
                                <input type="password" class="form-control" id="tn__loginModal__inputOTP">
                                <div class="invalid-feedback">
                                    Invalid OTP
                                </div>
                            </div>
                            <div class="col-md-12">
                                <label for="tn__loginModal__inputExpiration">Session expiration time (in seconds)</label>
                                <input type="number" class="form-control" id="tn__loginModal__inputExpiration">
                                <div class="invalid-feedback">
                                    Invalid value
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
        <button type="submit" class="btn btn-primary" id="tn__loginModal__loginButton">Login</button>
        </div>
    </form>
    </div>
    `;

    document.body.appendChild(login_modal);
    const bsLoginModal = new bootstrap.Modal(document.getElementById("tn__loginModal"));

    form = document.getElementById("tn__loginModal_formLogin");
    form.addEventListener('submit', event => {
        if (form.checkValidity()) {
            doLogin(event, bsLoginModal)
        } else {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
    }, false);


    
    bsLoginModal.show();
  
}

async function doLogin(e, bsLoginModal) {
    e.preventDefault();
    var username = document.getElementById("tn__loginModal__inputEmail").value;
    var password = document.getElementById("tn__loginModal__inputPassword").value;

    var alertspace = document.getElementById("tn__loginModal__alertspace")
    alertspace.innerHTML = `
    <div class="alert alert-primary" role="alert">
    <div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>
    </div>`

    var usp = new URLSearchParams();
    if (document.getElementById("tn__loginModal__inputOTP").value) {
        usp.set("code", document.getElementById("tn__loginModal__inputOTP").value)
    }
    if (document.getElementById("tn__loginModal__inputExpiration").value) {
        usp.set("expiration", document.getElementById("tn__loginModal__inputExpiration").value)
    }

    try {
    const response = await fetch(APIURL + "/auth/login?" + usp.toString(), {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Authorization": 'Basic ' + window.btoa(username + ":" + encodeURIComponent(password))
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
    if (response.status == 200) {
        await response.json().then(async function (data) {
            window.localStorage.setItem("token", data["token"]);
            await cacheUserData()
        })
        bsLoginModal.hide();
        // bsLoginModal.dispose();
        loadInterface();
    } else {
        response.json().then(function (data) {
            alertspace.innerHTML = `
            <div class="alert alert-danger" role="alert">
            Error (${data["type"]}): ${data["message"]}
            </div>`
        })
    }
            
    } catch (e) {
        if (e instanceof TypeError) {
        alertspace.innerHTML = `
        <div class="alert alert-danger" role="alert">
        JavaScript Type Error: TYhe server might be down or your firewall is blocking.
        </div>`
        } else {
        alertspace.innerHTML = `
        <div class="alert alert-danger" role="alert">
        Sorry, this client is down.
        <hr>
        <b>Details</b> ${e}
        </div>`
        } 
    }

    
}

async function cacheUserData() {
    console.log("AHOY")
    const res = await fetch(`${APIURL}/users/me`, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Authorization": 'Bearer ' + window.localStorage.getItem("token")
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    res.json().then((data) => {
        window.localStorage.setItem("user.id", data.id);
        window.localStorage.setItem("user.email", data.email);
        window.localStorage.setItem("user.admin", data.admin);
    })
    .catch((error) => {
        console.log(error)
    })
    console.log("YES")
}

function loadAScript(scr, onl) {
    var script = document.createElement('script');
    script.src = 'static/js/' + scr;
    script.type = 'text/javascript';

    script.onload = onl

    document.getElementsByTagName('head')[0].appendChild(script);
}

function loadInterface() {
    loadAScript('common.js', () => {
        loadAScript('mainscript.js', () => {main_createInterface()})
    })
}

window.onload = checkLoginStatus