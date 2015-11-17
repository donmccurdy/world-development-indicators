"use strict";angular.module("wdiApp",["ngAnimate","ngCookies","ngMaterial","ngResource","ngRoute","ngSanitize","ngTouch","chart.js"]).constant("ACTIONS",{TOPIC_UPDATE:"topic-update",COUNTRY_SET_SELECTED:"country-set-selected",COUNTRY_UPDATE:"country-update",COUNTRY_SELECT:"country-select",COUNTRY_DESELECT:"country-deselect",INDICATOR_SELECT:"indicator-select",INDICATOR_DESELECT:"indicator-deselect"}).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"about"}).otherwise({redirectTo:"/"})}]).config(["$mdThemingProvider",function(a){a.definePalette("sage",a.extendPalette("teal",{500:"75B5AA"})),a.theme("default").primaryPalette("sage")}]).config(function(){Parse.initialize("1HjpKS0k6054RdvGjmEwFtCbglfycTkTIqd1k22y","BTXQ11uqQEtihjZAIGMxUr8ZSdVJKXn8KadbC0iJ")}),angular.module("wdiApp").controller("MainCtrl",["$scope","SelectionStore","ACTIONS",function(a,b,c){a.countries=b.countries(),a.indicators=b.indicators(),a.remove=function(a){b.getDispatcher().dispatch({actionType:c.INDICATOR_DESELECT,indicator:a})};var d=[b.addListener(function(){a.countries=b.countries(),a.indicators=b.indicators()})];a.$on("$destroy",function(){_.forEach(d,function(a){a.remove()})})}]),angular.module("wdiApp").controller("AboutCtrl",function(){}),angular.module("wdiApp").factory("dispatcher",function(){return new Flux.Dispatcher}),angular.module("wdiApp").controller("NavigationCtrl",["$scope","$location","$timeout","$mdSidenav",function(a,b,c,d){a.toggleNavigation=_.debounce(function(){c(function(){d("navigation").toggle()})},200),a.isActive=function(a){return a===b.path()},a.openMenu=function(a,b){a(b)}}]),angular.module("wdiApp").factory("Store",["$timeout","dispatcher",function(a,b){var c=function(){this.__callbacks=[],this.__type="Store"};return c.prototype.init=function(){this.dispatchToken=b.register(this.__handler.bind(this))},c.prototype.addListener=function(a){return this.__callbacks.push(a),this.__createToken(a)},c.prototype.getDispatcher=function(){return b},c.prototype.__handler=function(){throw new Error("Store::__handler() not implemented.")},c.prototype.__emitChange=function(){var b=this.__callbacks;a(function(){b.forEach(function(a){a()})})},c.prototype.__createToken=function(a){var b=this.__callbacks;return{remove:function(){_.pull(b,a)}}},c}]),angular.module("wdiApp").factory("TopicStore",["Store","ACTIONS",function(a,b){var c=Parse.Object.extend("Topic"),d=function(){a.call(this),this.__type="TopicStore",this.__topics=[],this.init()};d.prototype=new a,d.constructor=d,d.prototype.__handler=function(a){switch(a.actionType){case b.TOPIC_UPDATE:this.__topics=a.topics;break;default:return}this.__emitChange()},d.prototype.get=function(a){return this.__topics[a]},d.prototype.all=function(){return _.values(this.__topics)};var e=new d,f=new Parse.Query(c);return f.find().then(function(a){e.getDispatcher().dispatch({actionType:b.TOPIC_UPDATE,topics:a})}).fail(console.error.bind(console)),e}]),angular.module("wdiApp").factory("CountryStore",["Store","ACTIONS",function(a,b){var c=Parse.Object.extend("Country"),d=300,e=function(){a.call(this),this.__type="CountryStore",this.__countries={},this.init()};e.prototype=new a,e.constructor=e,e.prototype.__handler=function(a){switch(a.actionType){case b.COUNTRY_UPDATE:this.__countries=_.indexBy(a.countries,"attributes.key");break;default:return}this.__emitChange()},e.prototype.get=function(a){return this.__countries[a]},e.prototype.getByIso2Code=function(a){return _.find(this.__countries,function(b){return b.attributes.iso2Code===a})},e.prototype.all=function(){return _.values(this.__countries)};var f=new e,g=new Parse.Query(c);return g.limit(d).find().then(function(a){f.getDispatcher().dispatch({actionType:b.COUNTRY_UPDATE,countries:_(a).filter("attributes.location").sortBy("attributes.name").value()}),f.getDispatcher().dispatch({actionType:b.COUNTRY_SET_SELECTED,selected:[f.get("USA"),f.get("CAN")]})}).fail(console.error.bind(console)),f}]),angular.module("wdiApp").factory("IndicatorStore",["Store",function(a){var b=Parse.Object.extend("Indicator"),c=1e3,d=function(){a.call(this),this.__type="IndicatorStore",this.__indicators={},this.__topics={},this.init()};return d.prototype=new a,d.constructor=d,d.prototype.__handler=function(a){switch(a.actionType){default:return}this.__emitChange()},d.prototype.get=function(a){if(a in this.__indicators)return Parse.Promise.as(this.__indicators[a]);var c=new Parse.Query(b);return c.equalTo("key",a).find().then(function(b){return this.__indicators[a]=_.first(b),this.__indicators[a]}.bind(this)).fail(console.error.bind(console))},d.prototype.getByTopic=function(a){if(a.get("key")in this.__topics)return Parse.Promise.as(this.__topics[a.get("key")]);var d=new Parse.Query(b);return d.containsAll("topics",[a]).limit(c).find().then(function(b){return this.__topics[a.get("key")]=b,b}.bind(this)).fail(console.error.bind(console))},new d}]),angular.module("wdiApp").factory("SelectionStore",["Store","IndicatorStore","CountryStore","ACTIONS",function(a,b,c,d){var e=function(){a.call(this),this.__type="SelectionStore",this.__countries=[],this.__indicators=[],this.init()};return e.prototype=new a,e.constructor=e,e.prototype.__handler=function(a){switch(a.actionType){case d.COUNTRY_SET_SELECTED:this.__countries=a.selected;break;case d.COUNTRY_SELECT:this.__countries.push(a.country);break;case d.COUNTRY_DESELECT:_.remove(this.__countries,a.country);break;case d.INDICATOR_SELECT:this.__indicators.push(a.indicator);break;case d.INDICATOR_DESELECT:_.remove(this.__indicators,a.indicator);break;default:return}this.__emitChange()},e.prototype.countries=function(){return this.__countries},e.prototype.indicators=function(){return this.__indicators},new e}]),angular.module("wdiApp").controller("SidebarCtrl",["$scope","TopicStore","CountryStore","IndicatorStore","SelectionStore","ACTIONS",function(a,b,c,d,e,f){a.countries=c.all(),a.topics=b.all(),a.indicators=[],a.selectedCountries=e.countries(),a.selectedTopic=null,a.selectedIndicator=null,a.selectedType="line",a.onCountryChange=function(){c.getDispatcher().dispatch({actionType:f.COUNTRY_SET_SELECTED,selected:a.selectedCountries})},a.clearCountries=function(){c.getDispatcher().dispatch({actionType:f.COUNTRY_SET_SELECTED,selected:[]})},a.onTopicChange=function(){d.getByTopic(a.selectedTopic).then(function(b){a.indicators=b})},a.onCreate=function(){e.getDispatcher().dispatch({actionType:f.INDICATOR_SELECT,indicator:a.selectedIndicator})};var g=[b.addListener(function(){a.topics=b.all()}),c.addListener(function(){a.countries=c.all()}),e.addListener(function(){a.selectedCountries=e.countries()})];a.$on("$destroy",function(){_.forEach(g,function(a){a.remove()})})}]),angular.module("wdiApp").directive("indicatorChart",function(){return{template:'<h2 class="md-title">{{ indicator.attributes.name }}</h2><canvas class="chart chart-line"chart-data="data"chart-labels="labels"chart-series="series"chart-legend="true"chart-options="{scaleBeginAtZero: true,scaleShowVerticalLines: false}"></canvas><blockquote class="indicator-notes">{{ indicator.attributes.sourceNote }}</blockquote><p class="indicator-source">{{ indicator.attributes.sourceOrganization }}</p>',restrict:"E",scope:{indicator:"="},controller:"IndicatorChartCtrl"}}),angular.module("wdiApp").controller("IndicatorChartCtrl",["$scope","$attrs","$timeout","CountryStore","SelectionStore",function(a,b,c,d,e){var f=Parse.Object.extend("IndicatorCountrySeries");a.countries=e.countries(),a.series=[],a.data=[],a.labels=[];var g=function(){return _.isEmpty(a.countries)?void(a.series=a.data=a.labels=[]):void new Parse.Query(f).equalTo("indicatorKey",a.indicator.get("key")).containedIn("countryKey",_.pluck(a.countries,"attributes.iso2Code")).find().then(function(b){c(function(){var c=function(a,b){return b%5===0};_.isEmpty(b)||(a.data=_(b).pluck("attributes.series").map(_.curry(_.pluck)(_,"value")).map(_.curry(_.filter)(_,c)).value(),a.labels=_(b[0]).thru(function(a){return a.get("series")}).filter(c).pluck("date").value(),a.series=_(b).pluck("attributes.countryKey").map(d.getByIso2Code,d).pluck("attributes.name").value())})}).fail(console.error.bind(console))};_.isEmpty(e.countries())||g();var h=[e.addListener(function(){var b=_.pluck(a.countries,"attributes.key"),c=_.pluck(e.countries(),"attributes.key");_.isEqual(b,c)||(a.countries=e.countries(),g())})];a.$on("$destroy",function(){_.forEach(h,function(a){a.remove()})})}]),angular.module("wdiApp").run(["$templateCache",function(a){a.put("views/about.html","<p>This is the about view.</p>"),a.put("views/main.html",'<md-card class="indicator-card" ng-if="countries.length" ng-repeat="indicator in indicators"> <md-card-content> <indicator-chart indicator="indicator"></indicator-chart> <md-button class="indicator-x md-icon-button" ng-click="remove(indicator)" aria-label="Favorite"> <md-icon md-svg-icon="images/icons/clear.addfce46.svg"></md-icon> </md-button> </md-card-content> </md-card> <div ng-if="!indicators.length || !countries.length" class="row placeholder md-display-1"> <md-icon class="placeholder-icon" md-svg-icon="images/icons/equalizer.19b1e365.svg"></md-icon> <span ng-if="!countries.length">Select a country.</span> <span ng-if="countries.length && !indicators.length">Create a visualization.</span> </div>'),a.put("views/sidebar.html",'<div ng-controller="SidebarCtrl"> <md-toolbar class="md-theme-indigo"> <h1 class="md-toolbar-tools">Countries</h1> </md-toolbar> <md-content layout-padding> <md-input-container class="md-input-container"> <label>Country</label> <md-select ng-model="selectedCountries" ng-change="onCountryChange()" ng-model-options="{trackBy: \'$value.attributes.key\'}" multiple aria-label="Select country"> <md-option ng-repeat="country in countries" ng-value="country"> {{ country.get(\'name\') }} </md-option> </md-select> </md-input-container> <md-button class="right md-primary" ng-click="clearCountries()">Clear</md-button> </md-content> <md-toolbar class="md-theme-indigo"> <h1 class="md-toolbar-tools">Create Visualization</h1> </md-toolbar> <md-content layout-padding> <md-input-container class="md-input-container md-create-group"> <label>Topic</label> <md-select ng-model="selectedTopic" ng-change="onTopicChange()" ng-model-options="{trackBy: \'$value.attributes.key\'}" aria-label="Select topic"> <md-option ng-repeat="topic in topics" ng-value="topic"> {{ topic.get(\'value\') }} </md-option> </md-select> </md-input-container> <div class="md-create-group" ng-show="selectedTopic && !indicators.length"> <md-progress-linear md-mode="indeterminate"></md-progress-linear> </div> <md-input-container class="md-input-container md-create-group" ng-show="indicators.length"> <label>Indicator</label> <md-select ng-model="selectedIndicator" aria-label="Select indicator"> <md-option ng-repeat="indicator in indicators" ng-value="indicator"> {{ indicator.get(\'name\') }} </md-option> </md-select> </md-input-container> <div ng-if="selectedIndicator" class="md-subhead">Description</div> <div ng-if="selectedIndicator" class="md-caption md-scroll-caption md-create-group"> <p>{{ selectedIndicator.get(\'sourceNote\') }}</p> <p><i>{{ selectedIndicator.get(\'sourceOrganization\') }}</i></p> </div> <div class="md-create-group"> <div class="md-subhead">Chart type</div> <md-radio-group ng-model="selectedType"> <md-radio-button value="line" class="md-primary" ng-selected="true">Line</md-radio-button> <md-radio-button value="bar" class="md-primary" disabled>Bar</md-radio-button> <md-radio-button value="pie" class="md-primary" disabled>Pie</md-radio-button> </md-radio-group> </div> <md-button class="md-raised md-primary right" ng-click="onCreate()" aria-label="Create"> <md-icon md-svg-src="images/icons/add.22545845.svg"></md-icon> </md-button> </md-content> </div>')}]);