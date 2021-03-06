Stats.directive('bbpStatsUpdateView', [
  '$scope',
  '$log',
  function($log, $scope) {
    return {
      restrict: 'E',
      templateUrl: './scripts/module/stats/template/stats.update.html'
    }

  }
]);
Stats.directive('bbpStatsHitterHistory', [
  '$timeout',
  '$log',
  '$filter',
  function($timeout, $log, $filter) {
    return {
      restrict: 'E',
      controller: [
        '$scope',
        '$log',
        'StatsServices',
        function($scope, $log, StatsServices) {
          $scope.hitterHistory = [];
          $scope.currentHistory = [];
          $scope.updatedHitterHistory = [];
          $scope.currentPlayerHistory = [];
          $scope.highestTotal = 0;
          $scope.getAllHittersHistory = function(isAll) {



            $scope.sortDir = {};
            $scope.sortDir['name'] = true;
            $scope.sortDir['r'] = true;
            $scope.sortDir['h'] = true;
            $scope.sortDir['hr'] = true;
            $scope.sortDir['rbi'] = true;
            $scope.sortDir['sb'] = true;
            $scope.sortDir['total'] = true;
            $scope.sortDir['aggregate'] = true;
            $scope.sortDir['lastUpdate'] = true;
            $scope.isReverse = function(colName) {
              return $scope.sortDir[colName] = !$scope.sortDir[colName];
            };
            $scope.sortEntities = function(colName) {
              $scope.updatedHitterHistory = $filter('orderBy')($scope.updatedHitterHistory, colName, $scope.isReverse(colName));
            };


            var filter = {};
            if (!isAll) {
              var d = new Date();
              d.setDate(d.getDate()-4);
              //{"where": {"lastUpdate": {"gt": 1459955268314}}}
              filter = {
                filter: { where: { lastUpdate: { gt : d.getTime()} } }
              };
            }
            $scope.getPlayerHistory = function(player) {
              if (player && player.mlbid) {
                var filter = {
                  filter: { where: { mlbid: player.mlbid } }
                };
                var playerHistory = StatsServices.getBatterHistory(filter)
                  .then(function(response) {
                    $log.debug('batter history', response);
                    $timeout(function() {
                      $scope.currentPlayerHistory = response;
                    }, 50);

                    //return response;
                  });

                //$log.debug('Player History', playerHistory);
                //returnArray.map(function(playerUpdate) {
                //  if (playerUpdate.name === player.name) {
                //    playerUpdate.history = playerHistory;
                //  }
                //
                //});

              }
            //  $scope.updatedHitterHistory = returnArray;
            };

            $scope.hitterHistory = StatsServices.getBatterHistory(filter)
              .then(function(response) {
                $log.debug('hitter history', response);



                response.map(function(update) {
                  update.total = parseFloat(update.total);
                  update.r = parseFloat(update.r);
                  update.h = parseFloat(update.h);
                  update.hr = parseFloat(update.hr);
                  update.rbi = parseFloat(update.rbi);
                  update.sb = parseFloat(update.sb);
                  if (parseFloat(update.total) > parseFloat($scope.highestTotal)) {
                    $scope.highestTotal = update.total;
                  }

                  update.lastUpdate = moment(update.lastUpdate).format('mm-dd'); // d.timestamp is from the data
                });

                response = $filter('orderBy')(response, 'total', true);
                $scope.hitterHistory = response;


                $scope.updatedHitterHistory = StatsServices.calculateDeltaPoints(response);

               // $scope.updatedHitterHistory = $filter('orderBy')(xresponse, 'deltaTotal', true);

                //return response;
              });

          };
        }
      ],
      link: function(scope, el, attrs) {
        scope.$watch('updatedHitterHistory', function(history, previousHistory) {
          //React.render(HitterHistory, {scope:scope}, el[0]);
          if (history && history.map && history.length > 0) {
            $timeout(function() {
              React.render(React.createElement(HitterHistory, {scope:scope}), el[0]);

            }, 50);

          }

        }, true);

        scope.$watch('currentPlayerHistory', function(history, previousHistory) {
          //React.render(HitterHistory, {scope:scope}, el[0]);
          if (history && history.map && history.length > 0) {
            $timeout(function() {
              history = $filter('orderBy')(history, 'lastUpdate', true);
              var dateRange2 = history[0].lastUpdate;
              var dateRange1 = history[history.length - 1].lastUpdate;
              var total1 = 1;
              var total2 = scope.highestTotal;

              scope.domain = {x: [dateRange1, dateRange2], y: [total1, total2]};
              $log.debug('Player History', history);
              React.render(React.createElement(HitterChart, {scope:scope}), document.getElementById(history[0].mlbid));
              //document.getElementById('formDiv')
            }, 50);

          }

        }, true);

      }
    }
  }
]);
Stats.directive('bbpStatsRList', [
  '$log',
  function($log) {
    return {
      restrict: 'E',
      templateUrl: './scripts/modules/stats/templates/stats.roster.list.html'
    }

  }
]);
Stats.directive('bbpMlbHittersStatsList', [
  '$log',
  function($log) {
    return {
      restrict: 'E',
      templateUrl: './scripts/modules/stats/templates/hitter.list.html',
      link: function(scope, el, attrs) {

      }
    }
  }
]);
Stats.directive('bbpMlbPitchersStatsList', [
  '$log',
  function($log) {
    return {
      restrict: 'E',
      templateUrl: './scripts/modules/stats/templates/pitcher.list.html',
      link: function(scope, el, attrs) {

      }
    }
  }
]);
