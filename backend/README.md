# Backend
* The backend will manage (among other things):
    * Authentication and authorization through CAS
    * Code samples from users that are coupled with tests from DB
    * Tests are coupled with assignments
    * Gamification platform
* Backend communicates with tester and frontend

# API documentation
[Swagger](https://swagger.io/) has been used to perform the API documentation. The API resides on the backend server at `https://130.240.5.119:18001/docs/`

Throughout the project the documentation has been handled via [Swaggerhub](https://app.swaggerhub.com), which gives real-time feedback while documenting. We used YAML as markup language and when we wanted the documentation to be served from the backend server we exported from Swaggerhub to JSON format (we couldn't find YAML support for node). The documentation is found under > `Backend/lib/swagger.json` the same documentation exists there in YAML format as well.  

