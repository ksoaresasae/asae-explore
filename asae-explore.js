/* 
******************************************************
ASAE EXPLORE
GNU GENERAL PUBLIC LICENSE
ASAE:       https://www.asaecenter.org
Developer:  Keith M. Soares - https://keithmsoares.com
******************************************************

Version: 
------------
5.0         2024-05-15

Last Update:
------------
- First GitHub version

Purpose:
--------
Add ASAE EXPLORE to any site on a per-page, per-site, or per-property basis.

Usage:
------
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/ksoaresasae/asae-explore/asae-explore.js"></script>

Note: if ebBaseURL is changed, this src will change, too.

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

//////////////////////////////////////////////
// MASTER CONTROL TO SHOW PROMO BAR: true/false
var showPB = true;
//////////////////////////////////////////////

//////////////////////////////////////////////
// MASTER BASE URL
var thisBaseURL = "https://cdn.jsdelivr.net/gh/ksoaresasae/asae-explore/";
//////////////////////////////////////////////

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
            asaeEB = ebhttp.responseText;
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
            //console.log(" - PB IS OK!");
            parsePBHTML();
        }
    };
    pbhttp.open("GET", thisBaseURL + "asae-pb.html", true);
    pbhttp.send();    
}

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
    setupEB();
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
// USE: setAttributes(elem, {"src": "http://example.com/something.jpeg", "height": "100%", ...});
function setAttributes(el, attrs) {
    for(var key in attrs) {
        //console.log("setAttribute: " + key + ": " + attrs[key]);
        el.setAttribute('style', key + ": " + attrs[key]);
    }
}
/* ---------- CSS HELPERS - END ---------- */

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

function setTransStyles(thisClick) {
    // SET TRANSITIONS FOR MODALS
    // Use these transition effects:
    // -webkit-transition: 0.5s linear;
    // -moz-transition: 0.5s linear;
    // -o-transition: 0.5s linear;
    // transition: 0.5s linear;
    var slideTrans = {"transition": "0.5s linear", "-o-transition": "0.5s linear", "-moz-transition": "0.5s linear",  "-webkit-transition": "0.5s linear"};

    //   --- OR ---
    // -webkit-transition: none;
    // -moz-transition: none;
    // -o-transition: none;
    // transition: none;
    var noTrans = {"transition": "none", "-o-transition": "none", "-moz-transition": "none",  "-webkit-transition": "none"};

    var transModalNav = document.getElementById("asae-eb-modal-nav-container");
    var transModalSearch = document.getElementById("asae-eb-modal-search-container");
    var transModalChatbot = document.getElementById("asae-eb-modal-chatbot-container");
    var transModalUser = document.getElementById("asae-eb-modal-user-container");

    setAttributes(transModalNav, slideTrans);
    setAttributes(transModalSearch, slideTrans);
    setAttributes(transModalChatbot, slideTrans);
    //setAttributes(transModalUser, slideTrans);

    if (thisClick == "navClick") {
        if (isOpenSearch || isOpenChatbot || isOpenUser) {
            setAttributes(transModalNav, noTrans);
        }
    }
    if (thisClick == "searchClick") {
        if (isOpenNav || isOpenChatbot || isOpenUser) {
            setAttributes(transModalSearch, noTrans);
        }
    }
    if (thisClick == "chatbotClick") {
        if (isOpenNav || isOpenSearch || isOpenUser) {
            setAttributes(transModalChatbot, noTrans);
        }
    }
    if (thisClick == "userClick") {
        if (isOpenNav || isOpenSearch || isOpenChatbot) {
            //setAttributes(transModalUser, noTrans);
        }
    }
}

function ebNavClickFunc() {
    //console.log("ebNavClickFunc")
    setTransStyles("navClick");

    isOpenNav = !isOpenNav;
    //console.log("isOpenNav="+isOpenNav);

    const ebNavClick = document.querySelector("#asae-eb-left-nav");
    const ebExploreASAE = document.querySelector("#asae-eb-explore-asae");
    const ebNavModal = document.querySelector("#asae-eb-modal-nav-container");
    
    ebNavClick.classList.toggle("active");
    ebExploreASAE.classList.toggle("active");
    ebNavModal.classList.toggle("active");

    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);

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
    //console.log("ebSearchClickFunc");
    setTransStyles("searchClick");
    
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
        document.getElementById("asae-eb-search-terms").focus();
    }

    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);

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
        // goto https://www.asaecenter.org/federatedsearch
        window.location.href = 'https://www.asaecenter.org/federatedsearch?query=' + termsSearch;
        return false;
    }
}

function ebChatbotClickFunc() {
    //console.log("ebChatbotClickFunc");
    setTransStyles("chatbotClick");

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
        document.getElementById("asae-eb-chatbot-terms").focus();
    }

    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);

}

function validateChatbot() {
    let termsChatbot = document.getElementById("asae-eb-chatbot-terms").value;
    termsChatbot = encodeURIComponent(termsChatbot);
    console.log("chatbot query: [" + termsChatbot + "]");
    //document.getElementById("asae-eb-chatbot-terms").value = termsChatbot;
    chatbotAlert = document.getElementById("asae-eb-chatbot-terms-alert");
    if (termsChatbot == "") {
        setAttributes(chatbotAlert, {"display": "inline-block"});
        return false;
    } else {
        setAttributes(chatbotAlert, {"display": "none"});
        // goto https://chat.bettybot.ai/asae.html
        window.location.href = 'https://chat.bettybot.ai/asae.html?prompt=' + termsChatbot;
        return false;
    }
}

function ebUserClickFunc() {
    //console.log("ebUserClickFunc");
    setTransStyles("userClick");

    isOpenUser = !isOpenUser;
    //console.log("isOpenUser="+isOpenUser);

    let thisRedirectURL = window.location.href;
    // goto https://sso.asaecenter.org/
    window.location.href = 'https://sso.asaecenter.org/sso.asaecenter.org/b2c_1a_signin_no_sign_up_aptify/oauth2/v2.0/authorize?response_type=code&scope=f64cfe0a-fef2-4cff-a059-87dc4ca71a52%20profile%20email%20address%20phone&redirect_uri=' + thisRedirectURL;
    
    /*
    const ebUserClick = document.querySelector("#asae-eb-right-user");
    const ebUserModal = document.querySelector("#asae-eb-modal-user-container");

    ebUserClick.classList.toggle("active");
    ebUserModal.classList.toggle("active");
    let svgparts = document.querySelectorAll('.asae-eb-user-icon');
    for (let i = 0; i < svgparts.length; i++) {
        svgparts[i].classList.toggle("active");
    }

    setTimeout(function(){
        document.getElementById("asae-eb-id").scrollIntoView({ behavior: "smooth" });
    }, 1000);
    */
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
        //console.log("CLICK: nav");
        ebNavClickFunc();
        if (isOpenSearch) {
            ebSearchClickFunc();
        } 
        if (isOpenChatbot) {
            // INSTANTLY HIDE CHATBOT
            //ebChatbotModal = document.querySelector("#asae-eb-modal-chatbot-container");
            //setAttributes(ebChatbotModal, {"display": "none"});
            ebChatbotClickFunc();
        } 
        if (isOpenUser) {
            ebUserClickFunc();
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
        //console.log("CLICK: search");
        ebSearchClickFunc();
        if (isOpenNav) {
            ebNavClickFunc();
        }
        if (isOpenChatbot) {
            ebChatbotClickFunc();
        } 
        if (isOpenUser) {
            ebUserClickFunc();
        } 
    });

    // EXPLORE ASAE CHATBOT (right)
    const ebChatbotClick = document.querySelector("#asae-eb-right-chatbot");
    ebChatbotClick.addEventListener("click", ()=>{
        //console.log("CLICK: chatbot");
        ebChatbotClickFunc();
        if (isOpenNav) {
            ebNavClickFunc();
        }
        if (isOpenSearch) {
            ebSearchClickFunc();
        } 
        if (isOpenUser) {
            ebUserClickFunc();
        } 
    });

    // EXPLORE ASAE USER (right)
    const ebUserClick = document.querySelector("#asae-eb-right-user");
    ebUserClick.addEventListener("click", ()=>{
        //console.log("CLICK: user");
        ebUserClickFunc();
        if (isOpenNav) {
            ebNavClickFunc();
        }
        if (isOpenSearch) {
            ebSearchClickFunc();
        } 
        if (isOpenChatbot) {
            ebChatbotClickFunc();
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
    eb-mmct - MMC+Tech Conference
    eb-annl - Annual Meeting
    eb-join - Join
    */
    var thisLink = null;
    const ebasae = document.querySelector("#eb-asae");
    const ebfoun = document.querySelector("#eb-foun");
    const ebcoll = document.querySelector("#eb-coll");
    const ebcahq = document.querySelector("#eb-cahq");
    const ebasnw = document.querySelector("#eb-asnw");
    const ebabsi = document.querySelector("#eb-absi");
    const eblear = document.querySelector("#eb-lear");
    const ebgovn = document.querySelector("#eb-govn");
    const ebmmct = document.querySelector("#eb-mmct");
    const ebannl = document.querySelector("#eb-annl");
    const ebjoin = document.querySelector("#eb-join");

    if (window.location.href.indexOf("www.asaecenter.org") != -1) {
        console.log("Current page is ASAE");
        thisLink = ebasae;
    }
    if (window.location.href.indexOf("foundation.asaecenter.org") != -1) {
        console.log("Current page is FOUN");
        thisLink = ebfoun;
    }
    if (window.location.href.indexOf("collaborate.asaecenter.org") != -1) {
        console.log("Current page is COLL");
        thisLink = ebcoll;
    }
    if (window.location.href.indexOf("careerhq.asaecenter.org") != -1) {
        console.log("Current page is CAHQ");
        thisLink = ebcahq;
    }
    if (window.location.href.indexOf("associationsnow.com") != -1) {
        console.log("Current page is ASNW");
        thisLink = ebasnw;
    }
    if (window.location.href.indexOf("www.asaebusinesssolutions.org") != -1) {
        console.log("Current page is ABSI");
        thisLink = ebabsi;
    }
    if (window.location.href.indexOf("learning.asaecenter.org") != -1) {
        console.log("Current page is LEAR");
        thisLink = eblear;
    }
    if (window.location.href.indexOf("governance.asaecenter.org") != -1) {
        console.log("Current page is GOVN");
        thisLink = ebgovn;
    }
    if ((window.location.href.indexOf("mmcc.asaecenter.org") != -1) || (window.location.href.indexOf("mmct.asaecenter.org") != -1)) {
        console.log("Current page is MMCT");
        thisLink = ebmmct;
    }
    if (window.location.href.indexOf("annual.asaecenter.org") != -1) {
        console.log("Current page is ANNL");
        thisLink = ebannl;
    }
    if (1 == 2) { // never turn off JOIN button
        thisLink = ebjoin;
    }

    if (thisLink !== null) {
        console.log("Disabling " + thisLink);
        thisLink.addEventListener("click", e => {
            e.preventDefault();
        })
        thisLink.style.color = "#d15007";
        thisLink.style.opacity = "70%";
        thisLink.style.cursor = "default";    
    }

    // hide div until loaded
    setAttributes(document.getElementById("asae-eb-id"), {"visibility":"visible"});
}

function closePB() {
    // close pb and set cookie to not show again until new
    pbID = document.getElementById("asae-pb-id");
    setAttributes(pbID, {"display": "none"});
    
    setCookie('pb-show',false,1); // expire in 1 day; set to 30 for production
}

(function() {
    document.addEventListener("DOMContentLoaded", function() { 
        // currently not in use 
    })
}) ()
