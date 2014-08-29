// These are UI functions. They set the UI but _do not trigger events_!
function openGrid() {
  $('.panel').hide();
  $('#grid').show();
}

function closeGrid() {
  $('#grid').hide();
}

function showPanel(num) {
  $('.panel').hide();
  $('#panel-' + num).show();
}

function closePanel() {
  $('.panel').hide();
}

// Button wiring
$(function() {
  $('#open-grid').on('click', function() {
    openGrid();
    $(window).trigger('showGrid');
  });
  $('#hide-grid').on('click', function() {
    closeGrid();
    $(window).trigger('hideGrid');
  });
  $('.show-panel').on('click', function() {
    var currentPanelNum = $('#grid .panel:visible').attr('panel-num');
    var panelNum = $(this).attr('panel-num');
    showPanel(panelNum);

    if (!currentPanelNum) {
      $(window).trigger('expandPanel');
    }
    if (currentPanelNum != panelNum) {
      $(window).trigger('selectPanel', panelNum);
    }
  });
  $('.close-panel').on('click', function() {
    closePanel();
    $(window).trigger('collapsePanel');
  });
  $('#open-grid-sel').on('click', function() {
    openGrid();
    showPanel('1');
    $(window).trigger('showGrid');
    $(window).trigger('expandPanel');
    $(window).trigger('selectPanel', '1');
  });
});
