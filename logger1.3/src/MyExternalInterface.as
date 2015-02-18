package {

   import flash.external.ExternalInterface;
   
   /**
    * This defines the functions that are to be made externally avialable
    * for the Flexstore application.
    */
   public class MyExternalInterface {
   
   public static function setupExternalInterface(app : Object) : void {
        trace("** setupExternalInterface()") ;
        try {
          // Ask Alexander which of these can be used:
          ExternalInterface.addCallback("getCatalogContents", app["pView"]["catalogPanel"]["getCatalogContents"]);
          ExternalInterface.addCallback("getCatalogState", app.pView.catalogPanel.getCatalogState);
          ExternalInterface.addCallback("getDetailsState", app["pView"]["catalogPanel"]["details"]["getDetailsState"]);
          ExternalInterface.addCallback("getMainTabState", app["getMainTabState"]);
          ExternalInterface.addCallback("getProductsState", app.pView.getProductsState);
          ExternalInterface.addCallback("getCartContents", app.pView.cartPanel.productList.getCartContents);
          ExternalInterface.addCallback("getCompareContents", app.pView.filterPanel.productList.getCartContents);
	    
          //Group of filltering checkboxes in the application
          ExternalInterface.addCallback("getTribandState", app.pView.filterPanel.getTribandState);
          ExternalInterface.addCallback("getCameraState", app.pView.filterPanel.getCameraState);
          ExternalInterface.addCallback("getVideoState", app.pView.filterPanel.getVideoState);
        }
        catch (e:Error) { 
           trace("** setupExternalInterface fails...") ;
        }
   }
  
 }
}