import BaseComponent from "./BaseComponent.js";


export default class BaseService extends BaseComponent {


    constructor(app, options = {}) {

        super(app);

        this.options = options;

        this._busListeners = [];

        if (!this.shouldInitialize()) return;

        this.bindBusEvents();

    }



    busEvents(){
        return {};
    }


    bindBusEvents(){
        const events = this.busEvents?.() ?? {};

        Object.entries(events).forEach(([event,handler])=>{

                if(typeof handler !== 'function') return;

                const listener = handler.bind(this);

                this.eventBus.on(event, listener);

                this._busListeners.push({event, listener});

            });


    }



    emit(event,payload={}){

        this.eventBus.emit(event, payload);

    }

    on(event ,handler){
        if(typeof handler !== 'function') return;

        const listener = handler.bind(this);

        this.eventBus.on(event, listener);

    }


    shouldInitialize(){

        return true;

    }

    destroy(){

        for(const {event, listener} of this._busListeners){

            this.eventBus.off(event, listener);

        }

        this._busListeners.length=0;


    }





}
