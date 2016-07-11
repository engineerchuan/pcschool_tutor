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
    
    function addKeyPressCondition(overlay, instructions, spec, document) {
        
        var textbox = $(instructions).children().first().get(0);
        var nToPress = spec.clearCondition.n;
        var keyPressListener = function(ev) {
            console.log("nToPress = ", nToPress);
            if (nToPress == 1) {
                overlay.detach();
                console.log("triggering the event");
            } else {
                nToPress -= 1;
                textbox.update(nToPress);
            }
        }
        var oldAttach = overlay.attach;
        overlay.attach = function() {
            $(this).bind("keypress.pcschool", keyPressListener);
            oldAttach();
        }
        textbox.update(nToPress);
        console.log("done");
    }
    
    function addWordEnteredCondition(overlay, instructions, spec, document) {
        
        var textbox = $(instructions).children().first().get(0);
        var word = spec.clearCondition.word;
        
        var wordListener = function(ev) {
            if (word[0] == ev.key) {
                word = word.slice(1,word.length);
                textbox.update(word);
                console.log("found letter ", ev.key);
            }
            if (word.length == 0) {
                overlay.detach();
            }
            
        }
        var oldAttach = overlay.attach;
        overlay.attach = function() {
            $(this).bind("keypress.pcschool", wordListener);
            oldAttach();
        }
        textbox.update(word);

    }
    function addMouseClickCondition(overlay, instructions, spec, document) {
        var textbox = $(instructions).children().first().get(0);
        var oldAttach = overlay.attach;
        overlay.attach = function() {
            $(this).bind("click.pcschool", function() {overlay.detach();});
            oldAttach();
        }
        textbox.update();

    }

    function createInstructions(spec, document) {
        var d = document.createElement('div');
        $(d).addClass("instructionsOverlay");
        var e = document.createElement('div');
        $(e).addClass("instructions");
        if (spec.clearCondition.type == "nKeypresses") {
            e.update = function(n) {
                $(e).html("Type " + n + " letters");
            }
        } else if (spec.clearCondition.type == "wordEntered") {
            e.update = function(word) {
                $(e).html("Type " + word + " !");
            }            
        } else if (spec.clearCondition.type == "mouseClick") {
            e.update = function() {
                $(e).html("Click inside the box");
            }
            
        }
        d.appendChild(e);
        document.body.appendChild(d);
        return d;
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

            overlay.attach = function() {
                found.wrap(overlay);
            }
        
            overlay.detach = function() {

                var oldFocusElement = document.activeElement;
                found.unwrap();
                $(oldFocusElement).focus();
                callback();
            }
            
        }
        return overlay;
        
    }
    
    function addClearCondition(overlay, instructions, spec, document) {
        if (spec.clearCondition.type == "nKeypresses") {
           addKeyPressCondition(overlay, instructions, spec, document);
        } else if (spec.clearCondition.type == "wordEntered") {
           addWordEnteredCondition(overlay, instructions, spec, document); 
        } else if (spec.clearCondition.type == "mouseClick") {
           addMouseClickCondition(overlay, instructions, spec, document); 
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
        var instructions = null;
        function next() {
            $(instructions).remove();
            if (i < events.length) {
                console.log("running createOverlay");
                var overlay = createOverlay(events[i], document, next);
                instructions = createInstructions(events[i], document);
                addClearCondition(overlay, instructions, events[i], document);
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