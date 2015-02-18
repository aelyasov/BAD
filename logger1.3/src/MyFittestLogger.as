package {

  import eu.fittest.Logging.*;
  import eu.fittest.Logging.Serialization.*;
  import eu.fittest.actionscript.automation.*;
  
  import mx.controls.*;
  import mx.core.*;
  import mx.containers.*;
	
  /**
   * This class is the concrete implementation of FittestLoggerHook. 
   */
  public class MyFittestLogger extends FittestLoggerHook {
  
    public function MyFittestLogger() {		
	  super() ;
    }
	
    // specify the ignore-list; events mathing this function will be ingonred/not logged:
    override public function ignoreList(evt : RecordEvent) : Boolean {
        var o = evt.source.target ;
        if(o is mx.controls.Label
            && evt.source.id.substr(0,5) == "Label") // probably non-semantical label, ignore
            return true ;
        if(o is mx.containers.Canvas 
             && (evt.source.id.substr(0,3) != "IDY"))  // probably non-semantical canvas, ignore
            return true ;
            
        return false ;
    }

    // specify the serialization delegates to use:
    override public function registerSerializationDelegates() : void {
        super.registerSerializationDelegates() ;
        Delegates.registerDelegate(mx.controls.Text, MxUISerializableDelegates.textSerializationDelegate) ;
        Delegates.registerDelegate(mx.controls.TextInput, MxUISerializableDelegates.textInputSerializationDelegate) ;
        // registering the serialization delegates for Flexstore itself:
        MySerializationDelegates.registerSerializationDelegates()
    }
	
	// register external interface, callable from JavaScript, if any:
	override public function setupMoreExternalInterface(loggedApp : Object) : void { 
	   MyExternalInterface.setupExternalInterface(loggedApp) ;
	}
   
  }	
}