APIURL = `http://${window.location.hostname}:${window.location.port}/api`

var g_currentPage = 1;

class p_unfilteredNews{
    static getContent(page=1, div="tn__maincontent__newsCards") {
        fetch(`${APIURL}/articles?page=${page}`, {
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
        .then((res) => res.json())
        .then((data) => {
            var theMan = document.getElementById(div)
            data["articles"].forEach(function (item) {
                // Bootstrap Card Output
                var card = document.createElement('div')
                card.classList.add("col")
                card.innerHTML = `
                <div class="card h-100" id="tn__maincontent__newsCards__cardNo${item.id}">
                    <img src="${item.imageurl}" class="card-img-top" alt="Image">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <p class="text-muted">Updated: ${item.timestamp}</p>
                        <a href="${item.link}" class="btn btn-primary" target="_blank">Read more</a>
                    </div>
                </div>
                `
                theMan.append(card)
            })
            g_currentPage = page
        })
        .catch((error) => {
            document.getElementById("tn__alertSpace").innerHTML = `
            <div class="alert alert-danger" role="alert">
            Cannot load news. Please logout and login again.
            </div>`;

            create_simple_toast("Cannot load news. Please logout and login again.", "danger", 10000)
            //main_deleteSession();
            // console.log(error)
        })
        document.getElementById("tn__alertSpace").innerHTML = "";
    }
};

var Settings = {
	change_theme: async function () {
		var th = document.getElementById("tn__settingsModal__pills__appearance__switchForm__theme").value
		await dump_setting("theme", th)
		document.documentElement.setAttribute("data-bs-theme", th)
		create_simple_toast(`The ${th} theme has been applied.`, "success")
	},
    change_pwd: async function (){
        var pwd_old = document.getElementById("tn__settingsModal__pills__account__formChangePWD__pw0").value;
        var newpw1 = document.getElementById("tn__settingsModal__pills__account__formChangePWD__pw1").value;
        var newpw2 = document.getElementById("tn__settingsModal__pills__account__formChangePWD__pw2").value;

        // checks
        if (newpw1 != newpw2) {
            create_simple_toast("New passwords do not match", "warning")
            document.getElementById("tn__settingsModal__pills__account__formChangePWD__pw2").value = ""
        } else {
            const res = await fetch(`${APIURL}/users/me`, {
                method: "PUT", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                  "Authorization": 'Bearer ' + window.localStorage.getItem("token"),
                  "Content-Type": "application/json"
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify({
                    "opassword": pwd_old,
                    "password": newpw2
                })
            })


            

            if (res.status == 200) {
                create_simple_toast("Password changed", "success")
                document.getElementById("tn__settingsModal__pills__account__formChangePWD").reset()
                bootstrap.Modal.getOrCreateInstance(document.getElementById("tn__settingsModal")).hide()
            } else if (res.status == 403) {
                create_simple_toast("Old password does not match", "warning")
                document.getElementById("tn__settingsModal__pills__account__formChangePWD__pw0").value = ""
            } else {
                res.json().then((data) => {
                    create_simple_toast(`API Error ${data["type"]}: ${data["message"]}`, "danger")
                })
            }
        }
    }
}



// namespace
var main_HTMLPages = {
    p_unfilteredNews: function() {
        main_clearHPC() // hpc = home page content
        document.getElementById("title").innerHTML = "All News";
        var newscards = document.createElement('div')
        newscards.id = "tn__maincontent__newsCards"
        newscards.classList.add("row", "row-cols-1", "row-cols-lg-3", "g-4")
        document.getElementById("tn__maincontent").appendChild(newscards)
        p_unfilteredNews.getContent()
    },

    p_settings: async function() {
        if (document.getElementById("tn__settingsModal")) {
            bootstrap.Modal.getInstance(document.getElementById("tn__settingsModal")).show()
        } else {
            var login_modal = document.createElement('div');
            login_modal.id = "tn__settingsModal";
            login_modal.classList.add("modal");
            login_modal.classList.add("fade");
            // data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true"
            // login_modal.setAttribute("data-bs-backdrop", "static");
            login_modal.setAttribute("data-bs-keyboard", "false");
            login_modal.setAttribute("tabindex", "-1");
            login_modal.setAttribute("aria-labelledby", "tn__settingsModal__label");
            login_modal.setAttribute("aria-hidden", "true");
            login_modal.setAttribute("data-bs-backdrop", "static");
            login_modal.setAttribute("data-bs-keyboard", "false");
            login_modal.innerHTML = await get_template_part("settings");

            document.body.appendChild(login_modal);

            form = document.getElementById("tn__settingsModal__pills__account__formChangePWD");
            form.addEventListener('submit', event => {
                event.preventDefault()
                if (form.checkValidity()) {
                    Settings.change_pwd()
                } else {
                    event.stopPropagation()
                }
        
                form.classList.add('was-validated')
            }, false);
			document.getElementById("tn__settingsModal__pills__appearance__switchForm__theme").addEventListener("change", Settings.change_theme);
            const bsSettModal = new bootstrap.Modal(document.getElementById("tn__settingsModal"));
            bsSettModal.show()
            dom_sspy_refresh()
        }
    }
};

const hashURLMap = {
    "": main_HTMLPages.p_unfilteredNews,
    "#": main_HTMLPages.p_unfilteredNews,
    "#home": main_HTMLPages.p_unfilteredNews,
    "#settings": main_HTMLPages.p_settings,
    "#logout": deleteSession,
    "#closed": (() => {})
};


async function main_createInterface() {
    document.title = "Trunews";
    document.getElementById("title").innerHTML = "If you are seeing this, click Home above to get the news page";

    document.getElementById("content").innerHTML = `
    <div class="row" id="tn__alertSpace">
    
    </div>
    <div class="row" id="tn__maincontent">
    
    </div>
    `
    // document.getElementById("tn__g_logout").addEventListener("click", main_deleteSession)

    await main_createNavbar()
    document.getElementById("fullcontent").setAttribute("style", "margin-top:60px;")
    // main_getContent()
    main_goToHashPage()
}

async function main_createNavbar() {
    var navbar = document.createElement("nav")
	navbar.id = "tn__primaryNavbar"
    navbar.classList.add("navbar", "fixed-top", "navbar-expand-lg", "bg-body-tertiary")
    navbar.innerHTML = await render_template("navbar", {email: window.localStorage.getItem("user.email")})
    window.localStorage.getItem("user.email")
    document.body.prepend(navbar)
}

function main_clearHPC() {
    document.getElementById("title").innerHTML = "";
    document.getElementById("tn__maincontent").innerHTML = ""
}

function main_goToHashPage() {
    // var alertspace = document.getElementById("tn__alertSpace")
    // alertspace.setAttribute("style", "")
    // alertspace.innerHTML = `
    // <div class="alert alert-primary" role="alert">
    // <div class="spinner-border" role="status">
    //     <span class="visually-hidden">Loading...</span>
    // </div>
    // </div>`
    try {
        hashURLMap[window.location.hash]()
        // alertspace.innerHTML = ""
    } catch {
        // alertspace.innerHTML = `
        // <div class="alert alert-danger" role="alert">
        // Cannot load page.
        // </div>`
        create_simple_toast("Cannot load page", "danger", 10000)
    }
    
}

function helper_domchange() {
    const dataSpyList = document.querySelectorAll('[data-bs-spy="scroll"]')
    console.log(dataSpyList)
    if (dataSpyList) {
    dataSpyList.forEach(dataSpyEl => {
        var a = bootstrap.ScrollSpy.getInstance(dataSpyEl);
        if (a) {a.refresh()}
    })}
}

window.addEventListener('hashchange', function () {
    main_goToHashPage()
});