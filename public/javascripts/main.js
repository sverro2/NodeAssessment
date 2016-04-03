$(document).ready(function(){
  $('.filterButton').on('click', filterResults);
  $('.removeOnClick').on('click', deleteRequest);
  $('.filterInput').on('keyup', filterResults);
  $('#searchLocationsButton').on('click', findLocations);
});

function filterResults(){
  var filterText = $('.filterInput').val();
  $('.filterable').children(".filter-item").each(function(){
    if($(this).find('.search').html().toLowerCase().indexOf(filterText.toLowerCase()) > -1){
      $(this).show();
    }else{
      $(this).hide();
    }
  });
}

function deleteRequest(){
  var $clickedButton = $(this);
  var urlToDelete = $clickedButton.data('url');
  var refresh = ($clickedButton.attr('data-refresh'))

  $.ajax({
    url: urlToDelete,
    type: 'DELETE',
    success: function(result) {
      $clickedButton.closest('.list-group-item').hide();
      if(refresh){
        location.reload(true);
      }
    }
  });
}

function findLocations(){
  var search = $('#locationInput').val();
  var baseUrl =   $('#searchLocationsButton').data("url");
  search = encodeURIComponent(search);
  $('#locationInput').val('');
  $.ajax({
    url: baseUrl + search,
    type: 'POST',
    success: function(result) {
      //add results to locations-to-add
      var resultsHTML = "";

      result.items.forEach(function(item){
        resultsHTML += '<div class="checkbox filter-item"><label class="search"><input type="checkbox" value=\'' + JSON.stringify(item) + '\' name="' + item._id + '">' + item.name + '</label></div>';
      });
      $('#locations-to-add').html(resultsHTML);
    }
  });
}
