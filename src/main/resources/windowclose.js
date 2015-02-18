var windowclose = function() {
	
	/* Cross-browser onDomLoad
		- Will fire an event as soon as the DOM of a web page is loaded
		- Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
		- Regular onload serves as fallback
	*/ 
	onDomLoad = function() {
        window.onbeforeunload = window_closing;
	}();
	
	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() { 
        window.onbeforeunload = window_closing;
	}
    
    <!-- send notification of window closing -->
    function window_closing()
    {
        var flashapp = document.getElementById("flexstore");
        var logstr = flashapp.window_closing();
        // make log available in clipboard
        window.prompt("FITTEST.Flash XML-log / You can now copy to clipboard", logstr);        
        // test automation (replay) takes the log from clipboard
    }


}();
