import {Component, NgZone, Injector, provide, AfterViewInit, ViewChild, AfterContentInit, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {DocumentService} from '../data_access/document.ts';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap'
import {Document} from '../domain/document.ts';
import {UPLOAD_DIRECTIVES} from './ng2-uploader.ts';
import {EventEmitter} from "angular2/src/facade/async";

import {Modal} from "ng2-modal/Modal";

@Component({
    selector: 'imageUploader',
    templateUrl: 'views/imageModal.html',
    directives: [Modal, UPLOAD_DIRECTIVES, Alert]
})
export class FileUpload implements AfterViewInit {
    zone: NgZone;
    options: Object = {
        url: './upload/photo'
    };
    basicProgress: number = 0;
    basicResp: Object;
    multipleProgress: number = 0;
    multipleResp: any[] = [];
    dropProgress: number = 0;
    dropResp: any[] = [];
    selectedFileIsUploading = false;
    dragedFileIsUploading = false;
    selectedFileIsUploaded = false;
    dragedFileIsUploaded = false;
    public dirFiles = [];
    public tests = [];
    public currentDoc;
    @Output() clickedImage: EventEmitter<any> = new EventEmitter();
    public imageToUploadToEditor;
    @Input() doc: Document;


    constructor(private documentService: DocumentService) {
        this.zone = new NgZone({ enableLongStackTrace: false });

    }

    ngAfterViewInit() {
        setTimeout(() => {
            console.log("FileUploadModal to'ern - OK?")
            this.currentDoc = this.doc
            this.findAllPhotos()
        }, 100)

    }

    onModalOpen() {
        console.log("on modal open");
    }
    private findAllPhotos() {
        console.log("1 OK")
        this.documentService.getFilesInDir(this.currentDoc._id, (files) => {
            if (!files.errno) {
                files.forEach(file => {
                    this.dirFiles.push("uploads/document/" + this.currentDoc._id + "/photos/" + file);
                });
            }
        });
    }

    photoClicked(file) {
        console.log("clicked: " + file)
        this.clickedImage.emit(file)
    }


    handleMultipleUpload(data): void {
        this.selectedFileIsUploading = true;
        let index = this.multipleResp.findIndex(x => x.id === data.id);
        if (index === -1) {
            if (!data.error) {
                this.selectedFileIsUploaded = true;
                console.log(data);
                setTimeout(() => {
                    this.dirFiles.push("uploads/document/" + this.currentDoc._id + "/photos/" + data.originalName);
                }, 1000)
            }
            this.multipleResp.push(data);
        }
        else {
            this.zone.run(() => {
                this.multipleResp[index] = data;
            });
        }

        let total = 0, uploaded = 0;
        this.multipleResp.forEach(resp => {
            total += resp.progress.total;
            uploaded += resp.progress.loaded;
        });

        this.multipleProgress = Math.floor(uploaded / (total / 100));

    }

    handleDropUpload(data): void {
        this.dragedFileIsUploading = true;
        let index = this.dropResp.findIndex(x => x.id === data.id);
        if (index === -1) {
            this.dropResp.push(data);
            if (!data.error) {
                this.dragedFileIsUploaded = true;
            }
        }
        else {
            this.zone.run(() => {
                this.dropResp[index] = data;
            });
        }

        let total = 0, uploaded = 0;
        this.dropResp.forEach(resp => {
            total += resp.progress.total;
            uploaded += resp.progress.loaded;
        });

        this.dropProgress = Math.floor(uploaded / (total / 100));

    }
}