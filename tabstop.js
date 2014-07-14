/*
Tabstop - Google Chrome extension to block tabs loading on startup
Copyright (C) 2014  Adam Rosendorff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var open = []; //list to store all open tabs at launch
var loaded = false;

//runs when chrome starts
chrome.runtime.onStartup.addListener(function(start){
  chrome.tabs.query({active : true}, function(openTab){//prevents open tab blocking

    //gets tab ID of active tab
    var currentTab = openTab[0].id;
    //getting tab IDs for all external http/s URLs
    chrome.tabs.query({url : "http://*/*"},function(tabs){
      for (var i = 0; i < tabs.length; i++) {
        if (currentTab != tabs[i].id) {//checks it's not the active tab's ID
          open.push(tabs[i].id);
        }
      }
    });
    chrome.tabs.query({url : "https://*/*"},function(tabs){
      for (var i = 0; i < tabs.length; i++) {
        if (currentTab != tabs[i].id) {//checks it's not the active tab's ID
          open.push(tabs[i].id);
        }
      }
      for (var i = 0; i < open.length; i++) {
        chrome.tabs.reload(open[i]);//reloads all tabs to ensure they are correctly blocked
      }
      loaded = true;
    });
  });
});

function block(tab){

  if (open.indexOf(tab.tabId) != -1 && loaded == true) {//checking if the tab has been reloaded
    return {cancel: true};//this blocks the web request
  }
}

function remove(tab){
  if (open.indexOf(tab.tabId) != -1) {//if the tab hasn't yet been reloaded
    open[open.indexOf(tab.tabId)] = undefined;//remove tab ID from array
    chrome.tabs.reload(tab.tabId);
  }
  var done = true;
  for (var i = 0; i < open.length; i++) {
    if (open[i] != undefined) {//check if all tabs are reloaded (empty array)
      done = false;
    }
  }
  if (done == true) {//when all tabs are reloaded, remove uneeded listeners
    console.log("DONE");
    chrome.tabs.onActivated.removeListener(remove);
    chrome.webRequest.onBeforeRequest.removeListener(block);
  }
}

//runs when the active tab is changed
chrome.tabs.onActivated.addListener(remove);

//blocks all requests from tabs
chrome.webRequest.onBeforeRequest.addListener(block,
  {urls: ["<all_urls>"]},
  ["blocking"]);
