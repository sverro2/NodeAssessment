var socket = io();

$(document).ready(function () {
    socket.on('userCheckin', function (msg) {
        $('#messages').html($('<span>').text(msg));
    });

    $("#startDate").datepicker({
        dateFormat: "yy-mm-dd"
    });
    $("#endDate").datepicker({
        dateFormat: "yy-mm-dd"
    });

    $('.filterButton').on('click', filterResults);
    $('.removeOnClick').on('click', deleteRequest);
    $('.filterInput').on('keyup', filterResults);
    $('#searchLocationsButton').on('click', findLocations);

    $('.checkinOnClick').on('click', checkInRequest);
    $('#planning-to-add').on('click', '.addPlanningOnClick', addPlanningRequest);
    findPlanning();
});

function filterResults() {
    var filterText = $('.filterInput').val();
    $('.filterable').children(".filter-item").each(function () {
        if ($(this).find('.search').html().toLowerCase().indexOf(filterText.toLowerCase()) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function deleteRequest() {
    var $clickedButton = $(this);
    var urlToDelete = $clickedButton.data('url');
    $.ajax({
        url: urlToDelete,
        type: 'DELETE',
        success: function (result) {
            $clickedButton.closest('.list-group-item').hide();
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
        success: function (result) {
            //add results to locations-to-add
            var resultsHTML = "";

            result.items.forEach(function (item) {
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
        success: function (result) {
            var contestId = $('#contestId').val();
            var resultsHTML = "<div class='btn-group'>";
            result.forEach(function (item) {
                resultsHTML += '<div class="list-group-item filter-item"><div class="input-group"><h4 class="search">' + item.name + '</h4><span class="input-group-btn"><button data-url="' + contestId + '/planning" class="btn btn-success addPlanningOnClick" json="JSON.stringify(item)" id="' + item._id + '">Add</button></div></div>';
                //resultsHTML += '<div class="radio filter-item"><label class="search"><input type="radio" value=\'' + JSON.stringify(item) + '\' name="' + item._id + '">' + item.name + '</label></div>'
            });
            resultsHTML += "</div>    <script src'\//code.jquery.com/jquery-1.12.0.min.js'></script>"
            $('#planning-to-add').html(resultsHTML);
        }
    });
}

function addPlanningRequest() {
    var clickedButton = $(this);
    var url = clickedButton.data('url');
    $.ajax({
        url: url,
        type: 'PUT',
        data: {
            planning: $(this).attr('id')
        },
        success: function () {
            //$('#planning-to-add').hide();
            console.log("yesssssss!");
        }
    });
}

function checkInRequest() {
    var clickedButton = $(this);
    var url = clickedButton.data('url');
    var location = $(this).attr("id");
    $.ajax({
        url: url,
        type: 'POST',
        success: function () {
            socket.emit('userCheckin', "rik", location); // user is nu nog hardcoded...
            return false;
        }
    });
}
