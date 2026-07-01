class MediaManager {
    constructor(options = {}) {
        this.page = 1;
        this.loading = false;
        this.selected = [];
        this.mode = options.mode || 'single';
        this.mimeType = null;
        this.disk = null;

        this.init();
    }
    init() {
        this.renderPopup();
        this.load();
    }

    async load() {
        if (this.loading) return;
        this.loading = true;

        const res = await fetch(`/api/filemanager?type=cursor=cursor&$cursor=${this.page || ''}&mime_type=${this.mimeType || ''}&disk=${this.disk || ''}`);

        const data = await res.json();
        const files = data?.files ?? [];
        const hasMore = data?.meta?.has_more ?? false;
        const nextCursor = data?.meta?.next_cursor ?? null;

        this.renderGrid(files);
        if (hasMore && nextCursor) {
            this.page = nextCursor
        }
        this.loading = false;

    }

    renderGrid(items) {
        items.forEach(item => {
            let div = document.createElement('div');
            div.className = 'media-card';
            div.innerHTML = `<div class="media-thumb">${this.renderItem(item)}</div><div class="media-name"> ${item.title}</div>`;
            div.onclick = () => {

                if (this.mode === 'single') {
                    document.querySelectorAll('.media-card')
                        .forEach(x => x.classList.remove('selected'));
                    this.selected = [item];

                    div.classList.add(
                        'selected'
                    );

                } else {

                    div.classList.toggle(
                        'selected'
                    );

                }

            };

            this.grid.append(div);

        });
    }

    renderItem(item){
        const fileType=(item?.mime_type?.toLowerCase()?.split("/") ?? [])[0]
        if (fileType === 'image')  return `<img src="${item.url}" alt="${item?.title ?? item?.original_name ?? 'not specified'}" width="300" height="200" />`;
        if (fileType === 'video')  return `<video src="${item.url}" width="300" height="200" controls></video>`;
        if (fileType === 'audio')  return `<audio src="${item.url}" controls></audio>`;
        if (fileType === 'text')  return `<div>
          <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024">
              <path d="M1005.714286 1005.714286H18.285714V18.285714h712.594286L877.714286 164.571429l128 128v713.142857z" fill="#BBCADC"/>
              <path d="M1024 1024H0V0h738.377143L1024 285.074286zM36.571429 987.428571h950.857142V300.068571L723.382857 36.571429H36.571429z" fill="#97ABC1"/>
              <path d="M731.428571 0v292.571429h292.571429L731.428571 0z" fill="#97ABC1"/>
              <path d="M378.88 408.868571a138.605714 138.605714 0 0 1 28.708571-45.714285 128 128 0 0 1 44.434286-29.988572 148.48 148.48 0 0 1 58.148572-10.971428 182.857143 182.857143 0 0 1 69.485714 11.52 130.925714 130.925714 0 0 1 44.617143 28.342857 100.022857 100.022857 0 0 1 24.32 36.571428 103.131429 103.131429 0 0 1 7.314285 36.571429 123.977143 123.977143 0 0 1-7.314285 46.262857 108.434286 108.434286 0 0 1-18.285715 30.902857 117.76 117.76 0 0 1-23.954285 21.942857c-8.777143 6.034286-17.188571 12.068571-24.868572 18.285715a111.542857 111.542857 0 0 0-20.845714 20.662857 59.062857 59.062857 0 0 0-11.337143 29.257143v22.308571h-78.811428v-26.331428a115.017143 115.017143 0 0 1 27.977142-71.131429 148.114286 148.114286 0 0 1 22.308572-20.845714c7.862857-5.851429 14.994286-11.702857 21.577143-18.285715a74.971429 74.971429 0 0 0 16.091428-18.285714 47.725714 47.725714 0 0 0 5.668572-26.331428 53.76 53.76 0 0 0-13.165715-39.862858 50.102857 50.102857 0 0 0-36.571428-12.8 57.6 57.6 0 0 0-27.245714 6.034286 54.857143 54.857143 0 0 0-18.285715 16.457143 70.217143 70.217143 0 0 0-10.971428 23.954286 126.537143 126.537143 0 0 0-3.474286 29.622857h-85.942857a168.411429 168.411429 0 0 1 10.422857-58.148572z m175.177143 251.062858V749.714286h-91.428572v-89.782857z" fill="#FFFFFF"/>
          </svg>
      </div>`;
        return `<div>
          <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024">
              <path d="M1005.714286 1005.714286H18.285714V18.285714h712.594286L877.714286 164.571429l128 128v713.142857z" fill="#BBCADC"/>
              <path d="M1024 1024H0V0h738.377143L1024 285.074286zM36.571429 987.428571h950.857142V300.068571L723.382857 36.571429H36.571429z" fill="#97ABC1"/>
              <path d="M731.428571 0v292.571429h292.571429L731.428571 0z" fill="#97ABC1"/>
              <path d="M378.88 408.868571a138.605714 138.605714 0 0 1 28.708571-45.714285 128 128 0 0 1 44.434286-29.988572 148.48 148.48 0 0 1 58.148572-10.971428 182.857143 182.857143 0 0 1 69.485714 11.52 130.925714 130.925714 0 0 1 44.617143 28.342857 100.022857 100.022857 0 0 1 24.32 36.571428 103.131429 103.131429 0 0 1 7.314285 36.571429 123.977143 123.977143 0 0 1-7.314285 46.262857 108.434286 108.434286 0 0 1-18.285715 30.902857 117.76 117.76 0 0 1-23.954285 21.942857c-8.777143 6.034286-17.188571 12.068571-24.868572 18.285715a111.542857 111.542857 0 0 0-20.845714 20.662857 59.062857 59.062857 0 0 0-11.337143 29.257143v22.308571h-78.811428v-26.331428a115.017143 115.017143 0 0 1 27.977142-71.131429 148.114286 148.114286 0 0 1 22.308572-20.845714c7.862857-5.851429 14.994286-11.702857 21.577143-18.285715a74.971429 74.971429 0 0 0 16.091428-18.285714 47.725714 47.725714 0 0 0 5.668572-26.331428 53.76 53.76 0 0 0-13.165715-39.862858 50.102857 50.102857 0 0 0-36.571428-12.8 57.6 57.6 0 0 0-27.245714 6.034286 54.857143 54.857143 0 0 0-18.285715 16.457143 70.217143 70.217143 0 0 0-10.971428 23.954286 126.537143 126.537143 0 0 0-3.474286 29.622857h-85.942857a168.411429 168.411429 0 0 1 10.422857-58.148572z m175.177143 251.062858V749.714286h-91.428572v-89.782857z" fill="#FFFFFF"/>
          </svg>
      </div>`

    }

    renderPopup(){
        const overall = document.createElement('div');
        overall.classList.add('filemanager','overlay');
        document.body.appendChild(overall);

        const container =document.createElement('section');
        document.body.appendChild('media-container');

        this.grid=overall;

    }

}


const standaloneBtn = document.getElementById('openMedia');
if (standaloneBtn) {
    standaloneBtn.onclick = (e) => {
        e.preventDefault();
        new MediaManager({mode: 'multi'});
    }
}
