// Simple JavaScript Templating
// John Resig - https://johnresig.com/ - MIT Licensed
(function(){
    var cache = {};
     
    this.tmpl = function tmpl(str, data){
      // Figure out if we're getting a template, or if we need to
      // load the template - and be sure to cache the result.
      var fn = !/\W/.test(str) ?
        cache[str] = cache[str] ||
          tmpl(document.getElementById(str).innerHTML) :
         
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
          "var p=[],print=function(){p.push.apply(p,arguments);};" +
           
          // Introduce the data as local variables using with(){}
          "with(obj){p.push('" +
           
          // Convert the template into pure JavaScript
          str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'")
        + "');}return p.join('');");
       
      // Provide some basic currying to the user
      return data ? fn( data ) : fn;
    };
})();

// loadAScript("jstempl.js")

// start common.js

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
        bootstrap.ScrollSpy.getOrCreateInstance(dataSpyEl).refresh()
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

async function load_setting(key) {
	const res = await fetch(`${APIURL}/users/me/preferences/${key}`, {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		cache: "no-cache",
		headers: {
		  "Authorization": 'Bearer ' + window.localStorage.getItem("token")
		},
	})
	
	if (res.status == 200) {
		const dat = await res.json()
		return dat
	} else {
		return null
	}
}

async function dump_setting(key, value) {
	const res = await fetch(`${APIURL}/users/me/preferences/${key}`, {
		method: "PUT", // *GET, POST, PUT, DELETE, etc.
		cache: "no-cache",
		headers: {
		  "Authorization": 'Bearer ' + window.localStorage.getItem("token"),
		  "Content-Type": "application/json"
		},
		body: JSON.stringify(
			value
		)
	})
}

async function apply_preferences() {
	// theme
	var theme = await load_setting("theme")
	if (!theme) { theme="light" }
	document.documentElement.setAttribute("data-bs-theme", theme)
}

function deleteSession(e=null) {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user.id");
    window.localStorage.removeItem("user.email");
    window.localStorage.removeItem("user.admin");
    window.location.hash = "";
	document.getElementById("tn__primaryNavbar").remove();
	document.getElementById("tn__maincontent").innerHTML = "";
	document.getElementById("title").innerHTML = "";
	document.title = "Log in";
    window.location.reload();
	// if (document.getElementById("tn__loginModal")) {
		// bootstrap.Modal.getOrCreateInstance(document.getElementById("tn__loginModal")).show();
	// }
	// else {
		// window.location.reload();
	// }
}