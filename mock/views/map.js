jQuery(function() {
    google.maps.event.addDomListener(window, 'load', function() {
        drawMap("35.643746", "139.826238");
    });
    jQuery("#redraw").on("click", reDrawMap);
});

function reDrawMap() {
    drawMap(jQuery("#lat").html(), jQuery("#lng").html());
}

function drawMap(lat, lng) {
    jQuery("#map").empty();
    var latlng = new google.maps.LatLng(lat, lng);
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        scaleControl: true,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}