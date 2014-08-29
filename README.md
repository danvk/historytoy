HTML5 History Toy
==========

This is an attempt to build a single page application with very explicit control of its web history.

The application has three views:

   1. Initial
   2. Grid view
   3. Panel view
   
Transitions between each of these are triggered by buttons. It is possible to transition between any pair.

The navigation stack should always look like the list above, never deeper. It could be shorter, but only
if the user navigates directly to a Panel URL fragment.

The goal is to write straightforward UI code to wire up the buttons and transitions, then to add the history
management without muddying up this code.


history.js
----------

This is the heart of the approach. It's a wrapper around `history.pushState` and `history.replaceState` which
attaches unique IDs to each state. It also attaches links to the previous state, which means that you can never
get lost in the current history stack. This means that you can walk back through the browser history to find out
exactly how many states you want to pop back through.


Demo
----

Run:

    $ python -m SimpleHTTPServer
    
And open `localhost:8000`. You can click the buttons, back/forward and edit the URL however you like.
You shouldn't be able to confuse the app!
