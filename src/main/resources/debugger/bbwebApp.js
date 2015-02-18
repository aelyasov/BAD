/* ==================== bbwebApp ==================== */
/*!
 * bbwebApp v1.0
 * Andreas Nikas
 * A.Nikas@students.uu.nl
 */
/* ===================== = = = = ==================== */

/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
 /*!
 * jQuery UI 1.10.1
 *
 * Copyright (c) 2009 http://jqueryui.com/about
 * Dual licensed under the MIT and GPL licenses.
 *
 * http://docs.jquery.com/UI
 */

/** bbwebApp object. **/
var bbwebApp = {
	appName: 'bbwebApp',
	version: '1.0',
	stopE: false,

	/** Detect browser **/
	detectBrowserLang: function(){
		try {
			return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2);
		}catch(e){
			return undefined;
		}
	},

	/** Alert messages **/
	alertMsg: {
		en : {
			'needCurrentJQuery':'You need jQuery 1.9 or newer to run that script.'
		}
	},

	/**boot function check for jquery version. In order to use the library, you need  > jquery 1.9  **/
	boot: function(){
		// Check jQuery
		 if(window.jQuery){
			var jQueryVersion = jQuery.fn.jquery;
			var jQueryVersionArray = jQueryVersion.split('.');
			// Check jQuery version
			if(jQueryVersionArray[0] + jQueryVersionArray[1] >= 13){ // jQuery v1.9+
// 			if(jQueryVersionArray[0]=='1' && jQueryVersionArray[1]>='3'){ // jQuery v1.9+
				return true;
			} else {
				window.alert(bbwebApp.alertMsg.needCurrentJQuery);
				return false;
			};
		} else {
			window.alert(bbwebApp.alertMsg.needCurrentJQuery);
			return false;
 		};
	},

	/** it's used in parsing and it checks if there is an event **/
	checkIfEvent: function (xml){

		var getSize = $(xml).find("E").size();
		if(getSize>0){
			return true;
		}
		return false;

	},

	/** it's used in parsing and it checks if there is an object **/
	checkIfObject: function (xml){
		var getSize = $(xml).find("O").size();

		if(getSize>0){
			return true;
		}
		return false;
	},

	/** it's used in parsing and it checks if there is a field **/
	checkIfField: function (xml){
		var getSize = $(xml).find("fd").size();
		if(getSize>0){
			return true;
		}
		return false;
	},

	/** it's used in parsing and it stores an event **/
	takeEvents: function(xml){

		var events="{";
		$(xml).find("E").each(function(){
			event = $(this);
			event_name = event.find("O fd:nth-child(2) V").attr("v");
			unq_event_name = event_name.substring(1, event_name.length - 1);
			if(bbwebApp.checkIfObject(event)){
				t = event.attr('t');
				events = events + '"' + t + "_" + unq_event_name + '"' + ":" + bbwebApp.takeObjects(event) + ",";
			}
		});
		events = events.substring(0, events.length - 1);
		events = events + "}";
		return events;
	},

	/** used in parsing and it stores an object **/
	takeObjects: function(xml){

		var objects="{";
		var checkifWasIn = 1;

		$(xml).find("O").siblings().each(function(){
			object = $(this);
			if(bbwebApp.checkIfField(object)){
				ty = object.attr('ty');
				objects = objects + '"' + ty + '"' + ":" + bbwebApp.takeFields(object) + "," ;
				checkifWasIn = 0;
			}
		});

		if(checkifWasIn == 1){
			$(xml).find("O").each(function(){
				object = $(this);
				if(bbwebApp.checkIfField(object)){
					ty = object.attr('ty');
					objects = objects + '"' + ty + '"' + ":" + bbwebApp.takeFields(object) + "," ;
				}
			});
		}
		objects = objects.substring(0, objects.length - 1);
		objects = objects + "}";
		return objects;

	},

	/** used in parsing and it stores a field **/
	takeFields: function(xml){

		var fields="{";
		var checkifWasIn = 1;
		var n;
		var trig=0;

		$(xml).find("fd").siblings().each(function(){
			field = $(this);
			if($(this).children().children().length==0){
				var values = bbwebApp.takeValues(field);
				n = field.attr('n');

				if(n=='elem' && trig==0){
					trig = 1;
					fields = fields + n + ": [" + values+ "," ;
				}else if(n=='elem' && trig==1){
					fields = fields + values + "," ;
				}else{
					fields = fields + n + ":" + values+ "," ;
				}

			}else{
				n = field.attr('n');
				fields = fields + n + ":" + bbwebApp.takeFields(field)+ "," ;
				return false;
			}
			checkifWasIn = 0;
		});


		if(checkifWasIn==1){
			$(xml).find("fd").each(function(){
				field = $(this);
				if($(this).children().children().length==0){
					var values = bbwebApp.takeValues(field);
					var n = field.attr('n');
					fields = fields + n + ":" + values + ",";
				}else{
					n = field.attr('n');
					fields = fields + n + ":" + bbwebApp.takeFields(field)+ "," ;
				}

			});

		}

		fields = fields.substring(0, fields.length - 1);
		if(trig==1){
			fields = fields + "]}";
		}else{
			fields = fields + "}";
		}
		return fields;
	},

	/** used in parsing and it stores values **/
	takeValues: function(xml){

		var values ;
		$(xml).find("V").each(function(){

			value = $(this);
			var v = value.attr('v');
			var ty = value.attr('ty');
			values = v;
			return false;// not sure if i need that YET!
		})

		return values;

	},

	/** start parsing the xml **/
	parseXml: function (xml){

		if(bbwebApp.checkIfEvent(xml)){
			eventz = bbwebApp.takeEvents(xml);
			//console.log(eval("eventz"));
			eval('var obj =' + eventz);
		}else{
			//console.log('Could not load xml file. You need a webserver to load xml files.');
			bbwebApp.printResults('Could not load xml file. You need a webserver to load xml files.',"error");
			return null;
		}

		// var events = obj;
		// return events;
		return obj;
	},

	/** show the parsed results in the library window **/
	showResults: function (obj){
		var type,targetID,elem;

		for (var k in obj) {
			v = obj[k];
			if (k!="AppAbstractState"){
				if(typeof v =="object"){
					if(k=="args"){
						elem = bbwebApp.showResults(v);
					}else if(k=="elem"){
						elem = "[\"" + v.join("\",\"") + "\"]";
						return elem;
					} else {
						bbwebApp.showResults(v);
					}
				}else{
					if(k=="type"){
						type = v;
					}else if(k=="targetID"){
						targetID = v;
					}
				}
			}
		}
		if(type && targetID){
			if(elem==undefined){
				elem='';
			}else{
				elem=',' + elem;
			}
			$('.bbdebugger').append('<div class="bbevent"><input type="checkbox" class="bbbreakpoints" name="breakpoints[]"/><input type="checkbox" class="bbinvokes" name="invokes[]"/> <span>document["AutomationLoader"].Invoke("'+targetID+'", '+'"'+type+'"' + elem + ')</span></div>');
		}
	},

	/** prints the error results on the result window of the library **/
	errorResults : function(errorMsg,url,lineNumber){
		$('.bbwebApp .bbrcontainer').show("slow");
		$('.bbwebApp .bbrcontainer').append('<p class="error">'+errorMsg + " @ " + url + " :: " + lineNumber+'</p>');
	},

	/** prints the output results on the result window of the library  **/
	printResults : function(res,daclass,printDate){
		var data = function(){
			if (printDate) {
				return "";
			} else {
				return new Date().toLocaleTimeString();
			}
		}
		//$('.bbwebApp .bbrcont, keepIdsainer').show("slow");
		$('.bbwebApp .bbrcontainer').show("slow");
		$('.bbwebApp .bbrcontainer').append('<p class="'+daclass+'">'+ data()+ ':: ' + res +'</p>');
		if ($('.bbautoscroll').is(":checked")) {
			$('.bbwebApp .bbrcontainer').scrollTop($('.bbwebApp .bbrcontainer')[0].scrollHeight);
		}
	 },

	// initial event trace provided for debugging
	Cx : Array(),

	// The array of element indices that should be kept in the splitting
	keepIds : Array(),

	// The sequence of event indices that defines the error.
	errorTrace : Array(),

	// Apply delta debugging combined with reduction
	isRedExec : Boolean,

	// Does reduced sequence reproduce error?
	isRedErr : Boolean,

	initException : String,

	ddStartDate: Date(),

	ddEndDate: Date(),

	/** where t,tt,ttt is a boolean threashold (ttt==false is the boolean that stops the algorithm and returns the result) , recursive way **/
	ddMin : function(delayMs, enumCx, n, t, tt, ttt, i){
		if(ttt){
			bbwebApp.ddminHelper(delayMs, enumCx, n, t, tt, ttt, i);
		}else{
			//console.log("Result : " + enumCx);
			//bbwebApp.printResults("Result : "+ enumCx, "result");
			/**
			 * This code would be convenient to use but enabling it leads to
			 * Uncaught RangeError: Maximum call stack size exceeded error in JS.
			 * Investigate this problem further. As a workaaround, if ddMinR was not able
			 * to reduced the sequence we manually run ddMin in ths same web session
			 */
 			if (!bbwebApp.isRedErr && (bbwebApp.Cx.length == enumCx.length)) {
 				bbwebApp.printResults("ddMinR did not succeed in minimizing the failure", "warning");
 				bbwebApp.printResults("Minimize the failing sequence with ddMin", "warning");
				bbwebApp.isRedErr = true;
 				bbwebApp.ddMin(delayMs, enumCx, 2, false, false, true, 0);
 			} else {
				bbwebApp.ddEndDate = new Date();
 				bbwebApp.printResults("STOP Minimization", "result");
				bbwebApp.printResults("RESULT: "+ enumCx, "result");
				bbwebApp.printResults("---------------------------");
				bbwebApp.printResults("         Statistics        ");
				bbwebApp.printResults("---------------------------");
				bbwebApp.printResults("#executed events: " + bbwebApp.numExecutedEvents);
				bbwebApp.printResults("#required tests:" + bbwebApp.ddStepN);
				bbwebApp.printResults("#actual tests:" + bbwebApp.ddRealStepN);
				bbwebApp.printResults("execution time: " + (Math.abs(bbwebApp.ddEndDate - bbwebApp.ddStartDate) / 1000) + "sec.");
				bbwebApp.printResults("---------------------------");
 			}
		}
	},

	/** public arrays to store the sequence and the results**/
	memoArray : Array(),
	memoArrayResult : Array(),

	ddStepN : new Number(0),

	ddRealStepN : new Number(0),

	numExecutedEvents : new Number(0),

	 /* ddminHelper is function with continuation and recursive way which is used by ddMin
	  * It's a straightforward function ... Nope, it's not:(
	  *  - delayMS:: delay which is used between the execution of a sequence of events,
	  *  - Cx:: contains all the events , named from the paper
	  *  - n:: an integer which is used to check if we have to increase the  granularity, reduce to subset/complement
	  *  - i:: counter
	  *  - t:: boolean threashhold for the first lvl of continuation
	  *  - tt::second lvl of continuation
	  *  - ttt:: boolean threashold for the last steop
	  * The ddminHelper function works in a recursive and continuation way which means that code is repeated a lot of times :(
	  */
	ddminHelper : function(delayMs, enumCx, n, t, tt, ttt, i){
		//console.log("bbwebApp.keepIds: " +  bbwebApp.keepIds);
		var si;
		var d;
		var subsets;
		//var enumCx = function(a,b){while(a--){b[a]=a}return b}(Cx.length,[]);
		bbwebApp.printResults("number of executed events: #" + bbwebApp.numExecutedEvents);
		if((n == 1) ||
		  (bbwebApp.isRedErr && enumCx.length >= n) ||
		  (bbwebApp.isRedExec) ||
		  (!bbwebApp.isRedErr && (enumCx.length - bbwebApp.keepIds.length >= n))){
			if (bbwebApp.isRedErr || n == 1) {
				subsets = bbwebApp.ddSplitIndices(enumCx, n);
				si = subsets[i]; // keep the current subset index
				d = bbwebApp.takeElements(bbwebApp.Cx, si);  // keep the current subset
			} else {
				var complToKeepIds = bbwebApp.arrayIndicesSubtract(enumCx, bbwebApp.keepIds);
				subsets = bbwebApp.ddSplitIndices(complToKeepIds, n);
				var subsetsN = []
				for (var sI = 0; sI < subsets.length; sI++) {
					subsetsN.push([].concat(subsets[sI], bbwebApp.keepIds).sort(function(a,b){return a-b}));
				}
				//subsets = bbwebApp.ddGreadySplit2Subsets(Cx,n);//bbwebApp.ddSplit2Subsets(Cx,n);
				si = subsetsN[i]; // keep the current subset index
				d = bbwebApp.takeElements(bbwebApp.Cx, si);  // keep the current subset
			}


			/** it tests a subset and returns the result **/
			/** To achieve a delay between the events i had to make it also in a continuation and recursive way **/
			/** It keeps the parameters of ddminHelper and some more which are: **/
			/** eventList:: subset of Cx1 **/
			/** ddException:: the result of an execution (string) **/
			/** it feeds a callback function with the result ("?","x","√") **/
			function ddTests (enumCx1, n1, t1, tt1, ttt1, i1, delayMs, eventList, callback){
				var t=true;
				var i=0;
				var e;
				var theReturn ='√';
				var errId = 0;

				/** the function checker checks if it has to continue executing events**/
				function checker(theReturn, eventList, i, t){
					if(t){
						loopa(theReturn, eventList, i, t);
					}else{
						//bbwebApp.ddMemorizer(eventList,theReturn); //memorize the Cx and result
						//console.log(theReturn);
						bbwebApp.printResults(theReturn);
						if (n != 1) {
							bbwebApp.isRedExec = false;
						}
						if (n != 1 && theReturn == "x") {
							bbwebApp.isRedErr = true;
						}
					callback(delayMs, enumCx1, n1, t1, tt1, ttt1, i1, theReturn);
					}
				}

				/** execute each event and keep the result. If the result is "x" or "?" end it with t=false; **/
				function loopa(theReturn, eventList, i, t){
					if(i < eventList.length){
						e = eventList[i];

						function innerLoopa(e, i, callback){
							var isExcepErr;
							try{

								document["AutomationLoader"].SetUException("");
								//console.log(e);
								bbwebApp.printResults(e);
								eval(e);
								if (bbwebApp.errorTrace[errId] == e) {
									bbwebApp.printResults("<< contributes to the error: " + e);
									errId++;
									if (bbwebApp.errorTrace.length == errId) {
										throw new Error("Whoops!");
									}
								}
								// var isExcep = document["AutomationLoader"].GetUException();
								isExcepErr = "";
							}catch(err){
								if (n == 1) {
									bbwebApp.initException = err.message;
									//console.log("err: " + err);
								}
								isExcepErr = err.message;
							}

							if(isExcepErr != "" && isExcepErr == bbwebApp.initException){
								theReturn = 'x';
								//console.log("isExcepErr: " + isExcepErr);
								bbwebApp.printResults("isExcepErr: " + isExcepErr,"error");
								bbwebApp.ddMemorizer(eventList.slice(0, i), '√')
								bbwebApp.numExecutedEvents = bbwebApp.numExecutedEvents + (i + 1);
								checker(theReturn, eventList, i, false);
							}else if (isExcepErr != "" && isExcepErr != bbwebApp.initException){
								theReturn = '?';
								//console.log("isExcepErr: " + isExcepErr);
								bbwebApp.printResults("isExcepErr: " + isExcepErr,"warning");
								bbwebApp.ddMemorizer(eventList.slice(0, i), '√');
								bbwebApp.ddMemorizer(eventList.slice(0, i+1), '?');
								bbwebApp.numExecutedEvents = bbwebApp.numExecutedEvents + (i + 1);
								checker(theReturn, eventList, i, false);
							}else{
								//bbwebApp.ddMemorizer(eventList.slice(0, i+1), theReturn);
								i++;
								callback(i, theReturn);
							}
						}

							innerLoopa(e, i, function(counter,r){
								setTimeout(function(){
									checker(r, eventList, counter, true);
								},delayMs);
							});


						}else{
							bbwebApp.ddMemorizer(eventList.slice(0, i), '√');
							bbwebApp.numExecutedEvents = bbwebApp.numExecutedEvents + (i + 1);
							checker(theReturn,eventList,i,false);
						}

				}

				/** if it is the first execution, it will delay delayMs seconds before calling the checker function **/

				//if(i==0){
				//	setTimeout(function(){return checker(isExcepErr,isExcep,theReturn,eventList,i,t);},delayMs)
				//	}
				// else{
					return checker(theReturn,eventList,i,t);
				//}
			}

			function daCallback2(delayMs, enumCx, n, t, tt, ttt, i, test2){
				if(test2=="x" && !tt){
					n = Math.max(n-1,2);
					enumCx = difIds;
					i = 0;
					t = false;
					tt = false;
					bbwebApp.ddMin(delayMs, enumCx, n, t, tt, ttt, i);
				} else if (i < subsets.length && !tt){
						i++;
						tt = false;
						if(i == subsets.length){
							i = 0;
							tt = true;
						}
						t = true;
						bbwebApp.ddMin(delayMs, enumCx, n, t, tt, ttt, i);
					} else if(n < enumCx.length && tt){
							n = Math.min(enumCx.length,2*n);
							i = 0;
							t = false;
							tt = false;
							bbwebApp.ddMin(delayMs, enumCx, n, t, tt, ttt, i);
						} else{
							ttt = false;
							bbwebApp.ddMin(delayMs, enumCx, n, false, false, i);
						}
			}

			/** callback function which does the rest of the algorithm **/
			function daCallback(delayMs, enumCx, n, t, tt, ttt, i, test1){
				if(test1=="x" && !t){
					enumCx = si;
					i=0;
					n=2;
					t=false;
					tt=false;
					bbwebApp.ddMin(delayMs, enumCx, n, t, tt, ttt, i);
				}else if(!t && i<subsets.length){
					i++;
					if(i==subsets.length){
						i=0;
						t = true;
						tt = false;
					}
					bbwebApp.ddMin(delayMs, enumCx, n, t, tt, ttt, i);
				}else{

 					if(si && !tt){
						difIds = bbwebApp.arrayIndicesSubtract(enumCx, si);
						difEvs = bbwebApp.takeElements(bbwebApp.Cx, difIds);

						//console.log("difEvs: " + difEvs);

						bbwebApp.ddStepN++;
						//console.log("dd test step: #" + bbwebApp.ddStepN + " | execute test2 | " + "n = " + n + " | i = " + i);
						bbwebApp.printResults("dd test step: #" + bbwebApp.ddStepN + " | execute test2 | " + "n = " + n + " | i = " + i);
						bbwebApp.printResults("event indices: " + difIds);
						//console.log("event indices: " + difIds);

						var checkiftested = bbwebApp.ddexeChecker(difEvs);
						if(checkiftested[0]){
							bbwebApp.ddRealStepN++;
							//console.log("dd actual test step: #" + bbwebApp.ddRealStepN);
							bbwebApp.printResults("dd actual test step: #" + bbwebApp.ddRealStepN);
							bbwebApp.bbrefreshSWF();
							setTimeout(function(){ddTests(enumCx, n, t, tt, ttt, i, delayMs, difEvs, daCallback2);},5000);
						}else{
							daCallback2(delayMs, enumCx, n, t, tt, ttt, i, checkiftested[1]);
						}
					}else{
						test2="";
						daCallback2(delayMs, enumCx, n, t, tt, ttt, i, test2);
						}
				}
			}

			if (bbwebApp.isRedExec && n != 1) {
				bbwebApp.ddStepN++;
				bbwebApp.printResults("dd test step: #" + bbwebApp.ddStepN + " | Check executability of the reduced sequence: " + bbwebApp.keepIds);
				bbwebApp.ddRealStepN++;
				//console.log("dd actual test step: #" + bbwebApp.ddRealStepN);
				bbwebApp.printResults("dd actual test step: #" + bbwebApp.ddRealStepN);
				si = bbwebApp.keepIds;
				d = bbwebApp.takeElements(bbwebApp.Cx, si);
				bbwebApp.bbrefreshSWF();
 				setTimeout(function(){
				  ddTests(enumCx, n, t, tt, ttt, (i-1), delayMs, d, daCallback);

				}, 5000);

			} else {

				if(!t){
					bbwebApp.ddStepN++;
					//console.log("dd test step: #" + bbwebApp.ddStepN + " | execute test1 | " + "n = " + n + " | i = " + i);
					bbwebApp.printResults("dd test step: #" + bbwebApp.ddStepN + " | execute test1 | " + "n = " + n + " | i = " + i);
					bbwebApp.printResults("event indices: " + si);
					//console.log("event indices: " + si);
					//console.log("checked events: " + d);

					var checkiftested = bbwebApp.ddexeChecker(d); // check if the current subset has been already checked

				      if(checkiftested[0]){
						bbwebApp.ddRealStepN++;
						//console.log("dd actual test step: #" + bbwebApp.ddRealStepN);
						bbwebApp.printResults("dd actual test step: #" + bbwebApp.ddRealStepN);
						bbwebApp.bbrefreshSWF();
						setTimeout(function(){ddTests(enumCx, n, t, tt, ttt, i, delayMs, d, daCallback);},5000);
					}else{
						daCallback(delayMs, enumCx, n, t, tt, ttt, i, checkiftested[1])
					}
				}else{
					test1 = "";
					daCallback(delayMs, enumCx, n, t, tt, ttt, i, test1);
				}
			}
		}else{
			bbwebApp.ddMin(delayMs, enumCx, n, false, false, false, i);
		}
	},


	/** Split Cx into subsets according to n and return an array with n subsets **/
	/** correct way of slicing...we keep the index too. **/
	/** [[index,subset]] **/
	ddSplit2Subsets : function (Cx,n) {

		var n2 = n;

		var len = Cx.length;

		var i = 0;
		//var z = 0; //Alex: dead code
		var sset=[];
		while (i < len) {
			var size = Math.ceil((len - i) / n--);

			var subsets=new Array();
			for(var k=i;k<(i+size);k++){
				subsets.push(k);
			}
			sset.push(subsets);
			i += size;
			//z++; //Alex: dead code
		}

		var len = Cx.length;
		var subsets = new Array();
		var i = 0;
		while (i < len) {
			var size = Math.ceil((len - i) / n2--);
			subsets.push(Cx.slice(i, i + size));
			i += size;
		}

		/** join arrays **/
		var result = [];
		for(var i=0;i<sset.length;i++){
			result[i]=[];
			result[i][0]=sset[i]; // stores possitions of the corresponding splitting in the initial array
			result[i][1]=subsets[i]; // stores a fragment of the splitting
		}

		return result;

	},

	ddGreadySplit2Subsets : function (Cx, n) {
		var splits = bbwebApp.ddSplit2Subsets(Cx,n);
		var result = [];
		for (var i = 0; i < splits.length; i++) {
			subsetComplInd = bbwebApp.restIndices(Cx, splits[i][0]);
			var subsetComplElem = [];
			for (var j = 0; j < subsetComplInd.length; j++) {
				subsetComplElem.push(Cx[subsetComplInd[j]]);
			}
			result.push([subsetComplInd, subsetComplElem]);
		}
		return result;
	},

	ddSplitIndices : function (inds, n) {
		var n2 = n;
		var len = inds.length;

		var i = 0;

		var sset = [];
		while (i < len) {
			var size = Math.ceil((len - i) / n--);

			var subsets=new Array();
				for(var k = i; k < (i + size); k++){
					subsets.push(inds[k]);
			}
			sset.push(subsets);
			i += size;

		}
		return sset;
	},
	/** Calculate the diff between 2 arrays according to the index of the second(doesn't remove duplicates)**/
	/** a = Array() , b = Array(), c = Array() of index values **/
	ddMinus : function(a,c){
		var diff = new Array();
		for (var i = 0; i< a.length; i++) {
			var iInC = false;
		        for (var j = 0; j < c.length; j++) {
				if (i == c[j]) {
				  iInC = true;
				  break;
				}
			}
			if (iInC == false) {
			        diff.push(a[i]);
			}
		}
		return diff;

	},

	restIndices : function(a,b){
		var res = new Array();
		for(var i = 0; i < a.length; i++){
			var iInA = false;
			for (var j = 0; j < b.length; j++){
				if (i == b[j]) {
					iInA = true;
					break;
				}
			}
			if (iInA == false) {
				res.push(i);
			}
		}
		return res;
	},

	arrayIndicesSubtract : function(a,b) {
		var isInB = function(i){
			for (var j = 0; j < b.length; j++) {
				if (i == b[j]) {
				  return false;
				}
			}
			return true;
		};
		return a.filter(isInB);
	},

	takeElements : function(Cx, ids) {
		var res = [];
		for (var i = 0; i < Cx.length; i++) {
			for (var j = 0; j < ids.length; j++) {
				if (i == ids[j]) {
					res.push(Cx[i]);
				}
			}
		}
		return res;
	},

	/** It stores in array each eventlist and the result **/
	ddMemorizer : function(eventList,theReturn){
		if (eventList.length > 0) {
			for (var i = 0; i < bbwebApp.memoArray.length; i++) {
				if (eventList.compare(bbwebApp.memoArray[i])) {
					//console.log("Given event sequence is already memorized: " + eventList);
					return;
				}
			}
			//console.log("Memorizing new event sequence: " + eventList + " = " + theReturn);
			bbwebApp.memoArray.push(eventList);
			bbwebApp.memoArrayResult.push(theReturn);
		}
	},

	/** It checks if an eventList is already executed to avoid .......the re-execution :/ .
	  * If it's been executed but the result was (?), it will try again, just in case
	  * The returning value it's an array that contains two elements:
	  *  - outcome of the test (bool)
	  *  - last considered idex (int)
	  */
	ddexeChecker : function(e1){
		var res = true;
		var memo = bbwebApp.memoArray;
		var pos = null;
		var result = Array();

		for(i=0; i<memo.length; i++){
			switch (bbwebApp.memoArrayResult[i]) {
				case "√":
					if (e1.compare(memo[i].slice(0, e1.length))) {
						res = false;
						pos = i;
						//console.log("already checked and the result was: √");
						bbwebApp.printResults("already checked and the result was: √");
						return result.push(res, pos)
					}
					break;
				case "?":
					if (memo[i].compare(e1.slice(0, memo[i].length))) {
						//console.log(memo[i]);
						res = false;
						pos = i;
						//console.log("already checked and the result was: ?");
						bbwebApp.printResults("already checked and the result was: ?");
						return result.push(res, pos)
					}
					break;
			}

		}
		result.push(res,pos);
		return result;
	},

	/** Manual refresh of the application without reloading the library**/
	bbrefreshSWF : function(){
		swfobject.removeSWF('AutomationLoader');
		$('body').append('<div id="flashContent"></div>');
		swfobject.embedSWF("AutomationLoader.swf", "flashContent","100%", "100%",swfVersionStr, xiSwfUrlStr,flashvars, params, attributes);

		setTimeout(function(){
			//console.log("refreshing the application");
			bbwebApp.printResults("refreshing the application");
			document["AutomationLoader"].loadApplication('flexstore.swf','FlexDelegates.swf','logger.swf');
		},1000);
	},

};

Array.prototype.compare = function (array) {
	// if the other array is a falsy value, return
	if (!array)
		return false;

	// compare lengths - can save a lot of time
	if (this.length != array.length)
		return false;

	for (var i = 0; i < this.length; i++) {
	// Check if we have nested arrays
	if (this[i] instanceof Array && array[i] instanceof Array) {
		// recurse into the nested arrays
		if (!this[i].compare(array[i]))
			return false;
	}
	else if (this[i] != array[i]) {
		// Warning - two different object instances will never be equal: {x:20} != {x:20}
		  return false;
	}
	}
	return true;
};

/** Detect browser language **/
bbwebApp.browserLang = bbwebApp.detectBrowserLang();
switch(bbwebApp.browserLang){
	case 'en':
		bbwebApp.alertMsg = bbwebApp.alertMsg['en'];
		break;
	default:
		bbwebApp.alertMsg = bbwebApp.alertMsg['en'];
};


/** If boot function is true then keep going. **/
if(bbwebApp.boot()){

	bbwebApp.lang = {

		// English
		en : {
			'appName':'bbwebApp'
		}
	}

	if(bbwebApp.browserLang){
		switch(bbwebApp.browserLang){
			case 'en':
				bbwebApp.label = bbwebApp.lang['en'];
				break;
			default:
				bbwebApp.label = bbwebApp.lang['en'];
		};
	}else{
		bbwebApp.label = bbwebApp.lang['en'];
	};

	/** ---------- bbwebApp Additional Properties with jQuery------------ **/
	$(document).ready(function(){
		var response;
		$.ajax({ type: "GET",
		url: "debugger/bbwebApp.html",
		async: false,
		success : function(text){
				response= text;
			}
		});
		// basic functionality
		$('body').prepend(response)
		$('#bbwebApp').resizable({alsoResize: "#bbwebApp"
		}).draggable({
		  //.bblcontainer, .bbrcontainer, .bbcontent, .bbdebugger"
			start: function() {
				// if scrolling, don't start and cancel drag
				if ($(this).data("scrolled")) {
					$(this).data("scrolled", false).trigger("mouseup");
					return false;
				}
			}
		}).find("*").andSelf().scroll(function() {
			// bind to the scroll event on current elements, and all children.
			//  we have to bind to all of them, because scroll doesn't propagate.

			//set a scrolled data variable for any parents that are draggable, so they don't drag on scroll.
			$(this).parents(".ui-draggable").data("scrolled", true);

		});
		//$('#bbwebApp').resizable({alsoResize: ".bbresults, .bbrcontainer"});
		$('#bbclose').click(function(){
			$('#bbwebApp').hide();
		});
		$('#bbmin').click(function(){
			$('.bbcontent').slideToggle('slow');
		});

		/** this cool function takes the errors of the console and prints them in our library. Whatever the error is **/
		window.onerror = function(errorMsg,url,lineNumber){ bbwebApp.errorResults(errorMsg,url,lineNumber); }


		/** clicks **/

		$('.bbrun').click(function(){
			var delayMS = $('.bbdelay input').val();
			bbwebApp.stopE = false; //reload stop value.
			$('.bbevent input.bbinvokes').each(function(i){
				if($(this).is(':checked')){
					var bbtoInvoke = $(this).next().html();
					var theSpan = $(this).next();
					setTimeout(
						function(){
							if(bbwebApp.stopE === false){//check if stop button pressed
								theSpan.toggleClass('bbcurrent');
								//console.log(bbtoInvoke);
								bbwebApp.printResults(bbtoInvoke);
								eval(bbtoInvoke);
							}
						},
						delayMS*i);//adding a delay.
				}
			});
		});

		/** It stops the execution **/
		$('.bbstop').click(function(){
			bbwebApp.stopE = true;
		});

		/** Select all break checkboxes **/
		$('.bbballbreaks').click(function(){
			$('.bbevent input.bbbreakpoints').each(function(){
				if($(this).is(':checked')){
					$(this).prop('checked', false);
				}else{
					$(this).prop('checked', true);
				}
			});
		});

		/** Select all invoke checkboxes **/
		$('.bballinvokes').click(function(){
			$('.bbevent input.bbinvokes').each(function(){
				if($(this).is(':checked')){
					$(this).prop('checked', false);
				}else{
					$(this).prop('checked', true);
				}
			});
		});


		/** read the log files with the events from the src AND starts the parsing**/
		$('.bbfromsrc').click(function(){
			var xmllog = $('.bbwebApp .bbcontent .bbreadxml').val().replace(/C:\\fakepath\\/i, '');
			//var xmllog = "flx5_log_1382708392738_new_modified.xml";
			var results = $.getXML('logs/' + xmllog);
			var obj = bbwebApp.parseXml(results);
			//console.log(obj);
			$('.bbdebugger').html('');
			bbwebApp.showResults(obj);
			$('.bbdebugger .bbevent span').click(function(){
				var event = $(this).text();
				//console.log(event);
				bbwebApp.printResults(event);
				eval(event);
			});

		});

		/** Another manual reloader for the flash application... **/
		$('.bbreloadflash').click(function(){
			/**
			* HAVE TO FIND A GENERIC WAY TO RELOAD
			* THE FLASH CONTENT WITHOUT KNOWING SO MUCH INFORMATION.
			**/
			alert('Your application is going to be reloaded..');
			bbwebApp.bbrefreshSWF();
		});

		/** Execution of the ddMin algorithm **/
		$('.bbddmin').click(function(){
			var delayMS = $('.bbdelay input').val();
			bbwebApp.Cx = [];
			$('.bbevent input.bbinvokes').each(function(i){
				if($(this).is(':checked')){
					var bbtoInvoke = $(this).next().html();
					bbwebApp.Cx.push(bbtoInvoke);
				}
			});
			bbwebApp.initException = "";
			bbwebApp.isRedExec = false;
			bbwebApp.isRedErr  = true;
			var enumCx = function(a,b){while(a--){b[a]=a}return b}(bbwebApp.Cx.length,[]);
			var errorIndices = [43];
			bbwebApp.errorTrace = bbwebApp.takeElements(bbwebApp.Cx, errorIndices);
			console.log("bbwebApp.errorTrace: " + bbwebApp.errorTrace);
			bbwebApp.ddStartDate = new Date();
			bbwebApp.printResults("Minimize the failing sequence with ddmin");
			bbwebApp.numExecutedEvents = 0;
			bbwebApp.ddStepN = 0;
			bbwebApp.ddRealStep = 0;
			bbwebApp.ddMin(delayMS, enumCx, 1, false, false, true, 0);
		});

		/** Execution of the ddMin algorithm **/
		$('.bbddminr').click(function(){
			var delayMS = $('.bbdelay input').val();
			bbwebApp.Cx = [];
			$('.bbevent input.bbinvokes').each(function(i){
				if($(this).is(':checked')){
					var bbtoInvoke = $(this).next().html();
					bbwebApp.Cx.push(bbtoInvoke);
				}
			});

			bbwebApp.printResults("Minimize the failing sequence with reduction and ddmin");
			bbwebApp.ddStartDate = new Date();
			bbwebApp.keepIds = [];


			var socket = io.connect('//localhost:3000');

			var xmllog = $('.bbwebApp .bbcontent .bbreadxml').val().replace(/C:\\fakepath\\/i, '');
			//var xmllog = "flx5_log_1382708392738_new_modified.xml";

			var rewrules = $('.bbwebApp .bbcontent .bbreadrrules').val().replace(/C:\\fakepath\\/i, '');
			//var rewrules = "flx5.0.9.pat";

			socket.emit('sendlog', {clientLog : xmllog, clientRRules : rewrules});

			socket.on('reducedLog', function(data){
				//console.log("reduced log consists of these indices: " + data.indices);
				// var keepIds = data.indices
				// bbwebApp.keepIds = keepIds.substring(1, keepIds.length-1).split(",");
				bbwebApp.keepIds = eval(data.indices).concat(bbwebApp.Cx.length - 1);
				bbwebApp.printResults("Reduced Log: " + bbwebApp.keepIds, "warning");
				// bbwebApp.keepIds = bbwebApp.keepIds.slice(0, bbwebApp.keepIds.length - 2);
				bbwebApp.initException = "";
				bbwebApp.isRedExec = true;
				bbwebApp.isRedErr  = false
				var enumCx = function(a,b){while(a--){b[a]=a}return b}(bbwebApp.Cx.length,[]);
				var errorIndices = [43];
				bbwebApp.errorTrace = bbwebApp.takeElements(bbwebApp.Cx, errorIndices);
				bbwebApp.numExecutedEvents = 0;
				bbwebApp.ddStepN = 0;
				bbwebApp.ddRealStep = 0;
				//console.log("bbwebApp.errorTrace: " + bbwebApp.errorTrace);
				bbwebApp.ddMin(delayMS, enumCx, 1, false, false, true, 0);
			})

		});

		/** AJAX rulez :: read the xml file and return the result**/
		$.extend({
			getXML:function(url){
				var result = null;
				$.ajax({
					url: url,
					type: 'get',
					dataType: 'xml',
					async:false,
					success: function(data){
						result = data;
					}
				});
				return result;
			}
		});

	});

}else{
	alert('Problem !'); // if you just see an alert box with the string "Problem" then you have a serious problem.
}
