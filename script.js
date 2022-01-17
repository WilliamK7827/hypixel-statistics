// service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

document.addEventListener("load", function () {
  toggleLightbox();
  colourPage();
});

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
  root.setProperty('--lightAccent1', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 45 + '%)');
  root.setProperty('--darkAccent1', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 35 + '%)');
  hue += 75;
  root.setProperty('--lightAccent2', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 45 + '%)');
  root.setProperty('--darkAccent2', 'hsl(' + hue + 'deg, ' + sat + '%, ' + 35 + '%)');
}

function toggleLightbox() {
  let lightbox = document.getElementById('lightbox');
  console.log(lightbox.style.display);
  if (lightbox.style.display != 'none') {
    lightbox.style.display = 'none';
  } else {
    lightbox.style.display = 'flex';
  }
}

function reload() {
  document.location.reload(true);
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

function searchPlayer(player) {
  
  let playerID = (player == undefined) ? document.getElementById("search").value : player;
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
    .then(response => {
      return response.json();
    })
    .then(data => {
      showProfile(data);
    })
    .catch(err => {
      if ((err + " ").includes("SyntaxError: Unexpected token S in JSON at position 0")) {
        displayError("Request rejected due to CORS.<br><a target='_blank' href='https://cors-anywhere.herokuapp.com/'>Click here for CORS</a>");
      } else {
        displayError("User \"" + playerID + "\" does not exist.<pre>" + err + "</pre>");
      }
    });
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
    .then(response => {
      return response.json();
    })
    .then(data => {
      showProfile(data);
    })
    .catch(err => {
      if ((err + " ").includes("SyntaxError: Unexpected token S in JSON at position 0")) {
        displayError("Request rejected due to CORS.<br><a target='_blank' href='https://cors-anywhere.herokuapp.com/'>Click here for CORS</a>");
      } else {
        displayError("User \"" + playerID + "\" does not exist.<pre>" + err + "</pre>");
      }
    });
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
  
  apiKeyUsed = document.getElementById("apikey").value;
  let dataFromKey = "";
  
  if (apiKeyUsed) {
    fetch("https://api.hypixel.net/player?uuid=" + uuid + "&key=" + apiKeyUsed, {
      mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
      dataFromKey = data;
    })
    .catch(err => displayError("The player with the uuid \"" + uuid + "\" does not have any stats.<pre>" + err + "</pre>"));
  }
  
  fetch("https://api.slothpixel.me/api/players/" + uuid, {
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    if (data.uuid == uuid) {
      showPlayerStats(Object.assign(data, dataFromKey));
    } else {
      throw Error(data.error);
    }
  })
  .catch(err => displayError("The player with the uuid \"" + uuid + "\" does not have any stats.<pre>" + err + "</pre>"));
  
}

function clearProfile(node) {
  node.parentElement.removeChild(node);
}


/* Player: SHOW STATISTICS */

function showPlayerStats(data) {
  //console.log(data);
  buildSection("profile-general", "General");
  playerGeneral(data);
  
  buildSection("recent-games", "Recent Games");
  fetchSection(data.uuid, "recentGames");
  
  buildSection("profile-friends", "Friends");
  fetchSection(data.uuid, "friends");
  
  // achievements, quests
  // guild
  
  buildSection("var_dump", "var_dump code for JS stolen from https://theredpine.wordpress.com/2011/10/23/var_dump-for-javascript/");
  document.getElementById("var_dump-body").innerHTML = "";
  var_dump(data, 1, "var_dump-body");
}

function showDate(timestamp, format) {
  let date = new Date(timestamp)
  if (format == null) {return date.toString();}
  else if (format == "mdt") {
    let mdt = date.toString().split(" ");
    return mdt[1] + " " + mdt[2] + " " + mdt[4];
  }
}

function playerGeneral(data) {
  
  let profileGeneralBody = document.getElementById("profile-general-body");
  profileGeneralBody.innerHTML = "";
  let profileGeneralTable = document.createElement("table");
  profileGeneralBody.appendChild(profileGeneralTable);
  
  if (data.online != null) profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Status:</td><td>" + (data.online ? "Online" : "Offline") + "</td></tr>";
  if (data.language != null) profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Language:</td><td>" + data.language + "</td></tr>";
  if (data.version != null) profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Version:</td><td>" + data.mc_version + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Rank:</td><td>" + (data.rank == null ? "Non" : data.rank) + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Level:</td><td>" + data.level + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>EXP:</td><td>" + data.exp + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Karma:</td><td>" + data.karma + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Achievement Points:</td><td>" + data.achievement_points + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Quests Completed:</td><td>" + data.quests_completed + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Total Coins:</td><td>" + data.total_coins + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Total Kills:</td><td>" + data.total_kills + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Total Wins:</td><td>" + data.total_wins + "</td></tr>";
  profileGeneralTable.innerHTML += "<hr>";
  
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Gifts Sent:</td><td>" + data.gifts_sent + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Gifts Received:</td><td>" + data.gifts_received + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Rewards Claimed:</td><td>" + data.rewards.claimed + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Rewards Claimed Daily:</td><td>" + data.rewards.claimed_daily + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Best Rewards Streak:</td><td>" + data.rewards.streak_best + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Current Rewards Streak:</td><td>" + data.rewards.streak_current + "</td></tr>";
  profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Reward Tokens:</td><td>" + data.rewards.tokens + "</td></tr>";
  profileGeneralTable.innerHTML += "<hr>";
  
  if (data.first_login != null) profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>First Login:</td><td>" + showDate(data.first_login) + "</td></tr>";
  if (data.last_login != null) profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Last Login:</td><td>" + showDate(data.last_login) + "</td></tr>";
  if (data.last_logout != null) profileGeneralTable.innerHTML += "<tr class='profile-general-item'><td>Last Logout:</td><td>" + showDate(data.last_logout) + "</td></tr>";
  
}

function fetchSection(uuid, section) {
  
  fetch("https://api.slothpixel.me/api/players/" + uuid + "/" + section)
  .then(response => {
    if (response.status == 200) {
      return response.json();
    } else {
      displayError("An error occured.<pre>" + response.statusText + "</pre>");
    }
  })
  .then(data => eval(section + "(data);"));
  
}

function recentGames(data) {
  
  let RecentGamesBody = document.getElementById("recent-games-body");
  RecentGamesBody.innerHTML = "";
  let RecentGamesTable = document.createElement("table");
  RecentGamesBody.appendChild(RecentGamesTable);
  
  if (data.length == 0) {
    RecentGamesTable.innerHTML += "No games within the past 3 days";
    return;
  } else {
    RecentGamesTable.innerHTML += "<tr class='profile-general-item'><th></th><th>Start Time</th><th>End Time</th><th>Game</th><th>Mode</th><th>Map</th></tr>";
  }
  
  for (let i = 0; i < data.length; i++) {
    RecentGamesTable.innerHTML += "<tr class='profile-general-item'><td>" + (i + 1) + ". </td><td>" + showDate(data[i].date, "mdt") + "</td><td>" + ((data[i].ended != undefined) ? showDate(data[i].ended, "mdt") : "In progress") + "</td><td>" + data[i].gameType + "</td><td>" + data[i].mode + "</td><td>" + data[i].map + "</td></tr>";
  }
  
}

function friends(data) {
  
  let profileFriendsBody = document.getElementById("profile-friends-body");
  profileFriendsBody.innerHTML = "";
  let profileFriendsTable = document.createElement("table");
  profileFriendsBody.appendChild(profileFriendsTable);
  
  if (data.length == 0) {
    profileFriendsTable.innerHTML += "Nothing here yet!";
    return;
  } else {
    profileFriendsTable.innerHTML += "<tr class='profile-friends-item'><th></th><th>Friend UUID</th><th>Direction Sent</th><th>Time</th></tr>";
    for (let i = 0; i < data.length; i++) {
      profileFriendsTable.innerHTML += "<tr class='profile-friends-item'><td>" + (i + 1) + "</td><td onclick='searchPlayer(\"" + data[i].uuid + "\")'>" + data[i].uuid + "</td><td>" + (data[i].uuid == data[i].sent_by ? "from friend" : "from self") + "</td><td>" + showDate(data[i].started) + "</td></tr>";
    }
  }

}

function var_dump(obj, level, section) {
  var dump = "(<i>" + (typeof obj) + "</i>) : ";
  var level_nbsp = "";
  if(typeof level == "undefined"){var level = 1;}
  for(let i = 0; i < 5*level; i++){level_nbsp += "&nbsp;";}
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
