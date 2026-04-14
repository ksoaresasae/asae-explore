/* 
******************************************************
ASAE EXPLORE
GNU GENERAL PUBLIC LICENSE
ASAE:       https://www.asaecenter.org
Developer:  Keith M. Soares - https://keithmsoares.com
******************************************************

Version:
------------
9.24          2026-04-14
Notes:
- move nav shadow to inner 800px element instead of 1200px container
*/

//////////////////////////////////////////////
// MASTER GITVERSION
var gitVersion = "v9.24";

// MASTER BASE URL
var thisBaseURL = "https://cdn.jsdelivr.net/gh/ksoaresasae/asae-explore@" + gitVersion + "/";

//////////////////////////////////////////////
//////////////////////////////////////////////
// MASTER CONTROLS: true/false
var showPB = true;        // SHOW PROMO BAR - STILL CONTROLLED BY DATETIME AND THE alertTimer FUNCTION
var showSearch = true;    // SHOW SEARCH ICON
var showChatbot = true;  // SHOW CHATBOT ICON
// USER ICON IS ALWAYS ON
// BELOW ARE RELATED TO alertTimer FUNCTION
const alertStartDate = new Date("2026-04-09 00:00:01");
const alertEndDate = new Date("2026-04-09 23:59:59");
//////////////////////////////////////////////
//////////////////////////////////////////////

// SEARCH RESULTS PAGE URL (used by AddSearch "Show all results")
window.searchResultsPageUrl = "https://www.asaecenter.org/globalsearch";

/*
Purpose:
--------
Add ASAE EXPLORE to any site on a per-page, per-site, or per-property basis, to provide navigation among ASAE sites. 

Usage:
------
<!-- ASAE Explore - CSS/JS - [GITVERSION] -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ksoaresasae/asae-explore@[GITVERSION]/asae-explore.css"/>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/ksoaresasae/asae-explore@[GITVERSION]/asae-explore.js"></script>

Note: if thisBaseURL is changed, this src will change, too.

Instructions:
-------------
Simply place the above <script> code anywhere on a page to add it to that single page, or
place it in a global include/widget to make the header appear on the entire site.
This script can also be added via Google Tag Manager to quickly add it to an entire property.

Notes:
------
ASAE EXPLORE automatically positions its contents just after the opening <BODY> tag,
so it can be added **anywhere** in your code to function correctly.

This script also hides two legacy banners/headers:
- id: notification-bar
- class: sister-domains

ASAE EXPLORE has 3 major editable parts:
- Edit HTML for the EXPLORE BAR (eb) component between the START and STOP comments, below
- Edit HTML for the PROMO BAR (pb) component between the START and STOP comments, below
- Edit CSS for all components in the asae-explore.css file

**************************************************
*/

// placeholders for HTML contents
var asaeEB = "";
var asaePB = "";
var body = document.body;
var ebDiv = "";
var pbDiv = "";

//////////////////////////////////////////////
// READ EXTERNAL HTML FILES
//console.log("READING FILES...");

function loadEBHTML() {
    var ebhttp = new XMLHttpRequest();
    ebhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //ebhttp.responseText has HTML content
            asaeEB = ebhttp.responseText + "<!-- ASAE Explore " + gitVersion + " -->";
            //console.log(" - EB IS OK!");
            parseEBHTML();
            loadPBHTML();
        }
    };
    ebhttp.open("GET", thisBaseURL + "asae-eb.html", true);
    ebhttp.send();
}

loadEBHTML();

function loadPBHTML() {
    var pbhttp = new XMLHttpRequest();
    pbhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //pbhttp.responseText has HTML content
            asaePB = pbhttp.responseText;
            alertTimer();
            //console.log(" - PB IS OK!");
            parsePBHTML();
        }
    };
    pbhttp.open("GET", thisBaseURL + "asae-pb.html", true);
    pbhttp.send();    
}

/* ---------- DYNAMIC LOADING HELPERS - START ---------- */
function loadCSS(href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = callback || function(){};
    document.head.appendChild(script);
}

function loadSearchDependencies() {
    // Load CSS for AddSearch
    loadCSS("https://cdn.jsdelivr.net/npm/addsearch-search-ui@0.10/dist/addsearch-search-ui.min.css");
    loadCSS(thisBaseURL + "ui.min.css");
    // Load JS in sequence: client SDK -> UI SDK -> our config
    loadScript("https://cdn.jsdelivr.net/npm/addsearch-js-client@0.8/dist/addsearch-js-client.min.js", function() {
        loadScript("https://cdn.jsdelivr.net/npm/addsearch-search-ui@0.10/dist/addsearch-search-ui.min.js", function() {
            loadScript(thisBaseURL + "ui.min.js");
        });
    });
}
/* ---------- DYNAMIC LOADING HELPERS - END ---------- */

// populate HTML into divs
function parseEBHTML() {
    // add EXPLORE BAR (eb)
    ebDiv = document.createElement('div');
    ebDiv.id = 'asae-eb-id';
    // hide div until loaded
    setAttributes(ebDiv, {"visibility":"hidden"});
    ebDiv.innerHTML = asaeEB;
    body.insertBefore(ebDiv, body.firstChild);
    //console.log(" - EB HTML IS ADDED");
    // Populate icon src attributes from CDN
    var icons = ebDiv.querySelectorAll('[data-icon]');
    for (var i = 0; i < icons.length; i++) {
        icons[i].src = thisBaseURL + 'icons/' + icons[i].getAttribute('data-icon');
    }
    // Populate logo src attributes from CDN root
    var logos = ebDiv.querySelectorAll('[data-logo]');
    for (var i = 0; i < logos.length; i++) {
        logos[i].src = thisBaseURL + logos[i].getAttribute('data-logo');
    }

    // Track this site visit and populate Quick Links
    ebTrackVisit();
    ebPopulateQuickLinks();

    setupEB();

    setTabIndexes();

    showHideButtons();

    // Load AddSearch after DOM containers exist
    if (showSearch) {
        loadSearchDependencies();
    }
}

function parsePBHTML() {
    // add PROMO BAR (pb)
    if (showPB == true) {
        pbDiv = document.createElement('div');
        pbDiv.id = 'asae-pb-id';        
        pbDiv.innerHTML = asaePB;
        body.insertBefore(pbDiv, ebDiv.nextSibling);    
        //console.log(" - PB HTML IS ADDED");
    }
}
//////////////////////////////////////////////

// internal checks to see what modal is open
var isOpenNav = false;
var isOpenSearch = false;
var isOpenChatbot = false;
var isOpenUser =  false;

var directClick = false;

/* ---------- CSS HELPERS - START ---------- */
// USE: setAttributes(elem, {"display": "none", "visibility": "hidden", ...});
function setAttributes(el, attrs) {
    for(var key in attrs) {
        el.style.setProperty(key, attrs[key]);
    }
}

// Instantly close a modal panel without animation, then call its toggle function to reset state
function closeModalInstant(modalSelector, toggleFunc) {
    var el = document.querySelector(modalSelector);
    el.style.transition = 'none';
    toggleFunc();
    el.offsetHeight; // force reflow so the instant collapse applies
    el.style.transition = ''; // restore CSS transitions for next use
}
/* ---------- CSS HELPERS - END ---------- */

/* ---------- TABINDEX HELPERS - START ---------- */
// USE: setTabIndexes();
function setTabIndexes() {
    // Use 0 (natural DOM order) for visible interactive elements, -1 for hidden
    var navTabIndex = 0;
    var searchTabIndex = 0;
    var chatbotTabIndex = 0;
    var userTabIndex = 0;

    document.getElementById("asae-eb-left-nav").tabIndex = navTabIndex;
    document.getElementById("asae-eb-mag").tabIndex = searchTabIndex;
    document.getElementById("asae-eb-chatbot").tabIndex = chatbotTabIndex;
    document.getElementById("asae-eb-user").tabIndex = userTabIndex;

    // Nav modal content: only tabbable when open
    var navContentTabIndex = isOpenNav ? 0 : -1;
    var links = document.getElementById('asae-eb-modal-nav').getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        links[i].tabIndex = navContentTabIndex;
    }

    // Search modal: AddSearch manages its own inputs; guard legacy elements
    var searchContentTabIndex = isOpenSearch ? 0 : -1;
    var searchTermsEl = document.getElementById("asae-eb-search-terms");
    var searchSubmitEl = document.getElementById("asae-eb-search-submit");
    if (searchTermsEl) searchTermsEl.tabIndex = searchContentTabIndex;
    if (searchSubmitEl) searchSubmitEl.tabIndex = searchContentTabIndex;
    // Also manage AddSearch inputs within the search container
    var searchContainer = document.getElementById("asae-eb-modal-search-container");
    if (searchContainer) {
        var searchInputs = searchContainer.querySelectorAll('input, button, a');
        for (var i = 0; i < searchInputs.length; i++) {
            searchInputs[i].tabIndex = searchContentTabIndex;
        }
    }

    // Chatbot modal content: only tabbable when open
    var chatbotContentTabIndex = isOpenChatbot ? 0 : -1;
    document.getElementById("asae-eb-chatbot-terms").tabIndex = chatbotContentTabIndex;
    var chatbotSubmitEl = document.getElementById("asae-eb-chatbot-submit");
    if (chatbotSubmitEl) chatbotSubmitEl.tabIndex = chatbotContentTabIndex;

    // HIDE THE SEARCH AND CHATBOT ALERTS UNTIL USER ENTRY OCCURS
    var searchAlert = document.getElementById("asae-eb-search-terms-alert");
    if (searchAlert) setAttributes(searchAlert, {"display": "none"});
    var chatbotAlert = document.getElementById("asae-eb-chatbot-terms-alert");
    if (chatbotAlert) setAttributes(chatbotAlert, {"display": "none"});

}
/* ---------- TABINDEX HELPERS - END ---------- */

/* ---------- SHOW/HIDE BUTTONS HELPERS - START ---------- */
// USE: showHideButtons();
function showHideButtons() {
    searchIcon = document.getElementById("asae-eb-right-search");
    if (!showSearch) {
        setAttributes(searchIcon, {"display": "none"});
        searchIcon.tabIndex = -1;
    }
    chatbotIcon = document.getElementById("asae-eb-right-chatbot");
    if (!showChatbot) {
        setAttributes(chatbotIcon, {"display": "none"});
        chatbotIcon.tabIndex = -1;
    }
}
/* ---------- SHOW/HIDE BUTTONS HELPERS - END ---------- */

/* ---------- COOKIE HELPERS - START ----------*/
function doesCookieExist(cname) {
    var status = false;
    if (document.cookie && document.cookie.indexOf(cname) != -1) {
        status = true;
    }
    //console.log('COOKIE ' + cname + ' EXISTS? ' + status);
    return status;
}

function setCookie(cname, cvalue, exdays) {
    //console.log ('SET COOKIE: ' + cname + '|' + cvalue);
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    //console.log ('GET COOKIE: ' + cname);
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        //console.log (' - VALUE: ' + c.substring(name.length, c.length));
        if (c.substring(name.length, c.length) == "true") {
            return true;
        }
        if (c.substring(name.length, c.length) == "false") {
            return false;
        }
        return c.substring(name.length, c.length);
      }
    }
    //console.log (' - VALUE: null');
    return "";
}
/* ---------- COOKIE HELPERS - END ----------*/

/* ---------- ALERT HELPER - START ---------- */
// USE: alertTimer();
function alertTimer() {
    // console.log('Current datetime between alert datetimes?');
    if (isCurrentDateBetween(alertStartDate,alertEndDate)) {
        // console.log(' - YES');
        showPB = true;
    } else {
        // console.log(' - NO');
        showPB = false;
    }
}
function isCurrentDateBetween(startDate, endDate) {
    const currentDate = new Date();
    // console.log('Current datetime: ' + currentDate);
    // Check if the current date is greater than or equal to the start date
    // and less than or equal to the end date
    return currentDate >= startDate && currentDate <= endDate;
}
/* ---------- ALERT HELPER - END ---------- */

/* ---------- QUICK LINKS - START ---------- */
// Site registry: metadata for all nav grid sites
var ebSiteRegistry = {
    "eb-coll": { href: "https://collaborate.asaecenter.org/?asaeexplore=1", logo: "collaborate-logo.svg", label: "Collaborate", desc: "ASAE's online member community forum" },
    "eb-cahq": { href: "https://careerhq.asaecenter.org/?asaeexplore=1", logo: "achq-logo.svg", label: "CareerHQ", desc: "For association job seekers and employers" },
    "eb-asae": { href: "https://www.asaecenter.org/?asaeexplore=1", logo: "asae-logo-color.svg", label: "ASAE", desc: "The Center for Association Excellence" },
    "eb-absi": { href: "https://www.asaebusinesssolutions.org/?asaeexplore=1", logo: "absi.svg", label: "ASAE Business Solutions", desc: "Insurance, retirement, investments, and more" },
    "eb-foun": { href: "https://foundation.asaecenter.org/?asaeexplore=1", logo: "asae%20foundation.svg", label: "ASAE Research Foundation", desc: "Advancing knowledge in association management" },
    "eb-asnw": { href: "https://associationsnow.com/?asaeexplore=1", logo: "an-logo.svg", label: "Associations Now", desc: "News, insight, and analysis for association leaders" },
    "eb-lear": { href: "https://academy.asaecenter.org/?asaeexplore=1", logo: "ASAE_Academy Logo Stacked COLOR.svg", label: "ASAE Academy", desc: "Professional training for the association industry" },
    "eb-govn": { href: "https://agi.asaecenter.org/?asaeexplore=1", logo: "agi-diamond.svg", label: "AGI", desc: "Excellence in governance practices for associations" },
    "eb-solu": { href: "https://solutionshq.asaecenter.org/?asaeexplore=1", logo: "solutionshq-logo.svg", label: "Solution Providers HQ", desc: "Connecting associations with trusted partners and services" },
    "eb-mmct": { href: "https://mmct.asaecenter.org/?asaeexplore=1", logo: "mmct-logo-k.svg", label: "MMC +Tech", desc: "May 28-29, 2026 | Washington, DC" },
    "eb-annl": { href: "https://annual.asaecenter.org/?asaeexplore=1", logo: "annual logo.svg", label: "Annual Meeting", desc: "August 15-18, 2026 | Indianapolis, IN" }
};

// Curated quick links (always shown first)
var ebCuratedQuickLinks = ["eb-coll", "eb-cahq"];

// Track current site visit in localStorage
function ebTrackVisit() {
    var siteMap = {
        "www.asaecenter.org": "eb-asae",
        "foundation.asaecenter.org": "eb-foun",
        "collaborate.asaecenter.org": "eb-coll",
        "careerhq.asaecenter.org": "eb-cahq",
        "associationsnow.com": "eb-asnw",
        "www.asaebusinesssolutions.org": "eb-absi",
        "academy.asaecenter.org": "eb-lear",
        "agi.asaecenter.org": "eb-govn",
        "solutionshq.asaecenter.org": "eb-solu",
        "mmcc.asaecenter.org": "eb-mmct",
        "mmct.asaecenter.org": "eb-mmct",
        "annual.asaecenter.org": "eb-annl"
    };
    var currentHost = window.location.hostname;
    var siteId = siteMap[currentHost];
    if (!siteId) return;
    try {
        var visits = JSON.parse(localStorage.getItem('eb-visits') || '{}');
        visits[siteId] = (visits[siteId] || 0) + 1;
        localStorage.setItem('eb-visits', JSON.stringify(visits));
    } catch(e) {}
}

// Get top visited sites from localStorage, excluding curated and current site
function ebGetTopVisited(exclude, count) {
    try {
        var visits = JSON.parse(localStorage.getItem('eb-visits') || '{}');
        var sorted = Object.keys(visits)
            .filter(function(id) { return exclude.indexOf(id) === -1 && ebSiteRegistry[id]; })
            .sort(function(a, b) { return visits[b] - visits[a]; });
        return sorted.slice(0, count);
    } catch(e) {
        return [];
    }
}

// Build a Quick Link HTML element
function ebBuildQuickLink(siteId, suffix) {
    var site = ebSiteRegistry[siteId];
    if (!site) return null;
    var a = document.createElement('a');
    a.id = siteId + (suffix || '-ql');
    a.href = site.href;
    a.target = '_blank';
    a.className = 'asae-eb-grid-item';
    a.setAttribute('aria-label', site.label + ' - opens in new tab');

    var img = document.createElement('img');
    img.src = thisBaseURL + site.logo;
    img.className = 'asae-eb-grid-icon';
    img.alt = '';

    var label = document.createElement('span');
    label.className = 'asae-eb-grid-label';
    label.textContent = site.label;

    var desc = document.createElement('span');
    desc.className = 'asae-eb-link-desc';
    desc.textContent = site.desc;

    a.appendChild(img);
    a.appendChild(label);
    a.appendChild(desc);
    return a;
}

// Populate the Quick Links grid
function ebPopulateQuickLinks() {
    var grid = document.getElementById('asae-eb-quick-links-grid');
    if (!grid) return;

    // Determine current site to exclude from dynamic slots
    var currentSiteId = null;
    var currentHost = window.location.hostname;
    var hostMap = {
        "www.asaecenter.org": "eb-asae",
        "foundation.asaecenter.org": "eb-foun",
        "collaborate.asaecenter.org": "eb-coll",
        "careerhq.asaecenter.org": "eb-cahq",
        "associationsnow.com": "eb-asnw",
        "www.asaebusinesssolutions.org": "eb-absi",
        "academy.asaecenter.org": "eb-lear",
        "agi.asaecenter.org": "eb-govn",
        "solutionshq.asaecenter.org": "eb-solu",
        "mmcc.asaecenter.org": "eb-mmct",
        "mmct.asaecenter.org": "eb-mmct",
        "annual.asaecenter.org": "eb-annl"
    };
    currentSiteId = hostMap[currentHost];

    // 1. Add curated links (skip if it's the current site)
    var added = [];
    for (var i = 0; i < ebCuratedQuickLinks.length; i++) {
        var id = ebCuratedQuickLinks[i];
        if (id === currentSiteId) continue;
        var el = ebBuildQuickLink(id, '-ql');
        if (el) {
            grid.appendChild(el);
            added.push(id);
        }
    }

    // 2. Add up to 2 dynamic links from visit history
    var exclude = added.concat(ebCuratedQuickLinks);
    if (currentSiteId) exclude.push(currentSiteId);
    var dynamic = ebGetTopVisited(exclude, 2);
    for (var i = 0; i < dynamic.length; i++) {
        var el = ebBuildQuickLink(dynamic[i], '-ql-dyn');
        if (el) {
            grid.appendChild(el);
            added.push(dynamic[i]);
        }
    }

    // Hide Quick Links section if empty
    if (added.length === 0) {
        document.getElementById('asae-eb-quick-links').style.display = 'none';
    }
}
/* ---------- QUICK LINKS - END ---------- */

function ebNavClickFunc() {

    isOpenNav = !isOpenNav;
    //console.log("isOpenNav="+isOpenNav);

    const ebNavClick = document.querySelector("#asae-eb-left-nav");
    const ebExploreASAE = document.querySelector("#asae-eb-explore-asae");
    const ebNavModal = document.querySelector("#asae-eb-modal-nav-container");
    
    ebNavClick.classList.toggle("active");
    ebExploreASAE.classList.toggle("active");
    ebNavModal.classList.toggle("active");
    let svgparts = document.querySelectorAll('.asae-eb-switcher-icon');
    for (let i = 0; i < svgparts.length; i++) {
        svgparts[i].classList.toggle("active");
    }

    //set aria-expanded value as well, for a11y
    const expanded = ebNavClick.getAttribute('aria-expanded') === 'true';
    ebNavClick.setAttribute('aria-expanded', !expanded);
    //
    
    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);

    setTabIndexes();
}

function ebNavShowDescClickFunc(directClick) {
    //console.log("ebNavShowDescClickFunc");
    var setNavShowDescCookie = false;
    const ebNavShowDescClick = document.querySelector("#asae-eb-showdesc-toggle");

    // what is current state?
    // if current state is OFF, set cookie var to TRUE
    //console.log("is ShowDesc active?");
    if (ebNavShowDescClick.classList.contains("active")) {
        //console.log(" - YES");
    } else {
        //console.log(" - NO");
        setNavShowDescCookie = true;
    }

    // toggle active style
    ebNavShowDescClick.classList.toggle("active");
    var els = document.querySelectorAll('.asae-eb-link-desc');
    for (var i=0; i < els.length; i++) {
        els[i].classList.toggle("active");
    }

    // if this was not a direct click on the input, handle changing the input, too
    if (!directClick) {
        var inputs = document.querySelectorAll('.asae-eb-showdesc-input');
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) {
                //console.log("input - change to unchecked");
                inputs[i].checked = false;
            } else {
                //console.log("input - change to checked");
                inputs[i].checked = true;
            }
        }
    }
    setCookie('eb-nav-showdesc',setNavShowDescCookie,10000);
}

function ebSearchClickFunc() {
    isOpenSearch = !isOpenSearch;
    //console.log("isOpenSearch="+isOpenSearch);
    
    const ebSearchClick = document.querySelector("#asae-eb-right-search");
    const ebSearchModal = document.querySelector("#asae-eb-modal-search-container");

    ebSearchClick.classList.toggle("active");
    ebSearchModal.classList.toggle("active");
    let svgparts = document.querySelectorAll('.asae-eb-mag-icon');
    for (let i = 0; i < svgparts.length; i++) {
        svgparts[i].classList.toggle("active");
    }

    if (isOpenSearch) {
        //document.getElementById("asae-eb-search-terms").focus();
    }

    //set aria-expanded value as well, for a11y
    const expanded = document.getElementById("asae-eb-mag").getAttribute('aria-expanded') === 'true';
    document.getElementById("asae-eb-mag").setAttribute('aria-expanded', !expanded);
    //

    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);
    
    setTabIndexes();
}

function validateSearch() {
    let termsSearch = document.getElementById("asae-eb-search-terms").value;
    termsSearch = encodeURIComponent(termsSearch);
    console.log("search query: [" + termsSearch + "]");
    //document.getElementById("asae-eb-search-terms").value = termsSearch;
    searchAlert = document.getElementById("asae-eb-search-terms-alert");
    if (termsSearch == "") {
        setAttributes(searchAlert, {"display": "inline-block"});
        return false;
    } else {
        setAttributes(searchAlert, {"display": "none"});
        window.location.href = 'https://www.asaecenter.org/globalsearch?search=' + termsSearch;
        return false;
    }
}

function ebChatbotClickFunc() {
    isOpenChatbot = !isOpenChatbot;
    //console.log("isOpenChatbot="+isOpenChatbot);
    
    const ebChatbotClick = document.querySelector("#asae-eb-right-chatbot");
    const ebChatbotModal = document.querySelector("#asae-eb-modal-chatbot-container");

    ebChatbotClick.classList.toggle("active");
    ebChatbotModal.classList.toggle("active");
    let svgparts = document.querySelectorAll('.asae-eb-chatbot-icon');
    for (let i = 0; i < svgparts.length; i++) {
        svgparts[i].classList.toggle("active");
    }

    if (isOpenChatbot) {
        //document.getElementById("asae-eb-chatbot-terms").focus();
    }

    //set aria-expanded value as well, for a11y
    const expanded = document.getElementById("asae-eb-chatbot").getAttribute('aria-expanded') === 'true';
    document.getElementById("asae-eb-chatbot").setAttribute('aria-expanded', !expanded);
    //

    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);

    setTabIndexes();
    
}

function validateChatbot() {
    let termsChatbot = document.getElementById("asae-eb-chatbot-terms").value;
    termsChatbot = encodeURIComponent(termsChatbot);
    console.log("chatbot query: [" + termsChatbot + "]");
    //document.getElementById("asae-eb-chatbot-terms").value = termsChatbot;
    chatbotAlert = document.getElementById("asae-eb-chatbot-terms-alert");
    if (termsChatbot == "") {
        setAttributes(chatbotAlert, {"display": "block"});
        return false;
    } else {
        setAttributes(chatbotAlert, {"display": "none"});
        window.location.href = 'https://www.asaecenter.org/stellar?prompt=' + termsChatbot;
        return false;
    }
}

function ebUserClickFunc() {

    isOpenUser = true; // !isOpenUser;
    //console.log("isOpenUser="+isOpenUser);

    let thisRedirectURL = window.location.href;
    // goto https://sso.asaecenter.org/
    if (isOpenUser) {
        window.location.href = 'https://asae-login.wicketcloud.com/login?service=https://my.asaecenter.org/my-account/&locale=en';
    }
    // https://sso.asaecenter.org/sso.asaecenter.org/b2c_1a_signin_no_sign_up_aptify/oauth2/v2.0/authorize?response_type=code&scope=f64cfe0a-fef2-4cff-a059-87dc4ca71a52%20profile%20email%20address%20phone&redirect_uri=' + thisRedirectURL;
    
    //const ebUserClick = document.querySelector("#asae-eb-right-user");
    //const ebUserModal = document.querySelector("#asae-eb-modal-user-container");

    //ebUserClick.classList.toggle("active");
    //ebUserModal.classList.toggle("active");
    //let svgparts = document.querySelectorAll('.asae-eb-user-icon');
    //for (let i = 0; i < svgparts.length; i++) {
    //    svgparts[i].classList.toggle("active");
    //}

    //setTimeout(function(){
    //    document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    //}, 1000);

    setTabIndexes();
}

function setupEB() {

    // SET INITIAL COOKIES
    // ---------->>  ADD CHECK FOR GDPR  <<---------- //
    //console.log('CHECKING COOKIES...');
    // start with Link Descriptions hidden
    if (doesCookieExist('eb-nav-showdesc')) {
        if (getCookie('eb-nav-showdesc')) {
            //console.log('...Show Desc is true');
            ebNavShowDescClickFunc(false);
        } else {
            setCookie('eb-nav-showdesc',false,10000);
        }
    }
    // start with Promo Bar shown
    if (doesCookieExist('pb-show')) {
        if (!getCookie('pb-show')) {
            //console.log('...Show PB is false');
            showPB = false;
        } else {
            setCookie('pb-show',true,10000);
        }
    }

    // EXPLORE ASAE NAV (left)
    const ebNavClick = document.querySelector("#asae-eb-left-nav");
    ebNavClick.addEventListener("click", ()=>{
        ebNavClickFunc();
        if (isOpenSearch) {
            closeModalInstant("#asae-eb-modal-search-container", ebSearchClickFunc);
        }
        if (isOpenChatbot) {
            closeModalInstant("#asae-eb-modal-chatbot-container", ebChatbotClickFunc);
        }
    });
    ebNavClick.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            ebNavClickFunc();
            if (isOpenSearch) {
                closeModalInstant("#asae-eb-modal-search-container", ebSearchClickFunc);
            }
            if (isOpenChatbot) {
                closeModalInstant("#asae-eb-modal-chatbot-container", ebChatbotClickFunc);
            }
        }
    });
    const ebNavShowDescClick = document.querySelector("#asae-eb-showdesc-toggle");
    ebNavShowDescClick.addEventListener("click", ()=>{
        //console.log("CLICK: nav descriptions");
        ebNavShowDescClickFunc(false);
    });

    // EXPLORE ASAE SEARCH (right)
    const ebSearchClick = document.querySelector("#asae-eb-right-search");
    ebSearchClick.addEventListener("click", ()=>{
        ebSearchClickFunc();
        if (isOpenNav) {
            closeModalInstant("#asae-eb-modal-nav-container", ebNavClickFunc);
        }
        if (isOpenChatbot) {
            closeModalInstant("#asae-eb-modal-chatbot-container", ebChatbotClickFunc);
        }
    });
    ebSearchClick.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            ebSearchClickFunc();
            if (isOpenNav) {
                closeModalInstant("#asae-eb-modal-nav-container", ebNavClickFunc);
            }
            if (isOpenChatbot) {
                closeModalInstant("#asae-eb-modal-chatbot-container", ebChatbotClickFunc);
            }
        }
    });

    // EXPLORE ASAE CHATBOT (right)
    const ebChatbotClick = document.querySelector("#asae-eb-right-chatbot");
    ebChatbotClick.addEventListener("click", ()=>{
        ebChatbotClickFunc();
        if (isOpenNav) {
            closeModalInstant("#asae-eb-modal-nav-container", ebNavClickFunc);
        }
        if (isOpenSearch) {
            closeModalInstant("#asae-eb-modal-search-container", ebSearchClickFunc);
        }
    });
    ebChatbotClick.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            ebChatbotClickFunc();
            if (isOpenNav) {
                closeModalInstant("#asae-eb-modal-nav-container", ebNavClickFunc);
            }
            if (isOpenSearch) {
                closeModalInstant("#asae-eb-modal-search-container", ebSearchClickFunc);
            }
        }
    });

    // EXPLORE ASAE USER (right)
    const ebUserClick = document.querySelector("#asae-eb-right-user");
    ebUserClick.addEventListener("click", ()=>{
        ebUserClickFunc();
        if (isOpenNav) {
            closeModalInstant("#asae-eb-modal-nav-container", ebNavClickFunc);
        }
        if (isOpenSearch) {
            closeModalInstant("#asae-eb-modal-search-container", ebSearchClickFunc);
        }
        if (isOpenChatbot) {
            closeModalInstant("#asae-eb-modal-chatbot-container", ebChatbotClickFunc);
        }
    });
    ebUserClick.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            ebUserClickFunc();
            if (isOpenNav) {
                closeModalInstant("#asae-eb-modal-nav-container", ebNavClickFunc);
            }
            if (isOpenSearch) {
                closeModalInstant("#asae-eb-modal-search-container", ebSearchClickFunc);
            }
            if (isOpenChatbot) {
                closeModalInstant("#asae-eb-modal-chatbot-container", ebChatbotClickFunc);
            }
        }
    });

    /* 
    **********************************************************
    Disable links for the current website
    IDs are:
    eb-asae - ASAE
    eb-foun - ASAE Research Foundation
    eb-coll - Collaborate
    eb-cahq - CareerHQ
    eb-asnw - Associations Now
    eb-absi - ASAE Business Solutions
    eb-lear - Learning
    eb-govn - Association Governance Institute
    eb-solu - Soluntion Providers HQ
    eb-mmct - MMC+Tech Conference
    eb-annl - Annual Meeting
    eb-join - Join
    */
    // Map hostnames to link ID prefixes (matches both grid and quick link instances)
    var siteMap = {
        "www.asaecenter.org": "eb-asae",
        "foundation.asaecenter.org": "eb-foun",
        "collaborate.asaecenter.org": "eb-coll",
        "careerhq.asaecenter.org": "eb-cahq",
        "associationsnow.com": "eb-asnw",
        "www.asaebusinesssolutions.org": "eb-absi",
        "academy.asaecenter.org": "eb-lear",
        "agi.asaecenter.org": "eb-govn",
        "solutionshq.asaecenter.org": "eb-solu",
        "mmcc.asaecenter.org": "eb-mmct",
        "mmct.asaecenter.org": "eb-mmct",
        "annual.asaecenter.org": "eb-annl"
    };

    var currentHost = window.location.hostname;
    var disableId = siteMap[currentHost];

    if (disableId) {
        // Disable all matching links (grid item + quick link duplicate)
        var linksToDisable = document.querySelectorAll('[id^="' + disableId + '"]');
        for (var i = 0; i < linksToDisable.length; i++) {
            var link = linksToDisable[i];
            link.addEventListener("click", function(e) { e.preventDefault(); });
            link.style.opacity = "0.5";
            link.style.cursor = "default";
        }
    }

    // hide div until loaded
    setAttributes(document.getElementById("asae-eb-id"), {"visibility":"visible"});
}

function closePB() {
    // close pb and set cookie to not show again until new
    pbID = document.getElementById("asae-pb-id");
    setAttributes(pbID, {"display": "none"});
    
    setCookie('pb-show',false,30); // expire in days; set to 30 for production
}

/* ---------- KEYBOARD HELPERS - START ---------- */
// Escape key closes any open modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (isOpenNav) ebNavClickFunc();
        if (isOpenSearch) ebSearchClickFunc();
        if (isOpenChatbot) ebChatbotClickFunc();
    }
});
/* ---------- KEYBOARD HELPERS - END ---------- */
