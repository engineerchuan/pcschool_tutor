$( document ).ready(function() {
    createLessonWindow();
    
    console.log("status - ready");
    
    // send a signal to enable the school
    $("#pcschool_extension").addClass("enabled");
    
    createURL = function(url) {
        return chrome.extension.getURL(url);
    }

    makeLessonRequest("lessons/test2.json", updateLessonNav);
 
});