//Mongoose schemas.

var test = new Schema({
    ID: Number,    
    stdin: String,
    stdout: String
});

var assignment = new Schema({
    ID:  Number,
    tests: [test]
});

var submission = new Schema({
  assignment:  assignment,
  code: String
});
