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

var block_tabs = [];

//runs when chrome starts
chrome.runtime.onStartup.addListener(function(start) {
  chrome.tabs.query({}, function(tabs) { // find all open tabs
    tabs.forEach(function(details) {
      if (details.url) { // check if a tab has a url (not an internal tab)
        block_tabs.push(details.id);
      }
    });
  });
});

// blocks all web requests
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  var tabIndex = block_tabs.indexOf(details.tabId);
  if (tabIndex !== -1) { // if the requests came from a tab open at startup
    block_tabs.splice(tabIndex, 1); // remove the tab from the list of tabs to be blocked
    return {cancel: true}; // block the tab
  }
  return {cancel: false}
},
{urls: ['<all_urls>']},
['blocking']);
