'use strict';

/**
 * @ngdoc function
 * @name wdiApp.controller:IndicatorChartCtrl
 * @description
 * # IndicatorChartCtrl
 * Controller of the wdiApp
 */
angular.module('wdiApp')
  .controller('IndicatorChartCtrl', function ($scope, $attrs, $http, CountryStore, IndicatorStore) {
		var ENDPOINT = 'http://api.worldbank.org/countries/{countries}/indicators/{indicator}';

		/* Chart data
		**************************************/

		$scope.countries = [];
		$scope.series = [];
		$scope.data = [];
		$scope.labels = [];

		/* Render
		**************************************/

		var update = function () {
			$scope.countries = CountryStore.selected();

			if (_.isEmpty($scope.countries)) {
				$scope.series = $scope.data = $scope.labels = [];
				return;
			}

			IndicatorStore.get($scope.chartIndicator).then(function (indicator) {
				$scope.indicator = indicator;
			});

			var endpoint = ENDPOINT
				.replace('{countries}', _.pluck($scope.countries, 'attributes.key').join(';'))
				.replace('{indicator}', $scope.chartIndicator);

			$http.jsonp(endpoint, {
				params: {format: 'jsonp', per_page: 100, prefix: 'JSON_CALLBACK'}
			})
				.then(function (response) {
					var series = _(response.data[1])
						.filter('value')
						.filter(function (row) { return row.date % 5 === 0; })
						.sortBy('date')
						.groupBy('country.id')
						.value();

					$scope.series = _.map(series, function (country, key) {
						return CountryStore.getByIso2Code(key).get('name');
					});
					$scope.data = _.map(series, function (rows) {
						return _.map(_.pluck(rows, 'value'), Number);
					});
					$scope.labels = _.pluck(_.values(series)[0], 'date');
				})
				.catch(console.error.bind(console));
		};

		if (!_.isEmpty(CountryStore.selected())) {
			update();
		}

		/* Store bindings
		**************************************/

		var tokens = [
			CountryStore.addListener(update)
		];

		$scope.$on('$destroy', function () {
			_.forEach(tokens, function (token) {
				token.remove();
			});
		});
  });
