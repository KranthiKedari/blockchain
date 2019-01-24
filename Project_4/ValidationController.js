

class ValidationController {
	constructor(app) {
        this.app = app;
    }

    // POST /requestValidation - To create a validation request
    postRequestValidation() {
        this.app.post("/requestValidation", (request, response) => {});
}
