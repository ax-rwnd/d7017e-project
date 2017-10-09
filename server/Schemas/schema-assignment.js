//Mongoose schemas.

var test = new Schema({
  stdin: String,
  stdout: String
});

var assignment = new Schema({
  ID:  String,
  tests: [test]
});

var submission = new Schema({
  assignment:  assignment,
  code: String
});
