$(document).ready(function() {
    
    function overlayFixed(left, top, width, height, border) {
        
        // Creates a transparent box at the positions shown
        // left, top width, height should be integers
        // border should be an integer
        var d = document.createElement('div');
        $(d).addClass("overlay");
        $(d).css("left", (left-border) + "px");
        $(d).css("top", (top-border) + "px");
        $(d).css("width", width + "px");
        $(d).css("height", height + "px");
        $(d).css("border-width", border + "px");
        document.body.appendChild(d);
        return d;
        
    }
    
    function addKeyPressCondition(overlay, found, spec, document, callback) {
        

        var nToPress = spec.clearCondition.n;
        var keyPressListener = function(ev) {
            console.log("nToPress = ", nToPress);
            if (nToPress == 1) {
                overlay.detach();
            
                /*var e = jQuery.Event("keydown");
                e.which = ev.keyCode; // # Some key code value
                e.keyCode = ev.keyCode;
                found.trigger(e);*/
                console.log("triggering the event");
            } else {
                nToPress -= 1;
            }
        }
        
        overlay.attach = function() {
            found.bind("keypress.pcschool", keyPressListener);
            found.wrap(this);
        }
    
        overlay.detach = function() {

            var oldFocusElement = document.activeElement;
            found.unwrap();
            $(oldFocusElement).focus();  // restore focus
            found.unbind("keypress.pcschool");
            callback();
        }
        
        console.log("done");
    }
    
    function addWordEnteredCondition(overlay, found, spec, document, callback) {
        
        var word = spec.clearCondition.word;
        
        var wordListener = function(ev) {
            if (word[0] == ev.key) {
                word = word.slice(1,word.length);
                
                console.log("found letter ", ev.key);
            }
            if (word.length == 0) {
                overlay.detach();
            }
            
        }
        
        overlay.attach = function() {
            found.bind("keypress.pcschool", wordListener);
            found.wrap(this);
        }
    
        overlay.detach = function() {

            var oldFocusElement = document.activeElement;
            found.unwrap();
            $(oldFocusElement).focus();  // restore focus
            found.unbind("keypress.pcschool");
            callback();
        }
    }

    function createOverlay(spec, document, callback) {
        
        // every overlay can be constructed
        // it will be constructed with a visible event
        // it will be constructed with a destructor
        // it will bind to other things

        console.log(spec.position.type);
        var overlay = null;
        
        if (spec.position.type == "fixed") {
            
            overlay = overlayFixed(rect.left, rect.top, rect.width, rect.height, 5);
            
        } else if (spec.position.type == "elementByClass") {
            overlay = document.createElement('div');
            $(overlay).addClass("wrapoverlay");
            var found = $(document).find("." + spec.position.class);
            if (found.length == 0) {
                alert("Failed to find element By Class ");
                return overlay;;
            }
            found = found.first();
            
            if (spec.clearCondition.type == "nKeypresses") {
               addKeyPressCondition(overlay, found, spec, document, callback);
            } else if (spec.clearCondition.type == "wordEntered") {
                
               addWordEnteredCondition(overlay, found, spec, document, callback);
                
            }

            
        }
        return overlay;
        
    }
    function createOverlayNext() {
        function next() {
            createOverlay(i+1, events, document);
        }
        if (k.clearCondition.type == "mouseClick") {
          $( document ).click(function(ev) {
            console.log(ev.pageX, ev.pageY);
            if (ev.pageX >= k.clearCondition.x &&
                ev.pageX <= k.clearCondition.x + 50 &&
                ev.pageY >= k.clearCondition.y &&
                ev.pageY <= k.clearCondition.y + 50) {
                console.log("inside the middle");        
                d.remove();
                $(document).unbind("click");
                console.log("cleared");
                next();
            }
          });
        } else if (k.clearCondition.type == "typeInside") {
           var numPressed = k.clearCondition.numLetters;
           $( document ).keypress(function(ev) {
                numPressed-=1;
                if (numPressed == 0) {
                    d.remove();
                    $(document).unbind("keypress");
                    console.log("cleared");
                    next();
               }
           }); 
        }
        
    }

    
    
    console.log("status - ready");
    
    var lookupTable = {};
    lookupTable["https://www.google.com/?gws_rd=ssl"] ='/lessons/google.json';
    lookupTable["file:///C:/Users/engin/Desktop/pcschool_tutor/pcschool_web/test/index.html"] ='/lessons/test.json';


        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
        xhr.open("GET", chrome.extension.getURL(lookupTable[window.location.href]), true);
        function handleStateChange() {
          if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            var events = resp.events;
            var i = 0;
            function next() {
                if (i < events.length) {
                    console.log("runnign createOverlay");
                    var overlay = createOverlay(events[i], document, next);
                    overlay.attach();
                    i+=1;
                } else {
                    console.log("finished");
                }
            }
            next();
            

          }  
        }
        xhr.send();
    
});