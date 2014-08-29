// History management service.
// Consider using this instead: https://github.com/browserstate/history.js
var History = function(hashToStateAdapter) {
  this.states = [];
  this.hashToStateAdapter = hashToStateAdapter;
};

History.prototype.initialize = function() {
  var that = this;
  $(window).on('popstate', function(e) {
    that.handlePopState(e.originalEvent.state);
  });

  // Create an artificial initial state
  if (!history.state) {
    var state = {initial: true};
    var didSetState = false;
    if (this.hashToStateAdapter) {
      // Need to honor any hash fragments that the user navigated to.
      state = this.hashToStateAdapter(document.location.hash);
      didSetState = true;
    }
    this.replaceState(state, document.title, document.location.href);

    if (didSetState) {
      $(this).trigger('setStateInResponseToPageLoad', state);
    }
  }
};

History.prototype.makeState = function(obj) {
  var currentStateId = null;
  if (history.state && 'id' in history.state) {
    currentStateId = history.state.id;
  }
  return $.extend({
    length: history.length,
    previousStateId: currentStateId,
    id: Date.now() + '' + Math.floor(Math.random() * 100000000)
  }, obj);
};
History.prototype.simplifyState = function(obj) {
  var state = $.extend({}, obj);
  delete state['id'];
  // delete state['length'];
  delete state['previousStateId'];
  return state;
};

History.prototype.handlePopState = function(state) {
  // note: we don't remove entries from this.state here, since the user could
  // still go forward to them.
  if (state && 'id' in state) {
    var stateObj = this.states[this.getStateIndexById(state.id)];
    if (stateObj && stateObj.expectingBack) {
      // This is happening as a result of a call on the History object.
      delete stateObj.expectingBack;
      return;
    }
  }

  if (!state && this.hashToStateAdapter) {
    state = this.hashToStateAdapter(document.location.hash);
  }

  $(this).trigger('setStateInResponseToUser', state);
};

History.prototype.pushState = function(stateObj, title, url) {
  var state = this.makeState(stateObj);
  this.states.push(state);
  history.pushState(state, title, url);
  document.title = title;
};
History.prototype.replaceState = function(stateObj, title, url) {
  var curState = this.getCurrentState();
  var replaceIdx = null;
  var previousId = null;
  if (curState) {
    if ('id' in curState) {
      replaceIdx = this.getStateIndexById(curState.id);
    }
    if ('previousStateId' in curState) {
      // in replacing the current state, we inherit its parent state.
      previousId = curState.previousStateId;
    }
  }

  var state = this.makeState(stateObj);
  if (previousId !== null) {
    state.previousStateId = previousId;
  }
  if (replaceIdx !== null) {
    this.states[replaceIdx] = state;
  } else {
    this.states.push(state);
  }
  history.replaceState(state, title, url);
  document.title = title;
}

History.prototype.getCurrentState = function() {
  return history.state;
};

History.prototype.getStateIndexById = function(stateId) {
  for (var i = 0; i < this.states.length; i++) {
    if (this.states[i].id == stateId) return i;
  }
  return null;
};

History.prototype.getPreviousState = function(state) {
  if (!('previousStateId' in state)) return null;
  var id = state['previousStateId'];
  if (id == null) return id;

  var idx = this.getStateIndexById(id);
  if (idx !== null) {
    return this.states[idx];
  }
  throw "State out of whack!";
};

History.prototype.goBackUntil = function(predicate) {
  // Convenience for common case of checking if history state has a key.
  if (typeof(predicate) == "string") {
    return this.goBackUntil(function(state) { return predicate in state });
  }

  var state = this.getCurrentState();
  var numBack = 0;

  while (state && !predicate(state)) {
    state = this.getPreviousState(state);
    numBack += 1;
  }
  if (state && numBack) {
    state.expectingBack = true;
    history.go(-numBack);
    return numBack;
  }
  if (numBack == 0) {
    return 0;  // current state fulfilled predicate
  } else {
    return null;  // no state fulfilled predicate
  }
};

History.prototype.logStack = function() {
  var state = this.getCurrentState();
  var i = 0;
  while (state) {
    console.log((i > 0 ? '-' : ' ') + i, this.simplifyState(state));
    state = this.getPreviousState(state);
    i++;
  }
};

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


h = new History(hashToState);

// An attempt to build history into app.html!
$(function() {

  // Event logging
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

  // History Management
  $(window)
    .on('showGrid', function() {
      h.pushState({grid:true}, 'Toy App - grid', '/#g');
    })
    .on('hideGrid', function() {
      var numBack = h.goBackUntil('initial');
    })
    .on('expandPanel', function() {
      h.pushState({panel:true}, 'Toy App - panel', '/#p');
    })
    .on('collapsePanel', function() {
      var numBack = h.goBackUntil('grid');
    })
    .on('selectPanel', function(e, panelNum) {
      h.replaceState({panel:true, panelNum: panelNum}, 'Toy App - panel #' + panelNum, '/#p:' + panelNum);
    })

  $(h).on('setStateInResponseToUser setStateInResponseToPageLoad', function(e, state) {
    console.log('Setting state in response to user action:', state);
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
