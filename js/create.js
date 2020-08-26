//avoir le token depuis l'uri courant (parametre get)
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
//meme fonction
function getUser(){
    var token = getTokenURL();
    //request user info using the token
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;                  
    var url = "http://localhost/REST/session";
    xmlhttp.onreadystatechange = function () { 
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var jU = JSON.parse(this.responseText);
            //fonction prend objet json et met ses valeurs dans le code html
            //document.getElementById("fname").innerHTML= "<h3>"+jU.AccountName+" (ID: "+jU.UserID+")</h3>";
            document.getElementById("fname").innerHTML = "<h3>"+jU.FullName+"</h3>";
            document.getElementById("accname").innerHTML = "<h5>"+jU.AccountName+" ID: "+jU.UserID+"</h5>";    
        }
        else {console.log("Failed to get user info.")
        ;}
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("X-Authentication", token); 
    xmlhttp.send();

    var XHR = new XMLHttpRequest();
    XHR.withCredentials = false;                                  
    XHR.onreadystatechange = function () { 
        if (XHR.readyState == 4) {
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
    XHR.open("GET", "http://localhost/REST/session/vault", true);
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.setRequestHeader("X-Authentication", token); 
    XHR.send();
}
//retourner à page welcome
function pageWelcome(){
    window.location.replace('welcome.html?token='+getTokenURL());

}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//                      Création de factures client et fournisseur                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////

//afficher les formulaires de création de factures

function getFormCreer(type){
    if (type === `facture`){
    document.getElementById("cr_tache").className="btn";
    document.getElementById("cr_client").className="btn";
    document.getElementById("cr_facture").className="btn active";
    document.getElementById("cr_rapport").className="btn";

    //document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Choisissez la classe de document</h2>";
    document.getElementById("content").innerHTML +="<button align='center' class='btn' onclick='getFormFacture(`client`);' style='width:40%;'>Facture Client</button><button align='center' class='btn' onclick='getFormFacture(`fournisseur`);' style='width:40%;margin-left:15%;'>Facture Fournisseur</button><br/><br/>";
    } else if(type === `client`){       
        document.getElementById("cr_tache").className="btn";
        document.getElementById("cr_client").className="btn active";
        document.getElementById("cr_facture").className="btn";
        document.getElementById("cr_rapport").className="btn";

        //document.getElementById("object").innerHTML="";
        document.getElementById("content").innerHTML = "";
        document.getElementById("content").innerHTML += '<iframe src="form_client.html?token='+getTokenURL()+'" height=700 width=85% style="border:none;"></iframe>';

    } else if(type === `rapportfin`){       
        document.getElementById("cr_tache").className="btn";
        document.getElementById("cr_client").className="btn";
        document.getElementById("cr_facture").className="btn";
        document.getElementById("cr_rapport").className="btn active";

        //document.getElementById("object").innerHTML="";
        document.getElementById("content").innerHTML = "";
        document.getElementById("content").innerHTML += '<iframe src="form_rapportfin.html?token='+getTokenURL()+'" height=700 width=85% style="border:none;"></iframe>';

    } else if(type === `tache`){       
        document.getElementById("cr_tache").className="btn active";
        document.getElementById("cr_client").className="btn";
        document.getElementById("cr_facture").className="btn";
        document.getElementById("cr_rapport").className="btn";

        //document.getElementById("object").innerHTML="";
        document.getElementById("content").innerHTML = "";
        document.getElementById("content").innerHTML += '<iframe src="form_tache.html?token='+getTokenURL()+'" height=700 width=85% style="border:none;"></iframe>';

    }
}

//afficher ou bien formulaire de facture client ou fournisseur
//selon le bouton cliqué

function getFormFacture(type){
    if(type ==="client"){
        document.getElementById("content").innerHTML = '';
        getFormCreer('facture');
        document.getElementById("content").innerHTML += '<iframe src="form_facture_client.html?token='+getTokenURL()+'" height=700 width=85% style="border:none;"></iframe>';
    }else if (type ==="fournisseur"){
        document.getElementById("content").innerHTML = '';
        getFormCreer('facture');
        document.getElementById("content").innerHTML += '<iframe src="form_facture_fourn.html?token='+getTokenURL()+'" height=700 width=85% style="border:none;"></iframe>';
    }
}

//création de facture client
function creeFactureClient(upID, size, title, ext){   
        var dateDoc = new Date(document.getElementById("fact-date-d").value);
        var clientID = document.getElementById("fact-client").value;
        clientID = parseInt(clientID);
        var clientN = document.getElementById("fact-client").options[document.getElementById("fact-client").selectedIndex].text;
        var projetID = document.getElementById("fact-projet").value;
        projetID = parseInt(projetID);
        var projetN = document.getElementById("fact-projet").options[document.getElementById("fact-projet").selectedIndex].text;;
        var motsCles = document.getElementById("fact-mots-cles").value;
        var descr = document.getElementById("fact-descr").value;

        //{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},
            var data = JSON.stringify({"PropertyValues":[{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},{"PropertyDef":100,"TypedValue":{"DataType":9,"Lookup":{"Item":89,"Version":-1}}},{"PropertyDef":1078,"TypedValue":{"DataType":10,"Lookups":[{"Item":projetID,"Version":-1,"ObjectType":101,"Value":projetN,"ObjectFlags":64}]}},{"PropertyDef":1079,"TypedValue":{"DataType":10,"Lookups":[{"Item":clientID,"Version":-1,"ObjectType":136,"DisplayValue":clientN,"ObjectFlags":64}]}},{"PropertyDef":1002,"TypedValue":{"DataType":5,"Value":dateDoc}},{"PropertyDef":1004,"TypedValue":{"DataType":1,"Value":motsCles,"SortingKey":";"}},{"PropertyDef":1034,"TypedValue":{"DataType":13,"Value":descr}}],"Files":[{"UploadID": upID, "Size": size, "Title":title, "Extension": ext}]}); 
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log("Création de l'objet en cours...");
                console.log(this.responseText);
                var jsonFact = JSON.parse(this.responseText);
                document.getElementById("fact-created").innerHTML ="";
                document.getElementById("fact-created").innerHTML += `<br><p align=center>La facture client ID: `+jsonFact.DisplayID+` au titre: `+jsonFact.Title+` a été créée. <button class="btn btn-info" onclick="window.open('welcome.html?click=factureclient&token=`+getTokenURL()+`');">Voir facture</button></p></br>`;
                document.getElementById("fact-form").reset(); 
            }
        });  
        xmlhttp.open("POST", "http://localhost/REST/objects/0?checkIn=true", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(data);
}

//création de facture fournisseur (retourne json ID 0 et données vides, à régler)

function creeFactureFournisseur(upID, size, title, ext){
        var titre = document.getElementById("fact-titre").value;
        var dateDoc = new Date(document.getElementById("fact-date-d").value);
        var motsCles = document.getElementById("fact-mots-cles").value;
        var descr = document.getElementById("fact-descr").value;

        console.log(titre+" "+dateDoc+" "+motsCles+" "+descr);
        //{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},
        var data = JSON.stringify({"PropertyValues":[{"PropertyDef":0,"TypedValue":{"DataType":1,"Value":titre}},{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},{"PropertyDef":38,"TypedValue":{"Lookup":{"Item":102,"Version":-1,"Value":"Vérification et approbation des factures fournisseurs"}, "DataType":9}},{"PropertyDef":39,"TypedValue":{"Lookup":{"Item":108,"Version":-1,"Value":"Reçue, en attente de vérification"}, "HasValue":true, "DataType":9}},{"PropertyDef":100,"TypedValue":{"DataType":9,"Lookup":{"Item":2,"Version":-1}}},{"PropertyDef":1002,"TypedValue":{"DataType":5,"HasValue": true,"Value":dateDoc}},{"PropertyDef":1004,"TypedValue":{"DataType":1,"Value":motsCles,"SortingKey":";"}},{"PropertyDef":1034,"TypedValue":{"DataType":13,"HasValue": true,"Value":descr}}],"Files":[{"UploadID": upID, "Size": size, "Title":title, "Extension": ext}]}); 
        console.log(data);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log("Création de l'objet en cours...");
                console.log(this.responseText);
                var jsonFact = JSON.parse(this.responseText);

                document.getElementById("fact-form").reset(); 
                document.getElementById("fact-created").innerHTML = "";
                document.getElementById("fact-created").innerHTML += `<br><p align=center>La facture fournisseur ID: `+jsonFact.DisplayID+` au titre: `+jsonFact.Title+` a été créée.<button class="btn btn-info" onclick="window.open('welcome.html?click=facturefournisseur&token=`+getTokenURL()+`');">Voir facture</button></p></br> </p></br>`;
            }
        });  
        xmlhttp.open("POST", "http://localhost/REST/objects/0?checkIn=true", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(data);
}

//upload de fichier associé à l'objet document
//et verigie l'entrée des données dans le formulaire et déclenche la création
//des factures selon le type (facture client/fourn ou rapport financier)
function fileUP(typedoc){
    var f = document.getElementsByTagName('form')[0];
    if(f.checkValidity()) {
    //fonction qui upload vers URL/files
        var fileInput = document.getElementById('doc-file');
        console.log(fileInput.files);
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append('file', file);


        var name = file.name;
        var ext = name.split('.').pop();

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log("Envoie du fichier en cours...");
            console.log(this.responseText);
            var jsonFileUP = JSON.parse(this.responseText);
            var upID = jsonFileUP.UploadID;
            var size = jsonFileUP.Size;
            var regex = /[^\/]*(?=\.[^.]+($|\?))/i;
            let m;
            var title = name;
            if ((m = regex.exec(name)) !== null) {
                m.forEach((match, groupIndex) => {
                    if(groupIndex == 0){
                        title = `${match}`;
                    }
                });
            }
            if(typedoc === 'client'){
                creeFactureClient(upID, size, title, ext);
            }else if (typedoc === 'fournisseur') {creeFactureFournisseur(upID, size, title, ext);
            }else if (typedoc === 'rapportfin') {creerRapportFin(upID, size, title, ext);}

        }
        }); 
        //onprogressHandler doit être une fonction
        //xmlhttp.upload.addEventListener('progress', onprogressHandler, false);
        xmlhttp.open("POST", "http://localhost/REST/files", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        //xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
        xmlhttp.send(formData);
    }else {
        alert("Entrez les données correctement.");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                              Création des rapports financiers                                     //
//                  Fonction déclenchée depuis la fonction fileUP car                                //
//                     l'upload du fichier arrive avant création objet                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////

function creerRapportFin(upID, size, title, ext){
    var titre = document.getElementById("rapp-titre").value;
    var dateDoc = new Date(document.getElementById("rapp-date-d").value);
    var motsCles = document.getElementById("rapp-mots-cles").value;
    var descr = document.getElementById("rapp-descr").value;

    var data = JSON.stringify({"PropertyValues":[{"PropertyDef":0,"TypedValue":{"DataType":1,"Value":titre}},{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},{"PropertyDef":100,"TypedValue":{"DataType":9,"Lookup":{"Item":62,"Version":-1}}},{"PropertyDef":1002,"TypedValue":{"DataType":5,"Value":dateDoc}},{"PropertyDef":1004,"TypedValue":{"DataType":1,"Value":motsCles,"SortingKey":";"}},{"PropertyDef":1034,"TypedValue":{"DataType":13,"Value":descr}}],"Files":[{"UploadID": upID, "Size": size, "Title":title, "Extension": ext}]}); 
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
    xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log("Création de l'objet en cours...");
            console.log(this.responseText);
            var jsonRapp = JSON.parse(this.responseText);
            document.getElementById("rapp-created").innerHTML ="";
            document.getElementById("rapp-created").innerHTML += `<br><p align=center>Le rapport client ID: `+jsonRapp.DisplayID+` au titre: `+jsonRapp.Title+` a été créée. <button class="btn btn-info" onclick="window.open('welcome.html?click=rapports&token=`+getTokenURL()+`');">Voir Rapport Financier</button></p></br>`;
            document.getElementById("rapp-form").reset(); 
        }
    });  
    xmlhttp.open("POST", "http://localhost/REST/objects/0?checkIn=true", true);
    xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(data);
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         Création des clients                                      //
///////////////////////////////////////////////////////////////////////////////////////////////////////


function getClientBtn(){

    document.getElementById("cr_tache").className="btn";
    document.getElementById("cr_client").className="btn active";
    document.getElementById("cr_facture").className="btn";
    document.getElementById("cr_rapport").className="btn";

    //document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML += '<iframe src="form_client.html?token='+getTokenURL()+'" height=700 width=85% style="border:none;"></iframe>';
}

function creeClient(){
    var f = document.getElementsByTagName('form')[0];
    if(f.checkValidity()) {
        var nom = document.getElementById("client-nom").value;
        var adr1 = document.getElementById("client-adr-1").value;
        var adr2 = document.getElementById("client-adr-2").value;
        var ville = document.getElementById("client-ville").value;
        var region = document.getElementById("client-region").value;
        var pays = document.getElementById("client-pays").value;
        var codepost = document.getElementById("client-code-postal").value;
        var tel = document.getElementById("client-tel").value;
        var website = document.getElementById("client-website").value;


        //{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},
        var data = JSON.stringify({"PropertyValues":[{"PropertyDef":100,"TypedValue":{"DataType":9,"HasValue": true,"Lookup":{"Item":78,"Version":-1}}},{"PropertyDef":1110,"TypedValue":{"DataType":1,"HasValue": true,"Value":nom}},{"PropertyDef":1073,"TypedValue":{"DataType":1,"Value":adr1}},{"PropertyDef":1082,"TypedValue":{"DataType":1,"Value":adr2}},{"PropertyDef":1088,"TypedValue":{"DataType":1,"HasValue": true,"Value":ville}},{"PropertyDef":1089,"TypedValue":{"DataType":1,"HasValue": true,"Value":region}},{"PropertyDef":1087,"TypedValue":{"DataType":1,"HasValue": true,"Value":codepost}},{"PropertyDef":1090,"TypedValue":{"DataType":10,"Lookups":[{"Item":1,"Version":-1,"ObjectType":154,"Value":pays,"ObjectFlags":64}]}},{"PropertyDef":1085,"TypedValue":{"DataType":1,"HasValue": true,"Value":tel}},{"PropertyDef":1086,"TypedValue":{"DataType":1,"HasValue": true,"Value":website}}]}); 
        console.log(data);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log("Création de l'objet en cours...");
                console.log(this.responseText);
                var jsonCli = JSON.parse(this.responseText);

                document.getElementById("client-form").reset(); 
                document.getElementById("client-created").innerHTML = "";
                document.getElementById("client-created").innerHTML += `<br><p align=center>Le client: `+jsonCli.DisplayID+` au titre: `+jsonCli.Title+` a été créée.<button class="btn btn-info" onclick="window.open('welcome.html?click=clients&token=`+getTokenURL()+`');">Voir client</button></p></br> </p></br>`;
            }
        });  
        xmlhttp.open("POST", "http://localhost/REST/objects/136?checkIn=true", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(data);
    }else {
        alert("Entrez les données correctement.");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                         Création des taches                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////

function creerTache(){
    var f = document.getElementsByTagName('form')[0];
    if(f.checkValidity()) {
        var nom = document.getElementById("tache-nom").value;
        var descr = document.getElementById("tache-descr").value;
        var affect_a = document.getElementById("tache-affecte-a").value;
        var echeance = document.getElementById("tache-echeance").value;


        var XHR = new XMLHttpRequest();
        XHR.withCredentials = false;
            XHR.addEventListener("readystatechange", function() {
                if(this.readyState === 4) {
                    console.log("Création de l'objet en cours...");
                    console.log(this.responseText);
                    var jU= JSON.parse(this.responseText);
                    //var myID = jU.UserID;
                    var myID = jU.Value;

                    var data = JSON.stringify({"PropertyValues":[{"PropertyDef":0,"TypedValue":{"DataType":1,"HasValue": true,"Value":nom}},{"PropertyDef":100,"TypedValue":{"DataType":9,"HasValue": true,"Lookup":{"Item":-100,"Version":-1}}},{"PropertyDef":98,"TypedValue":{"DataType":8,"HasValue":true,"Value":false}},{"PropertyDef":44,"TypedValue":{"DataType":10,"Lookups":[{"Item":affect_a,"Version":-1,"ObjectType": 6,"ObjectFlags":64}]}},{"PropertyDef":43,"TypedValue":{"DataType":10,"Lookups":[{"Item":myID,"Version":-1,"ObjectType": 6,"ObjectFlags":64}]}},{"PropertyDef":42,"TypedValue":{"DataType":5,"HasValue": true,"Value":echeance}},{"PropertyDef":41,"TypedValue":{"DataType":13,"HasValue": true,"Value":descr}}]}); 
                    console.log(data);
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.withCredentials = false;
                    xmlhttp.addEventListener("readystatechange", function() {
                        if(this.readyState === 4) {
                            console.log("Création de l'objet en cours...");
                            console.log(this.responseText);
                            var jsonTache = JSON.parse(this.responseText);
        
                            document.getElementById("tache-form").reset(); 
                            document.getElementById("tache-created").innerHTML = "";
                            document.getElementById("tache-created").innerHTML += `<br><p align=center>La tâche: `+jsonTache.DisplayID+` au titre: `+jsonTache.Title+` a été créée.<button class="btn btn-info" onclick="window.open('welcome.html?click=taches&token=`+getTokenURL()+`');">Voir tâche</button></p></br> </p></br>`;
                        }
                    });  
                    xmlhttp.open("POST", "http://localhost/REST/objects/10?checkIn=true", true);
                    xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
                    xmlhttp.setRequestHeader("Content-Type", "application/json");
                    xmlhttp.send(data);


                }
            });  
            XHR.open("GET", "http://localhost/REST/session/userid", true);
            XHR.setRequestHeader("X-Authentication", getTokenURL());
            XHR.setRequestHeader("Content-Type", "application/json");
            XHR.send();
    }else {
        alert("Entrez les données correctement.");
    }
}