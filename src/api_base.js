class ParameterSet {
    constructor(id, name, namespace, isHidden) {
        this.id = id;
        this.name = name;
        this.namespace = namespace;
        this.isHidden = isHidden;
        this.parameters = [];
    }

    addParameter(parameter) {
        if (!(parameter instanceof Parameter)) {
            throw new TypeError("parameter must be an instance of Parameter");
        }
        parameter._setParent(this);
        this.parameters.push(parameter);
    }

    getParameters() {
        this.parameters.sort(function(a, b) {
            var x = a.order?parseInt(a.order):9999;
            var y = b.order?parseInt(b.order):9999;
            return x - y;
        });
        return this.parameters;
    }
}

class Parameter {
    constructor(id, name, fullName, value, units, order, isImmutable, isSearchable) {
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

    _setParent(parent) {
        if (!(parent instanceof ParameterSet)) {
            throw new TypeError("Parent must be a ParameterSet");
        }
        this.parent = parent;
    }
}

class ApiBase {
    constructor($injector, baseUrl, baseUri, restangularConfig) {
        var restangular = $injector.get("Restangular");
        this.baseUrl = baseUrl;
        this.baseUri = baseUri;
        if (!restangularConfig) {
            this.restangular = restangular;
        } else {
            this.restangular = restangular.withConfig(restangularConfig);
        }
    }

    _getListFromUrl(url, endpointName, params) {
        params = params || {};
        return this.restangular.allUrl(endpointName, url).getList(params);
    }

    _getList(endpoint, params) {
        params = params || {};
        return this.restangular.all(endpoint).getList(params);
    }
}