loadAScript("jstempl.js")

async function get_template_part(name) {
    if (!window.sessionStorage.getItem("c:templPart__" + name)){
        const res = await fetch("static/html/part/"+name+".html")
        const text = await res.text()
        window.sessionStorage.setItem("c:templPart__" + name, text)
        return text
    }
    return window.sessionStorage.getItem("c:templPart__" + name)
}

async function render_template(name, obj){
    const res = await get_template_part(name)
    return tmpl(res, obj)
}

function dom_sspy_refresh() {
    const dataSpyList = document.querySelectorAll('[data-bs-spy="scroll"]')
    dataSpyList.forEach(dataSpyEl => {
        if (bootstrap.ScrollSpy.getInstance(dataSpyEl)) {
            bootstrap.ScrollSpy.getInstance(dataSpyEl).refresh()
        } else {
            bootstrap.ScrollSpy(dataSpyEl).refresh()
        }
    })

}

function _create_toast_container() {
    if (!document.getElementById("tn__toastContainer")) {
        var tc = document.createElement("div")
        tc.id = "tn__toastContainer";
        tc.classList.add("toast-container", "position-fixed", "top-0", "start-50", "translate-middle-x", "p-3")
        document.body.appendChild(tc)
        return tc;
    }

    return document.getElementById("tn__toastContainer")
}

async function create_toast(title, content, color="primary", delay=5000) {
    var tc = _create_toast_container()
    var ts = document.createElement('div')
    ts.id = `tn__toastContainer_toast${Date.now()}`
    ts.classList.add("toast")
    ts.setAttribute("role", "alert")
    ts.setAttribute("aria-live", "assertive")
    ts.setAttribute("aria-atomic", "true")
    ts.setAttribute("data-bs-delay", `${delay}`)
    ts.innerHTML = await render_template("toast_simple", {color: color, title: title, body: content})
    tc.appendChild(ts)
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(ts)
    toastBootstrap.show()
}

async function create_simple_toast(content, color="primary", delay=5000) {
    var tc = _create_toast_container()
    var ts = document.createElement('div')
    ts.id = `tn__toastContainer_stoast${Date.now()}`
    ts.classList.add("toast")
    ts.setAttribute("role", "alert")
    ts.setAttribute("aria-live", "assertive")
    ts.setAttribute("aria-atomic", "true")
    ts.setAttribute("data-bs-delay", `${delay}`)
    ts.innerHTML = await render_template("toast_supersimple", {color: color, body: content})
    tc.appendChild(ts)
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(ts)
    toastBootstrap.show()
}