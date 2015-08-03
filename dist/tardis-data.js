(function() {
    'use strict';
    var _get = function get(_x, _x2, _x3) {
        var _again = true;
        _function:
            while (_again) {
                var object = _x,
                    property = _x2,
                    receiver = _x3;
                desc = parent = getter = undefined;
                _again = false;
                if (object === null)
                    object = Function.prototype;
                var desc = Object.getOwnPropertyDescriptor(object, property);
                if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);
                    if (parent === null) {
                        return undefined;
                    } else {
                        _x = parent;
                        _x2 = property;
                        _x3 = receiver;
                        _again = true;
                        continue _function;
                    }
                } else if ('value' in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;
                    if (getter === undefined) {
                        return undefined;
                    }
                    return getter.call(receiver);
                }
            }
    };
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ('value' in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _inherits(subClass, superClass) {
        if (typeof superClass !== 'function' && superClass !== null) {
            throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass)
            Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
    var ParameterSet = function() {
        function ParameterSet(id, name, namespace, isHidden) {
            _classCallCheck(this, ParameterSet);
            this.id = id;
            this.name = name;
            this.namespace = namespace;
            this.isHidden = isHidden;
            this.parameters = [];
        }
        _createClass(ParameterSet, [{
            key: "addParameter",
            value: function addParameter(parameter) {
                if (!(parameter instanceof Parameter)) {
                    throw new TypeError("parameter must be an instance of Parameter");
                }
                parameter._setParent(this);
                this.parameters.push(parameter);
            }
        }, {
            key: "getParameters",
            value: function getParameters() {
                this.parameters.sort(function(a, b) {
                    var x = a.order ? parseInt(a.order) : 9999;
                    var y = b.order ? parseInt(b.order) : 9999;
                    return x - y;
                });
                return this.parameters;
            }
        }]);
        return ParameterSet;
    }();
    var Parameter = function() {
        function Parameter(id, name, fullName, value, units, order, isImmutable, isSearchable) {
            _classCallCheck(this, Parameter);
            this.parent = null;
            this.id = id;
            this.name = name;
            this.fullName = fullName;
            this.value = value;
            this.units = units;
            this.order = order;
            this.isImmutable = isImmutable;
            this.isSearchable = isSearchable;
        }
        _createClass(Parameter, [{
            key: "_setParent",
            value: function _setParent(parent) {
                if (!(parent instanceof ParameterSet)) {
                    throw new TypeError("Parent must be a ParameterSet");
                }
                this.parent = parent;
            }
        }]);
        return Parameter;
    }();
    var ApiBase = function() {
        function ApiBase($injector, baseUrl, baseUri, restangularConfig) {
            _classCallCheck(this, ApiBase);
            var restangular = $injector.get('Restangular');
            this.baseUrl = baseUrl;
            this.baseUri = baseUri;
            if (!restangularConfig) {
                this.restangular = restangular;
            } else {
                this.restangular = restangular.withConfig(restangularConfig);
            }
        }
        _createClass(ApiBase, [{
            key: "_getListFromUrl",
            value: function _getListFromUrl(url, endpointName, params) {
                params = params || {};
                return this.restangular.allUrl(endpointName, url).getList(params);
            }
        }, {
            key: "_getList",
            value: function _getList(endpoint, params) {
                params = params || {};
                return this.restangular.all(endpoint).getList(params);
            }
        }]);
        return ApiBase;
    }();
    var ApiV1 = function(_ApiBase) {
        _inherits(ApiV1, _ApiBase);

        function ApiV1($injector, baseUrl, baseUri) {
            _classCallCheck(this, ApiV1);
            _get(Object.getPrototypeOf(ApiV1.prototype), 'constructor', this).call(this, $injector, baseUrl, baseUri, function(RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl(baseUrl + baseUri);
                RestangularConfigurer.addResponseInterceptor(function(data, operation, what, url, response) {
                    var newResponse;
                    if (operation === 'getList') {
                        newResponse = data.objects;
                        newResponse.meta = data.meta;
                    } else {
                        newResponse = response.data;
                    }
                    return newResponse;
                });
                RestangularConfigurer.setRequestSuffix('/');
            });
        }
        _createClass(ApiV1, [{
            key: "getList",
            value: function getList(endpoint, params) {
                /**
                 * Generic method to get a list of API object and add pagination methods to navigate the result
                 * getPreviousPage() / getNextPage() will be undefined if no previous/next pages exist
                 */
                var self = this;
                return this._getList(endpoint, params).then(function(list) {
                    if (list.meta.next !== null) {
                        list.getNextPage = function() {
                            return self._getListFromUrl(self.baseUrl + list.meta.next, list.route);
                        };
                    }
                    if (list.meta.previous !== null) {
                        list.getPreviousPage = function() {
                            return self._getListFromUrl(self.baseUrl + list.meta.previous, list.route);
                        };
                    }
                    return list;
                });
            }
        }, {
            key: "getExperiments",
            value: function getExperiments(params) {
                /**
                 * Returns a list of experiments
                 * params is an object of query string parameters
                 */
                return this.getList('experiment', params);
            }
        }, {
            key: "getExperiment",
            value: function getExperiment(id) {
                /**
                 * Returns a single experiment by id
                 */
                return this.restangular.one('experiment', id).get();
            }
        }, {
            key: "getDatasets",
            value: function getDatasets(params) {
                /**
                 * Returns a list of datasets
                 * params is either on object of query string parameters or an experiment object
                 */
                var parameters = {};
                if (params.hasOwnProperty('id')) {
                    parameters['experiments__id'] = params.id;
                } else if (typeof params === 'number') {
                    parameters['experiments__id'] = params;
                } else {
                    parameters = params;
                }
                return this.getList('dataset', parameters);
            }
        }, {
            key: "getDataset",
            value: function getDataset(id) {
                /**
                 * Returns a single dataset by id
                 */
                return this.restangular.one('dataset', id).get();
            }
        }, {
            key: "getDatafiles",
            value: function getDatafiles(params) {
                /**
                 * Returns a list of datafiles
                 * params is either on object of query string parameters or an experiment object
                 */
                var parameters = {};
                if (params.hasOwnProperty('id')) {
                    parameters['dataset__id'] = params.id;
                } else if (typeof params === 'number') {
                    parameters['dataset__id'] = params;
                } else {
                    parameters = params;
                }
                return this.getList('dataset_file', parameters);
            }
        }, {
            key: "getDatafile",
            value: function getDatafile(id) {
                /**
                 * Returns a single datafile object by id
                 */
                return this.restangular.one('dataset_file', id).get();
            }
        }, {
            key: "getParameterSets",
            value: function getParameterSets(object) {
                /**
                 * Returns all parameter sets associated with an experiment/dataset/datafile
                 */
                if (!object.hasOwnProperty('parameter_sets')) {
                    throw new TypeError('Object must have a \'parameter_sets\' property');
                }

                var self = this;

                function fetchParameterDetails(param, psObj) {
                    return self.restangular.oneUrl('parametername', self.baseUrl + param.name).get().then(function(paramName) {
                        // value is determined in order of preference, from left to right:
                        var value = param.numerical_value || param.datetime_value || param.string_value || param.value || param.link_id;
                        return {
                            id: param.id,
                            name: paramName.name,
                            fullName: paramName.full_name,
                            value: value,
                            units: paramName.units,
                            order: paramName.order,
                            isImmutable: paramName.immutable,
                            isSearchable: paramName.is_searchable
                        };
                    }).then(function(p) {
                        psObj.addParameter(new Parameter(p.id, p.name, p.fullName, p.value, p.units, p.order, p.isImmutable, p.isSearchable));
                    });
                }

                var result = [];
                var promise;

                var parameterSets = object.parameter_sets;
                for (var i in parameterSets) {
                    if (parameterSets.hasOwnProperty(i)) {
                        var ps = parameterSets[i];
                        var psObj = new ParameterSet(ps.id, ps.schema.name, ps.schema.namespace, ps.schema.hidden);
                        var parameters = ps.parameters;
                        for (var j in parameters) {
                            if (parameters.hasOwnProperty(j)) {
                                var param = parameters[j];
                                if (!promise) {
                                    promise = fetchParameterDetails(param, psObj);
                                } else {
                                    (function(param, psObj) {
                                        promise = promise.then(function() {
                                            fetchParameterDetails(param, psObj);
                                        });
                                    })(param, psObj);
                                }
                            }
                        }
                        result.push(psObj);
                    }
                }

                return promise.then(function() {
                    return result;
                });
            }
        }]);
        return ApiV1;
    }(ApiBase);
    var app = angular.module('tardis-data', ['restangular']);
    app.provider('tardisData', tardisDataProvider);
    var UnsupportedApiVersionError = function(_Error) {
        _inherits(UnsupportedApiVersionError, _Error);

        function UnsupportedApiVersionError(version) {
            _classCallCheck(this, UnsupportedApiVersionError);
            _get(Object.getPrototypeOf(UnsupportedApiVersionError.prototype), 'constructor', this).call(this, 'Unsupported API version requested: ' + version);
        }
        return UnsupportedApiVersionError;
    }(Error);

    function tardisDataProvider() {
        var apiVersion = 1;
        var apiBaseUrl = '';
        var apiBaseUri = '/api/v1/';

        function setApiVersion(version) {
            apiVersion = version;
        }
        /**
         * Configuration option to set the base URL
         * e.g. "https://example.com"
         * @param baseUrl
         */
        function setApiBaseUrl(baseUrl) {
            apiBaseUrl = baseUrl;
        }
        /**
         * Configuration option to set the base URI
         * e.g. "/api/v1/"
         * @param baseUri
         */
        function setApiBaseUri(baseUri) {
            apiBaseUri = baseUri;
        }
        /** @ngInject */
        function tardisDataProviderFactory($injector) {
            switch (apiVersion) {
                case 1:
                    return new ApiV1($injector, apiBaseUrl, apiBaseUri);
                default:
                    throw new UnsupportedApiVersionError(apiVersion);
            }
        }
        return {
            setApiVersion: setApiVersion,
            setApiBaseUrl: setApiBaseUrl,
            setApiBaseUri: setApiBaseUri,
            $get: tardisDataProviderFactory
        };
    }
})();

//# sourceMappingURL=tardis-data.js.map