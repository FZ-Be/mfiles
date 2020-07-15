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
            formatUser(jsonUser);
        }
        else {console.log("Failed to get user info.")
        ;}
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("X-Authentication", token); 
    xmlhttp.send();
}
//données du coffre auquel utilisateur est connecté
function getVault(tokenV){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;                  
    var url = "http://localhost/REST/session/vaults";
    
    xmlhttp.onreadystatechange = function () { 
        if (xmlhttp.readyState == 4) {
            //console.log(this.responseText);
            var jsonVault = JSON.parse(this.responseText);
            jsonVault[0].GUID = jsonVault[0].GUID.replace("{", "");
            jsonVault[0].GUID = jsonVault[0].GUID.replace("}", "");
            document.getElementById("vname").innerHTML = "<h4> <img src='img/vault_s1_blue.png' alt='Coffre: '>  "+jsonVault[0].Name+"</h4>"+jsonVault[0].GUID;
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
function formatUser(jU){
    //fonction prend objet json et met ses valeurs dans le code html
    document.getElementById("fname").innerHTML = "<h3>"+jU.FullName+"</h3>";
    document.getElementById("accname").innerHTML = "<h5>"+jU.AccountName+" ID: "+jU.UserID+"</h5>";
}
///////////////////////////////////////////////////////////////////////////////////////
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
        //console.log("number of items "+arrayClients.length);
        //console.log(arrayClients[0].Title+" "+arrayClients[0].ObjVer.ID);
        formatClientList(arrayClients, arrayClients.length);
    }
    });

    xmlhttp.open("GET", "http://localhost/REST/objects/136");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
}
function formatClientList(array, length){
    document.getElementById("clients").className="btn active";
    document.getElementById("taches").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";


    document.getElementById("content").innerHTML = "";
    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des clients</h2><ul id='liste-clients'></ul>";
    if(length==0){
        document.getElementById("liste-clients").innerHTML ='<dt><dd style="color:black;">Aucun client à afficher.</dd></dt>';

    }else{
        for (var i = 0; i < length; i++) {
            var string = JSON.stringify(array[i]);
            document.getElementById("liste-clients").innerHTML +=`<a role="button" class="btn"  onclick="formatClient(`+array[i].DisplayID+`);"  style="text-align: left;"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifié le: `+array[i].LastModified+` | Créé le: `+array[i].Created+`</dd></dt></a>`;                
        } 
    }
}

function formatClient(cliID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center'>Propriétés</h3>";

    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;

    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var jsonClient = JSON.parse(this.responseText);
            var respArray = jsonClient.Properties;
            var N = respArray.length;

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
                                document.getElementById("object").innerHTML +="<p><b>"+propArray[j].Name+":</b> "+respArray[i].TypedValue.Value+"</p>";
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
    });
    XHR.open("GET", "http://localhost/REST/objects/136/"+cliID+"?include=properties");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();

}

//onclick boutonn tâches affectées à moi sur le menu à gauche
function getTaskToMe(){
    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        var jsonU = JSON.parse(this.responseText);
        var ID = jsonU.UserID;

        //requete asynch dans une requete asynch pour faire passage de l'ID à requete des tâches
        var XHR = new XMLHttpRequest();
        XHR.withCredentials = false;

        XHR.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                var json = JSON.parse(this.responseText);
                var arrayTasks = new Array();
                arrayTasks = json.Items;
                formatTaskList(arrayTasks, arrayTasks.length);
            }
            });
            XHR.open("GET", "http://localhost/REST/objects/10?p44"+ID);
            XHR.setRequestHeader("X-Authentication", token);
            XHR.setRequestHeader("Content-Type", "application/json");
            XHR.send();
        }

    });
    xmlhttp.open("GET", "http://localhost/REST/session");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();
}

function formatTaskList(array, length){
    document.getElementById("taches").className="btn active";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";

    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des tâches affectées à vous </h2><ul id='liste-taches'></ul>";
    if(length==0){        
        document.getElementById("liste-taches").innerHTML ='<dt><dd style="color:black;">Aucune tâche à afficher.</dd></dt>';
    }
    else{
        for (var i = 0; i < length; i++) {
            document.getElementById("liste-taches").innerHTML +=`<a role="button" class="btn" style="text-align: left;" onclick="formatTask(`+array[i].DisplayID+`)"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
        } 
    }

}

function formatTask(ID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center'>Propriétés</h3>";

    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;

    XHR.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            //console.log(this.responseText);
            var jsonTask = JSON.parse(this.responseText);
            var respArray = jsonTask.Properties;
            var N = respArray.length;

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
                                document.getElementById("object").innerHTML +="<p><b>"+propArray[j].Name+":</b> "+respArray[i].TypedValue.Value+"</p>";
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
    });
    XHR.open("GET", "http://localhost/REST/objects/10/"+ID+"?include=properties");
    XHR.setRequestHeader("X-Authentication", getTokenURL());
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send();
}


//bouton factures onclick
//////////////////////////////////////
function getFactures(){
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn active";
    document.getElementById("rapports").className="btn";

    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Liste des factures </h2>";
    document.getElementById("content").innerHTML +='<button align="center" class="btn" onclick="getFClients();" style="width:40%;">Factures Clients</button><button align="center" class="btn" onclick="getFFourn();" style="width:40%;margin-left:15%;">Factures Fournisseurs</button><br/><br/>';

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
            var length = array.length;            
            document.getElementById("liste-factures").innerHTML = "";
            if(length==0){        
                document.getElementById("liste-factures").innerHTML ='<dt><dd style="color:black;">Aucune facture à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-factures").innerHTML +=`<a role="button" class="btn"  style="text-align: left;" onclick="formatFact(`+array[i].DisplayID+`)"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
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
            var length = array.length;            
            document.getElementById("liste-factures").innerHTML = "";
            if(length==0){        
                document.getElementById("liste-factures").innerHTML ='<dt><dd style="color:black;">Aucune facture à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-factures").innerHTML +=`<a role="button" class="btn"  style="text-align: left;" onclick="formatFact(`+array[i].DisplayID+`)"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
                } 
            }

        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0?p100=2");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function formatFact(ID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center'>Propriétés</h3>";
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


            var XHR = new XMLHttpRequest();
            XHR.withCredentials = false;

            XHR.addEventListener("readystatechange", function() {
                if(this.readyState === 4) {
                    //console.log(this.responseText);
                    var propArray = JSON.parse(this.responseText);
                    var M = propArray.length;
                    for(var i = 0; i<N;i++){ //boucle dans la liste des proprietes de la facture
                        for(var j = 0; j<M; j++){//boucle dans /structure/propriete
                            if(obPropArray[i].PropertyDef == propArray[j].ID){
                                document.getElementById("object").innerHTML +="<p><b>"+propArray[j].Name+":</b> "+obPropArray[i].TypedValue.Value+"</p>";
                            }
                        }
                    }
                }
            });
            XHR.open("GET", "http://localhost/REST/structure/properties");
            XHR.setRequestHeader("X-Authentication", getTokenURL());
            XHR.setRequestHeader("Content-Type", "application/json");
            XHR.send();

            //boucle d'affichage des fichiers
            document.getElementById("object").innerHTML +="<h4><b><i>Fichiers </i></b></h4>";
            var F = fileArray.length;
            for(var k = 0;  k<F;k++){
                var fileID = fileArray[k].ID;
                document.getElementById("object").innerHTML += '<p><b>Nom: </b>'+fileArray[k].Name+'<br><b>Taille: </b>'+fileArray[k].Size+'<br/><button class=btn id="dl-f" onclick="dlFile(0, '+ID+', '+fileID+')">Télecharger</button></p><br/><br/>';

            }
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0/"+ID+"?include=properties");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function dlFile(objT, obID, fileID){

    var token = getTokenURL();
    //premiere requete pour recevoir l'ID
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
        console.log(this.responseText);            
        var data = "text/json;charset=utf-8," + encodeURIComponent(this.responseText);
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/"+objT+"/"+obID+"/latest/"+fileID+"/content");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

//affichage des rapports financiers
////////////////////////////////////

function getRapportsF(){
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn active";

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
            var length = array.length;            
            document.getElementById("liste-rapports").innerHTML = "";
            if(length==0){        
                document.getElementById("liste-rapports").innerHTML ='<dt><dd style="color:black;">Aucun rapport à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-rapports").innerHTML +=`<a role="button" class="btn"  style="text-align: left;" onclick="formatRapport(`+array[i].DisplayID+`)"><dt><dd style="color:black;">`+array[i].Title+`</dd><dd> ID: `+array[i].DisplayID+` | Modifiée le: `+array[i].LastModified+` | Créée le: `+array[i].Created+`</dd></dt></a>`;                
                } 
            }

        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0?p100=62");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

function formatRapport(ID){
    document.getElementById("object").innerHTML="";
    document.getElementById("object").innerHTML +="<h3 align='center'>Propriétés</h3>";


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


            var XHR = new XMLHttpRequest();
            XHR.withCredentials = false;

            XHR.addEventListener("readystatechange", function() {
                if(this.readyState === 4) {
                    //console.log(this.responseText);
                    var propArray = JSON.parse(this.responseText);
                    var M = propArray.length;
                    for(var i = 0; i<N;i++){ //boucle dans la liste des proprietes de la facture
                        for(var j = 0; j<M; j++){//boucle dans /structure/propriete
                            if(obPropArray[i].PropertyDef == propArray[j].ID){
                                document.getElementById("object").innerHTML +="<p style='text-align: left;'><b>"+propArray[j].Name+":</b> "+obPropArray[i].TypedValue.Value+"</p>";
                            }
                        }
                    }
                }
            });
            XHR.open("GET", "http://localhost/REST/structure/properties");
            XHR.setRequestHeader("X-Authentication", getTokenURL());
            XHR.setRequestHeader("Content-Type", "application/json");
            XHR.send();

            //boucle d'affichage des fichiers
            document.getElementById("object").innerHTML +="<h4><b><i>Fichiers </i></b></h4>";
            var F = fileArray.length;
            for(var k = 0;  k<F;k++){
                var fileID = fileArray[k].ID;
                document.getElementById("object").innerHTML += '<p><b>Nom: </b>'+fileArray[k].Name+'<br><b>Taille: </b>'+fileArray[k].Size+'<br/><button class=btn onclick="dlFile(0, '+ID+', '+fileID+')">Télecharger</button></p><br/><br/>';

            }
        }
    });
    xmlhttp.open("GET", "http://localhost/REST/objects/0/"+ID+"?include=properties");
    xmlhttp.setRequestHeader("X-Authentication", token);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send();

}

//Workflow
////////////////////////////////////////////////////////////////
function getWorkflow(){
    document.getElementById("taches").className="btn";
    document.getElementById("clients").className="btn";
    document.getElementById("workflow").className="btn active";
    document.getElementById("factures").className="btn";
    document.getElementById("rapports").className="btn";

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
            var length = jsonArr.length;            
            if(length==0){        
                document.getElementById("liste-wf").innerHTML ='<dt><dd style="color:black;">Aucun workflow à afficher.</dd></dt>';
            }
             else{
                for (var i = 0; i < length; i++) {
                    document.getElementById("liste-wf").innerHTML +=`<a role="button" class="btn" style="text-align: left;" onclick="formatWF(`+jsonArr[i].ID+`)"><dt><dd style="color:black;">`+jsonArr[i].Name+`</dd><dd> ID: `+jsonArr[i].ID+`</dd></dt></a><br/>`;                
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

function formatWF(wfID){
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
                    if(length==0){        
                        document.getElementById("liste-next-states").innerHTML ='<dt><dd style="color:black;font-size:1.4em;">Aucun état workflow à afficher.</dd></dt>';
                    }
                     else{
                        for (var i = 0; i < length; i++) {
                            if(jsonArr[i].Selectable == true){
                                document.getElementById("liste-next-states").innerHTML +=`<p  style="text-align: left;"><dd style="color:black;font-size:1em;">Nom: `+jsonArr[i].Name+`</dd><dd> State ID: `+jsonArr[i].ID+`</dd><dd> Selectable: `+jsonArr[i].Selectable+`</dd></p>`;                
                                }else{
                                    document.getElementById("liste-next-states").innerHTML +=`<p  style="text-align: left;"><dt><dd style="color:black;font-size:1em;">Nom: `+jsonArr[i].Name+`</dd><dd> State ID: `+jsonArr[i].ID+`</dd></p>`;                
            
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
