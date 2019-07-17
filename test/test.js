var server   = require('../server'),
    helper   = require('../Helpers'),
    chai     = require('chai'),
    chaiHTTP = require('chai-http'),
    should   = chai.should();

chai.use(chaiHTTP);

reqServer = process.env.HTTP_TEST_SERVER || server;

describe('Basic routes tests', function() {

    it('GET to / should return 200', function(done){
        chai.request(reqServer)
        .get('/')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })

    it('GET to /empty should return 200', function(done){
        chai.request(reqServer)
        .get('/empty')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })

    it('POST to /empty should return 200', function(done){
        chai.request(reqServer)
        .post('/empty')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })

    it('GET to /garbage should return 200', function(done){
        chai.request(reqServer)
        .get('/garbage')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })

    it('GET to /getIP should return 200', function(done){
        chai.request(reqServer)
        .get('/getIP')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        })

    })
})

describe('Helper function tests', function() {
    it('should return 11.12 with provided location', function(done){
        var isValid = helper.calcDistance([-6.2294728,106.9956579], [-6.1294728,106.9956579])
        isValid.should.equal('11.12');
        done();
    })
})