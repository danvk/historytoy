// History management service.
var History = function() {
  this.states = [];

  var that = this;
  $(window).on('popstate', function(e) {
    that.handlePopState(e.originalEvent.state);
  });

  // Create an artificial initial state
  if (!history.state) {
    this.replaceState({initial: true}, document.title, document.location.href);
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
    id: Date.now() + '' + Math.floor(Math.random() * 100000)
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
  console.log('handlePopState', state);
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
  if (numBack) {
    history.go(-numBack);
  }
  return numBack;
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

h = new History();



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
    .on('popstate', function(e) {
      var state = e.originalEvent.state;
      console.log('popstate fired', state);
    });

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

});
