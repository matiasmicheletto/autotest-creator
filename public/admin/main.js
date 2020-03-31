window.middleware=function(){var e={apiKey:"AIzaSyDcBhhiu-dQXWaGBLcTEtnz8HPnelfXuA4",authDomain:"covid19-autotest.firebaseapp.com",databaseURL:"https://covid19-autotest.firebaseio.com",projectId:"covid19-autotest",storageBucket:"covid19-autotest.appspot.com",messagingSenderId:"541298094681",appId:"1:541298094681:web:a715a3322843f6ff7e7748",measurementId:"G-0YZX1RVB1F"},t={};return t.init=function(){return new Promise(function(a,i){try{return firebase.initializeApp(e),firebase.auth().onAuthStateChanged(function(e){e?t.users.onUserSignedIn(e.uid):t.users.onUserSignedOut()}),a()}catch(n){return i(n)}})},t}();
!function(e){e.users={},e.users.onUserSignedIn=function(e){console.log("default -- logged in "+e)},e.users.onUserSignedOut=function(){console.log("default -- logged out")},e.users.signIn=function(e){return new Promise(function(n,a){firebase.auth().signInWithEmailAndPassword(e.email,e.password)["catch"](function(e){var n,t=e.code;switch(t){case"auth/wrong-password":n="La contraseña es incorrecta.";break;case"auth/user-disabled":n="El usuario se haya inhabilitado momentáneamente.";break;case"auth/invalid-email":n="El email no es válido. Quizá esté mal escrito o no exista.";break;case"auth/user-not-found":n="El usuario no existe.";break;default:n="Algo pasó.. revisa tu conexión a internet e intentálo nuevamente."}return a([t,n])}).then(function(e){return n("Logeado correctamente.")})})},e.users.signOut=function(){return new Promise(function(e,n){firebase.auth().signOut().then(function(){return e("Ha salido de la aplicación.")})["catch"](function(e){return n([e,"Algo pasó.. intentálo nuevamente."])})})},e.users.signUp=function(e){return new Promise(function(n,a){firebase.auth().createUserWithEmailAndPassword(e.email,e.password)["catch"](function(e){var n,t=e.code;switch(t){case"auth/weak-password":n="La contraseña es demasiado débil. Intenta con una más segura.";break;case"auth/email-already-in-use":n="Éste email ya existe en nuestra base de datos.";break;case"auth/invalid-email":n="El email no es válido. Revisa lo ingresado.";break;case"auth/operation-not-allowed":n="No se puede crear la cuenta para ese usuario. Ponete en contacto con los administradores.";break;default:n="Algo pasó... revisa tu conexión a internet e intentálo nuevamente."}return a([t,n])}).then(function(e){fullfill(e)})})},e.users.resetPwd=function(e){return new Promise(function(n,a){firebase.auth().sendPasswordResetEmail(e).then(function(){return n("Listo. Revisa tu correo electrónico.")})["catch"](function(e){return a([e,"Algo pasó.. intentálo nuevamente."])})})}}(middleware);
!function(n){n.db={},n.db.listen=function(n,e,t){firebase.database().ref(n).on("value",function(n){e(n.val(),n.key)},function(n){t(n)})},n.db.listenChild=function(n,e,t,r,u){firebase.database().ref(n).orderByChild(e).equalTo(t).on("child_added",function(n){r(n.val(),n.key)},function(n){u(n)})},n.db.stopListener=function(n){return new Promise(function(e,t){firebase.database().ref(n).off().then(function(){return e()})["catch"](function(n){return t(n)})})},n.db.get=function(n){return new Promise(function(e,t){firebase.database().ref(n).once("value").then(function(n){return e(n.val())})["catch"](function(n){return t(n)})})},n.db.getSorted=function(n,e){return new Promise(function(t,r){firebase.database().ref(n).orderByChild(e).once("value").then(function(n){return t(n)})["catch"](function(n){return r(n)})})},n.db.getSortedLimited=function(n,e,t){return new Promise(function(r,u){firebase.database().ref(n).orderByChild(e).limitToLast(t).once("value").then(function(n){return r(n)})["catch"](function(n){return u(n)})})},n.db.query=function(n,e,t){return new Promise(function(r,u){firebase.database().ref(n).orderByChild(e).equalTo(t).once("value").then(function(n){return r(n)})["catch"](function(n){return u(n)})})},n.db.set=function(n,e){return new Promise(function(t,r){firebase.database().ref(e).set(n).then(function(n){return t(n)})["catch"](function(n){return r(n)})})},n.db.update=function(n,e){return new Promise(function(t,r){firebase.database().ref(e).update(n).then(function(n){return t(n)})["catch"](function(n){return r(n)})})},n.db.push=function(n,e){return new Promise(function(t,r){firebase.database().ref(e).push(n).then(function(n){return t(n)})["catch"](function(n){return r(n)})})},n.db.pushMultiple=function(n,e){return new Promise(function(t,r){var u=[];for(var i in n)u.push(firebase.database().ref(e).push(n[i]));Promise.all(u).then(function(n){return t(n)})["catch"](function(n){return r(n)})})}}(middleware);
!function(e){e.fs={},e.fs.add=function(e,n){return new Promise(function(t,r){firebase.firestore().collection(n).add(e).then(function(e){return t(e)})["catch"](function(e){return r(e)})})},e.fs.set=function(e,n,t){return new Promise(function(r,i){firebase.firestore().collection(n).doc(t).set(e).then(function(){return r()})["catch"](function(e){return i(e)})})},e.fs.update=function(e,n,t){return new Promise(function(r,i){firebase.firestore().collection(n).doc(t).update(e).then(function(){return r()})["catch"](function(e){return i(e)})})},e.fs["delete"]=function(e,n){return new Promise(function(t,r){firebase.firestore().collection(e).doc(n)["delete"]().then(function(){return t()})["catch"](function(e){return r(e)})})},e.fs.getCollection=function(e){return new Promise(function(n,t){firebase.firestore().collection(e).get().then(function(e){return n(e)})["catch"](function(e){return t(e)})})},e.fs.getDocument=function(e,n){return new Promise(function(t,r){firebase.firestore().collection(e).doc(n).get().then(function(e){var n=e.data();return n.key=e.id,t(n)})["catch"](function(e){return r(e)})})},e.fs.query=function(e,n,t,r,i){return new Promise(function(o,c){var u,f=[];u=i?firebase.firestore().collection(e).where(n,t,r).limit(i):firebase.firestore().collection(e).where(n,t,r),u.get().then(function(e){return e.forEach(function(e){var n=e.data();n.key=e.id,f.push(n)}),o(f)})["catch"](function(e){return c(e)})})},e.fs.querySortedLimited=function(e,n,t,r,i,o){return new Promise(function(c,u){var f=[];firebase.firestore().collection(e).where(n,t,r).orderBy(i,"desc").limit(o).get().then(function(e){return e.forEach(function(e){var n=e.data();n.key=e.id,f.push(n)}),c(f)})["catch"](function(e){return u(e)})})},e.fs.queryMultipleLimited=function(e,n,t,r,i){return new Promise(function(o,c){var u=[],f=firebase.firestore().collection(e);for(var s in n)f=f.where(n[s],t[s],r[s]);f.limit(i).get().then(function(e){return e.forEach(function(e){var n=e.data();n.key=e.id,u.push(n)}),o(u)})["catch"](function(e){return c(e)})})}}(middleware);
!function(e){e.utils={},e.utils.saveFile=function(e,t,o){var a=document.createElement("a"),l=new Blob([e],{type:o});a.href=URL.createObjectURL(l),a.download=t,a.click()},e.utils.downloadXLSX=function(t,o,a){var l=XLSX.utils.aoa_to_sheet(t),i=XLSX.utils.book_new();XLSX.utils.book_append_sheet(i,l,a);var n={bookType:"xlsx",bookSST:!1,type:"array"},s=XLSX.write(i,n);e.utils.saveFile(s,o+".xlsx","application/octet-stream")}}(middleware);
var app=angular.module("autotest-admin",["ngRoute","ngSanitize"]).run(["$rootScope","$location",function(e,a){e.userLogged=!1,e.loading=!0,middleware.init(),a.path("/login"),middleware.users.onUserSignedIn=function(o){middleware.db.get("config").then(function(o){e.config=o,e.config.trees=[],middleware.db.getSorted("decisionTrees","timestamp").then(function(o){o.forEach(function(a){var o=a.val();o.key=a.key,e.config.trees.push(o)}),e.userLogged=!0,e.loading=!1,a.path("/"),e.$apply()})["catch"](function(a){console.log(a),toastr.error("Ocurrió un error al descargar la configuración global."),e.loading=!1,$scope.$apply()})})["catch"](function(a){console.log(a),toastr.error("Ocurrió un error al descargar la configuración global."),e.loading=!1,$scope.$apply()})},middleware.users.onUserSignedOut=function(){e.userLogged=!1,e.loading=!1,a.path("/login"),e.$apply()},e.logout=function(){e.loading=!0,middleware.users.signOut()},e.getTime=function(e,a){var o;switch(a||(a=3),e||(a=1),a){case 0:o=Date.now();break;case 1:o=moment(Date.now()).format("DD/MM/YYYY HH:mm");break;case 2:o=moment(Date.now()).format("DD/MM/YYYY");break;case 3:o=moment(e).format("DD/MM/YYYY HH:mm");break;case 4:o=moment(e).format("DD/MM/YYYY");break;case 5:o=moment(e).fromNow();break;case 6:o=moment(e).format("DD/MM HH:mm");break;default:o=null}return o},e.html2Text=function(e){var a=document.createElement("div");return a.innerHTML=e,a.textContent||a.innerText||""},e.generateID=function(e){return Math.random().toString(36).substr(2,e)},e.showHelp=function(a){switch(a){case"main-config":e.helpContent='<p>Configure los parámetros de funcionamiento de la aplicación y presione "Guardar" para que la configuración tome efecto o "Descartar" para reestablecer los cambios a los valores activos.</p>';break;case"map":e.helpContent="<p>El mapa muestra el area de interés. Para agregar una nueva región circular a esta zona, pulse sobre el mapa, indique el radio del área y presione \"Agregar\". Para borrar el área actual, presione el botón con el ícono <i class='material-icons'>layers_clear</i>.</p>";break;case"log-limit":e.helpContent="<p>Configure la cantidad de veces que un mismo usuario puede realizar el autotest y el tiempo que debe transcurrir entre cada resultado registrado en la base de datos</p>";break;case"tree-list":e.helpContent='<p>La lista muestra todos los árboles de decisión que fueron creados. Sólo un árbol por vez puede estar activo y una vez que se cargan los árboles a la base de datos ya no pueden volver a ser modificados.</p><p>Los nuevos árboles creados pueden modificarse múltiples veces antes de ser habilitados como <b>"activo"</b>.</p>';break;case"ages-plot":e.helpContent="<p>El gráfico de barras muestra un histograma de edades de los usuarios. Sólo se contabiliza la edad luego del registro del primer resultado. Los rangos de edad del histograma se crean a medida que aparecen registros correspondientes a dichos intervalos.</p>";break;case"genders-plot":e.helpContent="<p>El gráfico circular muestra la proporción de usuarios por género. Sólo se contabiliza el género seleccionado luego del registro del primer resultado.</p>";break;case"exitCodes-plot":e.helpContent="<p>Cada opción de cada nodo del árbol de decisiones puede tener asociado un código de salida. Cada vez que el usuario selecciona dicha opción del menú, se contabiliza el código de salida correspondiente. El significado de cada código de salida es definido por el administrador al momento de diseñar el árbol de decisiones.</p>";break;case"paths-plot":e.helpContent="<p>El gráfico permite visualizar el árbol de decisiones actual donde el espesor de cada camino es proporcional a la cantidad de veces que un usuario pasó por ese camino.</p>";break;case"tree-container":e.helpContent="<p>El gráfico permite visualizar el árbol de decisiones activo. Puede arrastrar los nodos, desplazar la vista o hacer zoom.</p><p>Con el botón <i class='material-icons'>phone_android</i> de la derecha puede simular el comportamiento del arbol activo.</p>";break;default:e.helpContent="No se encontro la referencia"}$("#help-modal").modal("show")}}]).config(["$routeProvider",function(e){e.when("/dashboard",{templateUrl:"views/dashboard.html",controller:"dashboard"}).when("/login",{templateUrl:"views/login.html",controller:"login"}).when("/",{templateUrl:"views/config.html",controller:"config"})}]).filter("trusted",["$sce",function(e){return e.trustAsResourceUrl}]);
app.controller("login",["$scope","$rootScope",function(o,r){o.login=function(){return o.form?o.form.email?o.form.password?(r.loading=!0,void middleware.users.signIn(o.form).then(function(o){toastr.success("Bienvenido!")})["catch"](function(e){console.log(e),toastr.error(e[1]),r.loading=!1,o.$apply()})):void toastr.error("Ingrese su contraseña!"):void toastr.error("Indique su usuario!"):void toastr.error("Complete los campos de credenciales!")},o.retrievePassword=function(){toastr.info("Pronto contaremos con esa funcionalidad.")}}]);
app.controller("dashboard",["$scope","$rootScope","$location",function(t,a,e){a.userLogged||e.path("/login");var o=function(){var e=[],o=[],s=[],n=Math.floor(200/Object.getOwnPropertyNames(a.stats.ages).length),i=5;for(var r in a.stats.ages){var l=10*parseInt(r.split("_")[1]),d=l+9;e.push(l+"-"+d),o.push(a.stats.ages[r]),s.push("rgba("+i+","+i+","+i+",0.9)"),i+=n}t.agesChart&&t.agesChart.destroy(),t.agesChart=new Chart(document.getElementById("age-chart"),{type:"bar",data:{labels:e,datasets:[{label:"Usuarios por edad",backgroundColor:s,data:o}]},options:{maintainAspectRatio:!1,scales:{yAxes:[{display:!0,ticks:{beginAtZero:!0}}]}}})},s=function(){t.genderChart&&t.genderChart.destroy(),t.genderChart=new Chart(document.getElementById("gender-chart"),{type:"doughnut",data:{labels:["Masculino","Femenino","Otro"],datasets:[{backgroundColor:["#333333","#777777","#AAAAAA"],pointRadius:0,data:[a.stats.genders.m,a.stats.genders.f,a.stats.genders.n]}]},options:{maintainAspectRatio:!0}})},n=function(){var e=[],o=[],s=[],n=Math.floor(200/Object.getOwnPropertyNames(a.stats.exitCodes).length),i=5;for(var r in a.stats.exitCodes)e.push(r),o.push(a.stats.exitCodes[r]),s.push("rgba("+i+","+i+","+i+",0.9)"),i+=n;t.exitCodeChart&&t.exitCodeChart.destroy(),t.exitCodeChart=new Chart(document.getElementById("exitCode-chart"),{type:"bar",data:{labels:e,datasets:[{label:"Código de resultado",backgroundColor:s,data:o}]},options:{maintainAspectRatio:!0,scales:{yAxes:[{display:!0,ticks:{beginAtZero:!0}}]}}})},i=function(){var t=a.config.trees.find(function(t){return t.active}),e=t.tree,o=[],s=0;for(var n in a.pathStats[t.id]){var i=n.split("_"),r=parseInt(i[1]),l=parseInt(i[2]),d=parseInt(i[3]);o[r]||(o[r]=[]),o[r][l]||(o[r][l]=[]),o[r][l][d]=a.pathStats[t.id][n],a.pathStats[t.id][n]>s&&(s=a.pathStats[t.id][n])}console.log(o),0==s&&(s=1);for(var p=[],c=[],n=0;n<e.length;n++){var u=e[n].header.substring(0,15)+"-\n"+e[n].header.substring(15,30)+"-\n"+e[n].header.substring(30,50);p.push({id:n,value:1,label:"["+n+"] -- "+a.html2Text(u)+"...",shape:"box",font:{size:12,color:"white",face:"arial"},color:"#444444"});for(var h=0;h<e[n].options.length;h++)switch(e[n].options[h].type){case"goto":var g=0,f=a.html2Text(e[n].options[h].text).substring(0,10)+(e[n].options[h].text.length>10?"...":"")+"\n(0)";o[n]&&o[n][e[n].options[h]["goto"]]&&o[n][e[n].options[h]["goto"]][h]&&(g=o[n][e[n].options[h]["goto"]][h],f=a.html2Text(e[n].options[h].text).substring(0,10)+(e[n].options[h].text.length>10?"...":"")+"\n("+g+")"),c.push({from:n,to:e[n].options[h]["goto"],smooth:{type:"curvedCW",roundness:Math.random()-.5},value:Math.round(g/s*10),label:f});break;case"link":var m=a.generateID(20);p.push({id:m,value:1,label:e[n].options[h].text.substring(0,8)+"..."||"S/L",shape:"circle",font:{size:12,color:"white",face:"arial"},color:"#AAAAAA"}),c.push({from:n,to:m,smooth:{type:"curvedCW",roundness:Math.random()-.5},value:0,label:"Enlace ext."});break;case"decision":const v=e[n].options[h].decision.split(",");var b=-.5;const y=1/v.length;for(var S=Math.log(v.length)/Math.log(2),C=0;C<v.length;C++){var g=0,f=parseInt(C).toString(2).padStart(S,"0")+"\n(0)";o[n]&&o[n][parseInt(v[C])]&&o[n][parseInt(v[C])][C]&&(g=o[n][parseInt(v[C])][C],f=parseInt(C).toString(2).padStart(S,"0")+"\n("+g+")"),c.push({from:n,to:parseInt(v[C]),smooth:{type:"curvedCW",roundness:b},value:Math.round(g/s*10),label:f}),b+=y}break;case"exit":var m=a.generateID(20);p.push({id:m,value:1,label:e[n].options[h].exitCode||"S/C",shape:"circle",font:{size:12,color:"white",face:"arial"},color:"#AA0000"}),c.push({from:n,to:m,smooth:{type:"curvedCW",roundness:Math.random()-.5},value:0,label:"Cód. de salida"})}}var k={nodes:new vis.DataSet(p),edges:new vis.DataSet(c)};console.log(k);var w={layout:{hierarchical:{direction:"UD",sortMethod:"directed"}},physics:!1,edges:{font:{size:10,color:"black",face:"arial",align:"top"},arrows:{to:{enabled:!0,scaleFactor:1}}},nodes:{shape:"box"}};new vis.Network(document.getElementById("paths-container"),k,w)};t.updateStats=function(){a.loading=!0,middleware.fs.getCollection("stats").then(function(e){a.stats={},e.forEach(function(t){a.stats[t.id]=t.data()}),o(),n(),s(),middleware.fs.getCollection("pathStats").then(function(e){a.pathStats={},e.forEach(function(t){a.pathStats[t.id]=t.data()}),i(),a.loading=!1,t.$apply()})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})},t.clearStats=function(){a.loading=!0,middleware.fs.getCollection("stats").then(function(e){a.stats={},e.forEach(function(t){a.stats[t.id]=t.data()}),middleware.fs.getCollection("pathStats").then(function(e){a.pathStats={},e.forEach(function(t){a.pathStats[t.id]=t.data()});var r={name:t.backupName,stats:a.stats,pathStats:a.pathStats,timestamp:Date.now()},l=[];l.push(middleware.db.push(r,"statsBackups"));for(var d in a.stats){for(var p in a.stats[d])a.stats[d][p]=0;l.push(middleware.fs.update(a.stats[d],"stats",d))}for(var d in a.pathStats){for(var p in a.pathStats[d])a.pathStats[d][p]=0;l.push(middleware.fs.update(a.pathStats[d],"pathStats",d))}Promise.all(l).then(function(){i(),o(),n(),s(),a.loading=!1,t.$apply(),$("#save-modal").modal("hide")})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()}),a.loading=!1,t.$apply()})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})},t.listBckps=function(){a.loading=!0,middleware.db.get("statsBackups").then(function(e){t.backupList=[];for(var o in e){var s=e[o];s.key=o,t.backupList.push(s)}a.loading=!1,$("#load-stats-modal").modal("show"),t.$apply()})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})},t.viewBackup=function(e){var r=t.backupList.findIndex(function(t){return t.key==e});a.stats=angular.copy(t.backupList[r].stats),a.pathStats=angular.copy(t.backupList[r].pathStats),o(),n(),s(),i(),$("#load-stats-modal").modal("hide")},t.restoreBackup=function(e){a.loading=!0;var r=t.backupList.findIndex(function(t){return t.key==e}),l=[];for(var d in t.backupList[r].stats)l.push(middleware.fs.update(t.backupList[r].stats[d],"stats",d));for(var d in t.backupList[r].pathStats)l.push(middleware.fs.update(t.backupList[r].pathStats[d],"pathStats",d));Promise.all(l).then(function(){a.stats=angular.copy(t.backupList[r].stats),a.pathStats=angular.copy(t.backupList[r].pathStats),a.loading=!1,t.$apply(),$("#load-stats-modal").modal("hide"),o(),n(),s(),i()})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})},t.deleteBackup=function(a){t.backupList.findIndex(function(t){return t.key==a})},a.exportDB=function(e){a.loading=!0;var o=function(o){switch(e){case"xlsx":var s=[["ID Resultado","ID Árbol","Código finalización","Estampa de tiempo","DNI","Nombre","Edad","Tel.","Género","Lat.","Long."]];for(var n in o)s.push([o[n].id,o[n].treeID,o[n].exitCode,o[n].timestamp,o[n].dni,o[n].name,o[n].age,o[n].tel,o[n].gender,o[n].lat,o[n].lng]);middleware.utils.downloadXLSX(s,"ResultadosAutotest","Resultados");break;case"csv":var i="ID Resultado, ID Árbol, Código finalización, Estampa de tiempo, DNI, Nombre, Edad, Tel., Género, Lat., Long.\n";for(var n in o){var r=[o[n].id,o[n].treeID,o[n].exitCode,o[n].timestamp.toString(),o[n].dni.toString(),o[n].name,o[n].age.toString(),o[n].tel,o[n].gender,o[n].lat.toString(),o[n].lng.toString()];i+=r.join(",")+"\n"}middleware.utils.saveFile(i,"ResultadosAutotest.csv","text/plain");break;case"json":console.log(o),middleware.utils.saveFile(JSON.stringify(o),"ResultadosAutotest.json","text/json")}a.loading=!1,t.$apply()};middleware.fs.getCollection("results").then(function(t){var a=[];t.forEach(function(t){var e=t.data();e.id=t.id,a.push(e)}),o(a)})["catch"](function(e){console.log(e),a.loading=!1,t.$apply()})},a.stats?(o(),n(),s(),i()):t.updateStats()}]);
app.controller("config",["$scope","$rootScope",function(e,o){o.userLogged||$location.path("/login"),e.map=L.map("map",{center:[o.config.locationFilter.lat,o.config.locationFilter.lng],zoom:8}),L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{id:"mapbox/streets-v11",accessToken:"pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w"}).addTo(e.map),e.defaultFilterRange=50,e.map.on("click",function(o){console.log(o.latlng),e.newLocation=o.latlng,e.newLocation.range=e.defaultFilterRange,e.$apply(),$("#location-modal").modal("show")});var t=function(){e.markerGroup||(e.markerGroup=L.layerGroup().addTo(e.map)),e.markerGroup.clearLayers();for(var o in e.tempConfig.locationFilters){var t={marker:L.marker(e.tempConfig.locationFilters[o]),radius:L.circle(e.tempConfig.locationFilters[o],1e3*e.tempConfig.locationFilters[o].range)};e.defaultFilterRange=e.tempConfig.locationFilters[o].range,t.marker.addTo(e.markerGroup).bindPopup("Area de acceso a la aplicación"),t.radius.addTo(e.markerGroup),t.marker.openPopup()}};e.addLocationFilter=function(){e.tempConfig.locationFilters||(e.tempConfig.locationFilters=[]),e.tempConfig.locationFilters.push(e.newLocation),t(),toastr.success("Espacio de operación actualizado"),$("#location-modal").modal("hide")},e.clearLocationFilters=function(){e.tempConfig.locationFilters=[],t()};var i=function(){var t=e.tempConfig.trees.find(function(e){return e.active}),i=t.tree,r=[],n=[];for(var a in i){var s=i[a].header.substring(0,15)+"-\n"+i[a].header.substring(15,30)+"-\n"+i[a].header.substring(30,50);r.push({id:a,value:1,label:"["+a+"] -- "+o.html2Text(s)+"...",shape:"box",font:{size:12,color:"white",face:"arial"},color:"#444444"});for(var l in i[a].options)switch(i[a].options[l].type){case"goto":n.push({from:a,to:i[a].options[l]["goto"],smooth:{type:"curvedCW",roundness:Math.random()-.5},label:o.html2Text(i[a].options[l].text).substring(0,10)+(i[a].options[l].text.length>10?"...":"")});break;case"link":var c=o.generateID(20);r.push({id:c,label:i[a].options[l].text.substring(0,8)+"..."||"S/L",shape:"circle",font:{size:12,color:"white",face:"arial"},color:"#AAAAAA"}),n.push({from:a,to:c,smooth:{type:"curvedCW",roundness:Math.random()-.5},label:"Enlace ext."});break;case"decision":const d=i[a].options[l].decision.split(",");var p=-.5;const f=1/d.length;for(var u=Math.log(d.length)/Math.log(2),g=0;g<d.length;g++)n.push({from:a,to:parseInt(d[g]),smooth:{type:"curvedCW",roundness:p},label:g.toString(2).padStart(u,"0")}),p+=f;break;case"exit":var c=o.generateID(20);r.push({id:c,label:i[a].options[l].exitCode||"S/C",shape:"circle",font:{size:12,color:"white",face:"arial"},color:"#AA0000"}),n.push({from:a,to:c,smooth:{type:"curvedCW",roundness:Math.random()-.5},label:"Cód. de salida"})}}var m={nodes:r,edges:n};console.log(m);var h={layout:{hierarchical:{direction:"UD",sortMethod:"directed"}},physics:!1,edges:{font:{size:10,color:"black",face:"arial",align:"top"},arrows:{to:{enabled:!0,scaleFactor:1}}},nodes:{shape:"box"}};new vis.Network(document.getElementById("tree-container"),m,h)};e.newTree=function(){var o={author:firebase.auth().currentUser.email,id:"T00"+(e.tempConfig.trees.length+1),timestamp:Date.now(),editable:!0,validated:!1,tree:[{header:"",content:"",options:[]}]};e.tempConfig.trees.push(o),toastr.success("Nuevo arbol creado")},e.copyTree=function(o){var t={author:firebase.auth().currentUser.email,id:"T00"+(e.tempConfig.trees.length+1),timestamp:Date.now(),editable:!0,validated:!1,tree:angular.copy(e.tempConfig.trees[o].tree)};e.tempConfig.trees.push(t),toastr.success("Árbol duplicado")},e.deleteTree=function(o){e.tempConfig.trees[o].deleted=!0,toastr.info("Árbol eliminado")},e.setActiveTree=function(o){for(var t in e.tempConfig.trees)t==o?e.tempConfig.trees[t].active=!0:e.tempConfig.trees[t].active=!1;i()},e.editTree=function(o){e.editingIndex=o,e.tempConfig.trees[e.editingIndex].validated=!1,$("#tree-edit-modal").modal("show")},e.cancelEdition=function(){toastr.info("Arbol no verificado! No guarde la configuración actual."),$("#tree-edit-modal").modal("hide")},e.validateTree=function(){var o=e.tempConfig.trees[e.editingIndex].tree;for(var t in o){var r=0,n=[];for(var a in o[t].options)if("toggle"==o[t].options[a].type&&r++,"decision"==o[t].options[a].type){if(!o[t].options[a].decision)return void toastr.error("Falta definir expresiones en el nodo "+t);n.push(o[t].options[a].decision)}if(r>0&&0==n.length)return void toastr.error("No hay opciones de decisión para los selectores del nodo "+t);for(var a in n){var s=n[a].split(",").length;if(s!=Math.pow(2,r))return void toastr.error("El nodo "+t+" tiene "+r+" selectores, pero la lista de indices tiene "+s+" indices")}}var l,c=function(e){var t=!1;for(var i in o[e].options){if("goto"==o[e].options[i].type){t=!0;var r=c(o[e].options[i]["goto"]);if("ok"!=r)return r}if("decision"==o[e].options[i].type){var n=o[e].options[i].decision.split(",");t=!0;for(var a in n){var r=c(n[a]);if("ok"!=r)return r}}"exit"==o[e].options[i].type&&o[e].options[i].exitCode&&(t=!0)}return t?"ok":"exit"};try{l=c(0)}catch(d){console.log(d.message),l="loop"}switch(l){case"exit":console.log("Se detectaron nodos sin salida."),toastr.error("El arbol tiene nodos sin salida");break;case"loop":console.log("Se detectaron lazos infinitos."),toastr.error("El arbol tiene lazos infinitos o hay nodos mal referenciados");break;case"ok":console.log("Arbol correcto"),toastr.success("Arbol correcto"),e.tempConfig.trees[e.editingIndex].validated=!0,$("#tree-edit-modal").modal("hide")}i()},e.testInDevice=function(){e.activeIndex=e.tempConfig.trees.findIndex(function(e){return e.active}),e.current=e.tempConfig.trees[e.activeIndex].tree[0],e.loadMenu=function(o){o>0&&e.tempConfig.trees[e.activeIndex].tree[o]&&(e.current=e.tempConfig.trees[e.activeIndex].tree[o])},e.toggleButton=function(o){e.current.options[o].checked?e.current.options[o].checked=!1:e.current.options[o].checked=!0},e.evalDecision=function(o){var t=o.split(",");for(var i in t)t[i]=parseInt(t[i]);var r="";for(var i in e.current.options)"toggle"==e.current.options[i].type&&(r+=e.current.options[i].checked?"1":"0");var n=parseInt(r,2);e.loadMenu(t[n])},e.exit=function(e){toastr.info("Codigo de finalización: "+e),$("#app-test-modal").modal("hide")},$("#app-test-modal").modal("show")},e.saveConfig=function(){var t={},i=[],r=[];for(var n in e.tempConfig.trees){if(e.tempConfig.trees[n].active){if(!e.tempConfig.trees[n].validated)return toastr.error("El modelo de decisiones que intenta activar no fue validado. Edite el árbol y seleccione 'Validar'"),void $("#confirm-modal").modal("hide");e.tempConfig.trees[n].editable=!1}e.tempConfig.trees[n].key&&!e.tempConfig.trees[n].deleted?t["decisionTrees/"+e.tempConfig.trees[n].key+"/active"]=e.tempConfig.trees[n].active:(i.push(e.tempConfig.trees[n]),r.push(n))}var a=[];for(var n in e.tempConfig.trees)e.tempConfig.trees[n].deleted&&e.tempConfig.trees[n].key&&a.push(middleware.db.set(null,"decisionTrees/"+e.tempConfig.trees[n].key));t["config/locationFilters"]=e.tempConfig.locationFilters,t["config/logLimit"]=e.tempConfig.logLimit,o.loading=!0,Promise.all(a).then(function(){middleware.db.update(t).then(function(){middleware.db.pushMultiple(i,"decisionTrees").then(function(t){var i=[];for(var n in t)e.tempConfig.trees[r[n]].key=t[n].key,i.push(middleware.fs.set({},"pathStats",e.tempConfig.trees[r[n]].id));Promise.all(i).then(function(){o.config=angular.copy(e.tempConfig),o.loading=!1,e.$apply(),toastr.success("La configuración actual fue sincronizada con la base de datos."),$("#confirm-modal").modal("hide")})["catch"](function(t){console.log(t),o.loading=!1,e.$apply(),toastr.error("Ocurrió un error al crear indicadores del nuevo árbol creado.")})})["catch"](function(t){console.log(t),o.loading=!1,e.$apply(),toastr.error("Ocurrió un error al sincronizar los árboles creados. Vuelva a intentarlo más tarde.")})})["catch"](function(t){console.log(t),o.loading=!1,e.$apply(),toastr.error("Ocurrió un error al sincronizar árboles activos. Vuelva a intentarlo más tarde.")})})["catch"](function(t){console.log(t),o.loading=!1,e.$apply(),toastr.error("Ocurrió un error al eliminar arboles creados")})},e.resetConfig=function(){e.tempConfig=angular.copy(o.config),e.elapsedHours=e.tempConfig.logLimit.elapsed/36e5,t(),i()},e.updateElapsed=function(){e.tempConfig.logLimit.elapsed=36e5*e.elapsedHours},e.resetConfig()}]);
//# sourceMappingURL=maps/main-deed60fbda.js.map