# MyTardis AngularJS data service
## What is it?
The MyTardis AngularJS data service provides an AngularJS service with which AngularJS applications may easily interact with the MyTardis API.

## Installation
The easiest way to get started is to install via bower:  
```
bower install --save angular-mytardis-data
```
Then add the dependency to your AngularJS application:
```
angular.module('mytardisApp', ['ngMaterial', 'tardis-data']);
```

### Configuration
Three configuration options are available:
* ```setApiVersion``` : Sets the API version, defaults to 1.
* ```setApiBaseUrl``` : Sets the base URL for API requests (e.g. http://example.com), defaults to blank. _This setting is usually not needed and is typically used for testing only. Do not add a trailing slash._
* ```setApiBaseUri``` : Sets the base URI for API requests (e.g. /api/v1/), defaults to '/api/v1/'.

### Usage
To use the data service, simply inject ```tardisData``` into your application. For example:
```
(function() {
  'use strict';

  angular
    .module('mytardisApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, tardisData) {
     /** do things */
  }
})();
```

#### Currently implemented methods
* ```getExperiments(params)```: Returns a promise that resolves to a list of experiments. ```params``` is an optional object containing query string key/value entries for the API query.
* ```getExperiment(id)```: Returns a promise that resolves to a single experiment that matches the given identifier.
* ```getDatasets(params)```: Returns a promise that resolves to a list of datasets. ```params``` is an optional object containing _either_ query string key/value entries for the API query OR an experiment result object.
* ```getDataset(id)```: Returns a promise that resolves to a single dataset that matches the given identifier.
* ```getDatafiles(params)```: Returns a promise that resolves to a list of datafiles. ```params``` is an optional object containing _either_ query string key/value entries for the API query OR an dataset result object.
* ```getDatafile(id)```: Returns a promise that resolves to a single datafile that matches the given identifier.
* ```getParameterSets(object)```: Returns a promise that resolves to an array of parameter sets for a given ```object```. ```object``` may be either an experiment, dataset or datafile results object.

Results objects from any method that returns a list will contain methods for moving between pages of the result. These methods will be present only if a previous/next page exists. Thus the following check can be made to determine whether the result has more than one page:
```
if (resultsObject.getNextPage) {
   resultsObject.getNextPage().then(function(nextPage) {
      /** do things with the next page */
    });
}
```
More information can be obtained by examining the ```meta``` object in the results object, which contains the same information as in the meta object returned by a Tastypie API query. These are namely: ```limit```, ```next```, ```offset```, ```previous``` and ```total_count```.
