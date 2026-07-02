class FileManager {

    constructor() {

        this.cursor = null;
        this.loading = false;
        this.hasMore = true;

        this.mimeType = '';
        this.disk = '';

        this.grid =
            document.querySelector('[data-grid]');

        this.loader =
            document.querySelector('[data-loader]');

        this.loadMoreBtn =
            document.querySelector('[data-load-more]');

        this.mimeSelect =
            document.querySelector('[data-mime]');

        this.diskSelect =
            document.querySelector('[data-disk]');

        this.bind();

        this.load(true);

    }

    bind(){

        this.loadMoreBtn?.addEventListener(
            'click',
            ()=>this.load()
        );

        this.mimeSelect?.addEventListener(
            'change',
            e => {

                this.mimeType =
                    e.target.value;

                this.load(true);

            }
        );

        this.diskSelect?.addEventListener(
            'change',
            e => {

                this.disk =
                    e.target.value;

                this.load(true);

            }
        );

    }

    async load(reset=false){

        if(this.loading)
            return;

        try{

            this.loading = true;

            this.toggleLoader(true);

            if(reset){

                this.cursor = null;

                this.hasMore = true;

                this.grid.innerHTML='';

            }

            const query =
                new URLSearchParams({

                    type:'cursor',

                    cursor:
                        this.cursor || '',

                    mime_type:
                    this.mimeType,

                    disk:
                    this.disk

                });

            const response =
                await fetch(
                    `/api/filemanager?${query}`
                );

            if(!response.ok){

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            const data =
                await response.json();

            const files =
                data?.files ?? [];

            this.cursor =
                data?.meta?.next_cursor ?? null;

            this.hasMore =
                data?.meta?.has_more ?? false;

            this.renderGrid(files);

            this.loadMoreBtn.style.display =
                this.hasMore
                    ? 'block'
                    : 'none';

        }
        catch(error){

            console.error(error);

        }
        finally{

            this.loading=false;

            this.toggleLoader(false);

        }

    }

    renderGrid(items=[]){

        const fragment =
            document.createDocumentFragment();

        items.forEach(item=>{

            const card =
                document.createElement('div');

            card.className =
                'media-card';

            card.innerHTML=`
                <div class="media-thumb">
                    ${this.renderItem(item)}
                </div>
            `;

            fragment.append(card);

        });

        this.grid.append(fragment);

    }

    renderItem(item){

        const type =
            item?.mime_type
                ?.split('/')[0]
                ?.toLowerCase();

        switch(type){

            case 'image':
                return `<img src="${item.url}" loading="lazy">`;

            case 'video':
                return `<video src="${item.url}"></video>`;

            case 'audio':
                return `<audio src="${item.url}"></audio>`;

            default:
                return `<div>📄</div>`;
        }

    }

    toggleLoader(show){

        this.loader.style.display =
            show
                ? 'flex'
                : 'none';

    }

}
