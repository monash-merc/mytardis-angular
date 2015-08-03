class ApiV1 extends ApiBase {

    constructor($injector, baseUrl, baseUri) {
        super($injector, baseUrl, baseUri, function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(baseUrl + baseUri);
            RestangularConfigurer.addResponseInterceptor(function (data, operation, what, url, response) {
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

    getList(endpoint, params) {
        /**
         * Generic method to get a list of API object and add pagination methods to navigate the result
         * getPreviousPage() / getNextPage() will be undefined if no previous/next pages exist
         */
        var self = this;
        return this._getList(endpoint, params).then(
            function (list) {
                if (list.meta.next !== null) {
                    list.getNextPage = function () {
                        return self._getListFromUrl(self.baseUrl + list.meta.next, list.route);
                    };
                }
                if (list.meta.previous !== null) {
                    list.getPreviousPage = function () {
                        return self._getListFromUrl(self.baseUrl + list.meta.previous, list.route);
                    };
                }
                return list;
            }
        )
    }

    getExperiments(params) {
        /**
         * Returns a list of experiments
         * params is an object of query string parameters
         */
        return this.getList('experiment', params);
    }

    getExperiment(id) {
        /**
         * Returns a single experiment by id
         */
        return this.restangular.one('experiment', id).get();
    }

    getDatasets(params) {
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

    getDataset(id) {
        /**
         * Returns a single dataset by id
         */
        return this.restangular.one('dataset', id).get();
    }

    getDatafiles(params) {
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

    getDatafile(id) {
        /**
         * Returns a single datafile object by id
         */
        return this.restangular.one('dataset_file', id).get();
    }

    getParameterSets(object) {
        /**
         * Returns all parameter sets associated with an experiment/dataset/datafile
         */
        if (!object.hasOwnProperty('parameter_sets')) {
            throw new TypeError('Object must have a \'parameter_sets\' property');
        }

        var self = this;

        function fetchParameterDetails(param, psObj) {
            return self.restangular.oneUrl('parametername', self.baseUrl + param.name).get()
                .then(function (paramName) {
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
                })
                .then(function (p) {
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
                            (function (param, psObj) {
                                promise = promise.then(function () {
                                    fetchParameterDetails(param, psObj)
                                });
                            })(param, psObj);
                        }
                    }
                }
                result.push(psObj);
            }
        }

        return promise.then(function () {
            return result
        });
    }
}