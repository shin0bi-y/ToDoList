// App logic.
window.myApp = {};


let inc = 0;

document.addEventListener('init', function(event) {
  let page = event.target;

  inc++;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }


  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  if (inc === 6) {

    myApp.controllers.displaySort();

    myApp.controllers.listenersAdd();

  }
});
