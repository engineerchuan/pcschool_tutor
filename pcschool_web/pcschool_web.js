$(document).ready(function() {

    console.log("created");
    
    function createObject(i, events, document) {
        var k = events[i];
        if (i >= events.length) {
            console.log("Finished Lesson");
            return;
        }
        var d = document.createElement('div');
        $(d).addClass(k.class);
        for (var key in k.css) {
            $(d).css(key, k.css[key]);
        }
        document.body.appendChild(d);
        if (k.clearCondition.type == "typeInside") {
            d.innerHTML="Type Inside";
        } else if (k.clearCondition.type == "mouseClick") {
            d.innerHTML="Click";
        }
        for (var key in k.css) {
            $(d).css(key, k.css[key]);
        }
        document.body.appendChild(d);
        function next() {
            createObject(i+1, events, document);
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


    // load a lesson
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
    xhr.open("GET", chrome.extension.getURL('/lessons/google.json'), true);
    function handleStateChange() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);
        var events = resp.events;
        createObject(0, events, document);

      }  
    }
    xhr.send();

    
});