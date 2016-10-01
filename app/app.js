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
