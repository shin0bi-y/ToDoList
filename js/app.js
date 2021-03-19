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
  // page.id === 'menuPage' || page.id === 'pendingTasksPage'
  if (inc === 5) {
    for(let key in window.localStorage){
      if(!key.startsWith('item:')) continue;

      let task = JSON.parse(window.localStorage.getItem(key));
      console.log(key + " " + task)
      myApp.services.tasks.create(task);
    }
  }
});
