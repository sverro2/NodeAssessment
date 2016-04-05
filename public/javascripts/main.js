var socket = io();

$(document).ready(function() {
    $("#startDate").datepicker({
        dateFormat: "yy-mm-dd"
    });
    $("#endDate").datepicker({
        dateFormat: "yy-mm-dd"
    });

    $('.filterButton').on('click', filterResults);
    $('.removeOnClick').on('click', deleteRequest);
    $('.updateOnClick').on('click', addPlanningRequest);
    $('.filterInput').on('keyup', filterResults);
    $('#searchLocationsButton').on('click', findLocations);

    $('.checkinOnClick').on('click', checkInRequest);
    $('#planning-to-add').on('click', '.addPlanningOnClick', addPlanningRequest);
});

function filterResults() {
    var filterText = $('.filterInput').val();
    $('.filterable').children(".filter-item").each(function() {
        if ($(this).find('.search').html().toLowerCase().indexOf(filterText.toLowerCase()) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function findLocations() {
    var search = $('#locationInput').val();
    var baseUrl = $('#searchLocationsButton').data("url");
    search = encodeURIComponent(search);
    $('#locationInput').val('');
    $.ajax({
        url: baseUrl + search,
        type: 'POST',
        success: function(result) {
            //add results to locations-to-add
            var resultsHTML = "";

            result.items.forEach(function(item) {
                resultsHTML += '<div class="checkbox filter-item"><label class="search"><input type="checkbox" value=\'' + JSON.stringify(item) + '\' name="' + item._id + '">' + item.name + '</label></div>';
            });
            $('#locations-to-add').html(resultsHTML);
        }
    });
}

function findPlanning() {
    $('planningInput').val('');
    $.ajax({
        url: '../searchPlanning',
        type: 'GET',
        success: function(result) {
            var contestId = $('#contestId').val();
            var resultsHTML = "<div class='btn-group'>";
            result.forEach(function(item) {
                resultsHTML += '<div class="list-group-item filter-item"><div class="input-group"><h4 class="search">' + item.name + '</h4><span class="input-group-btn"><button data-url="' + contestId + '/planning" class="btn btn-success addPlanningOnClick" json="JSON.stringify(item)" id="' + item._id + '">Add</button></div></div>';
                //resultsHTML += '<div class="radio filter-item"><label class="search"><input type="radio" value=\'' + JSON.stringify(item) + '\' name="' + item._id + '">' + item.name + '</label></div>'
            });
            resultsHTML += "</div>    <script src'\//code.jquery.com/jquery-1.12.0.min.js'></script>"
            $('#planning-to-add').html(resultsHTML);
        }
    });
}

function addPlanningRequest() {
    var $clickedButton = $(this);
    var url = $clickedButton.data('url');
    var refresh = ($clickedButton.attr('data-refresh'));

    $.ajax({
        url: url,
        type: 'PUT',
        data: {
            planning: $(this).attr('id')
        },
        success: function(serv) {
            //$('#planning-to-add').hide();
            if(serv){
              window.location.href =serv.url;
            }else{
              var successHtml = "<span>Planning succesvol toegevoegd! <a class='btn btn-success' href='/contest'>Back</a></span>"
              $('#planning-to-add').html(successHtml);
            }
        }
    });
}

function deleteRequest() {
    var $clickedButton = $(this);
    var urlToDelete = $clickedButton.data('url');
    var refresh = ($clickedButton.attr('data-refresh'));

    console.log("deleteding");
    $.ajax({
        url: urlToDelete,
        type: 'DELETE',
        success: function(result) {
          console.log("delete succesvol");
            $clickedButton.closest('.list-group-item').hide();
            if (refresh) {
                location.reload(true);
            }
        },
        error: function(err){
          console.log("kon niet deleten: " + JSON.stringify(err));
        }
    });
}

function checkInRequest() {
    console.log("check");
    var clickedButton = $(this);
    var url = clickedButton.data('url');
    var location = $(this).attr("id");
    var user = $("#userName").attr("value");

    console.log(url);
    $.ajax({
        url: url,
        type: 'POST',
        success: function() {
            clickedButton.closest('.list-group-item').hide();
            socket.emit('userCheckin', user, location);
            return false;
        }
    });
}
