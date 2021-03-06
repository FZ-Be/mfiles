//fonction pour récupérer le token depuis l'URL (get)
function getTokenURL(){
    //get token from current url
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/ig, function(m,key,value) {
        vars[key] = "";
        vars[key] = value;
    });
    if(vars["token"] != ""){
        return vars["token"];
    }
    else return "";
}

//permet d'utiliser des liens qui affiche un élément du menu de la page welcome.html
function getClickSideBar(){
    //get id of button from current url
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/ig, function(m,key,value) {
        vars[key] = "";
        vars[key] = value;
    });
    if(vars["click"] == "clients"){
        document.getElementById("clients").click();
    }else if(vars["click"] == "vues"){
        document.getElementById("vues").click();
    }
    else if(vars["click"] == "taches"){
        document.getElementById("taches").click();
    }
    else if(vars["click"] == "factureclient"){
        document.getElementById("factures").click();
        document.getElementById("fact_cli").click();
    }
    else if(vars["click"] == "facturefournisseur"){
        document.getElementById("factures").click();
        document.getElementById("fact_fourn").click();
    }
    else if(vars["click"] == "rapports"){
        document.getElementById("rapports").click();
    }
    else if(vars["click"] == "workflow"){
        document.getElementById("workflow").click();
    }
}

//utilisation des données de l'utilisateur connecté
function getUser(){
    var token = getTokenURL();
    //request user info using the token
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;                  
    var url = "http://localhost/REST/session";
    xmlhttp.onreadystatechange = function () { 
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //console.log(this.responseText);
            var jsonUser = JSON.parse(this.responseText);
            getVault(token);
            afficherUser(jsonUser);
        }
        else {console.log("Failed to get user info.")
        ;}
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("X-Authentication", token); 
    xmlhttp.send();
}

//affiche données du coffre auquel l'utilisateur est connecté
function getVault(tokenV){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;                  
    var url = "http://localhost/REST/session/vault";
    
    xmlhttp.onreadystatechange = function () { 
        if (xmlhttp.readyState == 4) {
            //console.log(this.responseText);
            var jsonVault = JSON.parse(this.responseText);
            jsonVault.GUID = jsonVault.GUID.replace("{", "");
            jsonVault.GUID = jsonVault.GUID.replace("}", "");
            document.getElementById("vname").innerHTML = "<h4> <img src='img/vault_s1_blue.png' alt='Coffre: '>  "+jsonVault.Name+"</h4>"+jsonVault.GUID;
        }
        else {
            console.log("Failed to get vault info.");
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("X-Authentication", tokenV); 
    xmlhttp.send();
}

//affiche les informations de l'utilisateur connecté dans le sidebar
function afficherUser(jU){
    //fonction prend objet json et met ses valeurs dans le code html
    //document.getElementById("fname").innerHTML= "<h3>"+jU.AccountName+" (ID: "+jU.UserID+")</h3>";
    document.getElementById("fname").innerHTML = "<h3>"+jU.FullName+"</h3>";
    document.getElementById("accname").innerHTML = "<h5>"+jU.AccountName+" ID: "+jU.UserID+"</h5>";
}

//change la couleur des éléments cliqués depuis la liste d'affichage
function objectColor(param_id){
    var listes = document.getElementsByClassName("liste");
    var N = listes.length;
    for(var i=0; i<N;i++){
        if(listes[i].id==param_id){
            listes[i].style.backgroundColor="#f6f9fb";
        }
        else listes[i].style.backgroundColor="white";
    }
}

//lien vers page de création des objets
function pageCreate(){
    window.location.replace('create.html?token='+getTokenURL());

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function afficheProperties(respArray, N){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;

    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var propArray = JSON.parse(this.responseText);
            var M = propArray.length;
            for(var i = 0; i<N;i++){ //boucle dans la liste des proprietes de la facture
                for(var j = 0; j<M; j++){//boucle dans /structure/propriete
                    if(respArray[i].PropertyDef == propArray[j].ID){
                        document.getElementById("object").innerHTML +="<p><b>"+propArray[j].Name+":</b> "+respArray[i].TypedValue.DisplayValue+"</p>";
                    }
                }
            }
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/structure/properties");
    xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
}

//accéde aux tâches dans le coffre 
function getTasks(){
    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        afficherTaskList();
        var jsonU = JSON.parse(this.responseText);
        var ID = jsonU.UserID;

        //requete asynch dans une requete asynch pour faire passage de l'ID à requete des tâches
        var XHR1 = new XMLHttpRequest();
        XHR1.withCredentials = false;

        XHR1.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                var json = JSON.parse(this.responseText);
                var arrayTasks = new Array();
                arrayTasks = json.Items;
                arrayTasks.sort((a, b) => parseFloat(b.DisplayID) - parseFloat(a.DisplayID));
                afficherTaskListToMe(arrayTasks, arrayTasks.length);
            }
            });
            XHR1.open("GET", "http://localhost/REST/objects/10?p44="+ID);
            XHR1.setRequestHeader("X-Authentication", token);
            XHR1.setRequestHeader("Content-Type", "application/json");
            XHR1.send();

        //requete asynch dans une requete asynch pour faire passage de l'ID à requete des tâches
        var XHR2 = new XMLHttpRequest();
        XHR2.withCredentials = false;

        XHR2.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                var json = JSON.parse(this.responseText);
                var arrayTasks = new Array();
                arrayTasks = json.Items;
                arrayTasks.sort((a, b) => parseFloat(b.DisplayID) - parseFloat(a.DisplayID));
                afficherTaskListFromMe(arrayTasks, arrayTasks.length);
            }
            });
            XHR2.open("GET", "http://localhost/REST/objects/10?p43="+ID);
            XHR2.setRequestHeader("X-Authentication", token);
            XHR2.setRequestHeader("Content-Type", "application/json");
            XHR2.send();
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/session");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
}

//affiche la page des tâches
function afficherTaskList(){
    document.getElementById("vues").className="btn";
    document.getElementById("taches").className="btn active";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";
    document.getElementById("create").className="btn";
    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML = "<div id='aff-a-moi'></div><div id='aff-par-moi'></div>";
}

//affiche liste des tâches affectées à l'utilisateur connecté
function afficherTaskListToMe(array, length){
    document.getElementById("aff-a-moi").innerHTML +="<h2 align='center'>Liste des tâches affectées à vous </h2><ul id='liste-taches-a-moi'></ul>";
        if(length==0){        
            document.getElementById("liste-taches-a-moi").innerHTML +='<dt><dd style="color:black;">Aucune tâche à afficher.</dd></dt>';
        }
        else{
            for (var i = 0; i < length; i++) {
                document.getElementById("liste-taches-a-moi").innerHTML +=`<a role="button" class="btn liste" id="tto`+i+`" style="text-align: left;" onclick="afficherTaskProperties(`+array[i].DisplayID+`);objectColor('tto`+i+`');"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
            } 
        }
}

//affiche liste des tâches créées par l'utilisateur connecté
function afficherTaskListFromMe(array, length){
    document.getElementById("aff-par-moi").innerHTML +="<h2 align='center'>Liste des tâches créées par vous</h2><ul id='liste-taches-par-moi'></ul>";
    if(length==0){        
        document.getElementById("liste-taches-par-moi").innerHTML +='<dt><dd style="color:black;">Aucune tâche à afficher.</dd></dt>';
    }
    else{
        for (var i = 0; i < length; i++) {
            document.getElementById("liste-taches-par-moi").innerHTML +=`<a role="button" class="btn liste" id="tfrom`+i+`" style="text-align: left;" onclick="afficherTaskProperties(`+array[i].DisplayID+`);objectColor('tfrom`+i+`');"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
        } 
    }
}

//affiche les propriétés de la tâche affichée
function afficherTaskProperties(ID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center' style='color:rgb(25,80,134);'>Propriétés</h3>";

    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;

    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var jsonTask = JSON.parse(this.responseText);
            var respArray = jsonTask.Properties;
            var N = respArray.length;
            afficheProperties(respArray, N);
        }
    });
    XHR.open("GET", "http://localhost/REST/objects/10/"+ID+"?include=properties");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();
}


//onclick boutonn Clients sur le menu à gauche
function getClients(){
    var token = getTokenURL();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        var jsonClients = JSON.parse(this.responseText);
        var arrayClients = new Array();
        arrayClients = jsonClients.Items;
        arrayClients.sort((a, b) => parseFloat(b.DisplayID) - parseFloat(a.DisplayID));
        //console.log("number of items "+arrayClients.length);
        //console.log(arrayClients[0].Title+" "+arrayClients[0].ObjVer.ID);
        afficherClientList(arrayClients, arrayClients.length);
    }
    });

    xmlhttp.open("GET", "http://localhost/REST/objects/136");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
}

function afficherClientList(array, length){
    document.getElementById("vues").className="btn";
    document.getElementById("clients").className="btn active";
    document.getElementById("taches").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";
    document.getElementById("create").className="btn";

    document.getElementById("content").innerHTML = "";
    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des clients</h2><ul id='liste-clients'></ul>";
    if(length==0){
        document.getElementById("liste-clients").innerHTML ='<dt><dd style="color:black;">Aucun client à afficher.</dd></dt>';

    }else{
        for (var i = 0; i < length; i++) {
            document.getElementById("liste-clients").innerHTML +=`<a role="button" class="btn liste" id="cli`+i+`" onclick="afficherClientProperties(`+array[i].DisplayID+`);objectColor('cli`+i+`');"  style="text-align: left;"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifié le: `+array[i].LastModified+` | Créé le: `+array[i].Created+`</dd></dt></a>`;                
        } 
    }
}

function afficherClientProperties(cliID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center' style='color:rgb(25,80,134);'>Propriétés</h3>";

    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;

    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var jsonClient = JSON.parse(this.responseText);
            var respArray = jsonClient.Properties;
            var N = respArray.length;
            afficheProperties(respArray, N);
        }
    });
    XHR.open("GET", "http://localhost/REST/objects/136/"+cliID+"?include=properties");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();

}

//bouton factures onclick
//////////////////////////////////////
function getFactures(){
    document.getElementById("vues").className="btn";
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn active";
    document.getElementById("rapports").className="btn";
    document.getElementById("create").className="btn";


    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des factures </h2>";
    document.getElementById("content").innerHTML +='<button align="center" class="btn" onclick="getFClients();" style="width:40%;" id="fact_cli">Factures Clients</button><button align="center" class="btn" onclick="getFFourn();" style="width:40%;margin-left:15%;" id="fact_fourn">Factures Fournisseurs</button><br/><br/>';

}
function getFClients(){
    document.getElementById("content").innerHTML ="";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des factures clients</h2>";
    document.getElementById("content").innerHTML +='<button align="center" class="btn" onclick="getFClients();" style="width:40%;">Factures Clients</button><button align="center" class="btn" onclick="getFFourn();" style="width:40%;margin-left:15%;">Factures Fournisseurs</button><br/>';
    document.getElementById("content").innerHTML +="<ul id='liste-factures'></ul>";


    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var jsonf = JSON.parse(this.responseText);
            var array = jsonf.Items;
            array.sort((a, b) => parseFloat(b.DisplayID) - parseFloat(a.DisplayID));
            var length = array.length;            
            document.getElementById("liste-factures").innerHTML = "";
            if(length==0){        
                document.getElementById("liste-factures").innerHTML ='<dt><dd style="color:black;">Aucune facture à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-factures").innerHTML +=`<a role="button" class="btn liste" id="fcli`+i+`"  style="text-align: left;" onclick="afficherFactProperties(`+array[i].DisplayID+`);objectColor('fcli`+i+`');"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
                } 
            }

        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects?p100=89");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function getFFourn(){
    document.getElementById("content").innerHTML ="";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des factures fournisseurs</h2>";
    document.getElementById("content").innerHTML +='<button align="center" class="btn" onclick="getFClients();" style="width:40%;">Factures Clients</button><button align="center" class="btn" onclick="getFFourn();" style="width:40%;margin-left:15%;">Factures Fournisseurs</button><br/>';
    document.getElementById("content").innerHTML +="<ul id='liste-factures'></ul>";

    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var jsonf = JSON.parse(this.responseText);
            var array = jsonf.Items;
            array.sort((a, b) => parseFloat(b.DisplayID) - parseFloat(a.DisplayID));
            var length = array.length;            
            document.getElementById("liste-factures").innerHTML = "";
            if(length==0){        
                document.getElementById("liste-factures").innerHTML ='<dt><dd style="color:black;">Aucune facture à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-factures").innerHTML +=`<a role="button" class="btn liste" id="ffourn`+i+`"  style="text-align: left;" onclick="afficherFactProperties(`+array[i].DisplayID+`);objectColor('ffourn`+i+`');"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
                } 
            }

        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0?p100=2");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function afficherFactProperties(ID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center' style='color:rgb(25,80,134);'>Propriétés</h3>";
    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var jsonF = JSON.parse(this.responseText);   
            var fileArray = jsonF.Files;
            var obPropArray = jsonF.Properties;
            var N = obPropArray.length;
            afficheProperties(obPropArray, N);
            //boucle d'affichage des fichiers
            document.getElementById("object").innerHTML +="<h4><b><i>Fichiers </i></b></h4>";
            var F = fileArray.length;
            for(var k = 0;  k<F;k++){
                var fileID = fileArray[k].ID;
                document.getElementById("object").innerHTML += '<p><b>Nom: </b>'+fileArray[k].Name+'<br><b>ID: </b>'+fileArray[k].ID+'<br><b>Version: </b>'+fileArray[k].Version+'<br><b>Taille: </b>'+fileArray[k].Size+'<br/><b>Extension: </b>'+fileArray[k].Extension+'<br/><button class=btn id="dl-f" onclick="ouvrirFile(0, '+ID+', '+fileID+')">Ouvrir</button></p><br/><br/>';

            }
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0/"+ID+"?include=properties");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function ouvrirFile(objT, objID, fileID){
 
    var token = getTokenURL();

    //get vault guid
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;                  
    var url = "http://localhost/REST/session/vault";
    
    xmlhttp.onreadystatechange = function () { 
        if (xmlhttp.readyState == 4) {
            //console.log(this.responseText);
            var jsonVault = JSON.parse(this.responseText);
            jsonVault.GUID = jsonVault.GUID.replace("{", "");
            jsonVault.GUID = jsonVault.GUID.replace("}", "");

            //open mfiles url
            window.open("m-files://open/"+jsonVault.GUID+"/"+objT+"-"+objID+"/"+fileID, '_blank');
        }
        else {
            console.log("Failed to get vault info.");
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("X-Authentication", token); 
    xmlhttp.send();
}

//affichage des rapports financiers
////////////////////////////////////

function getRapportsF(){
    document.getElementById("vues").className="btn";
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn active";
    document.getElementById("create").className="btn";


    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des rapports financiers</h2>";
    document.getElementById("content").innerHTML +="<ul id='liste-rapports'></ul>";

    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var jsonf = JSON.parse(this.responseText);
            var array = jsonf.Items;
            array.sort((a, b) => parseFloat(b.DisplayID) - parseFloat(a.DisplayID));
            var length = array.length;            
            document.getElementById("liste-rapports").innerHTML = "";
            if(length==0){        
                document.getElementById("liste-rapports").innerHTML ='<dt><dd style="color:black;">Aucun rapport à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-rapports").innerHTML +=`<a role="button" class="btn liste" id="rf`+i+`" style="text-align: left;" onclick="afficherRapportProperties(`+array[i].DisplayID+`);objectColor('rf`+i+`');"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
                } 
            }

        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0?p100=62");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function afficherRapportProperties(ID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center' style='color:rgb(25,80,134);'>Propriétés</h3>";


    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var jsonF = JSON.parse(this.responseText);   
            var fileArray = jsonF.Files;
            var obPropArray = jsonF.Properties;
            var N = obPropArray.length;
            afficheProperties(obPropArray, N);
            //boucle d'affichage des fichiers
            document.getElementById("object").innerHTML +="<h4><b><i>Fichiers </i></b></h4>";
            var F = fileArray.length;
            for(var k = 0;  k<F;k++){
                var fileID = fileArray[k].ID;
                document.getElementById("object").innerHTML += '<p><b>Nom: </b>'+fileArray[k].Name+'<br><b>ID: </b>'+fileArray[k].ID+'<br><b>Version: </b>'+fileArray[k].Version+'<br><b>Taille: </b>'+fileArray[k].Size+'<br/><button class=btn onclick="ouvrirFile(0, '+ID+', '+fileID+')">Ouvrir</button></p><br/><br/>';

            }
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0/"+ID+"?include=properties");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

//affichege des Workflow
////////////////////////////////////////////////////////////////
function getWorkflow(){
    document.getElementById("vues").className="btn";
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn active";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";
    document.getElementById("create").className="btn";


    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des workflows</h2>";
    document.getElementById("content").innerHTML +="<ul id='liste-wf'></ul>";
    //document.getElementById("liste-wf").innerHTML = "";

    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var jsonArr = JSON.parse(this.responseText);
            jsonArr.sort((a, b) => parseFloat(b.ID) - parseFloat(a.ID));
            var length = jsonArr.length;            
            if(length==0){        
                document.getElementById("liste-wf").innerHTML ='<dt><dd style="color:black;">Aucun workflow à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-wf").innerHTML +=`<a role="button" class="btn liste" id="wf`+i+`"  onclick="afficherWFProperties(`+jsonArr[i].ID+`);objectColor('wf`+i+`');" style="text-align: left;width=100%;"><dt><dd style="color:black;">`+jsonArr[i].Name+`</dd><dd> ID: `+jsonArr[i].ID+`</dd></dt></a><br/>`;                
                } 
            }
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/structure/workflows");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
    document.getElementById("content").innerHTML +="<h4 align='center' style='color:rgb(25,80,134);'>Etats du workflow séléctionné</h4>";
    document.getElementById("content").innerHTML +='<div id="wf-states"></div>';

}

//affichage des etapes de workflow cliqué
function afficherWFProperties(wfID){
    document.getElementById("wf-states").innerHTML ='';
    document.getElementById("wf-states").innerHTML += '<h4 align="center" style="color:#5b9bd1;">Prochains états possibles du workflow ID: '+wfID+'</h4><ul id="liste-next-states"></ul></div>';

    var token = getTokenURL();
    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;

    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var jsonArr = JSON.parse(this.responseText);
            var length = jsonArr.length;   
            jsonArr.sort((a, b) => parseFloat(b.ID) - parseFloat(a.ID));
    
            if(length==0){        
                document.getElementById("liste-next-states").innerHTML ='<dt><dd style="color:black;">Aucun état workflow à afficher.</dd></dt>';
            }
                else{
                for (var i = 0; i < length; i++) {
                    if(jsonArr[i].Selectable == true){
                        document.getElementById("liste-next-states").innerHTML +=`<p  style="text-align: left;"><dd style="color:black;">Nom: `+jsonArr[i].Name+`</dd><dd> State ID: `+jsonArr[i].ID+`</dd><dd> Selectable: `+jsonArr[i].Selectable+`</dd></p>`;                
                        }else{
                            document.getElementById("liste-next-states").innerHTML +=`<p  style="text-align: left;"><dt><dd style="color:black;">Nom: `+jsonArr[i].Name+`</dd><dd> State ID: `+jsonArr[i].ID+`</dd></p>`;                
    
                        }  
                } 
            }
        }
    });
    XHR.open("GET", "http://localhost/REST/structure/workflows/"+wfID+"/states?currentstate=108");
    XHR.setRequestHeader("X-Authentication", token);
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();

}

function getViews(){

    document.getElementById("vues").className="btn active";
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";
    document.getElementById("create").className="btn";


    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";

    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;
    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var jsonViewsList = JSON.parse(this.responseText);
            var arrViews = jsonViewsList.Items;
            var N = arrViews.length;
            arrViews.sort((a, b) => parseFloat(a.View.ID) - parseFloat(b.View.ID));
            document.getElementById("content").innerHTML +="<h4 align='center' style='color:rgb(25,80,134);'>Liste des Vues (Path : /) </h4><br/><br/><div class='list-group' id='liste-vues'></div>";
            if (N == 0){document.getElementById("liste-vues").innerHTML +="<dt><dd>Aucun élément ici.</p></dd>";} 
            for(var i = 0; i<N ; i++){
                console.log(arrViews[i]);
                document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id='vue"+i+"'  onclick='getSubViews("+arrViews[i].View.ID+");objectColor(`vue"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;'><dt><dd style='color:black;'>"+arrViews[i].View.Name+"</dd><dd> ID: "+arrViews[i].View.ID+"</dd></dt></a>";
            }
        }
    });
    XHR.open("GET", "http://localhost/REST/views/items");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();

}

function getSubViews(vID){
    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;
    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
            var jsonViewsList = JSON.parse(this.responseText);
            var arrViews = jsonViewsList.Items;
            document.getElementById("object").innerHTML="";
            document.getElementById("content").innerHTML = "";
            document.getElementById("content").innerHTML +="<h4 align='center' style='color:rgb(25,80,134);'>Liste des Vues "+jsonViewsList.viewPathInfos[0].ViewName+" (Path: /"+vID+")</h4>";
            document.getElementById("content").innerHTML += "<button class='btn btn-info' style='align:center;font-size:1.2em;' onclick='getViews();'>Retour à Path: / </button>";
            document.getElementById("content").innerHTML +="<br/><br/><ul id='liste-vues'></ul>";
            var N = arrViews.length;  
            if (N == 0){document.getElementById("liste-vues").innerHTML +="<dt><dd>Aucun élément ici.</p></dd>";}
            for(var i = 0; i<N ; i++){
                console.log(arrViews[i]);
                if(arrViews[i].FolderContentItemType == 1){
                    document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id=subv1'"+i+"' onclick='getViewsByClass("+vID+","+arrViews[i].View.ID+");objectColor(`subv1"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;'><dt><dd style='color:black;'>"+arrViews[i].View.Name+"</dd><dd> ID: "+arrViews[i].View.ID+"</dd></dt></a>";
                } if(arrViews[i].FolderContentItemType == 4){
                    document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id='subv4"+i+"' onclick='objectColor(`subv4"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;'><dt><dd style='color:black;'>"+arrViews[i].ObjectVersion.EscapedTitleWithID+"</dd><dd> ID: "+arrViews[i].ObjectVersion.DisplayID+"</dd></dt></a>";
                }
            }
        }
    });
    XHR.open("GET", "http://localhost/REST/views/v"+vID+"/items");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();
}

function getViewsByClass(vID, subvID){
    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;
    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
            var jsonViewsList = JSON.parse(this.responseText);
            document.getElementById("object").innerHTML="";
            document.getElementById("content").innerHTML = "";
            document.getElementById("content").innerHTML +="<h4 align='center' style='color:rgb(25,80,134);'>Liste des Vues "+jsonViewsList.viewPathInfos[0].ViewName+" > "+jsonViewsList.viewPathInfos[1].ViewName+" (Path: /"+vID+"/"+subvID+")</h4>";
            document.getElementById("content").innerHTML += "<button class='btn btn-info' align ='middle' onclick='getSubViews("+vID+");'>Retour à Path: /"+vID+" </button>";
            document.getElementById("content").innerHTML +="<br/><br/><ul id='liste-vues'></ul>";
            var arrViews = jsonViewsList.Items;
            var N = arrViews.length;
            if (N == 0){document.getElementById("liste-vues").innerHTML +="<dt><dd>Aucun élément ici.</p></dd>";}
            for(var i = 0; i<N ; i++){
                if(arrViews[i].FolderContentItemType == 1){
                    document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id='vuecl1"+i+"' onclick='objectColor(`vuecl1"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;' onclick='getViewsByClass("+vID+","+arrViews[i].View.ID+");'><dt><dd style='color:black;'>"+arrViews[i].View.Name+"</dd><dd> ID: "+arrViews[i].View.ID+"</dd></dt></a>";
                } if(arrViews[i].FolderContentItemType == 4){
                    document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id='vuecl4"+i+"' onclick='objectColor(`vuecl4"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;'><dt><dd style='color:black;'>"+arrViews[i].ObjectVersion.EscapedTitleWithID+"</dd><dd> ID: "+arrViews[i].ObjectVersion.DisplayID+"</dd></dt></a>";
                }
                if(arrViews[i].FolderContentItemType == 2){
                    if(!arrViews[i].PropertyFolder.Lookup){
                        document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id='vuecl21"+i+"' onclick='objectColor(`vuecl21"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;'><dt><dd style='color:black;'>"+arrViews[i].PropertyFolder.DisplayValue+"</dd><dd>Valeur: "+arrViews[i].PropertyFolder.Value+"</dd></dt></a>";
                    } 
                    if(arrViews[i].PropertyFolder.Lookup){
                        document.getElementById("liste-vues").innerHTML +="<a role='button' class='btn' id='vuecl22"+i+"' onclick='objectColor(`vuecl22"+i+"`);' style='text-align: left;width:100%;font-size:1.2em;background-color:#f5f5f5;margin:10px;'><dt><dd style='color:black;'>"+arrViews[i].PropertyFolder.DisplayValue+"</dd><dd>ID: "+arrViews[i].PropertyFolder.Lookup.Item+"</dd></dt></a>";
                    }
                }
            }
        }
    });
    XHR.open("GET", "http://localhost/REST/views/v"+vID+"/v"+subvID+"/items");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();

}
