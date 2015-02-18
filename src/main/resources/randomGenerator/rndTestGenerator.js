/*
 * These functions are actually constructors for clasess representing 
 * events, states, etc.
 */

function eventFS(name, type) {
    this.name = name;
    this.type = type;
    var args_ = [];
    for (var i = 2; i < arguments.length; i++) {
        args_.push(arguments[i]); // arguments --> list of params, so functions can have more args!
    }
    this.args = args_;
}

function stateFS(menu, catalog, cart, compare, catalog_view) {
    this.menu = menu;
    this.catalog = catalog;
    this.cart = cart;
    this.compare = compare;
    this.catalog_view = catalog_view;
}

function metaST(flag) 
{
    this.flag = flag;
    if (this.flag) {
        this.effect = arguments[1];
        this.state = arguments[2];
    } 
    else {
        this.effect = null;
        this.state = arguments[1];
    }
}

/*
 * These are auxilarly functions which are used in various parts of the event driving automata
 */

function randomR(n) {
    return Math.floor(Math.random() * n );
}

function findEventCategoryName(evt) 
{
    var ename = evt.name;
    for (var cname in fs_event_cats) {
        categs = fs_event_cats[cname];
        for (var i = 0; i < categs.length; i++) {
            if (categs[i] == ename) {
                return cname;
            }
        }
    }
    return null;
}

function delay(ms) {
  ms += new Date().getTime();
  while (new Date() < ms) {}
} 

function clone(obj) {
  function Clone() { } 
  Clone.prototype = obj;
  var c = new Clone();
  c.constructor = Clone;
  return c;
}

/*
 * This function will probably work only for arrays which contain primitive data.
 */
function compareArrays(a1, a2) {
    if (a1.length != a2.length) return false;
    for (var i in a1) {
        if (a1[i] !== a2[i]) return false;    
    }
    return true;
}

/*
 * These are constants representing existed events in the application and event categories
 */
const fs_events = new Array( 
                 new eventFS("phone_details", "click")
			   , new eventFS("add_compare_this", "click")
			   , new eventFS("add_cart_this", "click")
			   , new eventFS("back_thumb", "click")
    		   , new eventFS("series", "change", "5")
			   , new eventFS("priceSlider", "change", "11", "11")
			   , new eventFS("Tri-Band_check", "click")
			   , new eventFS("Tri-Band_uncheck", "click")
			   , new eventFS("Camera_check", "click")
			   , new eventFS("Camera_uncheck", "click")
			   , new eventFS("Video_check", "click")
			   , new eventFS("Video_uncheck", "click")
               , new eventFS("remove_cart", "click")
               , new eventFS("remove_compare", "click")
               , new eventFS("ButtonBar0", "itemclick", "3")
			   , new eventFS("change_view", "click")   
			   , new eventFS("add_compare", "click")
			   , new eventFS("toCompareView", "click")
			   , new eventFS("backCompareView", "click")
			   , new eventFS("add_cart", "click")
			   , new eventFS("phone_click", "click")
                           );
//for some strange reason this evens hanging application
//new eventFS("details_tabs", "change", 2)
//new eventFS("quantity_change", "type")
	
var fs_event_cats = { maintab: ["ButtonBar0"]
                    , filter: ["series", "priceSlider", "Tri-Band_check", "Tri-Band_uncheck", "Camera_check", "Camera_uncheck", "Video_check", "Video_uncheck"]
                    , phoneclick: ["phone_click", "phone_details"]
                    , addcart : ["add_cart"]
                    , addcompare: ["add_compare"]
                    , compare: ["toCompareView", "backCompareView"]
                    , changeview: ["change_view"] 
                    , remove: ["remove_cart", "remove_compare"]
                    , details: ["add_cart_this", "add_compare_this", "back_thumb", "details_tabs"]
                    , cart_quantity: ["quantity_change"]
                    };


/*
 * Javascript wrappers over the functions exported by Actionscript. 
 * They are mostly getters of certain peaces of information about the AS application.
 */

function getApp() { return document["AutomationLoader"]; }
function getId(prefix) { return getApp().getAutomationId(prefix); }
function getCatalog() { return getApp().getCatalogContents(); }
function getCart() { return getApp().getCartContents(); }
function getCompare() { return getApp().getCompareContents(); }
function getMainTabState() { return getApp().getMainTabState(); }
function getCatalogState() { return getApp().getCatalogState(); }
function getProductsState() { return getApp().getProductsState(); }
function getDetailsState() { return getApp().getDetailsState(); }
function getTribandState(){ return getApp().getTribandState(); }
function getVideoState() { return getApp().getVideoState(); }
function getCameraState() { return getApp().getCameraState(); }
function getDelegateId(name) { return getApp().getDelegateIdByObjectName(name); }
function getObjectName(id) { return getApp().getObjectNameByDelegateId(id); }
function updateDelegateId(name) { return getApp().changeDelegateIdByName(name); }

/*
 * functions generating execution steps in response on the events
 */
 
function makeStep(step) {
    var time;
    if (arguments.length == 2) time = arguments[1] ;
    else time = 1000; 
    return function() { step; delay(time); };   
} 
 
function applyBBarItemClick(evt, st) {
    var effect = makeStep(getApp().Invoke(evt.name , evt.type, evt.args[0]));
    return new metaST(true, effect, st);
}

function applyFilterGroup(evt, st) {
    var effect;
    if (getMainTabState() == "Products" && getProductsState() == "showFilter")
    {
    //this big conditional structure can be slightly improved by carrying out of 
    //switch effect assignment and update call
        switch (evt.name) 
        {
            case "series":
                evt.name = "IDY_filterPanel_comboboxSeries" ;              
                effect = makeStep(getApp().Invoke(evt.name , evt.type, evt.args[0])); 
                break;
            case "priceSlider":
                evt.name = "IDY_priceSlider" ;
                effect = function() {
                    getApp().Invoke(evt.name , evt.type, "0", 100*evt.args[0]);
                    delay(1000);
                    getApp().Invoke(evt.name , evt.type, "1", 100*evt.args[1]);
                    delay(1000);
                };
                break;
            case "Tri-Band_check":
                if (!getTribandState()) {
                    evt.name = "IDY_filterPanel_cbTriband" ;
                    //evt.name += "_false"
                    //updateDelegateId(evt.name);
                    effect = makeStep(getApp().Invoke(evt.name , evt.type)) ;
                }
                else return new metaST(false, st);
                break;
            case "Tri-Band_uncheck":
                if (getTribandState()) {
                    evt.name = "IDY_filterPanel_cbTriband" ;
                    //evt.name += "_true"
                    //updateDelegateId(evt.name);
                    effect = makeStep(getApp().Invoke(evt.name , evt.type));
                }
                else return new metaST(false, st);
                break;
            case "Camera_check":
                if (!getCameraState()) {
                    evt.name = "IDY_filterPanel_cbCamera" ;
                    //evt.name += "_false"
                    //updateDelegateId(evt.name);
                    effect = makeStep(getApp().Invoke(evt.name , evt.type)) ;
                }
                else return new metaST(false, st);
                break;
            case "Camera_uncheck":
                if (getCameraState()) {
                    evt.name = "IDY_filterPanel_cbCamera" ;
                    //evt.name += "_true"
                    //updateDelegateId(evt.name);
                    effect = makeStep(getApp().Invoke(evt.name , evt.type)) ;
                }
                else return new metaST(false, st);
                break;
            case "Video_check":
                if (!getVideoState()) {
                    evt.name = "IDY_filterPanel_cbVideo" ;
                    //evt.name += "_false"
                    //updateDelegateId(evt.name);
                    effect = makeStep(getApp().Invoke(evt.name , evt.type)) ;
                }
                else return new metaST(false, st);
                break;
            case "Video_uncheck":
                if (getVideoState()) {
                    evt.name = "IDY_filterPanel_cbVideo" ;
                    //evt.name += "_true"
                    //updateDelegateId(evt.name);
                    effect = makeStep(getApp().Invoke(evt.name , evt.type)) ;
                }
                else return new metaST(false, st);
                break;
            
        }
        return new metaST(true, effect, st);
    } 
    return new metaST(false, st) ;
}

function applyClickPhoneGroup(evt, st) {
    var effect;
    if ( getMainTabState() == "Products" && !compareArrays(getCatalog(), [])) {
         switch (evt.name) {   
            case "phone_click":
                evt.name = "IDY_img_" + evt.args[0];
                break;
            case "phone_details": 
                evt.name = "IDY_details_" + evt.args[0];
                break;   
         }
         var effect = makeStep(getApp().Invoke(evt.name , evt.type));
         return new metaST(true, effect, st);
    }
    return new metaST(false, st) ;
}


function applyAddCartGroup(evt, st) {
  var effect;
  if (getMainTabState() == "Products" && !compareArrays(getCatalog(), [])) {
     switch (evt.name) {
        case "add_cart":
            evt.name = "IDY_purchase_" + evt.args[0];
            effect = makeStep(getApp().Invoke(evt.name, evt.type));
            break;
     }
     return new metaST(true, effect, st);
  }
  return  new metaST(false, st);
} 

function applyAddCompareGroup(evt, st) {
  var effect;
  if (getMainTabState() == "Products" && !compareArrays(getCatalog(), [])) {
    switch (evt.name) {
        case "add_compare":
            evt.name = "IDY_compare_" + evt.args[0];
            effect = makeStep(getApp().Invoke(evt.name, evt.type));
            break ;
    }
    return new metaST(true, effect, st);
  }
  return  new metaST(false, st) ;
} 

function applyCompareGroup(evt, st) {
  var effect;
  if (getMainTabState() == "Products" && getProductsState() == "showFilter") {
    switch (evt.name) 
    {
      case "toCompareView":
        if (getCatalogState() == "browse")  {
            var compare_cart = getCompare();
            evt.name = "IDY_compare_button";
            // evt.name += "_showingThumbnails" ;
            // updateDelegateId(evt.name);
            if (compareArrays(compare_cart, [])) {
                effect = function() {
                    getApp().Invoke(evt.name, evt.type);
                    delay(1000);
                    getApp().Invoke("OK", "click");
                    delay(1000);
                };
            }
            else {
                effect = makeStep(getApp().Invoke(evt.name, evt.type));
            }
        }
        else return  new metaST(false, st);
        break;  
      case "backCompareView":
        if (getCatalogState() == "compare") {
            var compare_cart = getCompare();
            evt.name = "IDY_compare_button";
            // evt.name += "_showingComparison" ;
            // updateDelegateId(evt.name);
            effect = makeStep(getApp().Invoke(evt.name, evt.type));
        }
        else return  new metaST(false, st) ;
        break;
    }
    return new metaST(true, effect, st);
  }
  return  new metaST(false, st);
}

function applyChangeViewGroup(evt, st) {
    var effect;
    if (getMainTabState() == "Products") {
        if (getProductsState() == "showFilter") {
            evt.name = "IDY_CatTitleBtns_label_viewCart" ;
            effect = makeStep(getApp().Invoke(evt.name, evt.type));    
        }
        else {
            evt.name = "IDY_CatTitleBtns_label_findPhones" ;
            effect = makeStep(getApp().Invoke(evt.name, evt.type));
        }
        return new metaST(true, effect, st);
    }
    return  new metaST(false, st);    
}

function applyRemoveGroup(evt, st){
    var effect;
    var ename;
    if ( getMainTabState() == "Products" && 
         (evt.name == "remove_cart" && getProductsState() == "showCart"   && !compareArrays(getCart(), [])) ||
         (evt.name == "remove_compare" && getProductsState() == "showFilter" && !compareArrays(getCompare(), []))
       )
    {
      if (evt.name == "remove_cart") evt.name = "IDY_remove_shoppingCart_" + evt.args[0];
      else evt.name = "IDY_remove_compareCart_" + evt.args[0];
      // only try it if the target exists!
      if (!getApp().TestObject(evt.name)) return  new metaST(false, st) ;
      effect = makeStep(getApp().Invoke(evt.name, evt.type)); 
      return new metaST(true, effect, st);	
    }
    else return  new metaST(false, st);
}
 

function applyDetailsGroup(evt, st){
  var effect;
  var ename;
  if (getMainTabState() == "Products" && getCatalogState() == "details") {
    switch (evt.name)  {
      case "add_compare_this":
        evt.name = "IDY_compare_this";
        break;
      case "add_cart_this":
        evt.name = "IDY_purchase_this";
        break;
      case "back_thumb":
        break;
//uncomment this if corresponding event will be added in the event list again	
//       case "details_tabs":
// 	effect = makeStep(getApp().Invoke("TabNavigator0", "change", evt.args[0]));
// 	break;
    }
    effect = makeStep(getApp().Invoke(evt.name, evt.type)); 
    return new metaST(true, effect, st);	
  }
  else return  new metaST(false, st);
}

function applyChangeQuantity(evt, st) {
  var effect;
  if ( getMainTabState() == "Products" && 
       evt.name == "quantity_change" && 
       getProductsState() == "showCart" && 
       !compareArrays(getCart(), [])
     ) 
    {
    evt.name = "IDY_quantity_" + evt.args[0];
    effect = makeStep(getApp().Invoke(evt.name, "type", randomR(101).toString())); 
    return new metaST(true, effect, st);
  }
  return  new metaST(false, st);
}

function makeTransition(evt, st) 
{
    var mstate;
    switch (findEventCategoryName(evt)) 
    {
        case "maintab":
            mstate = applyBBarItemClick(evt, st);
            break;
        case "filter":
            mstate = applyFilterGroup(evt, st);
            break;
        case "phoneclick":
            mstate = applyClickPhoneGroup(evt, st);
            break;
	case "addcart":
	    mstate = applyAddCartGroup(evt, st);
	    break;
	case "addcompare":
	    mstate = applyAddCompareGroup(evt, st);
	    break;
	case "compare":
	    mstate = applyCompareGroup(evt, st);
	    break;
	case "changeview":
	    mstate = applyChangeViewGroup(evt, st);
	    break;    
	case "remove":    
	    mstate = applyRemoveGroup(evt, st);
	    break;
	case "details":
	    mstate = applyDetailsGroup(evt, st);
	    break;
	case "cart_quantity":
	    mstate = applyChangeQuantity(evt, st);
	    break;
    }
    return mstate;
}

function genRandomEvent() {
    var evt = fs_events[randomR(fs_events.length)];
    evt_clone = clone(evt);
    switch (evt_clone.name) 
    {
        case "phone_click":
            var phone_list = getCatalog();
	    evt_clone.args = [];
            evt_clone.args.push(phone_list[randomR(phone_list.length)]);
            break;
        case "phone_details":
            var phone_list = getCatalog();
	    evt_clone.args = [];
            evt_clone.args.push(phone_list[randomR(phone_list.length)]);
            break;
	case "add_cart":
            var phone_list = getCatalog();
	    evt_clone.args = [];
            evt_clone.args.push(phone_list[randomR(phone_list.length)]);
            break;    
	case "add_compare":
            var phone_list = getCatalog();
	    evt_clone.args = [];
            evt_clone.args.push(phone_list[randomR(phone_list.length)]);
            break;
	case "remove_compare":
	    var phone_list = getCompare();
	    evt_clone.args = [];
            evt_clone.args.push(phone_list[randomR(phone_list.length)]);
	    break;
	case "remove_cart":  
	    var phone_list = getCart();
	    evt_clone.args = [];
            evt_clone.args.push(phone_list[randomR(phone_list.length)]);
	    break;
	case "quantity_change":
	    var phone_list = getCart();
	    evt_clone.args = [];
	    evt_clone.args.push(phone_list[randomR(phone_list.length)]);
	    break;
        default:
            evt_clone.args = evt_clone.args.map(function(x) {return parseInt(x, 0);});
            evt_clone.args = evt_clone.args.map(function(x) {return randomR(x);});
    }
    //console.log("name=" + evt_clone.name + "; type=" + evt_clone.type + "; args="+evt_clone.args);
    return evt_clone;
}


function runAutomataNTimes(n, reqN, st){
    //console.log(n);
    if (n > 0) {
        var evt;
        evt = genRandomEvent();
	    //console.log("name=" + evt.name + "; type=" + evt.type + "; args=" + evt.args);
        
        var mstate;
        mstate = makeTransition(evt, st);
        if (mstate.flag) 
        {
            mstate.effect();
            console.log("[" + (reqN-n) + "] " + evt.name + "; type=" + evt.type + "; args=" + evt.args);
            //console.log("** st.hasEverConstructedPhoneDetail = " + st.hasEverConstructedPhoneDetail) ;
            return runAutomataNTimes(n - 1, reqN, mstate.state);
        } 
        else 
        {
            return runAutomataNTimes(n, reqN, mstate.state);
        }
    }
    else 
    {
      alert("Test is done!");
    }
}

function runTests(n) {
    var initST = new stateFS("0", "0", false, false, "0");
    runAutomataNTimes(n,n,initST);
}