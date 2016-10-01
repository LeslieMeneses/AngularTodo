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