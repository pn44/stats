APIURL = `http://${window.location.hostname}:${window.location.port}/api`

var g_currentPage = 1;
var g_doRefresh = true;

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
            //main_deleteSession();
            // console.log(error)
        })
        document.getElementById("tn__alertSpace").innerHTML = "";
    }
};

function main_deleteSession(e=null) {
    window.localStorage.removeItem("token");
    window.location.hash = "";
    window.location.reload();
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

    p_settings: function() {
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
            login_modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl modal-fullscreen-lg-down">
            <div class="modal-content" id="tn__settingsModal_content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="tn__settingsModal__label">Settings</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                <div class="d-flex align-items-start">
                    <div class="nav flex-column nav-pills me-3" id="tn__settingsModal__pills__tab" role="tablist" aria-orientation="vertical">
                        <button class="nav-link active" id="tn__settingsModal__pills__tabHomepage" data-bs-toggle="pill" data-bs-target="#tn__settingsModal__pills__homepage" type="button" role="tab" aria-controls="tn__settingsModal__pills__homepage" aria-selected="true">Homepage</button>
                        <button class="nav-link" id="tn__settingsModal__pills__tabAccount" data-bs-toggle="pill" data-bs-target="#tn__settingsModal__pills__account" type="button" role="tab" aria-controls="tn__settingsModal__pills__account" aria-selected="false">Account</button>
                    </div>
                    <div class="tab-content" id="tn__settingsModal__pills__tabContent">
                        <div class="tab-pane fade show active" id="tn__settingsModal__pills__homepage" role="tabpanel" aria-labelledby="tn__settingsModal__pills__tabHomepage" tabindex="0">
                            <h5>Homepage Filters</h5>
                        </div>
                        <div class="tab-pane fade" id="tn__settingsModal__pills__account" role="tabpanel" aria-labelledby="tn__settingsModal__pills__tabAccount" tabindex="0">
                            <h5>Change password</h5>
                            <form id="tn__settingsModal__pills__account__formChangePWD">
                            <div class="mb-3">
                                <label for="tn__settingsModal__pills__account__formChangePWD__pw0" class="form-label">Old password</label>
                                <input type="password" class="form-control" id="tn__settingsModal__pills__account__formChangePWD__pw0">
                            </div>
                            <div class="mb-3">
                                <label for="tn__settingsModal__pills__account__formChangePWD__pw1" class="form-label">New password</label>
                                <input type="password" class="form-control" id="tn__settingsModal__pills__account__formChangePWD__pw1">
                            </div>
                            <div class="mb-3">
                                <label for="tn__settingsModal__pills__account__formChangePWD__pw2" class="form-label">Confirm new password</label>
                                <input type="password" class="form-control" id="tn__settingsModal__pills__account__formChangePWD__pw2">
                            </div>
                            <div class="mb-3">
                                <button type="submit" class="btn btn-primary" id="tn__settingsModal__pills__account__formChangePWD__submitBtn">Change password</button>
                            </div>
                            </form>
                            <h5>Logout</h5>
                            <a class="btn btn-warning" href="#logout">Logout</a>
                            <h5>Delete account</h5>
                            <a class="btn btn-danger" href="#settings/account/delete">Delete my account</a>
                        </div>
                    </div>
                </div>
              
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
            </div>
            `;

            document.body.appendChild(login_modal);
            const bsSettModal = new bootstrap.Modal(document.getElementById("tn__settingsModal"));
            bsSettModal.show()
        }
    }
};

const hashURLMap = {
    "": main_HTMLPages.p_unfilteredNews,
    "#": main_HTMLPages.p_unfilteredNews,
    "#home": main_HTMLPages.p_unfilteredNews,
    "#settings": main_HTMLPages.p_settings,
    "#logout": main_deleteSession
};


function main_createInterface() {
    document.title = "Trunews";
    document.getElementById("title").innerHTML = "If you are seeing this, click Home above to get the news page";

    document.getElementById("content").innerHTML = `
    <div class="row" id="tn__alertSpace">
    
    </div>
    <div class="row" id="tn__maincontent">
    
    </div>
    `
    // document.getElementById("tn__g_logout").addEventListener("click", main_deleteSession)

    main_createNavbar()
    document.getElementById("fullcontent").setAttribute("style", "margin-top:60px;")
    // main_getContent()
    main_goToHashPage()
}

function main_createNavbar() {
    var navbar = document.createElement("nav")
    navbar.classList.add("navbar", "fixed-top", "navbar-expand-lg", "bg-body-tertiary")
    navbar.innerHTML = `<div class="container-fluid">
        <a class="navbar-brand" href="#">Trunews</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Home</a>
            </li>
            <li class="nav-item">
            <a class="nav-link" href="#settings" onclick="main_HTMLPages.p_settings()">Settings</a>
            </li>
            <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown
            </a>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><a class="dropdown-item" href="#">Another action</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
            </li>
            <li class="nav-item">
            <a class="nav-link disabled">Disabled</a>
            </li>
        </ul>
        <div class="d-flex">
            <a class="btn btn-outline-warning" href="#logout">Logout</a>
        </div>
        </div>
    </div>`
    document.body.prepend(navbar)
}

function main_clearHPC() {
    document.getElementById("title").innerHTML = "";
    document.getElementById("tn__maincontent").innerHTML = ""
}

function main_goToHashPage() {
    var alertspace = document.getElementById("tn__alertSpace")
    // alertspace.setAttribute("style", "")
    alertspace.innerHTML = `
    <div class="alert alert-primary" role="alert">
    <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
    </div>`
    try {
        hashURLMap[window.location.hash]()
        alertspace.innerHTML = ""
    } catch {
        alertspace.innerHTML = `
        <div class="alert alert-danger" role="alert">
        Cannot load page.
        </div>`
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

main_createInterface();