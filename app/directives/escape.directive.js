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