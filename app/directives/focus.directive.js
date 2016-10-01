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
