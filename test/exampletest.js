var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('express')();
var calendar = require('../routes/index');
app.use('/', calendar);

function makeRequest(route, statusCode, done) {
    request(app)
        .get(route)
        .expect(statusCode)
        .end(function (err, res) {
            if (err) { return done(err); }

            done(null, res);
        });
};


describe("Example test to assert the working of implemented frameworks", function () {
    /* Moet slagen */
    it("Should return 42 and 'Haha cool, blijkbaar werkt het'", function (done) {
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
    it("Should return 42 and 'Haha cool, blijkbaar werkt het'", function (done) {
        makeRequest('/test', 200, function (err, res) {
            if (err) { return done(err); }

            expect(res.body.intje).to.be.undefined;
            expect(res.body.intje).to.equal(42);
            expect(res.body.stringetje).to.be.undefined;
            expect(res.body.stringetje).to.equal('Haha cool, blijkbaar werkt het');
            done();
        });
    })
    
    /* Moet falen */
    it("Should return 42 and 'Haha cool, blijkbaar werkt het'", function (done) {
        makeRequest('/test', 200, function (err, res) {
            if (err) { return done(err); }

            expect(res.body.intje).to.not.be.undefined;
            expect(res.body.intje).to.equal(7);
            expect(res.body.stringetje).to.not.be.undefined;
            expect(res.body.stringetje).to.equal('Haha cgrgrgool, blijkbaar werkt het');
            done();
        });
    })
    
    /* Moet falen */
    it("Should return 42 and 'Haha cool, blijkbaar werkt het'", function (done) {
        makeRequest('/test', 200, function (err, res) {
            if (err) { return done(err); }

            expect(res.body.intje).to.not.be.undefined;
            expect(res.body.intje).to.equal('42');
            expect(res.body.stringetje).to.not.be.undefined;
            expect(res.body.stringetje).to.equal('Haha cool, blijkbaar werkt het');
            done();
        });
    })
})