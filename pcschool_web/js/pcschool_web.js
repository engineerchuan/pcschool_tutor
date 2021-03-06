var createURL = function () {}; // stub for later


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


function createMiniOverlay(moSpec, parent) {

  var mo = document.createElement('div');
  $(mo).addClass("miniOverlay");
  if (moSpec.type == "hidden") {
    $(mo).addClass("hiddenOverlay");
  }

  function resizeOverlay() {
    if (parent.active) {

      var width = $(parent).width();

      var moLeft = width * moSpec.left_width_perc / 100.0;
      var moWidth = width * moSpec.width_width_perc / 100.0;
      var moTop = width * moSpec.top_width_perc / 100.0;
      var moHeight = width * moSpec.height_width_perc / 100.0;

      $(mo).css("left", moLeft + "px");
      $(mo).css("top", moTop + "px");
      $(mo).css("width", moWidth + "px");
      $(mo).css("height", moHeight + "px");
      setTimeout(resizeOverlay, 1000);
    } else {
      console.log("resize overlay stopped");
    }
  }

  // address the revealing
  if (moSpec.type == "hidden") {
    $(mo).bind("click.pcschool", function() {
      $(mo).removeClass("hiddenOverlay");
      $(mo).addClass("hiddenOverlayRevealed");
      $(mo).unbind("click.pcschool");
    });
  }

  mo.attach = function () {
    parent.appendChild(mo);
    resizeOverlay();
  }

  mo.detach = function () {
    $(mo).unbind("click.pcschool");
  }
  return mo;
}

function createOverlay(spec, document) {
    
    // every overlay can be constructed
    // it will be constructed with a visible event
    // it will be constructed with a destructor
    // it will bind to other things

    var overlay = null;
    
    if (spec.type == "fullScreenPictureOverlay") {
        

        overlay = document.createElement('div');
        $(overlay).addClass("fullScreenPictureOverlay");
        $(overlay).css("background-image", "url(" + createURL(spec.imageLink) + ")");
        overlay.childOverlays = [];

        // add some mini overlays
        if (spec.overlays) {
          for (var iMO in spec.overlays) {
            var moSpec = spec.overlays[iMO];
            var mo = createMiniOverlay(moSpec, overlay);
            overlay.childOverlays.push(mo);

          }
        } 


        overlay.attach = function() {
            document.body.appendChild(overlay);
            overlay.active = true;
            for (var iSub in overlay.childOverlays) {
              var mo = overlay.childOverlays[iSub];
              mo.attach();
            }
        }

        overlay.detach = function() {
            for (var iSub in overlay.childOverlays) {
              var mo = overlay.childOverlays[iSub];
              mo.detach();
            }

            $(overlay).remove();
            overlay.active = false;
        }
        
        
    } else if (spec.type == "elementOverlay") {
        overlay = document.createElement('div');
        $(overlay).addClass("wrapoverlay");

        var found = $(document).find(spec.searchQuery);
        if (found.length == 0) {
            console.log("ERROR: failed to find element by searchQuery " + spec.searchQuery);
            return null;
        }
        found = found.first();

        $(overlay).css("left", found.offset().left + "px");
        $(overlay).css("top", found.offset().top + "px");
        $(overlay).css("width", found.outerWidth() + "px");
        $(overlay).css("height", found.outerHeight() + "px");
        
        // create a listener that will poll the stuff for changes
        function resetPosition() {
            if (overlay.active) {

                $(overlay).css("left", found.offset().left + "px");
                $(overlay).css("top", found.offset().top + "px");
                $(overlay).css("width", found.outerWidth() + "px");
                $(overlay).css("height", found.outerHeight() + "px");
                setTimeout(resetPosition, 1000);
            } else {
                console.log("reset position stopped");                  
            }
        }
        
        overlay.attach = function() {
            document.body.appendChild(overlay);
            overlay.active = true;
            console.log("reset position started");
            resetPosition();
        }

        overlay.detach = function() {
            $(overlay).remove();
            overlay.active = false;
        }
                
    }

    var ma = $(".lessonMain").first().get(0);
    $(ma).bind("DOMSubtreeModified.pcschool",function(){
      $(ma).unbind("DOMSubtreeModified.pcschool");
      overlay.detach();
            
    });
    overlay.attach();
    
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

function makeLessonRequest(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
    xhr.open("GET", createURL(url), true);
    function handleStateChange() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);
        callback(resp);
      }  
    }
    xhr.send();
}

function renderSinglePageOverlay(overlay) {
    console.log("rendering single overlay");
    createOverlay(overlay, document);
}

function renderPageOverlays(iPage, lesson) {
    var page = lesson.contents[iPage];
    if (page.overlays) {
        for (var i = 0 ; i < page.overlays.length; ++i) {
            var overlay = page.overlays[i];
            renderSinglePageOverlay(overlay);
        }
    }
}

function renderPage(iPage, data, lesson) {

    var page = lesson.contents[iPage];
    var ma = $(".lessonMain").first().get(0);
    var ln = $(".lessonNav").first().get(0);

    $(ma).html(data);

    // bold the navigation page
    var classKey = "lwPageNav" + "_" + iPage;
    $(ln).find(".lwPageNav").removeClass("lwPageNavBolded");
    $(ln).find("." + classKey).addClass("lwPageNavBolded");

    // create forward or backward buttons
    if (iPage > 0) {
        $(".topMenu1").html("Previous");
        $(".topMenu1").unbind();
        $(".topMenu1").click( function() {
            displayPage(iPage-1, lesson);
        });
    } else {
        $(".topMenu1").empty();
        
    }

    // create forward or backward buttons
    if (iPage < lesson.contents.length-1) {
        $(".topMenu2").html("Next");
        $(".topMenu2").unbind();
        $(".topMenu2").click( function() {

            displayPage(iPage+1, lesson);
        });
    } else {
        $(".topMenu2").empty();
    }

    // if the page is a videoPage
if (page.type == "videoPage") {

      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('pcyoutubeplayer', {
          height: '390',
          width: '640',
          videoId: 'M7lc1UVf-VE',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = false;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(stopVideo, 6000);
          done = true;
        }
      }
      function stopVideo() {
        player.stopVideo();
      }
}

    renderPageOverlays(iPage, lesson);
}

function displayPage(iPage, lesson) {

    console.log("displaying page");
    var page = lesson.contents[iPage];

    if (page.type == "linkPage") {
        // make asynchronous call for data then render page
        var url = page.HTMLContentLink;
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
        xhr.open("GET", createURL(url), true);
        function handleStateChange() {
          if (xhr.readyState == 4) {
            var resp = $.parseHTML(xhr.responseText);
            renderPage(iPage, resp, lesson);
          }  
        }
        xhr.send();

    } else if (page.type == "contentPage") {  // this is a simplified text page

        var url = "templates/dumbLesson.html";
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
        xhr.open("GET", createURL(url), true);
        function handleStateChange() {
          if (xhr.readyState == 4) {
            var resp = $.parseHTML(xhr.responseText);
            $(resp).find(".title").html(page.title);
            $(resp).find(".pccontent").html(page.HTMLContent);
            renderPage(iPage, resp, lesson);
          }  
        }
        xhr.send();

    } else if (page.type == "imagePage") {  // this is a simplified text page

        var url = "templates/imagePage.html";
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
        xhr.open("GET", createURL(url), true);
        function handleStateChange() {
          if (xhr.readyState == 4) {
            var resp = $.parseHTML(xhr.responseText);
            $(resp).find(".title").html(page.title);
            $(resp).find(".image").html('<img src="' + createURL(page.imageLink) + '"></img>');
            $(resp).find(".pccontent").html(page.HTMLContent);
            renderPage(iPage, resp, lesson);
          }  
        }
        xhr.send();
    } else if (page.type == "videoPage") {

        var url = "templates/videoPage.html";
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
        xhr.open("GET", createURL(url), true);
        function handleStateChange() {
          if (xhr.readyState == 4) {
            var resp = $.parseHTML(xhr.responseText, document, true);
            $(resp).find(".title").html(page.title);
            $(resp).find(".pccontent").html(page.HTMLContent);
            renderPage(iPage, resp, lesson);
          }  
        }
        xhr.send();

    }
}


function createLWMenuBar(lw) {

    var c = $(lw).find(".container").first().get(0);

    var r1 = document.createElement('div');
    $(r1).addClass("pcrow lessonHeader")
    c.appendChild(r1);
    
    var nav = document.createElement('div');
    $(nav).addClass("col-md-2 topMenu");
    r1.appendChild(nav);
    $(nav).html("PC School Web Tutor");
    $(nav).css("color", "#ffffff");
    
    var nav = document.createElement('div');
    $(nav).addClass("col-md-7");
    r1.appendChild(nav);
    
    var nav = document.createElement('div');
    $(nav).addClass("col-md-1 topMenu topMenu1");
    r1.appendChild(nav);
    
    var nav = document.createElement('div');
    $(nav).addClass("col-md-1 topMenu topMenu2");
    r1.appendChild(nav);
    
    
    var nav = document.createElement('div');
    $(nav).addClass("col-md-1 topMenu topMenu3");
    r1.appendChild(nav);
    $(nav).html("Minimize");
    var maximized = true;
    $(nav).click(
        function () {
            if (maximized) {
                $(this).html("Maximize");
                // replace with easing 
                $(lw).addClass("collapsed");
                $(lw).removeClass("uncollapsed");
                maximized = false;

                // hide all menu options
                $(".topMenu1").css("visibility", "hidden");
                $(".topMenu2").css("visibility", "hidden");

            } else {
                
                $(this).html("Minimize");
                $(lw).removeClass("collapsed");
                $(lw).addClass("uncollapsed");
                maximized = true;

                // show menu options
                $(".topMenu1").css("visibility", "visible");
                $(".topMenu2").css("visibility", "visible");

            }
        }
    );

}    


function createLessonWindow() {
    
    var lw = document.createElement('div');
    $(lw).addClass("pcschool lessonWindow uncollapsed");
    document.body.appendChild(lw);
    
    // create a navigation panel to the left
    var c = document.createElement('div');
    $(c).addClass("container");
    lw.appendChild(c);

    createLWMenuBar(lw);
            
    var r2 = document.createElement('div');
    $(r2).addClass("pcrow lessonBodyRow")
    c.appendChild(r2);
    
    var nav = document.createElement('div');
    $(nav).addClass("col-md-4 lessonNav");
    r2.appendChild(nav);
    
    var mainarea = document.createElement('div');
    $(mainarea).addClass("col-md-8 lessonMain");
    r2.appendChild(mainarea);
    
    
}

function updateLessonNavPage(startPage) {
  function inner(lesson) {



    var ln = $(".lessonNav").first().get(0);
    
    var d = document.createElement('div');
    $(d).addClass("navTitle h4");
    ln.appendChild(d);     
    $(d).html(lesson.title);

    for (iPage = 0; iPage < lesson.contents.length; ++iPage) {
       console.log("ipage = ", iPage);
       var page = document.createElement('div');
       $(page).addClass("lwPageNav").addClass("lwPageNav" + "_" + iPage);
       ln.appendChild(page);     
       $(page).html("   " + lesson.contents[iPage].title + " -  " + (iPage+1) + "/" + lesson.contents.length);

       // anonymous function to pass by value
       (function (i) {
         $(page).click(
           function () {
             displayPage(i, lesson, function() {});
           }
         );
       })(iPage);
    }
    

    displayPage(startPage, lesson, function() {});

  }
  return inner;
}
