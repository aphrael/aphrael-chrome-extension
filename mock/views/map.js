window.__MAP__ = {};

jQuery(function() {
    google.maps.event.addDomListener(window, 'load', function() {
        drawMap("35.643746", "139.826238");
    });
    jQuery("#redraw").on("click", moveMap);
});

// 指定した位置に移動する
function moveMap() {
    var latlng = new google.maps.LatLng(jQuery("#lat").html(), jQuery("#lng").html());
    window.__MAP__.panTo(latlng);
}

// 地図を描画する
function drawMap(lat, lng) {
    jQuery("#map").empty();
    var latlng = new google.maps.LatLng(lat, lng);
    window.__MAP__ = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        scaleControl: true,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    showHistory(lat, lng);
}

// 履歴を表示する
function showHistory(lat, lng) {
    jQuery("#history").append(
        jQuery("<div>").html(lng + "/" + lat)
    );
}