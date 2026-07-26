import UiService from "../Foundation/UiService.js";
import Events from "../constants/events.js";

export default class FilterUi extends UiService {

    initialize(){

       this.state.set("load.disk", this.disksEl.value);

       this.state.set("load.type", this.mimesEl.value);
    }

    defineElements() {

        return {

            mimesEl: "[data-mimeList]",

            disksEl: "[data-diskList]",
        };
    }


    domEvents() {

        return [

            [this.mimesEl, "change", this.updateTypeFilter],

            [this.disksEl, "change", this.updateDiskFilter],
        ];
    }


    updateDiskFilter(event) {

        const value = event.currentTarget.value.trim() || null;

        if (value === this.state.get("load.disk", null)) return;

        this.state.set("load.disk", value);

        this.emit(Events.GRID_CLEAR, {value});
    }


    updateTypeFilter(event) {

        const value = event.currentTarget.value.trim() || null;

        if (value === this.state.get("load.type", null)) return;

        this.state.set("load.type", value);
    }
}
