var express = require('express');
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var app = express();

/*Objects to be used when mockig*/

//mongoose mocker
var mongoose = {
  model: function(name){
    return {
      getLocations : function(a, callback){
          locations = placesRequestResponse;
        callback(locations);
      }
    }
  }
}

//user authentication mocker
var usr ={
  is: function () {
    return function(req, res, next){
      next();
    }
  }
}

var GLOBAL_VARS = {
  google_places_api_key: "google_mock_key"
}

var reques = function(url, callback){
  var error = false;
  var response = {statusCode: 200};
  var body = JSON.stringify(googlePlacesResponce);
  callback(error, response, body);
}

var index = require('../routes/index')(usr, mongoose);
app.use('/', index);

function makeRequest(route, statusCode, done) {
    request(app)
        .get(route)
        .expect(statusCode)
        .end(function (err, res) {
            if (err) { return done(err); }

            done(null, res);
        });
};

function makePostRequest(route, statusCode, done) {
    request(app)
        .post(route)
        .expect(statusCode)
        .end(function (err, res) {
            if (err) { return done(err); }

            done(null, res);
        });
};

describe("UnitTestTest", function () {
    /* Moet slagen */
    it("Alles correct", function (done) {
        makeRequest('/test', 200, function (err, res) {
            if (err) { return done(err); }

            expect(res.body.intje).to.not.be.undefined;
            expect(res.body.intje).to.equal(42);
            expect(res.body.stringetje).to.not.be.undefined;
            expect(res.body.stringetje).to.equal('Haha cool, blijkbaar werkt het');
            done();
        });
    })


    /* Moet falen */
    it("Test met verkeerde String en Number moet afgewezen worden", function (done) {
        makeRequest('/test', 200, function (err, res) {
            if (err) { return done(err); }

            expect(res.body.intje).to.not.be.undefined;
            expect(res.body.intje).to.not.equal(7);
            expect(res.body.stringetje).to.not.be.undefined;
            expect(res.body.stringetje).to.not.equal('Haha cgrgrgool, blijkbaar werkt het');
            done();
        });
    })

    /* Moet falen */
    it("Test met char i.p.v. Number. Moet false zijn.'", function (done) {
        makeRequest('/test', 200, function (err, res) {
            if (err) { return done(err); }

            expect(res.body.intje).to.not.be.undefined;
            expect(res.body.intje).to.not.equal('42');
            expect(res.body.stringetje).to.not.be.undefined;
            expect(res.body.stringetje).to.equal('Haha cool, blijkbaar werkt het');
            done();
        });
    })
})

var trip = require('../routes/trip')(reques, GLOBAL_VARS, mongoose, usr);
app.use('/planner', trip);

describe("Trip", function () {
    /* Moet slagen */
    it("Returned results when searching for places (don't display the same location from different sources, but just show one)", function (done) {
        makePostRequest('/planner/user_mock_key/searchLocations/search_mock_key', 200, function (err, res) {
            if (err) { return done(err); }
              expect(res.body.items.length).to.equal(1);
              expect(res.body.items[0].name).to.equal("Rhythmboat Cruises");
            done();
        });
    });
});

//objects used for testing data
var googlePlacesResponce = {
   "html_attributions" : [],
   "results" : [
      {
         "geometry" : {
            "location" : {
               "lat" : -33.870775,
               "lng" : 151.199025
            }
         },
         "id" : "21a0b251c9b8392186142c798263e289fe45b4aa",
         "name" : "Rhythmboat Cruises"
      },
      {
         "geometry" : {
            "location" : {
               "lat" : -33.866891,
               "lng" : 151.200814
            }
         },
         "id" : "da4d635744dff201ae1f58e49d6efe0639e35b31",
         "name" : "Hotel Dom"
      }
   ]
}

var placesRequestResponse = {
  results: [ {"geometry" : { "location" : { "lat" : -33.870775, "lng" : 151.199025 }},"place_id" : "ChIJrTLr-GyuEmsRBfy61i59si0",}],
  route: [
    {
      "_id": "da4d635744dff201ae1f58e49d6efe0639e35b31",
      "name": "Hotel Dom",
      "lat": 52.0916478,
      "long": 5.122479100000001
    },
    {
      "_id": "9536ce5f914697bb62357d99f3fc9c2ff0bc5904",
      "name": "La Cubanita Utrecht",
      "lat": 52.0920786,
      "long": 5.1217364
    }
 ]
}
