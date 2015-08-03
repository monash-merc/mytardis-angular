describe('tardisData tests', function () {

    var $httpBackend, $rootScope, $log, tardisDataService;

    // Set up the module
    beforeEach(module('tardis-data'));
    beforeEach(inject(function ($injector) {
        tardisDataService = $injector.get('tardisData');
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $log = $injector.get('$log');

        // Load test data
        // * Experiments and directly referenced URIs
        for (var url in synchPublicData) {
            if (synchPublicData.hasOwnProperty(url)) {
                $httpBackend.when("GET", url).respond(synchPublicData[url]);
            }
        }
        // * A sample list of datasets for experiment id 257
        $httpBackend.when("GET", "/api/v1/dataset/?experiments__id=257").respond(datasetsExample);
        // * A sample single dataset (id 13363)
        $httpBackend.when("GET", "/api/v1/dataset/13363/").respond(singleDatasetExample);
        // * A sample datafile list for dataset id 13363
        $httpBackend.when("GET", "/api/v1/dataset_file/?dataset__id=13363").respond(datafileListExample);
        // * A sample single datafile (id 903851)
        $httpBackend.when("GET", "/api/v1/dataset_file/903851/").respond(singleDatafileExample);
    }));

    afterEach(function () {
        var logs = $log.debug.logs;
        if (logs.length > 0) {
            console.log("==== debug logs ====");
            for (var i in logs) {
                console.log(logs[i]);
            }
        }
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('when I request all experiments', function () {
        it('returns two pages of 20 and 11 records, respectively', function () {
            var resultPage1;
            var resultPage2;
            var totalRecordsExpected;
            var totalRecordsFound = 0;
            tardisDataService.getExperiments()
                .then(function (data) {
                    resultPage1 = data;
                    totalRecordsExpected = data.meta.total_count;
                    totalRecordsFound += data.length;
                    if (data.hasOwnProperty("getNextPage")) {
                        return data.getNextPage();
                    }
                })
                .then(function (data) {
                    resultPage2 = data;
                    totalRecordsFound += data.length;
                });

            $httpBackend.flush();

            expect(resultPage1.length).toEqual(20);
            expect(resultPage2.length).toEqual(11);
            expect(totalRecordsFound).toEqual(totalRecordsExpected);
            expect(resultPage1.hasOwnProperty("getNextPage")).toBeTruthy();
            expect(resultPage2.hasOwnProperty("getNextPage")).toBeFalsy();
        });
    });

    describe('when I request a single experiment', function () {
        it('returns a single experiment', function () {
            var result;
            tardisDataService.getExperiment(208).then(function (data) {
                result = data;
            });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.id).toEqual(208);
        });
    });

    describe('when I request a list of datasets using an experiment result as the parameter', function () {
        it('returns a list of datasets for that experiment', function () {
            var result;
            tardisDataService.getExperiment(257)
                .then(function (experiment) {
                    return tardisDataService.getDatasets(experiment)
                })
                .then(function (datasetList) {
                    result = datasetList;
                });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.length).toEqual(4);
        });
    });

    describe('when I request a list of datasets using an experiment id as the parameter', function () {
        it('returns a list of datasets for that experiment', function () {
            var result;
            tardisDataService.getDatasets(257)
                .then(function (datasetList) {
                    result = datasetList;
                });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.length).toEqual(4);
        });
    });

    describe('when I request a single dataset', function () {
        it('returns a single dataset', function () {
            var result;
            tardisDataService.getDataset(13363)
                .then(function (dataset) {
                    result = dataset;
                });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.id).toEqual(13363);
        });
    });

    describe('when I request a list of datafiles using a dataset result as the parameter', function () {
        it('returns a list of datafiles for that dataset', function () {
            var result;
            tardisDataService.getDataset(13363)
                .then(function (dataset) {
                    return tardisDataService.getDatafiles(dataset)
                })
                .then(function (datafileList) {
                    result = datafileList;
                });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.length).toEqual(20);
            expect(result.meta.total_count).toEqual(720);
        });
    });

    describe('when I request a list of datafiles using a dataset id as the parameter', function () {
        it('returns a list of datafiles for that experiment', function () {
            var result;
            tardisDataService.getDatafiles(13363)
                .then(function (datafileList) {
                    result = datafileList;
                });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.length).toEqual(20);
            expect(result.meta.total_count).toEqual(720);
        });
    });

    describe('when I request a single datafile', function () {
        it('returns a single datafile', function () {
            var result;
            tardisDataService.getDatafile(903851)
                .then(function (datafile) {
                    result = datafile;
                });

            $httpBackend.flush();

            expect(result).toBeDefined();
            expect(result.id).toEqual(903851);
        });
    });

    describe('when I request parameter sets using an experiment result', function () {
        it('returns an array of parameter sets', function () {
            var results;
            tardisDataService.getExperiment(257)
                .then(function (experiment) {
                    return tardisDataService.getParameterSets(experiment);
                })
                .then(function(parameterSets) {
                    results = parameterSets;
                });

            $httpBackend.flush();

            expect( results.length ).toEqual(4);
            expect( results[0].parameters.length ).toEqual(2);
            expect( results[1].parameters.length ).toEqual(10);
            expect( results[2].parameters.length ).toEqual(4);
            expect( results[3].parameters.length ).toEqual(4);

            expect( results[0].parameters[0].id ).toEqual(430);
            expect( results[0].parameters[0].name ).toEqual('beamline');
            expect( results[0].parameters[0].fullName ).toEqual('Beamline');
            expect( results[0].parameters[0].value ).toEqual('MX2');
            expect( results[0].parameters[0].units ).toEqual('');
            expect( results[0].parameters[0].order ).toEqual(9999);
            expect( results[0].parameters[0].isImmutable ).toBeFalsy();
            expect( results[0].parameters[0].isSearchable ).toBeTruthy();

            expect( results[1].parameters[5].id ).toEqual(887);
            expect( results[1].parameters[5].name ).toEqual('resolution');
            expect( results[1].parameters[5].fullName ).toEqual('Resolution');
            expect( results[1].parameters[5].value ).toEqual(1.9);
            expect( results[1].parameters[5].units ).toEqual('Å');
            expect( results[1].parameters[5].order ).toEqual(6);
            expect( results[1].parameters[5].isImmutable ).toBeFalsy();
            expect( results[1].parameters[5].isSearchable ).toBeTruthy();

            // Check the parameter ordering
            for (var ps in results) {
                var parameterSet = results[ps];
                var previousOrder = null;
                var sortedParameters = parameterSet.getParameters();
                for (var param in sortedParameters) {
                    var parameter = sortedParameters[param];
                    if (previousOrder === null) {
                        previousOrder = parameter.order;
                    } else {
                        expect( parameter.order >= previousOrder ).toBeTruthy();
                        previousOrder = parameter.order;
                    }
                }
            }
        });
    });

    describe('when I request parameter sets using a dataset result', function () {
        it('returns an array of parameter sets', function () {
            var results;
            tardisDataService.getDataset(13363)
                .then(function (dataset) {
                    return tardisDataService.getParameterSets(dataset);
                })
                .then(function(parameterSets) {
                    results = parameterSets;
                });

            $httpBackend.flush();

            expect( results.length ).toEqual(3);
            expect( results[0].parameters.length ).toEqual(0);
            expect( results[1].parameters.length ).toEqual(1);
            expect( results[2].parameters.length ).toEqual(4);
        });
    });

    describe('when I request parameter sets using a datafile result', function () {
        it('returns an array of parameter sets', function () {
            var results;
            tardisDataService.getDatafile(903851)
                .then(function (datafile) {
                    return tardisDataService.getParameterSets(datafile);
                })
                .then(function(parameterSets) {
                    results = parameterSets;
                });

            $httpBackend.flush();

            expect( results.length ).toEqual(1);
            expect( results[0].parameters.length ).toEqual(8);
        });
    });

});