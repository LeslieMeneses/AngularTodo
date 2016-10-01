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