// An attempt to build history into app.html!
$(function() {

  $(window)
    .on('showGrid', function() {
      console.log('showGrid');
    })
    .on('hideGrid', function() {
      console.log('hideGrid');
    })
    .on('selectPanel', function(e, panelNum) {
      console.log('selected panel', panelNum);
    })
    .on('collapsePanel', function(panelNum) {
      console.log('collapsed panel');
    })
    .on('expandPanel', function(panelNum) {
      console.log('expanded panel');
    })

});
