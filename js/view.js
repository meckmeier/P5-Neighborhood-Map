
  var markers = [];
  var items =[];
  var nbrMarkers;
  var map;
  var Loc = function(data){
    this.location= data.location;//ko.observable(data.location); //these are referred to as location()
    this.address =data.address;//ko.observable(data.address);
    this.lat = data.lat;//ko.observable(data.lat);
    this.lng = data.lng;//ko.observable(data.lng);
    this.streetView = "https://maps.googleapis.com/maps/api/streetview?size=100x50&location='" +data.lat+ "," +data.lng + "'key=AIzaSyAaeEKsxpkvy9N4aNx4GKYd7eom-mZOiik";
    this.visible = ko.observable(data.visible);
    this.nyt = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q='" + data.location + "'&fq=source\:\(\"The New York Times\"\) AND news_desk\:\(\"Travel\"\)&page=1&sort=newest&api-key=a83fb0e20722ea3a4e8b4b05dda2786f:8:38135839";
    this.contentForWindow = data.location + "<br/><img src=\"https://maps.googleapis.com/maps/api/streetview?size=100x50&location='" + data.location +" " + data.address  + "'key=AIzaSyAaeEKsxpkvy9N4aNx4GKYd7eom\-mZOiik\">'";
    //this.koMarkerItem = ko.observable(0);
    this.markerItem  =new google.maps.Marker({
        position: {lat: data.lat, lng:data.lng},
        title: data.location,
        animation: google.maps.Animation.DROP,
        visible:  data.visible
    });
  };
//MV - the only place where you can access the MODEL AND the VIEW
// MODEL = MyListOfPlaces
// VIEW - stuff you do to build the display
  var Octopus = function() {
    //DATA
    //do self = this so this works correctly. THIS is the octopus... not the data
    var self = this;
    this.chosenMarker = ko.observable();
    this.koMarkerArray = ko.observableArray([]);
    //this puts all the objects from the data model into an array you can use here
    //once here you should not use MyListOfPlaces again...
    MyListOfPlaces.forEach(function(datapoint){
      //used for the filter functionality and the list objects
      self.koMarkerArray.push (new Loc(datapoint));
      //used for the markers on the google map
      markers.push (new Loc(datapoint));
      });
      nbrMarkers = markers.length;
    //console.log('The first element is ' + this.koMarkerArray()[0].location);
    this.filter = ko.observable('');
    //BEHAVIORS
    this.goToMarker = function(x) {
        self.chosenMarker(x.location);
        for (i=0; i < nbrMarkers; i++)
          {if (x.location == markers[i].markerItem.title)
            {
              google.maps.event.trigger(markers[i].markerItem, 'click');
            }
          }
        };

    this.filteredItems = ko.computed(function() {
      var lcFilter = this.filter().toLowerCase();
      if (!lcFilter) {
          //if there is no filter, then return the whole list
          for (i=0; i< nbrMarkers; i++) {
            markers[i].markerItem.setVisible(true);
          }
          return this.koMarkerArray();}
        else {
          //if there is a filter then use arrayFilter to shorten the list
          return ko.utils.arrayFilter(this.koMarkerArray(), function(item) {
            var string = item.location.toLowerCase();
            for (i=0; i < nbrMarkers; i++) {
              var str2 = markers[i].markerItem.title.toLowerCase();
              if(str2.search(lcFilter) >=0)
                {markers[i].markerItem.setVisible(true);}
              else
                {markers[i].markerItem.setVisible(false);}
              }
          if( string.search(lcFilter) >= 0 )
              {return true;}
            else
              {return false;}
              });
          }
    }, this);
  };


//VIEW tasks:
  //create and set Google Map with marker
  //initialize is a VIEW element

  function viewThing() {
    //setup the Map
  	var mapCanvas = document.getElementById('map');
  	var mapOptions = {
   		 center:  new google.maps.LatLng(44.955241, -92.075459),
       zoom: 4,
    	 mapTypeId: google.maps.MapTypeId.ROADMAP
     };
    map = new google.maps.Map(mapCanvas, mapOptions);

    //this seems to need to be AFTER the construct of the map to work.
    //set up the menu
    //TODO: According to requirements JQuery and vanilla JS usage should be minimized to manipulate DOM objects. Any click events can be easily implemented via Knockout observbles and data-bindings.
    //Here is an example how you can manipulate with styles using Knockout:
    //http://knockoutjs.com/documentation/style-binding.html
    //http://knockoutjs.com/documentation/css-binding.html
    var menuControl = document.getElementById("menu");
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuControl);
      menuControl.addEventListener('click', function(e) {
        drawer.classList.toggle('open');
        e.stopPropagation();
      });

    var main = document.querySelector('#map');
    var drawer = document.querySelector('#drawer');
    var exitStep = document.querySelector('#exit');

    main.addEventListener('click', function() {
      drawer.classList.remove('open');
      menu.classList.remove('open');
      });

    exitStep.addEventListener('click',function(){
      drawer.classList.remove('open');
      });

    for (i=0; i< markers.length; i++) {
      LinkMarkerToContent(markers[i].markerItem, markers[i].contentForWindow, markers[i].nyt);
      markers[i].markerItem.setMap(map);
    	google.maps.event.addListener(markers[i].markerItem, 'click', toggleBounce);
    }
}

  //link infowindow to marker
  var LinkMarkerToContent=function(marker, contentString, nyt){
    var items =[];
    var x='';
    $.getJSON( nyt,
       function(data) {
      $.each(data.response.docs, function(key,val) {
            //items.push("<li class ='article' id='" + val.web_url + "''>" +  val.headline + "</li>");
              items.push("<li id='articles'><a href='" + val.web_url + "'>" + val.headline.main + "</a>" + "<p>" + val.snippet + "</a></li>");//
              x=x + "<li id='articles'><a href='" + val.web_url + "'>" + val.headline.main + "</a>" + "<p>" + val.snippet + "</a></li>";
              //console.log('inside loop');
              //console.log(contentString);
              //console.log(x);
              //console.log(items);
           });
         });
           //but not here outside the loop... but both variables are defined outside the loop... so what am imissing?

  /*    $.ajax({
               url: nyt,
               dataType: 'jsonp',
               callback: 'svc_search_v2_articlesearch',
               success: function () {
                 console.log('success');
               }
                   });
*/
//console.log('outside loop');
//console.log(contentString);
console.log(contentString);
console.log(x);
//console.log(items);
var FinalStr = contentString + x;
console.log(FinalStr);
    var infowindow = new google.maps.InfoWindow({
      content: FinalStr
      });
    map.addListener('click',function(){
      if (infowindow.opened){
        infowindow.close();
      }
    });
    marker.addListener('click', function() {
      if(infowindow.opened){
      infowindow.close();
      infowindow.opened = false;
    }
    else{

      infowindow.open(marker.get('map'), marker);
      infowindow.opened = true;
    }
      //setTimeout(function () { infowindow.close(); }, 5000);
    });
  };
  //bounce markers on click, end after 1.5sec
  var toggleBounce = function(marker) {
  	var self = this;
  	if(self.getAnimation() !== null) {
  		self.setAnimation(null);
  	}
     else {
  		self.setAnimation(google.maps.Animation.BOUNCE);
  		setTimeout(function(){self.setAnimation(null); }, 1500);
  	}
  };
function initRoutine()
{
  var octo = new Octopus();
  ko.applyBindings(octo);
  google.maps.event.addDomListener(window, 'load', function() {
    viewThing();}
                                  );
  }
function errorHandling(){
  console.log("there was an error in the google load");
}
