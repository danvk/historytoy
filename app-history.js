// In the event that the initial page has a hash fragment (perhaps the user
// opened the link from an email or tweet), then this converts it to a state
// object.
var panelRe = /#p:(\d+)/;
function hashToState(hash) {
  var m;
  if (hash == '') {
    return {initial: true};
  } else if (hash == '#g') {
    return {grid: true};
  } else if (m = panelRe.exec(hash)) {
    return {panel: true, panelNum: m[1]};
  }
}

// This should go in the $(function()) block below.
// It's exposed to facilitate debugging.
h = new History(hashToState);

// TODO: consider adding stateToHash and stateToTitle functions to History
// object. Combining these seems to be a common pattern.

$(function() {
  // These are events raised by the UI code.
  // These handlers shape the history in response to the UI events.
  $(window)
    .on('showGrid', function() {
      h.pushState({grid:true}, 'Toy App - grid', '/#g');
    })
    .on('hideGrid', function() {
      h.goBackUntil('initial', [{initial:true}, 'Toy App', '/']);
    })
    .on('expandPanel', function() {
      h.pushState({panel:true}, 'Toy App - panel', '/#p');
    })
    .on('collapsePanel', function() {
      h.goBackUntil('grid', [{grid:true}, 'Toy App - grid', '/#g']);
    })
    .on('selectPanel', function(e, panelNum) {
      h.replaceState({
        panel:true,
        panelNum: panelNum
      }, 'Toy App - panel #' + panelNum, '/#p:' + panelNum);
    })

  // Update the UI in response to hitting the back/forward button,
  // a hash fragment on initial page load or the user editing the URL.
  $(h).on('setStateInResponseToUser setStateInResponseToPageLoad',
  function(e, state) {
    // It's important that these methods only configure the UI.
    // They must not trigger events, or they could cause a loop!
    if ('grid' in state) {
      openGrid();
    } else if ('panelNum' in state) {
      openGrid();
      showPanel(state['panelNum']);
    } else if ('initial' in state) {
      closeGrid();
    }
  });

  h.initialize();
});
