package {

import eu.fittest.Logging.Serialization.*;

import flash.display.*;
import flash.utils.*;

/**
 * Specifying some serialization delegates for the target application, including
 * one to get the application's abstract state.
 */
public class MySerializationDelegates {

    /**
     * Will be called from MyFittestLogger.
     */
    public static function registerSerializationDelegates() : void {
        // list down here all serialization delegates that need to be
        // registered/used:
        // to serialize Flexstore's own abstract state:
        Delegates.registerDelegate(getDefinitionByName("flexstore") as Class,flexstoreSerializationFunction) ;
        // to serialize other Flexstore's internal objects (needed in deep logging):
        Delegates.registerDelegate(getDefinitionByName("productsView.ProductCatalogPanel") as Class , productCatalogPanelSerializationFunction) ;
        Delegates.registerDelegate(getDefinitionByName("samples.flexstore.Product") as Class, productSerializationFunction) ;
        Delegates.registerDelegate(getDefinitionByName("samples.flexstore.ProductThumbEvent") as Class, productThumbEventSerializationFunction) ;                                 
    }


    // To serialize flexstore itself:
    public static function flexstoreSerializationFunction(app : Object, s : Serializer) : void {
        //trace("** TYPE flexstore = " + getQualifiedClassName(app)) ;
        
        // extracting the info:
        // Ask Alexander, which ones are applicable:
        
        var numOfSelectedItems : int = app["pView"]["filterPanel"]["filter"]["count"] ;
        var numInShopCart : int    =  app["pView"]["cartPanel"]["numProducts"] ;
        var cartCurrency : String  =  app["pView"]["cartPanel"]["cf"]["currencySymbol"] ;
        var cartTotal : String     =  app["pView"]["cartPanel"]["grandTotal"]["text"] ;
        var numInCompareCart: int  = app["pView"]["filterPanel"]["productList"]["items"]["length"];
        // selectedProduct was originally commented out, need to
        // ask why to Alexander. I am putting it back:
        var selectedProduct: int ;
        var selectedProduct_ : Object   = app["pView"]["catalogPanel"]["details"]["product"] ;
        if (selectedProduct_ == null ) {
            // trace("** product is null") ;
            selectedProduct = -1 ;
        }
        else {
          selectedProduct = selectedProduct_["productId"] ;
        }
        
        var catalogContents: Array = app["pView"]["catalogPanel"]["getCatalog"];
        var shoppingCartContents: Array = app["pView"]["cartPanel"]["productList"]["getCart"];
        var compareCartContents: Array  = app["pView"]["filterPanel"]["productList"]["getCart"];

        // the serialization begin here:
        s.beginObject(app,"AppAbstractState") ;
        s.storeField(new QName("numOfSelectedItems"), numOfSelectedItems) ;
        s.storeField(new QName("numInShopCart"), numInShopCart) ;
        s.storeField(new QName("cartCurrency"), cartCurrency) ;
        s.storeField(new QName("cartTotal"), cartTotal) ;
        s.storeField(new QName("numInCompareCart"), numInCompareCart) ;
        s.storeField(new QName("selectedProduct"), selectedProduct) ;
        s.storeField(new QName("catalogContents"), catalogContents);
        s.storeField(new QName("shoppingCartContents"), shoppingCartContents);
        s.storeField(new QName("compareCartContents"), compareCartContents);
        s.endObject() ;
    }
    
    // To serialize ProductCatalogPanel
    public static function productCatalogPanelSerializationFunction(o : Object, s : Serializer) : void {
        s.beginObject(o,"ProductCatalogPanel") ;
        s.storeField(new QName("currentState"), o["currentState"]) ;
        s.storeField(new QName("thumbnailState"), o["thumbnailState"]) ;
        s.storeField(new QName("thumbnailSize"), o["thumbnails"].length) ;
        s.endObject() ;
    }
    
    // To serialize Product
    public static function productSerializationFunction(o : Object, s : Serializer) : void {
        s.beginObject(o,"samples.flexstore.Product") ;
        s.storeField(new QName("qty"), o["qty"]) ;
        s.endObject() ;
    }
    
    // To serialize ProductThumbEvent
    public static function productThumbEventSerializationFunction(o : Object, s : Serializer) : void {
        s.beginObject(o,"samples.flexstore.ProductThumbEvent") ;
        s.storeField(new QName("type"), o["type"]) ;
        s.storeField(new QName("prodQty"), o["product"]["qty"]) ;
        s.endObject() ;
    }
  }
}