var app = angular.module('tardis-data', ['restangular']);
app.provider('tardisData', tardisDataProvider);

class UnsupportedApiVersionError extends Error {
    constructor(version) {
        super('Unsupported API version requested: '+version);
    }
}

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