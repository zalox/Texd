import {ParseMap} from "../utils/parseMap.ts";
import {Component, ElementRef, Renderer, Input, AfterViewInit, OnChanges, SimpleChange} from 'angular2/core';
import {Http, HTTP_BINDINGS, Response} from 'angular2/http';
import {Injectable, } from 'angular2/core';
import {RouteParams} from 'angular2/router';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {ChapterItem} from './chapteritem.ts'
import {CmComponent} from './cmcomponent.ts'
import {SnappetParser} from "../utils/snappetParser.ts";

import {CORE_DIRECTIVES} from 'angular2/common';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';


@Component({
    selector: 'texd-editor',
    templateUrl: 'views/editor.html',
    providers: [DocumentService, HTTP_BINDINGS],
    directives: [ChapterItem, CmComponent, DROPDOWN_DIRECTIVES, CORE_DIRECTIVES]
})

export class EditorController {
    private document: Document = new Document([], [], [], [], [{}, {}, {}]);
    public current_chapter: number = 0;
    public current_paragraph: number = 0;
    public element: ElementRef;
    private snappetParser: SnappetParser;
    private cmFocused: boolean[] = [];
    private showUploadDiv = false;
    public filesToUpload: Array<File> = [];

    constructor(private http: Http, public currElement: ElementRef, private documentService: DocumentService, public renderer: Renderer, private _routeParams: RouteParams) {
        this.element = currElement;
        renderer.listenGlobal('document', 'keydown', ($event) => {
            this.globalKeyEvent($event);
        });
        if (this._routeParams.get('id')) {
            this.documentService.getDocument(this._routeParams.get('id'), (document2) => {
                this.document = document2;
            })
        }
        //TODO integrate with codemirror
        this.http.get('./snappets').map((res: Response) => res.json()).subscribe(res => {
            console.log(JSON.stringify(res, null, 2));
            var snappets: any[] = [];
            this.snappetParser = new SnappetParser(this.element, res);
        });
    }

    // from cmComponent output emit
    public cmOnFocusEmit(index) {
        this.current_paragraph = index;
        for (var i = 0; i < this.document.chapters[this.current_chapter].paragraphs.length; i++) {
            if (i != index) {
                this.cmFocused[i] = false;
            }
        }
    }

    //TODO implement this, to be deleted in DB
    public deleteChapterFromDB(value: string) {
        console.log("deleteChapterFromDB(" + value + ")");

        var chapters: Chapter[] = this.documentService.document.chapters;

        for (var index = 0; index < chapters.length; index++) {
            var element = chapters[index];
            if (element.id == value) {
                chapters.splice(index, 1);
                break;
            }
        }

    }

    public createChapter() {
        var p = new Paragraph("Text", []);
        this.document.chapters.splice(this.current_chapter + 1, 0, new Chapter("New Chapter", [p]));
        var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, {}, p, 0, false, true);
        this.documentService.sendDiff(diff);
        this.current_chapter += 1;
    }

    public gotoChapter($event, text) {
        if ($event.which === 13) {
            if (this.document.chapters[text]) {
                this.current_chapter = parseInt(text);
            }
        }
    }

    public changeDocumentTitle($event) {
        if (!($event.target.innerHTML == this.document.title)) {
            this.documentService.changeTitle(this.document.id, $event.target.innerHTML);
        }
    }

    public changeChapter(chapter_number: number) {
        console.log("CHANGE CHAPTER:   changeChapter(chapter_number : " + chapter_number + ")")
        this.current_chapter = chapter_number;
    }

    public globalKeyEvent($event) {
        console.log($event.which);
        var keyMap = {};
        keyMap[78] = () => {
            this.document.chapters[this.current_chapter].paragraphs.splice(this.current_paragraph + 1, 0, new Paragraph("...", []));
            var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, "", new Paragraph("...", []), this.current_paragraph, true, false)
            this.documentService.sendDiff(diff);
        }
        keyMap[80] = () => {
            console.log("ctrl+p");
        }
        keyMap[67] = () => {
            console.log("ctrl+c");
            this.createChapter();
        }

        if ($event.ctrlKey) {
            if (keyMap[$event.which]) {
                $event.preventDefault();
                keyMap[$event.which]();
            }
        }
    }


    public showUploadDivToggle(hide) {
        this.showUploadDiv = hide;

    }



}
