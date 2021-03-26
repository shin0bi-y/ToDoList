/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

myApp.services = {

  ascendingSort:true,
  /////////////////
  // Task Service //
  /////////////////
  tasks: {

    // Creates a new task and attaches it to the pending task list.
    create: function(data) {
      // Task item template.
      var taskItem = ons.createElement(
          '<ons-gesture-detector id="detect-area">' +
          '<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category)+ '">' +
          '<label class="left">' +
          '</label>' +
          '<div class="center">' +
          data.title +
          '</div>' +
          '<div class="right">' +
          '<ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>' +
          '</div>' +
          '</ons-list-item>' +
          '</ons-gesture-detector>'
      );

      // Store data within the element.
      taskItem.data = data;

      taskItem.addEventListener("swipeleft", evt => {
        if (taskItem.data.state !== 1) {
          taskItem.data.state --;

          //animation
          myApp.services.animators.swipe(taskItem, function() {
            document.querySelector(myApp.services.tasks.getState(taskItem.data)).appendChild(taskItem);
            myApp.controllers.displaySort();
          }, false);

          //saving
          window.localStorage.setItem("item:" + taskItem.data.title + "-" + taskItem.data.category, JSON.stringify(taskItem.data));
        }
      });

      taskItem.addEventListener("swiperight", evt => {
        if (taskItem.data.state !== 3) {
          taskItem.data.state++;

          //animation
          myApp.services.animators.swipe(taskItem, function() {
            document.querySelector(myApp.services.tasks.getState(taskItem.data)).appendChild(taskItem);
            myApp.controllers.displaySort();
          }, true);

          //saving
          window.localStorage.setItem("item:" + taskItem.data.title + "-" + taskItem.data.category, JSON.stringify(taskItem.data));
        }
      });

      // Add button functionality to remove a task.
      taskItem.querySelector('.right').onclick = function() {
        myApp.services.tasks.remove(taskItem);
      };

      // Add functionality to push 'details_task.html' page with the current element as a parameter.
      taskItem.addEventListener("hold", function() {
        document.querySelector('#myNavigator')
            .pushPage('html/details_task.html',
                {
                  animation: 'lift',
                  data: {
                    element: taskItem
                  }
                }
            );
      });

      // Check if it's necessary to create new categories for this item.
      myApp.services.categories.updateAdd(taskItem.data.category);

      // Add the highlight if necessary.
      if (taskItem.data.highlight) {
        taskItem.classList.add('highlight');
      }

      //list = document.querySelector((data.completed) ? '#completed-list' : '#pending-list');

      // Change the checkbox state
      //taskItem.querySelector("ons-checkbox").checked = data.completed;

      // Set the task's state basing on data.state
      let list = document.querySelector(this.getState(taskItem.data));

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      (taskItem.data.urgent && list.firstChild !== null) ? list.insertBefore(taskItem, list.firstChild) : list.appendChild(taskItem);
    },
    exists: function(task){
      return window.localStorage.getItem("item:" + task.title + "-" + task.category) !== null;
    },

    // Store a task
    store: function(task) {
      if (window.localStorage.getItem("item:" + task.title + "-" + task.category) === null) {
        window.localStorage.setItem("item:" + task.title + "-" + task.category, JSON.stringify(task));
        return true;
      }
      return false;
    },

    getState: function(taskItem) {
      let list;
      switch (taskItem.state) {
        case 1:
          list = "#pending-list"
          break;
        case 2:
          list = "#in-progress-list"
          break;
        case 3:
          list = "#completed-list"
          break;
        default:
          console.log("nan ? : "+taskItem.state);
      }
      return list;
    },

    purge: function () {
      ons.notification.confirm({message: "Are you sure about that ?", callback: function (answer) {
        if (answer)  {
          for (let localStorageKey in window.localStorage) {
            if (localStorageKey.startsWith("item:")) {
              window.localStorage.removeItem(localStorageKey);
            }
          }
          location.reload();
        }
      }});
    },

    // Modifies the inner data and current view of an existing task.
    update: function(taskItem, data) {
      if (data.title !== taskItem.data.title) {
        // Update title view.
        taskItem.querySelector('.center').innerHTML = data.title;
      }

      if (data.category !== taskItem.data.category) {
        // Modify the item before updating categories.
        taskItem.setAttribute('category', myApp.services.categories.parseId(data.category));
        // Check if it's necessary to create new categories.
        myApp.services.categories.updateAdd(data.category);
        // Check if it's necessary to remove empty categories.
        myApp.services.categories.updateRemove(taskItem.data.category);

      }

      // Add or remove the highlight.
      taskItem.classList[data.highlight ? 'add' : 'remove']('highlight');

      window.localStorage.removeItem("item:" + taskItem.data.title + "-" + taskItem.data.category);

      // Store the new data within the element.
      taskItem.data = data;
      this.store(data);
    },

    // Deletes a task item and its listeners.
    remove: function(taskItem) {
      taskItem.removeEventListener('change', taskItem.data.onCheckboxChange);

      myApp.services.animators.remove(taskItem, function() {
        // Remove the item before updating the categories.
        taskItem.remove();
        // Check if the category has no items and remove it in that case.
        myApp.services.categories.updateRemove(taskItem.data.category);
      });
      console.log("suppr : " + taskItem.data.title)
      window.localStorage.removeItem("item:" + taskItem.data.title + "-" + taskItem.data.category);
    }
  },

  /////////////////////
  // Category Service //
  ////////////////////
  categories: {

    // Creates a new category and attaches it to the custom category list.
    create: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);

      // Category item template.
      var categoryItem = ons.createElement(
          '<ons-list-item tappable category-id="' + categoryId + '">' +
          '<div class="left">' +
          '<ons-radio name="categoryGroup" input-id="radio-'  + categoryId + '"></ons-radio>' +
          '</div>' +
          '<label class="center" for="radio-' + categoryId + '">' +
          (categoryLabel || 'No category') +
          '</label>' +
          '</ons-list-item>'
      );

      // Adds filtering functionality to this category item.
      myApp.services.categories.bindOnCheckboxChange(categoryItem);

      // Attach the new category to the corresponding list.
      document.querySelector('#custom-category-list').appendChild(categoryItem);
    },

    // On task creation/update, updates the category list adding new categories if needed.
    updateAdd: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector('#menuPage ons-list-item[category-id="' + categoryId + '"]');

      if (!categoryItem) {
        // If the category doesn't exist already, create it.
        myApp.services.categories.create(categoryLabel);
      }
    },

    // On task deletion/update, updates the category list removing categories without tasks if needed.
    updateRemove: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector('#tabbarPage ons-list-item[category="' + categoryId + '"]');

      if (!categoryItem) {
        // If there are no tasks under this category, remove it.
        myApp.services.categories.remove(document.querySelector('#custom-category-list ons-list-item[category-id="' + categoryId + '"]'));
      }
    },

    // Deletes a category item and its listeners.
    remove: function(categoryItem) {
      if (categoryItem) {
        // Remove listeners and the item itself.
        categoryItem.removeEventListener('change', categoryItem.updateCategoryView);
        categoryItem.remove();
      }
    },

    // Adds filtering functionality to a category item.
    bindOnCheckboxChange: function(categoryItem) {
      var categoryId = categoryItem.getAttribute('category-id');
      var allItems = categoryId === null;

      categoryItem.updateCategoryView = function() {
        var query = '[category="' + (categoryId || '') + '"]';

        var taskItems = document.querySelectorAll('#tabbarPage ons-list-item');
        for (var i = 0; i < taskItems.length; i++) {
          taskItems[i].style.display = (allItems || taskItems[i].getAttribute('category') === categoryId) ? '' : 'none';
        }
      };

      categoryItem.addEventListener('change', categoryItem.updateCategoryView);
    },

    // Transforms a category name into a valid id.
    parseId: function(categoryLabel) {
      return categoryLabel ? categoryLabel.replace(/\s\s+/g, ' ').toLowerCase() : '';
    },

    returnAllCategories: function () {
      let categories = [];
      for (let localStorageKey in window.localStorage) {
        if (localStorageKey.startsWith("item:")) {
          let item = JSON.parse(window.localStorage.getItem(localStorageKey));

          if(!categories.includes(item.category)) categories.push(item.category);
        }
      }
      return categories;
    }
  },

  //////////////////////
  // Animation Service//
  /////////////////////
  animators: {

    // Swipe animation for task completion.
    swipe: function(listItem, callback, right) {
      let animation = right ? "animation-swipe-right" : "animation-swipe-left";

      listItem.querySelector("ons-list-item").classList.add('hide-children');
      listItem.querySelector("ons-list-item").classList.add(animation);

      setTimeout(function() {
        listItem.querySelector("ons-list-item").classList.remove(animation);
        listItem.querySelector("ons-list-item").classList.remove('hide-children');
        callback();
      }, 950);
    },

    // Remove animation for task deletion.
    remove: function(listItem, callback) {
      listItem.querySelector("ons-list-item").classList.add('animation-remove');
      listItem.querySelector("ons-list-item").classList.add('hide-children');

      setTimeout(function() {
        callback();
      }, 750);
    }
  }
};
