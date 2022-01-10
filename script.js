
document.addEventListener("load", colourPage());

document.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    searchPlayer();
  }
});

let apiKeyUsed = false;

function colourPage() {
  let hue = 101 + Math.floor(Math.random() * 225);
  let sat = 75;
  let root = document.querySelector(':root').style;
  root.setProperty('--lightAccent1', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 50 + '%)');
  root.setProperty('--darkAccent1', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 40 + '%)');
  hue += 50;
  root.setProperty('--lightAccent2', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 50 + '%)');
  root.setProperty('--darkAccent2', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 40 + '%)');
}


/* SEARCH FEATURES */

function toggleSearchList() {
  let searchlist = document.getElementById('searchlist');
  searchlist.style.display = (searchlist.style.display != 'inline-block') ? 'inline-block' : 'none';
}

function changeSearchType(value) {
  let searchMessage = document.getElementById("search");
  let searchMethod = document.getElementById("search-btn");
  let searchType = document.getElementById("searchtypehead");
  
  if (value == "player") {
    searchMessage.placeholder = "Search by Username or UUID";
    searchMessage.disabled = false;
    searchMessage.style.backgroundColor = "white";
    searchMethod.setAttribute("onclick", "searchPlayer()");
    searchType.innerHTML = "Player";
  } else if (value == "guild") {
    searchMessage.placeholder = "Search by Hypixel Guild Name";
    searchMessage.disabled = false;
    searchMessage.style.backgroundColor = "white";
    searchMethod.setAttribute("onclick", "searchGuild()");
    searchType.innerHTML = "Guild";
  } else if (value == "leaderboards") {
    searchMessage.placeholder = "Search Leaderboards";
    searchMessage.disabled = true;
    searchMessage.style.backgroundColor = "#DDD";
    searchMethod.setAttribute("onclick", "searchLeaderboards()");
    searchType.innerHTML = "Leaderboards";
  } else if (value == "punishments") {
    searchMessage.placeholder = "Search Punishment Statistics";
    searchMessage.disabled = true;
    searchMessage.style.backgroundColor = "#DDD";
    searchMethod.setAttribute("onclick", "searchPunishments()");
    searchType.innerHTML = "Punishments";
  }
  
}


/* SECTIONS */

function buildSection(sectionName, displayName) {
  
  if (document.getElementById(sectionName) != undefined) return;
  
  let section = document.createElement("section");
  section.setAttribute("id", sectionName);
  
  let secBody = document.createElement("div");
  secBody.setAttribute("id", sectionName + "-body");
  secBody.setAttribute("class", "section-body");
  
  let secHead = document.createElement("div");
  secHead.setAttribute("class", "section-heading");
  
  let secBtn = document.createElement("span");
  secBtn.setAttribute("id", sectionName + "-btn");
  secBtn.setAttribute("class", "section-btn");
  secBtn.setAttribute("onclick", "toggleSectionBody(this, '" + sectionName + "-body', false)");
  secBtn.innerHTML = "&plus;";
  
  secHead.appendChild(secBtn);
  secHead.innerHTML += displayName;
  section.appendChild(secHead);
  section.appendChild(secBody);
  document.getElementsByTagName('main')[0].appendChild(section);
  
}

function toggleSectionBody(btn, sectionName, isFromSearch) {
  
  let section = document.getElementById(sectionName);
  if (section.style.display != 'block') {
    section.style.display = 'block';
    btn.innerHTML = '&ndash;';
  } else if (!isFromSearch) {
    section.style.display = 'none';
    btn.innerHTML = '&plus;';
  }
  
}

function displayError(error) {
  
  let errorDiv = document.getElementById('error');
  
  errorDiv.innerHTML = error;
  if (error != "") {
    errorDiv.style.display = "inline-block";
  } else {
    errorDiv.style.display = "none";
  }
  
}


/* SEARCH */

function searchPlayer() {
  
  let playerID = document.getElementById("search").value;
  playerID = playerID.replaceAll(/[^a-zA-Z0-9_-]/g, "");
  if (document.getElementById("search").value == "") return;
  
  if (playerID.length > 30 && playerID == playerID.replaceAll(/[^a-f0-9-]/g, "")) {
    fetch("https://cors-anywhere.herokuapp.com/sessionserver.mojang.com/session/minecraft/profile/" + playerID, {
      mode: 'cors'
    })
    /*fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + playerID, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })*/
    .then(response => response.json())
    .then(data => {
      apiKeyUsed = document.getElementById("apikey").value;
      showProfile(data);
    })
    .catch(err => displayError("\"" + playerID + "\" does not exist.<br>Error Code" + err));
    //.catch(err => console.log(err));
  } else {
    fetch("https://cors-anywhere.herokuapp.com/api.mojang.com/users/profiles/minecraft/" + playerID, {
      mode: 'cors'
    })
    /*fetch("https://api.mojang.com/users/profiles/minecraft/" + playerID, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })*/
    .then(response => response.json())
    .then(data => {
      apiKeyUsed = false;
      showProfile(data);
    })
    .catch(err => displayError("\"" + playerID + "\" does not exist.<br>Error Code" + err));
    //.catch(err => console.log(err));
  }

}


/* Player: PROFILE RESULTS */

function showProfile(data) {
  
  let username = data.name;
  let UUID = data.id;
  let legacy = (data.legacy != undefined) ? data.legacy : false;
  let demo = (data.demo != undefined) ? data.demo : false;
  
  displayError("");
  buildSection("profile-results", "Profile Results");
  toggleSectionBody(document.getElementById('profile-results-btn'), 'profile-results-body', true);
  let profileResultsBody = document.getElementById("profile-results-body");
  let profileResultsItem = document.createElement("div");
  profileResultsItem.classList.add("profile-results-item");
  
  profileResultsItem.innerHTML = apiKeyUsed ? "Using API Key &nbsp;" : "";
  profileResultsItem.innerHTML += "<span class='profile-select-btn' onclick='selectProfile(\"" + UUID + "\")'>Select</span>";
  profileResultsItem.innerHTML += "<span class='profile-clear-btn' onclick='clearProfile(this.parentElement)'>Clear</span><br>";
  profileResultsItem.innerHTML += "Username: " + username + "<br>";
  profileResultsItem.innerHTML += "UUID: " + UUID + "<br>";
  profileResultsItem.innerHTML += (demo) ? "<span class='profile-status'>This is a demo account</span>" : (legacy) ? "<span class='profile-status'>This account has not migrated</span>" : "<span class='profile-status'>This account has migrated</span>";
  let PRBinnerHTML = profileResultsBody.innerHTML;
  profileResultsBody.innerHTML = "";
  profileResultsBody.appendChild(profileResultsItem);
  profileResultsBody.innerHTML += PRBinnerHTML;
}

function selectProfile(uuid) {
  
  let dataFromKey = "";
  
  if (apiKeyUsed) {
    fetch("https://api.hypixel.net/player?uuid=" + uuid + "&key=" + apiKeyUsed, {
      mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
      dataFromKey = data;
    })
    .catch(err => displayError("The player with the uuid \"" + uuid + "\" does not have any stats.<br>Error Code" + err));
    //.catch(err => console.log(err));
  }
  
  fetch("https://api.slothpixel.me/api/players/" + uuid, {
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    showPlayerStats(Object.assign(data, dataFromKey));
  })
  .catch(err => displayError("The player with the uuid \"" + uuid + "\" does not have any stats.<br>Error Code" + err));
  //.catch(err => console.log(err));
  
}

function clearProfile(node) {
  node.parentElement.removeChild(node);
}


/* Player: SHOW STATISTICS */

function showPlayerStats(data) {
  console.log(data);
  buildSection("profile-general", "General");
  playerGeneral(data);
  
  // achievements, quests, recent games, friends, online?
  //guild
  
  buildSection("var_dump", "var_dump code for JS stolen from https://theredpine.wordpress.com/2011/10/23/var_dump-for-javascript/");
  document.getElementById("var_dump-body").innerHTML = "";
  var_dump(data, 1, "var_dump-body");
}

function playerGeneral(data) {
  
  let profileGeneralBody = document.getElementById("profile-general-body");
  let profileGeneralItem = document.createElement("div");
  profileGeneralItem.classList.add("profile-general-item");
  
  profileGeneralBody.innerHTML = "";
  profileGeneralItem.innerHTML = "";
  if (data.first_login != null) profileGeneralItem.innerHTML += "First Login: " + new Date(data.first_login).toString();
  if (data.last_login != null) profileGeneralItem.innerHTML += "<br>Last Login: " + new Date(data.last_login).toString();
  if (data.last_logout != null) profileGeneralItem.innerHTML += "<br>Last Logout: " + new Date(data.last_logout).toString();
  
  let PGBinnerHTML = profileGeneralBody.innerHTML;
  profileGeneralBody.innerHTML = "";
  profileGeneralBody.appendChild(profileGeneralItem);
  profileGeneralBody.innerHTML += PGBinnerHTML;
  
}





function var_dump(obj, level, section) {
  var dump = "(<i>" + (typeof obj) + "</i>) : ";
  var level_nbsp = "";
  if(typeof level == "undefined"){var level = 1;}
  for(i = 0; i < 5*level; i++){level_nbsp += "&nbsp;";}
  switch(typeof obj){
    case "string":
      dump += obj + "<br/>\n";
      break;
    case "boolean":
      dump += (obj?"true":"false") + "<br/>\n";
      break;
    case "number":
    case "function":
      dump += obj.toString() + "<br/>\n";
      break;
    default:
      dump += "<br>\n";
      for(var key in obj){dump += level_nbsp +"<b>" + key + "</b> " + var_dump(obj[key], level + 1);}
      break;
  }
  if(level == 1){
    var dump_area = document.createElement('dump_area');
    dump_area.innerHTML = dump;
    document.getElementById(section).appendChild(dump_area);
  }
  else{return dump;}
}
