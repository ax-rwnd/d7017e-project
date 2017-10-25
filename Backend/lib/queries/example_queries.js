// example query: retrieve tests from an assignment
 
//Get tests from our database with tester format.
/*queries.getTestsFromAssignment(assignment_id, function(tests) {

    request.post(
        TESTER_IP,
        { json: {
        'lang' : lang,
        'code' : code,
        'tests' : tests
    }},
    function (error, response, body){
        console.log(body)
        res.set('Content-Type', 'application/json');
        res.send(body);
    });
});*/


//Example: Insert assignment with tests into the database.
/*var t1 = new Test({
    stdin: '', 
    stdout: 'Detta är ett program som räknar hur mycket kaffe du dricker.\nJag heter Anna andersson\nJag har druckit 2 koppar kaffe idag.\n'
});

t1.save(function(err, savedt1) {
    if (err) {
        console.log('Error' + err);
        return;
    }
        console.log("T1")
        console.log(savedt1)

        var a1 = new Assignment({
            assignmentName: 'assignment-kaffe',
            tests: [savedt1]
        });

        a1.save(function(err, saveda1) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }

            Assignment.findOne({ '_id': saveda1._id}, function(err, assignments) {
                if (err) return console.log(err);
                        console.log(assignments);
            });

        });
});*/




