export class ServiceProvider {

    constructor(app) {

        this.app = app;

        this.config = app.config;

        this.state = app.state;

        this.request = app.request;

        this.eventBus = app.eventBus;

        this.errorBus = app.errorBus;

        this.root = app.root;

    }

}
