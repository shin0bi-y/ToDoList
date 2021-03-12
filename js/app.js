// App logic.
window.myApp = {};

document.addEventListener('init', function(event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  if (page.id === 'menuPage' || page.id === 'pendingTasksPage') {

    if (document.querySelector('#menuPage') && document.querySelector('#pendingTasksPage') && !document.querySelector('#pendingTasksPage ons-list-item'))
    {
      /*
      myApp.services.fixtures.forEach(function(data) {
        myApp.services.tasks.create(data);
      });*/

      
      for(let key in window.localStorage){
        if(!key.startsWith('item:')) continue;

        let task = JSON.parse(window.localStorage.getItem(key));
        console.log(key + " " + task)
        myApp.services.tasks.create(task);
      }
      /*
      window.localStorage.forEach(key => {
        let task = JSON.parse(window.localStorage.getItem(key));
        myApp.services.tasks.create(task);
      });*/

    }
  }
});
