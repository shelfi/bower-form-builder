'use strict';

angular.module('shelfiFormBuilder', [])
	.config(["sfFormBuilderProvider", function (sfFormBuilderProvider) {
		sfFormBuilderProvider.add('row', '' + 
			'<div layout="column">' + 
				'<div ng-repeat="item in structure">' + 
					'<sf-form-builder structure="item" ng-model="data" form="form"></sf-form-builder>' + 
				'</div>' + 
			'</div>'
		);
		sfFormBuilderProvider.add('column', '' + 
			'<div layout="row">' + 
				'<div ng-repeat="item in structure">' + 
					'<sf-form-builder structure="item" ng-model="data" form="form"></sf-form-builder>' + 
				'</div>' + 
			'</div>'
		);
		sfFormBuilderProvider.add('inputContainer', '' + 
			'<md-input-container>' + 
				'<label>{{ label }}</label>' + 
				'<sf-input attrs="input" ng-model="data" form="form"></sf-input>' + 
			'</md-input-container>'
		);
		sfFormBuilderProvider.add('lines', '' + 
			'<div>' + 
				'<h2>{{ title }}</h2>' + 
				'<sf-form-builder ng-repeat="item in data[items]" structure="repeat" ng-model="item" form="form"></sf-form-builder>' + 
				'<md-button ng-click="add()">Add</md-button>' + 
				'<md-button ng-click="removeAll()">Remove all</md-button>' + 
			'</div>'
		);
	}])
	.provider('sfFormBuilder', function () {
		var template = {};
		this.add = function (name, tmpl) {
			template[name] = tmpl;
		};
		this.$get = ['$templateCache', function ($templateCache) {
			return {
				getTemplate: function (name) {
					var tmpl = template[name];
					if (!tmpl) {
						tmpl = $templateCache.get(name);
						if(!tmpl) {
							//http://stackoverflow.com/questions/15458876/check-if-a-string-is-html-or-not
							if (/<[a-z][\s\S]*>/i.test(name)) {
								return name;
							}
							throw 'Error: Template not found! Template name: ' + name;
						}
					}
					return tmpl;
				}
			};
		}];
	})
	.directive('sfFormBuilder', ["$compile", "sfFormBuilder", function ($compile, sfFormBuilder) {
		return {
			restrict: 'E',
			scope: {
				structure: '=',
				data: '=ngModel',
				form: '=',
				live: '@'
			},
			link: function (scope, element) {
				var compileTemplate = function (key, val) {
					if (!angular.isObject(val)) {
						//console.log('returned', key, val);
						return;
					}
					//console.log('------------------');
					//console.log(key, val, scope);
					var template = '<sf-input attrs="structure" ng-model="data" form="form"></sf-input>';
					if (key !== 'input') {
						template = sfFormBuilder.getTemplate(key);
					}
					var childScope = scope.$new(true);
					angular.forEach(val, function (scopeVal, scopeKey) {
						childScope[scopeKey] = scopeVal;
					});
					childScope.structure = val;
					childScope.data = scope.data;
					scope.$watch('data', function (v) {
						childScope.data = v;
					}, true);
					childScope.form = scope.form;
					if (key === 'lines') {
						childScope.add = function () {
							childScope.data[val.items].push({});
						};
						childScope.removeAll = function () {
							childScope.data[val.items] = [];
						};
						childScope.remove = function (index) {
							childScope.data[val.items].splice(index, 1);
						};
					}
					var el = angular.element(template);
					element.append(el);
					$compile(el)(childScope);
					//console.log('------------------');
					//console.log('renderrr');
					//console.log(template);
					//console.log(childScope);
				};
				var render = function () {
					element.html('');
					//console.log('====================');
					//console.log(scope.structure);
					angular.forEach(scope.structure, function (structureVal, structureKey) {
						//console.log('------------------------');
						//console.log(structureKey, structureVal);
						if (angular.isArray(structureVal) && structureKey !== 'row' && structureKey !== 'column') {
							angular.forEach(structureVal, function (arrayVal) {
								compileTemplate(structureKey, arrayVal);
							});
						}
						else {
							compileTemplate(structureKey, structureVal);
						}
					});
				};
				if (!scope.live) {
					scope.live = 'false';
				}
				if (scope.live === 'true') {
					scope.$watch('structure', function () {
						render();
					}, true);
				}
				else {
					render();
				}
			}
		};
	}]);
'use strict';

angular.module('shelfiFormBuilder')
	.config(["sfInputProvider", function (sfInputProvider) {
		sfInputProvider.add('text', '<input type="text">');
		sfInputProvider.add('hidden', '<input type="hidden">');
		sfInputProvider.add('password', '<input type="password">');
		sfInputProvider.add('checkbox', '<input type="checkbox">');
		sfInputProvider.add('file', '<input type="file">');
		sfInputProvider.add('email', '<input type="email">');
		sfInputProvider.add('date', '<input type="date">');
		sfInputProvider.add('datetime', '<input type="datetime">');
		sfInputProvider.add('datetimeLocal', '<input type="datetime-local">');
		sfInputProvider.add('month', '<input type="month">');
		sfInputProvider.add('number', '<input type="number">');
		sfInputProvider.add('range', '<input type="range">');
		sfInputProvider.add('search', '<input type="search">');
		sfInputProvider.add('tel', '<input type="tel">');
		sfInputProvider.add('time', '<input type="time">');
		sfInputProvider.add('url', '<input type="url">');
		sfInputProvider.add('week', '<input type="week">');
		sfInputProvider.add('color', '<input type="color">');
		sfInputProvider.add('textarea', '<textarea></textarea>');
		sfInputProvider.add('radio', '<input type="radio">');
		sfInputProvider.add('select', '<select></select>');
		//sfInputProvider.add('select', '<md-select></md-select>');
		//sfInputProvider.add('row', 'asd');
	}])
	.provider('sfInput', function () {
		var input = {};
		this.add = function (name, tmpl) {
			input[name] = tmpl;
		};
		this.$get = function () {
			return {
				getTemplate: function (name) {
					if (!input[name]) {
						throw 'Error: Input not found! Input name: ' + name;
					}
					return input[name];
				},
				getElement: function (attrs) {
					var t = this.getTemplate(attrs.type);
					var c = angular.element('<div />');
					var e = angular.element(t);
					//console.log('-------------------');
					//console.log(attrs);
					angular.forEach(attrs, function (val, key) {
						if (['type', 'multi'].indexOf(key) === -1 && (angular.isString(val) || angular.isFunction(val))) {
							//camelCase to hyphen-case
							//http://stackoverflow.com/questions/8955533/javascript-jquery-split-camelcase-string-and-add-hyphen-rather-than-space
							//http://stackoverflow.com/questions/3673138/javascript-regex-camel-to-file-case
							//str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()
							e.attr(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), angular.isFunction(val) ? 'event_' + key + '()' : val);
						}
						/*
						else if (attrs.name === 'cvc' && angular.isFunction(val)) {
							//console.log('isFunction', key, val);
							//e.bind(key, val);
							e.attr(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), 'event_' + key + '()');
						}
						*/
					});
					c.append(e);
					if (attrs.validationTexts) {
						angular.forEach(attrs.validationTexts, function (val, key) {
							//console.log(key, val);
							var code = angular.element('<code />');
							code.attr('ng-show', 'form.' + attrs.name + '.$error.' + key);
							code.html('{{ "' + val + '" }}'); // TODO: translate filter will be added
							c.append(code);
						});
					}
					return {
						multi: false,
						element: c.children()
					};
				}
			};
		};
	})
	.directive('sfInput', ["$compile", "sfInput", function ($compile, sfInput) {
		return {
			restrict: 'E',
			scope: {
				attrs: '=',
				data: '=ngModel',
				form: '='
			},
			link: function (scope, element) {
				angular.forEach(scope.attrs, function (val, key) {
					if (angular.isFunction(val)) {
						scope['event_' + key] = val;
					}
				});
				var input = sfInput.getElement(scope.attrs);
				element.replaceWith(input.element);
				$compile(input.element)(scope);
			}
		};
	}]);