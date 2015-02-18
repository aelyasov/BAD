/*
 * These functions are clasess representing events, states, etc.
 */

function eventFS(name, type) {
    this.name = name;
    this.type = type;
    var args_ = [];
    for (var i = 2; i < arguments.length; i++) 
    {
        args_.push(arguments[i]);
    }
    this.args = args_;
    this.toString = function() 
      {
	return ("name=" + evt_clone.name + "; type=" + evt_clone.type + "; args="+evt_clone.args);
      }
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
    if (this.flag) 
    {
        this.effect = arguments[1];
        this.state = arguments[2];
    } 
    else 
    {
        this.effect = null;
        this.state = arguments[1];
    }
}

var isLoadCompleted = false;

var logId;

function loadCompleted() {
  isLoadCompleted = true;
}

var isContractViolated = false;

function contractViolationHandler() {
  isContractViolated = true;
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
    for (var cname in fs_event_cats) 
    {
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
    for (var i in a1) 
    {
        if (a1[i] !== a2[i]) return false;    
    }
    return true;
}

/*
 * These are constants representing existed events in the application and event categories
 */
const fs_events = new Array( new eventFS("phone_details", "click")
			   , new eventFS("add_compare_this", "click")
			   , new eventFS("add_cart_this", "click")
			   , new eventFS("back_thumb", "click")
    			   , new eventFS("series", "change", "5")
			   , new eventFS("priceSlider", "change", "3", "3")
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

function getApp() {
    return document["AutomationLoader"];
}

function getId(prefix) {
  return getApp().getAutomationId(prefix);
}

function getCatalog() {
    return getApp().getCatalogContents();
}

function getCart() {
    return getApp().getCartContents();
}

function getCompare() {
    return getApp().getCompareContents();
}

function getMainTabState() {
    return getApp().getMainTabState();
}

function getCatalogState() {
    return getApp().getCatalogState();
}

function getProductsState() {
    return getApp().getProductsState();
}

function getDetailsState() {
    return getApp().getDetailsState();
}

function getTribandState()
{
  return getApp().getTribandState();
}

function getVideoState()
{
  return getApp().getVideoState();
}

function getCameraState()
{
  return getApp().getCameraState();
}

function getDelegateId(name) 
{
    return getApp().getDelegateIdByObjectName(name);
}

function getObjectName(id) {
    return getApp().getObjectNameByDelegateId(id);
}

function isInvoke(id){
  return getApp().TestObject(id);
}

function EInvoke() {
    try {
        return getApp().Invoke.apply(getApp(), arguments)
        } catch (err) {alert("Exception!")}
}

function inspect() {
  return getApp().Inspect();
}

function updateDelegateId(name) 
{
  return getApp().changeDelegateIdByName(name);
}

function getLogFromDebugOutput()
{
  return getApp().getLogFromDebugOutput();
}

/*
 * functions generating execution steps in response on the events
 */
 
function makeStep(step) 
{
    var time;
    if (arguments.length == 2) 
    {
        time = arguments[1];
    }
    else 
    {
        time = 3000; 
    }
    return function() { step; delay(time); };   
} 
 
function applyBBarItemClick(evt, st) {
    var effect = makeStep(getApp().Invoke("ButtonBar0", "itemclick", evt.args[0]));
    return new metaST(true, effect, st);
}

function applyFilterGroup(evt, st) {
    var effect;
    if (getMainTabState() == "Products" && getProductsState() == "showFilter")
    {
	//this huge exhaustion search of cases can be slightly improved by carrying out of switch effect assignment and update call
        switch (evt.name) 
        {
            case "series":
                effect = makeStep(getApp().Invoke("series", "change", evt.args[0]));
                break;
            case "priceSlider":
		ename = "priceSlider";
		updateDelegateId(ename);
                effect = function() {
                    getApp().Invoke(ename, "change", "0", 300*evt.args[0]);
		    delay(3000);
                    getApp().Invoke(ename, "change", "1", 500+300*evt.args[1]);
		    delay(3000);
                };
                break;
            case "Tri-Band_check":
		if (!getTribandState()) 
		{
		  ename = "triband_false"
		  updateDelegateId(ename);
		  effect = makeStep(getApp().Invoke(ename, "click"));
		}
		else
		{
		  return new metaST(false, st);
		}
                break;
	    case "Tri-Band_uncheck":
		if (getTribandState())
		{
		  ename = "triband_true"
		  updateDelegateId(ename);
		  effect = makeStep(getApp().Invoke(ename, "click"));
		}
		else
		{
		  return new metaST(false, st);
		}
                break;
	    case "Camera_check":
		if (!getCameraState()) 
		{
		  ename = "camera_false"
		  updateDelegateId(ename);
		  effect = makeStep(getApp().Invoke(ename, "click"));
		}
		else
		{
		  return new metaST(false, st);
		}
                break;
	    case "Camera_uncheck":
		if (getCameraState())
		{
		  ename = "camera_true"
		  updateDelegateId(ename);
		  effect = makeStep(getApp().Invoke(ename, "click"));
		}
		else
		{
		  return new metaST(false, st);
		}
                break;	
	    case "Video_check":
		if (!getVideoState()) 
		{
		  ename = "video_false"
		  updateDelegateId(ename);
		  effect = makeStep(getApp().Invoke(ename, "click"));
		}
		else
		{
		  return new metaST(false, st);
		}
                break;
	    case "Video_uncheck":
		if (getVideoState())
		{
		  ename = "video_true"
		  updateDelegateId(ename);
		  effect = makeStep(getApp().Invoke(ename, "click"));
		}
		else
		{
		  return new metaST(false, st);
		}
                break;
        }
        return new metaST(true, effect, st);
    } 
    else 
    {
        return new metaST(false, st);
    }
}

function applyClickPhoneGroup(evt, st) {
     var effect;
     if ( getMainTabState() == "Products" &&
          !compareArrays(getCatalog(), [])
	)
     {
         switch (evt.name) 
         {   
             case "phone_click":
		 var ename = "img_" + evt.args[0];
                 break;
              case "phone_details": 
 		 var ename = "details_" + evt.args[0];
                 break;   
         }
         updateDelegateId(ename);
         effect = makeStep(getApp().Invoke(ename, "click"));
         return new metaST(true, effect, st);
    }
    else
    {
        return new metaST(false, st);
    }
}


function applyAddCartGroup(evt, st) {
  var effect;
  if (getMainTabState() == "Products" && !compareArrays(getCatalog(), []))
  {
    switch (evt.name)
    {
      case "add_cart":
	var ename = "purchase_" + evt.args[0];
	break;
    }
    updateDelegateId(ename);
    effect = makeStep(getApp().Invoke(ename, "click"));
    return new metaST(true, effect, st);
  }
  else
  {
    return  new metaST(false, st);
  }
} 

function applyAddCompareGroup(evt, st) {
  var effect;
  if (getMainTabState() == "Products" && !compareArrays(getCatalog(), []))
  {
    switch (evt.name)
    {
      case "add_compare":
	var ename = "compare_" + evt.args[0];
	break;
    }
    updateDelegateId(ename);
    effect = makeStep(getApp().Invoke(getDelegateId(ename), "click"));
    return new metaST(true, effect, st);
  }
  else
  {
    return  new metaST(false, st);
  }
} 

function applyCompareGroup(evt, st) {
  var effect;
  if (getMainTabState() == "Products" && getProductsState() == "showFilter")
  {
    switch (evt.name)
    {
      case "toCompareView":
	  if (getCatalogState() == "browse") 
	  {
	    var compare_cart = getCompare();
	    var ename = "compare_button_showingThumbnails";
	    updateDelegateId(ename);
	    if (compareArrays(compare_cart, []))
	    {
		effect = function() 
		{
		    getApp().Invoke(ename, "click");
		    delay(3000);
		    getApp().Invoke("OK", "click");
		    delay(3000);
		};
	    }
	    else
	    {
	      effect = makeStep(getApp().Invoke(ename, "click"));
	    }
	 }
	 else
	 {
	    return  new metaST(false, st);
	 }
	 break;
      case "backCompareView":
	  if (getCatalogState() == "compare")
	  {
	      var compare_cart = getCompare();
	      var ename = "compare_button_showingComparison";
	      updateDelegateId(ename);
	      effect = makeStep(getApp().Invoke(ename, "click"));
	  }
	  else
	  {
	      return  new metaST(false, st);
	  }
	  break;
    }
    return new metaST(true, effect, st);
  }
  else
  {
    return  new metaST(false, st);
  }
}

function applyChangeViewGroup(evt, st) 
{
    var effect;
    if (getMainTabState() == "Products")
    {
        if (getProductsState() == "showFilter")
        {
            effect = makeStep(getApp().Invoke("view_cart", "click"));    
        }
        else
        {
            effect = makeStep(getApp().Invoke("find_phones", "click"));
        }
        return new metaST(true, effect, st);
    }
    else
    {
        return  new metaST(false, st);    
    }
}

function applyRemoveGroup(evt, st)
{
    var effect;
    var ename;
    if ( getMainTabState() == "Products" && 
         (evt.name == "remove_cart" && getProductsState() == "showCart"   && !compareArrays(getCart(), [])) ||
         (evt.name == "remove_compare" && getProductsState() == "showFilter" && !compareArrays(getCompare(), []))
       )
    {
      if (evt.name == "remove_cart")
      {
	ename = "remove_shoppingCart_" + evt.args[0];
      }
      else
      {
	ename = "remove_compareCart_" + evt.args[0]; 
      }
      updateDelegateId(ename);
      effect = makeStep(getApp().Invoke(ename, "click")); 
      return new metaST(true, effect, st);	
    }
    else
    {
	return  new metaST(false, st);
    }
}
 

function applyDetailsGroup(evt, st)
{
  var effect;
  var ename;
  if (getMainTabState() == "Products" && getCatalogState() == "details") 
  {
    switch (evt.name) 
    {
      case "add_compare_this":
	ename = "compare_this";
	break;
      case "add_cart_this":
	ename = "purchase_this" 
	break;
      case "back_thumb":
	ename = "back_thumb";
	break;
//uncomment this if corresponding event will be added in the event list again	
//       case "details_tabs":
// 	effect = makeStep(getApp().Invoke("TabNavigator0", "change", evt.args[0]));
// 	break;
    }
    updateDelegateId(ename);
    effect = makeStep(getApp().Invoke(ename, "click")); 
    return new metaST(true, effect, st);	
  }
  else
  {
    return  new metaST(false, st);
  }
}

function applyChangeQuantity(evt, st) 
{
  var effect;
  if ( getMainTabState() == "Products" && 
       evt.name == "quantity_change" && 
       getProductsState() == "showCart" && 
       !compareArrays(getCart(), [])
     ) 
    {
	var ename = "quantity_" + evt.args[0];
	updateDelegateId(ename);
	effect = makeStep(getApp().Invoke(ename, "type", randomR(101).toString())); 
	return new metaST(true, effect, st);
    }
    else
    {
	return  new metaST(false, st);
    }
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

function genRundomEvent() {
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
    return evt_clone;
}


function runAutomataNTimes(n, st)
{
    //console.log(n);
    if (n > 0 && !isContractViolated) {
        var evt;
        evt = genRundomEvent();
	//console.log(evt);
        var mstate;
        mstate = makeTransition(evt, st);
        if (mstate.flag) 
        {
	    //console.log(evt.toString());
            mstate.effect();
            return runAutomataNTimes(n - 1, mstate.state);
        } 
        else 
        {
            return runAutomataNTimes(n, mstate.state);
        }
    }
    else 
    {
      if (isContractViolated) {
	alert("Test has been unexpectadly abrupted!");
      }
      else {
	alert("Test is done!");
      }
    }
}

function runTestUntilCrash(st)
{
  while (!isContractViolated) {
    var evt;
        evt = genRundomEvent();
	//console.log(evt);
        var mstate;
        mstate = makeTransition(evt, st);
        if (mstate.flag) 
        {
	    //console.log(evt.toString());
            mstate.effect();
            return runTestUntilCrash(mstate.state);
        } 
        else 
        {
            return runTestUntilCrash(mstate.state);
        }
  }
  //window.alert("a contract has been violated!!!");
  window.opener.testN--;
  //window.opener.console.log(window.opener.testN);
  if (window.opener.testN > 0) {
     window.location.reload();
  } else {
    loadDownloadify(getLogsFromLocalStorage());
  }
}

function writeLogToLocalStore(log) {
  localStorage.setItem(logId, log);
}

function getLogsFromLocalStorage()
{
  var res = "";
  for (x in localStorage) {
    res = res + localStorage[x] + "\n" ;
}  
  return res;
}

function test(n) 
{
    var initST = new stateFS("0", "0", false, false, "0");
    runAutomataNTimes(n, initST);
}

function testUntilCrash() {
    var initST = new stateFS("0", "0", false, false, "0");
    runTestUntilCrash(initST);
}
  
// Some experiment section. The code below can be safely removed.

function foo() {
  return bar(arguments);
}

function bar(x, y) {
  return (x + y);
}