var token = "";
var agsurl = "";
var tokenurl = "";
var referer = window.location.hostname.endsWith('/') ? window.location.hostname.slice(0, -1) : window.location.hostname;

var folders = [];
var services = [];

var current_folder = "";
var iterator = -1;

// Get a token using credentials
function getToken()
{
    var user = document.getElementById("agsuser").value;
    var pass = document.getElementById("agspassword").value;

    agsurl = document.getElementById("agsurl").value;

    tokenurl = getTokenURL(agsurl)

    var params = { "username": user, "password": pass, "f": "json", "client": "referer", "referer":referer,"expiration":"120"};
    var query_string = Object.keys(params).map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) }).join('&');

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xmlHttp.responseText);
            if (response.hasOwnProperty("token"))
            {
                token = response.token;
                alertify.success('Successfully got token!');
                showMainSection();
            }
            else
            {
                alertify.error('Couldnt get token :(');
            }
        }
    };
    xmlHttp.open("POST", tokenurl, true);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.send(query_string);
}

// Work out the token URL (this is syncronous)
function getTokenURL(url)
{
    url = `${url}/rest/info?f=json`;
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", url, false);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.send(null);

    if (xmlHttp.status == 200) {
        var response = JSON.parse(xmlHttp.responseText);
        
        if (response.hasOwnProperty("authInfo"))
        {
            if (response.authInfo.hasOwnProperty("tokenServicesUrl")) return response.authInfo.tokenServicesUrl
        }
    };
    return "";
}

// Show the main UI after login
function showMainSection()
{
    document.getElementById("login").className = "section u-none";
    document.getElementById("loading").className = "section";
    populateMainSection();
    document.getElementById("loading").className = "section u-none";
    document.getElementById("main").className = "section";
}

// Populat ethe main section
function populateMainSection()
{ 
    var folders = ["/"].concat(getAGSFolders());

    var el = document.getElementById("folders")

    folders.forEach(function (item, index)
    {
        console.log(item, index);
        let li = document.createElement("li");
        li.innerHTML = `<a href="javascript:showServices('${item}')">${item}</a>`;
        li.setAttribute("class","menu-item");            
        el.appendChild(li);
    })
}

// Get the ArcGIS service folders
function getAGSFolders()
{
    var url = `${agsurl}/admin/services`
    var params = { "token": token, "f": "json"};
    var query_string = Object.keys(params).map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) }).join('&');

    var xmlHttp = new XMLHttpRequest();   
    xmlHttp.open("GET", `${url}?${query_string}`, false);
    xmlHttp.send(null);

     if (xmlHttp.status == 200)
    {
        var response = JSON.parse(xmlHttp.responseText);
        if (response.hasOwnProperty("folders"))
        {
            return response.folders;
        }
    }

    return [];
}

// Get the services within a folder
function getAGSServices(folder)
{
    services = [];

    var url = `${agsurl}/admin/services`
    if (folder != "/") url = `${url}/${folder}`;

    var params = { "token": token, "f": "json"};
    var query_string = Object.keys(params).map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) }).join('&');

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", `${url}?${query_string}`, false);
    xmlHttp.send(null);

    if (xmlHttp.status == 200)
    {
        var response = JSON.parse(xmlHttp.responseText);
        if (response.hasOwnProperty("services"))
        {
            response.services.forEach(service => {
                services.push(`${service.serviceName}.${service.type}`)
            })
        }
    }
}

// Display the services list
function showServices(folder)
{
    current_folder = folder;

    getAGSServices(folder)
    
    var el = document.getElementById("services")
    el.innerHTML = ``;

    var ul = document.createElement("ul");
    ul.setAttribute("class","no-bullets u-overflow-auto p-1");

    ul.appendChild(createButtonGroupAll());

    services.forEach(function (item, index)
    {        
        ul.appendChild(createButtonGroup(item))
    })

    el.appendChild(ul);
}

// Create a button element for stop/start/restart actions
function createButtonGroup(item)
{
    let li = document.createElement("li");

    var d = document.createElement("div");
    d.setAttribute("class","btn-group");
            
    var btn = document.createElement("button");
    btn.setAttribute("class","btn-danger btn-small");
    btn.setAttribute("onclick",`toggleService('${item}','stop')`);
    btn.innerHTML = `<i class="fa-wrapper fa fa-fw fa-stop"></i>`
    d.appendChild(btn);

    var btn = document.createElement("button");
    btn.setAttribute("class","btn-success btn-small");
    btn.setAttribute("onclick",`toggleService('${item}','start')`);
    btn.innerHTML = `<i class="fa-wrapper fa fa-fw fa-play"></i>`
    d.appendChild(btn);

    var btn = document.createElement("button");
    btn.setAttribute("class","btn-info btn-small");
    btn.setAttribute("onclick",`restartService('${item}')`);
    btn.innerHTML = `<i class="fa-wrapper fa fa-fw fa-redo"></i>`
    d.appendChild(btn);

    var btn = document.createElement("button");
    btn.setAttribute("class","outline btn-transparent btn-small");
    btn.innerText = item;
    d.appendChild(btn);

    li.appendChild(d);
    return li
}

// Create a button element for the "ALL" stop/start/restart actions
function createButtonGroupAll()
{
    let li = document.createElement("li");

    var d = document.createElement("div");
    d.setAttribute("class","btn-group");
            
    var btn = document.createElement("button");
    btn.setAttribute("class","btn-danger btn-small");
    btn.setAttribute("onclick",`stopServices()`);
    btn.innerHTML = `<i class="fa-wrapper fa fa-fw fa-stop"></i> All`
    d.appendChild(btn);

    var btn = document.createElement("button");
    btn.setAttribute("class","btn-success btn-small");
    btn.setAttribute("onclick",`startServices()`);
    btn.innerHTML = `<i class="fa-wrapper fa fa-fw fa-play"></i> All`
    d.appendChild(btn);

    var btn = document.createElement("button");
    btn.setAttribute("class","btn-info btn-small");
    btn.setAttribute("onclick",`restartServices()`);
    btn.innerHTML = `<i class="fa-wrapper fa fa-fw fa-redo"></i> All`
    d.appendChild(btn);

    li.appendChild(d);
    return li
}

// Restart All services
function restartServices()
{    
    services.forEach(function (item, index)
    {        
        if (stopServiceSync(item) == true) toggleService(item,"start");
    })
}

// Restart a single service
function restartService(serviceName)
{    
    if (stopServiceSync(serviceName) == true) toggleService(serviceName,"start");
}

// Stop all services
function stopServices()
{ 
    iterator=0;
    toggleNextService("stop");
}

// Start all services
function startServices()
{
    iterator=0;
    toggleNextService("start");
}

// Toggle next service in itertaor (stop or start action)
function toggleNextService(action)
{
    if (iterator == services.length-1){iterator = -1;return;}
    toggleService(services[++iterator],action);
}

// Toggle given service (stop or start action)
function toggleService(serviceName,action)
{
    var a1 = "";
    var a2 = "";

    if (action == "stop"){a1="STOPPING";a2="STOPPED"}
    if (action == "start"){a1="STARTING";a2="STARTED"}

    alertify.warning(`${a1}<br>${serviceName}`);
    console.log(`${a1} ${current_folder} ${serviceName}`);
    
    var url = `${agsurl}/admin/services`
    if (current_folder != "/") url += `/${current_folder}`;
    url += `/${serviceName}/${action}`;

    var params = {"token": token, "f": "json"};
    var query_string = Object.keys(params).map((key) => {return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) }).join('&');

    var xmlHttp = new XMLHttpRequest();  

    xmlHttp.onreadystatechange = function ()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            var response = JSON.parse(xmlHttp.responseText);

            if (response.hasOwnProperty("status"))
            {
                if (response.status == "success")
                {
                    console.log(`${a2} ${current_folder} ${serviceName}`);
                    alertify.success(`${a2}<br>${serviceName}`);
                    if (iterator >= 0) toggleNextService(action);
                    return;
                }
            }
            alertify.notify(xmlHttp.responseText, 'error', 5);
        }
    };

    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.send(query_string);
}

// Stop a service, this function is syncronous :(
function stopServiceSync(serviceName)
{
    console.log(`STOPPING ${current_folder} ${serviceName}`);
    
    var url = `${agsurl}/admin/services`
    if (current_folder != "/") url += `/${current_folder}`;
    url += `/${serviceName}/stop`;

    var params = {"token": token, "f": "json"};
    var query_string = Object.keys(params).map((key) => {return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) }).join('&');

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", url, false);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.send(query_string);

    if (xmlHttp.status == 200)
    {
        var response = JSON.parse(xmlHttp.responseText);

        if (response.hasOwnProperty("status"))
        {
            if (response.status == "success")
            {
                console.log(`STOPPED ${current_folder} ${serviceName}`);
                return true;
            }
        }
        
    }

    return false;    
}