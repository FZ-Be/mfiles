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
            //console.log(this.responseText);
            var jU = JSON.parse(this.responseText);
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

function getFactureBtn(){

    var client = "client";
    var fournisseur = "fournisseur";

    document.getElementById("cr_vue").className="btn";
    document.getElementById("cr_client").className="btn";
    document.getElementById("cr_facture").className="btn active";
    document.getElementById("cr_rapport").className="btn";

    document.getElementById("object").innerHTML="";
    document.getElementById("content").innerHTML = "";
    document.getElementById("content").innerHTML +="<h2 align='center'>Choisissez la classe de document</h2>";
    document.getElementById("content").innerHTML +="<button align='center' class='btn' onclick='getFormFacture(`client`);' style='width:40%;'>Facture Client</button><button align='center' class='btn' onclick='getFormFacture(`fournisseur`);' style='width:40%;margin-left:15%;'>Facture Fournisseur</button><br/><br/>";

}

function getFormFacture(type){
    if(type ==="client"){
        document.getElementById("content").innerHTML = '';
        getFactureBtn();    
        document.getElementById("content").innerHTML += '<iframe src="form_facture_client.html?token='+getTokenURL()+'" height=800 width=100% style="border:none;"></iframe>';
    }else if (type ==="fournisseur"){
        document.getElementById("content").innerHTML = '';
        getFactureBtn();  
        document.getElementById("content").innerHTML += '<iframe src="form_facture_fourn.html?token='+getTokenURL()+'" height=800 width=100% style="border:none;"></iframe>';
    }
}

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
            var data = JSON.stringify({"PropertyValues":[{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},{"PropertyDef":100,"TypedValue":{"DataType":9,"Lookup":{"Item":89,"Version":-1}}},{"PropertyDef":1078,"TypedValue":{"DataType":10,"Lookups":[{"Item":projetID,"Version":-1,"ObjectType":101,"DisplayValue":projetN,"ObjectFlags":64}]}},{"PropertyDef":1079,"TypedValue":{"DataType":10,"Lookups":[{"Item":clientID,"Version":-1,"ObjectType":136,"DisplayValue":clientN,"ObjectFlags":64}]}},{"PropertyDef":1002,"TypedValue":{"DataType":5,"Value":dateDoc}},{"PropertyDef":1004,"TypedValue":{"DataType":1,"DisplayValue":motsCles,"SortingKey":";"}},{"PropertyDef":1034,"TypedValue":{"DataType":13,"DisplayValue":descr}}],"Files":[{"UploadID": upID, "Size": size, "Title":title, "Extension": ext}]}); 
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log("Création de l'objet en cours...");
                console.log(this.responseText);
                var jsonFact = JSON.parse(this.responseText);
                document.getElementById("fact-created").innerHTML += `<br><p align=center>La facture client ID: `+jsonFact.DisplayID+` au titre: `+jsonFact.Title+` a été crée.</p></br>`;
                document.getElementById("fact-form").reset(); 
            }
        });  
        xmlhttp.open("POST", "http://localhost/REST/objects/0?checkIn=true", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(data);
}


function creeFactureFournisseur(upID, size, title, ext){

        var titre = document.getElementById("fact-titre").value;
        var dateDoc = new Date(document.getElementById("fact-date-d").value);
        var motsCles = document.getElementById("fact-mots-cles").value;
        var descr = document.getElementById("fact-descr").value;

        console.log(titre+" "+dateDoc+" "+motsCles+" "+descr);
        //{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},
        var data = JSON.stringify({"PropertyValues":[{"PropertyDef":0,"TypedValue":{"DataType":1,"Value":titre}},{"PropertyDef":22,"TypedValue":{"DataType":8,"Value":true}},{"PropertyDef":38,"TypedValue":{"Lookup":{"Item":102,"Version":-1,"DisplayValue":"Vérification et approbation des factures fournisseurs"}, "HasValue":true, "DataType":9}},{"PropertyDef":39,"TypedValue":{"Lookup":{"Item":108,"Version":-1,"DisplayValue":"Reçue, en attente de vérification"}, "HasValue":true, "DataType":9}},{"PropertyDef":100,"TypedValue":{"DataType":9,"Lookup":{"Item":2,"Version":-1}}},{"PropertyDef":1002,"TypedValue":{"DataType":5,"Value":dateDoc}},{"PropertyDef":1004,"TypedValue":{"DataType":1,"DisplayValue":motsCles,"SortingKey":";"}},{"PropertyDef":1034,"TypedValue":{"DataType":13,"DisplayValue":descr}}],"Files":[{"UploadID": upID, "Size": size, "Title":title, "Extension": ext}]}); 
        console.log(data);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log("Création de l'objet en cours...");
                console.log(this.responseText);
                var jsonFact = JSON.parse(this.responseText);

                document.getElementById("fact-form").reset(); 
                document.getElementById("fact-created").innerHTML += `<br><p align=center>La facture fournisseur ID: `+jsonFact.DisplayID+` au titre: `+jsonFact.Title+` a été crée.</p></br>`;
            }
        });  
        xmlhttp.open("POST", "http://localhost/REST/objects/0?checkIn=true", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(data);
}

function fileUP(typefacture){
    var f = document.getElementsByTagName('form')[0];
    if(f.checkValidity()) {
    //fonction qui upload vers URL/files
        var fileInput = document.getElementById('fact-file');
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
            if(typefacture === 'client'){
                creeFactureClient(upID, size, title, ext);
            }else if (typefacture === 'fournisseur') {creeFactureFournisseur(upID, size, title, ext);}
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

function fileFacture(objID, version){
    //fonction qui upload vers l'objet
        var fileInput = document.getElementById('fact-file');
        console.log(fileInput.files);
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append('file', file);

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = false;
        xmlhttp.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log("Envoie du fichier en cours...");
            console.log(this.responseText);
        }
        });  
        //onprogressHandler doit être une fonction
        //xmlhttp.upload.addEventListener('progress', onprogressHandler, false);
        xmlhttp.open("POST", "http://localhost/REST/0/"+objID+"/latest/files", true);
        xmlhttp.setRequestHeader("X-Authentication", getTokenURL());
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        //xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
        xmlhttp.send(formData);

}
//compatibilité du navigateur pour upload du fichier avec ajax
/*function supportAjaxUploadWithProgress() {
    return supportFileAPI() && supportAjaxUploadProgressEvents();

    function supportFileAPI() {
        var fi = document.createElement('INPUT');
        fi.type = 'file';
        return 'files' in fi;
    };

    function supportAjaxUploadProgressEvents() {
        var xhr = new XMLHttpRequest();
        return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
    };
}

function compatibility(){
    document.getElementById("comp").innerHTML = supportAjaxUploadWithProgress();
}*/
