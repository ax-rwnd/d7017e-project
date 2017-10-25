//example: fetch tests from a specific assignment and send them to tester.  

/*router.post('/test', function(req, res) {
    var lang = req.body.lang;
    var code = req.body.code;
    var assignment_id = req.body.assignment_id;

    //Get tests from our database
    queries.getTestsFromAssignment(assignment_id, function(tests) {

        request.post(
            TESTER_IP,
            { json: {
            'lang' : lang,
            'code' : code,
            'tests' : tests
        }},
        function(error, response, body) {
            console.log(body)
            res.set('Content-Type', 'application/json');
            res.send(body);
        });
    });
});*/

