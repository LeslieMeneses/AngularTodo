# AngularJS Tutorial

* Estructura de la aplicación
* Data Binding
* Controladores
* Directivas
* Servicios

# Estructura de la aplicación

```
todomvc
|--app
|----directives
|----layout
|----services
|----todo
|--index.html
```

1. Crear el archivo package.json en la raíz de la aplicación y ejecutar npm install.

```
{
  "private": true,
  "scripts": {
    "test": "karma start test/config/karma.conf.js",
    "start": "http-server -a localhost -p 3000 -c-1"
  },
  "dependencies": {
    "angular": "^1.4.3",
    "angular-resource": "^1.4.3",
    "angular-route": "^ 1.4.3",
    "http-server": "^0.9.0",
    "todomvc-app-css": "^1.0.1",
    "todomvc-common": "^1.0.0"
  },
  "devDependencies": {
    "angular-mocks": "^1.3.12",
    "karma": "^0.10.0"
  }
}
```

2. Crear el archivo index.html en la raíz de la aplicación.

```
<!doctype html>
<html lang="en" data-framework="angularjs">

<head>
    <meta charset="utf-8">
    <title>AngularJS • TodoMVC</title>
    <link rel="stylesheet" href="node_modules/todomvc-common/base.css">
    <link rel="stylesheet" href="node_modules/todomvc-app-css/index.css">
    <style>
        [ng-cloak] {
            display: none;
        }
    </style>
</head>

<body ng-app="todomvc">
    <ng-view />

    <script src="node_modules/todomvc-common/base.js"></script>
    <script src="node_modules/angular/angular.js"></script>
    <script src="node_modules/angular-route/angular-route.js"></script>
    <script src="node_modules/angular-resource/angular-resource.js"></script>
    <script src="app/app.js"></script>
    <script src="app/todo/todo.controller.js"></script>
    <script src="app/services/storage.service.js"></script>
    <script src="app/services/api.service.js"></script>
    <script src="app/services/localstorage.service.js"></script>
    <script src="app/directives/focus.directive.js"></script>
    <script src="app/directives/escape.directive.js"></script>
</body>

</html>
```

3. Crear el archivo app.js dentro del directorio app.

```
/*global angular */

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
(function () {
    'use strict';

    angular.module('todomvc', [
        'ngRoute',
        'ngResource'
    ]).config(function ($routeProvider) {
        'use strict';

        var routeConfig = {
            controller: 'TodoController',
            controllerAs: 'vm',
            templateUrl: './app/layout/index.html',
            resolve: {
                store: function (Storage) {
                    // Get the correct module (API or localStorage).
                    return Storage.then(function (module) {
                        module.get(); // Fetch the todo records in the background.
                        return module;
                    });
                }
            }
        };

        $routeProvider
            .when('/', routeConfig)
            .when('/:status', routeConfig)
            .otherwise({
                redirectTo: '/'
            });
    });
})();
```

4. Crear el archivo index.html dentro del directorio app/layout.
```
<section id="todoapp">
    <header id="header">
        <h1>todos</h1>
        <form id="todo-form" ng-submit="vm.addTodo()">
            <input id="new-todo" placeholder="What needs to be done?" ng-model="vm.newTodo" ng-disabled="vm.saving" autofocus>
        </form>
    </header>
    <section id="main" ng-show="vm.todos.length" ng-cloak>
        <input id="toggle-all" type="checkbox" ng-model="vm.allChecked" ng-click="vm.markAll(vm.allChecked)">
        <label for="toggle-all">Mark all as complete</label>
        <ul id="todo-list">
            <li ng-repeat="todo in vm.todos | filter:vm.statusFilter track by $index" ng-class="{completed: todo.completed, editing: todo == vm.editedTodo}">
                <div class="view">
                    <input class="toggle" type="checkbox" ng-model="todo.completed" ng-change="vm.toggleCompleted(todo)">
                    <label ng-dblclick="vm.editTodo(todo)">{{todo.title}}</label>
                    <button class="destroy" ng-click="vm.removeTodo(todo)"></button>
                </div>
                <form ng-submit="vm.saveEdits(todo, 'submit')">
                    <input class="edit" ng-trim="false" ng-model="todo.title" todo-escape="vm.revertEdits(todo)" ng-blur="vm.saveEdits(todo, 'blur')"
                        todo-focus="todo == vm.editedTodo">
                </form>
            </li>
        </ul>
    </section>
    <footer id="footer" ng-show="vm.todos.length" ng-cloak>
        <span id="todo-count"><strong>{{vm.remainingCount}}</strong>
                        <ng-pluralize count="vm.remainingCount" when="{ one: 'item left', other: 'items left' }"></ng-pluralize>
                    </span>
        <ul id="filters">
            <li>
                <a ng-class="{selected: vm.status == ''} " href="#/">All</a>
            </li>
            <li>
                <a ng-class="{selected: vm.status == 'active'}" href="#/active">Active</a>
            </li>
            <li>
                <a ng-class="{selected: vm.status == 'completed'}" href="#/completed">Completed</a>
            </li>
        </ul>
        <button id="clear-completed" ng-click="vm.clearCompletedTodos()" ng-show="vm.completedCount">Clear completed</button>
    </footer>
</section>
<footer id="info">
    <p>Double-click to edit a todo</p>
    <p>Credits:
        <a href="http://twitter.com/cburgdorf">Christoph Burgdorf</a>,
        <a href="http://ericbidelman.com">Eric Bidelman</a>,
        <a href="http://jacobmumm.com">Jacob Mumm</a> and
        <a href="http://blog.igorminar.com">Igor Minar</a>
    </p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
</footer>
```

5. Crear ek controlador de la aplicación dentro del directorio app/todo.

```
/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */

(function () {
    'use strict';

    angular
        .module('todomvc')
        .controller('TodoController', TodoController);

    TodoController.$inject = ['$scope', '$routeParams', '$filter', 'store'];
    function TodoController($scope, $routeParams, $filter, store) {
        var vm = this;

        'use strict';

        var todos = vm.todos = store.todos;

        vm.newTodo = '';
        vm.editedTodo = null;

        $scope.$watch('todos', function () {
            vm.remainingCount = $filter('filter')(todos, { completed: false }).length;
            vm.completedCount = todos.length - vm.remainingCount;
            vm.allChecked = !vm.remainingCount;
        }, true);

        // Monitor the current route for changes and adjust the filter accordingly.
        $scope.$on('$routeChangeSuccess', function () {
            var status = vm.status = $routeParams.status || '';
            vm.statusFilter = (status === 'active') ?
                { completed: false } : (status === 'completed') ?
                    { completed: true } : {};
        });

        vm.addTodo = function () {
            var newTodo = {
                title: vm.newTodo.trim(),
                completed: false
            };

            if (!newTodo.title) {
                return;
            }

            vm.saving = true;
            store.insert(newTodo)
                .then(function success() {
                    vm.newTodo = '';
                })
                .finally(function () {
                    vm.saving = false;
                });
        };

        vm.editTodo = function (todo) {
            vm.editedTodo = todo;
            // Clone the original todo to restore it on demand.
            vm.originalTodo = angular.extend({}, todo);
        };

        vm.saveEdits = function (todo, event) {
            // Blur events are automatically triggered after the form submit event.
            // This does some unfortunate logic handling to prevent saving twice.
            if (event === 'blur' && vm.saveEvent === 'submit') {
                vm.saveEvent = null;
                return;
            }

            vm.saveEvent = event;

            if (vm.reverted) {
                // Todo edits were reverted-- don't save.
                vm.reverted = null;
                return;
            }

            todo.title = todo.title.trim();

            if (todo.title === vm.originalTodo.title) {
                vm.editedTodo = null;
                return;
            }

            store[todo.title ? 'put' : 'delete'](todo)
                .then(function success() { }, function error() {
                    todo.title = vm.originalTodo.title;
                })
                .finally(function () {
                    vm.editedTodo = null;
                });
        };

        vm.revertEdits = function (todo) {
            todos[todos.indexOf(todo)] = vm.originalTodo;
            vm.editedTodo = null;
            vm.originalTodo = null;
            vm.reverted = true;
        };

        vm.removeTodo = function (todo) {
            store.delete(todo);
        };

        vm.saveTodo = function (todo) {
            store.put(todo);
        };

        vm.toggleCompleted = function (todo, completed) {
            if (angular.isDefined(completed)) {
                todo.completed = completed;
            }
            store.put(todo, todos.indexOf(todo))
                .then(function success() { }, function error() {
                    todo.completed = !todo.completed;
                });
        };

        vm.clearCompletedTodos = function () {
            store.clearCompleted();
        };

        vm.markAll = function (completed) {
            todos.forEach(function (todo) {
                if (todo.completed !== completed) {
                    vm.toggleCompleted(todo, completed);
                }
            });
        };

        activate();

        ////////////////

        function activate() { }
    }
})();
```

6. Crear los servicios dentro del directorio app/services: api.service.js, 
localstorage.service.js, storage.service.js.

### api.service.js
```
(function () {
    'use strict';

    angular
        .module('todomvc')
        .factory('Api', Api);

    Api.$inject = ['$resource'];
    function Api($resource) {
        var service = {
            todos: [],

            api: $resource('/api/todos/:id', null,
                {
                    update: { method: 'PUT' }
                }
            ),

            clearCompleted: function () {
                var originalTodos = store.todos.slice(0);

                var incompleteTodos = store.todos.filter(function (todo) {
                    return !todo.completed;
                });

                angular.copy(incompleteTodos, store.todos);

                return store.api.delete(function () {
                }, function error() {
                    angular.copy(originalTodos, store.todos);
                });
            },

            delete: function (todo) {
                var originalTodos = store.todos.slice(0);

                store.todos.splice(store.todos.indexOf(todo), 1);
                return store.api.delete({ id: todo.id },
                    function () {
                    }, function error() {
                        angular.copy(originalTodos, store.todos);
                    });
            },

            get: function () {
                return store.api.query(function (resp) {
                    angular.copy(resp, store.todos);
                });
            },

            insert: function (todo) {
                var originalTodos = store.todos.slice(0);

                return store.api.save(todo,
                    function success(resp) {
                        todo.id = resp.id;
                        store.todos.push(todo);
                    }, function error() {
                        angular.copy(originalTodos, store.todos);
                    })
                    .$promise;
            },

            put: function (todo) {
                return store.api.update({ id: todo.id }, todo)
                    .$promise;
            }
        };

        return service;

        ////////////////
        function exposedFn() { }
    }
})();
```

### localstorage.service.js
```
(function () {
    'use strict';

    angular
        .module('todomvc')
        .factory('LocalStorage', LocalStorage);

    LocalStorage.$inject = ['$q'];
    function LocalStorage($q) {
        var STORAGE_ID = 'todos-angularjs';

        var service = {
            todos: [],

            _getFromLocalStorage: function () {
                return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            },

            _saveToLocalStorage: function (todos) {
                localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            },

            clearCompleted: function () {
                var deferred = $q.defer();

                var incompleteTodos = service.todos.filter(function (todo) {
                    return !todo.completed;
                });

                angular.copy(incompleteTodos, service.todos);

                service._saveToLocalStorage(service.todos);
                deferred.resolve(service.todos);

                return deferred.promise;
            },

            delete: function (todo) {
                var deferred = $q.defer();

                service.todos.splice(service.todos.indexOf(todo), 1);

                service._saveToLocalStorage(service.todos);
                deferred.resolve(service.todos);

                return deferred.promise;
            },

            get: function () {
                var deferred = $q.defer();

                angular.copy(service._getFromLocalStorage(), service.todos);
                deferred.resolve(service.todos);

                return deferred.promise;
            },

            insert: function (todo) {
                var deferred = $q.defer();

                service.todos.push(todo);

                service._saveToLocalStorage(service.todos);
                deferred.resolve(service.todos);

                return deferred.promise;
            },

            put: function (todo, index) {
                var deferred = $q.defer();

                service.todos[index] = todo;

                service._saveToLocalStorage(service.todos);
                deferred.resolve(service.todos);

                return deferred.promise;
            }
        };

        return service;

        ////////////////
        function exposedFn() { }
    }
})();
```

### storage.service.js
```
(function () {
    'use strict';

    angular
        .module('todomvc')
        .factory('Storage', Storage);

    Storage.$inject = ['$http', '$injector'];
    function Storage($http, $injector) {
        // Detect if an API backend is present. If so, return the API module, else
        // hand off the localStorage adapter
        return $http.get('/api')
            .then(function () {
                return $injector.get('api');
            }, function () {
                return $injector.get('LocalStorage');
            });
    }
})();
```

7. Crear las directivas dentro del directorio app/directives: escape.directive.js,
focus.directive.js

escape.directive.js
```
(function () {
    'use strict';

    angular
        .module('todomvc')
        .directive('todoEscape', todoEscape);

    todoEscape.$inject = [];
    function todoEscape() {
        // Usage:
        //
        // Creates:
        //
        var ESCAPE_KEY = 27;

        var directive = {
            bindToController: true,
            controller: TodoEscapeController,
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            element.bind('keydown', function (event) {
                if (event.keyCode === ESCAPE_KEY) {
                    scope.$apply(attrs.todoEscape);
                }
            });

            scope.$on('$destroy', function () {
                element.unbind('keydown');
            });
        }
    }
    /* @ngInject */
    function TodoEscapeController() {
    }
})();
```

focus.directive.js
```
(function() {
    'use strict';

    angular
        .module('todomvc')
        .directive('todoFocus', todoFocus);

    todoFocus.$inject = ['$timeout'];
    function todoFocus($timeout) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: TodoFocusController,
            link: link,
            restrict: 'A'
        };
        return directive;
        
        function link(scope, element, attrs) {
            scope.$watch(attrs.todoFocus, function (newVal) {
                if (newVal) {
                    $timeout(function () {
                        element[0].focus();
                    }, 0, false);
                }
            });
        }
    }
    /* @ngInject */
    function TodoFocusController () {
    }
})(); 
```
