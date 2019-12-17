export default class FileСontainerPage {
    constructor(context) {
        this._context = context;
        this._rootEl = context.rootEl();
    }


    init() {

        this._rootEl.innerHTML = `
      <div class="container">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <a class="navbar-brand" href="#">Network</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-supported-content">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbar-supported-content">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item active">
                <a class="nav-link" data-id="menu-main" href="/">NewsFeed</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-id="menu-messages" href="/messages">Messages</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-id="menu-files" href="/container">Files</a>
              </li>
            </ul>
          </div>
        </nav>
        <div class="row">
            <div class="col">
              <div class="card">
                <div class="card-body">
                  <form data-id="post-edit-form">
                    <input type="hidden" data-id="id-input" value="0">
                    <div class="form-group">
                      <label for="content-input">Name</label>
                      <input type="text" data-id="content-input" class="form-control" id="content-input">
                    </div>
                    <div class="form-group">
                      <div class="custom-file">
                        <input type="hidden" data-id="media-name-input">
                        <input type="file" data-id="media-input" class="custom-file-input" id="media-input">
                        <label class="custom-file-label" for="media-input">Choose file</label>
                      </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                  </form>
                </div>
              </div>
            </div>
        </div>
        <div align="center" style="margin: 10px;">
            <div class="btn-group" role="group" aria-label="Basic example">
              <button type="button" data-id="load-image" class="btn btn-secondary">Изображения</button>
              <button type="button" data-id="load-video" class="btn btn-secondary">Видео</button>
              <button type="button" data-id="load-audio" class="btn btn-secondary ">Аудио</button> 
            </div>
         </div>
         <div class="row" data-id="posts-container">
            <div data-id="posts-container-w" style="min-width: 50%; min-height: 100px;"></div>
            <div data-id="posts-container-view" style="min-width: 50%; max-width: 50%; min-height: 100px;"></div>
        </div>
      </div>
      <!-- TODO: https://getbootstrap.com/docs/4.4/components/modal/ -->
      <div class="modal fade" data-id="error-modal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Error!</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div data-id="error-message" class="modal-body">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
        this._rootEl.querySelector('[data-id=menu-main]').addEventListener('click', evt => {
            evt.preventDefault();
            this._context.route(evt.currentTarget.getAttribute('href'));
        });
        this._rootEl.querySelector('[data-id=menu-messages]').addEventListener('click', evt => {
            evt.preventDefault();
            this._context.route(evt.currentTarget.getAttribute('href'));
        });
        this._rootEl.querySelector('[data-id=menu-files]').addEventListener('click', evt => {
            evt.preventDefault();
        });

        this._errorModal = $('[data-id=error-modal]'); // jquery
        this._errorMessageEl = this._rootEl.querySelector('[data-id=error-message]');
        this._postsContainerEl = this._rootEl.querySelector('[data-id=posts-container-w]');
        this._postsContainerView = this._rootEl.querySelector('[data-id=posts-container-view]');
        this._postCreateFormEl = this._rootEl.querySelector('[data-id=post-edit-form]');
        this._fileButtonImage = this._rootEl.querySelector('[data-id=load-image]');
        this._fileButtonVideo = this._rootEl.querySelector('[data-id=load-video]');
        this._fileButtonAudio = this._rootEl.querySelector('[data-id=load-audio]');

        this._idInputEl = this._postCreateFormEl.querySelector('[data-id=id-input]');
        this._nameInputEl = this._postCreateFormEl.querySelector('[data-id=content-input]');
        this._mediaNameInputEl = this._postCreateFormEl.querySelector('[data-id=media-name-input]');
        this._mediaInputEl = this._postCreateFormEl.querySelector('[data-id=media-input]');

        let mediaExtension = "";

        this._mediaInputEl.addEventListener('change', evt => {
            const [file] = Array.from(evt.currentTarget.files);
            const formData = new FormData();
            formData.append('file', file);
            this._context.post('/files/multipart', formData, {},
                text => {
                    const data = JSON.parse(text);
                    this._mediaNameInputEl.value = data.name;
                    if (data.name !== null) {
                        if (data.name.endsWith('.png') || data.name.endsWith('.jpg')) {
                            mediaExtension = "image";
                        } else if (data.name.endsWith('.mp4') || data.name.endsWith('.webm')) {
                            mediaExtension = "video";
                        } else if (data.name.endsWith('.mp3')) {
                            mediaExtension = "audio";
                        }
                    }
                },
                error => {
                    this.showError(error);
                });
        });

        this._postCreateFormEl.addEventListener('submit', evt => {
            evt.preventDefault();
            const data = {
                id: Number(this._idInputEl.value),
                name: this._nameInputEl.value,
                media: this._mediaNameInputEl.value,
                extension: mediaExtension
            };
            this._context.post('/container', JSON.stringify(data), {'Content-Type': 'application/json'},
                text => {
                    this._idInputEl.value = 0;
                    this._nameInputEl.value = '';
                    this._mediaNameInputEl.value = '';
                    this._mediaInputEl.value = '';
                    this.loadAll();
                },
                error => {
                    this.showError(error);
                });
        });

        this._fileButtonImage.addEventListener('click', evt => {
            evt.preventDefault();
            this.loadAllImage();
        });
        this._fileButtonVideo.addEventListener('click', evt => {
            evt.preventDefault();
            this.loadAllVideo();
        });
        this._fileButtonAudio.addEventListener('click', evt => {
            evt.preventDefault();
            this.loadAllAudio();
        });
    }

    loadAll() {
        this._context.get('/container', {},
            text => {
                const files = JSON.parse(text);
                this.rebuildList(files);
            },
            error => {
                this.showError(error);
            });
    }

    loadAllImage()  {
        this._context.get('/container/image', {},
            text => {
                const files = JSON.parse(text);
                this.rebuildList(files);
            },
            error => {
                this.showError(error);
            });
    }

    loadAllVideo()  {
        this._context.get('/container/video', {},
            text => {
                const files = JSON.parse(text);
                this.rebuildList(files);
            },
            error => {
                this.showError(error);
            });
    }

    loadAllAudio()  {
        this._context.get('/container/audio', {},
            text => {
                const files = JSON.parse(text);
                this.rebuildList(files);
            },
            error => {
                this.showError(error);
            });
    }

    rebuildList(files) {
        this._postsContainerEl.innerHTML = '';
        for (const file of files) {
            const postEl = document.createElement('div');
            postEl.className = 'col-12';
            postEl.innerHTML = `
            <div class="card" style="padding: 5px">
             <div class="row">
                <div class="col">
                 <p style="float: left" class="card-text">${file.name}</p>
                 <div class="col text-right">
                    <a style="float: right; margin-left: 10px;" href="#" data-action="remove" class="btn btn-sm btn-danger">&#10006;</a>
                    <a style="float: right" href="#" data-action="view" class="btn btn-sm btn-primary">Просмотр</a>
                  </div> 
                 </div>
             </div>
           </div>
          `;
            postEl.querySelector('[data-action=remove]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.delete(`/container/${file.id}`, {},
                    () => {
                        if (file.extension === 'image') {
                           this.loadAllImage();
                        }else if (file.extension === 'video'){
                            this.loadAllVideo();
                        }else if (file.extension === 'audio'){
                            this.loadAllAudio();
                        }
                    }, error => {
                        this.showError(error);
                    });
            });
            postEl.querySelector('[data-action=view]').addEventListener('click', evt => {
                evt.preventDefault();
                this._postsContainerView.innerHTML = '';
                const fileView = document.createElement('div');
                fileView.className = 'col-12';
                console.log(this._context.mediaUrl());
                let fileMedia = '';
                if (file.extension === 'image') {
                    fileMedia = `<img src="${this._context.mediaUrl()}/${file.media}" class="card-img-top" alt="...">`;
                }else if (file.extension === 'video'){
                    fileMedia = `
                        <div class="card-img-topcard-img-top embed-responsive embed-responsive-16by9 mb-2">
                           <video src = "${this._context.mediaUrl()}/${file.media}" class = "embed-responsive-item" style="min-width: 100%" controls>
                        </div>                      
                    `
                }else if (file.extension === 'audio'){
                    fileMedia = `
                      <audio src = "${this._context.mediaUrl()}/${file.media}" class = "embed-responsive-item" style="min-width: 100%" controls>
                    `
                }
                fileView.innerHTML = `
                <div class="card mt-2">
                  ${fileMedia}
                </div>
                `;
                this._postsContainerView.appendChild(fileView);
            });

            this._postsContainerEl.appendChild(postEl);
        }
    }


    showError(error) {
        const data = JSON.parse(error);
        const message = this._context.translate(data.message);
        this._errorMessageEl.textContent = message;
        this._errorModal.modal('show');
    }
}