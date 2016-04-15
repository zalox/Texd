import {Component, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {Directive} from "angular2/core";
import {OnInit} from 'angular2/core';
import {EventEmitter} from "angular2/src/facade/async";
import {isPropertyUpdated} from "angular2/src/common/forms/directives/shared";
import {DocumentService} from '../data_access/document.ts';
import {Document, Line, Chapter} from '../domain/document.ts';


@Component({
  selector: 'chapteritem',
  templateUrl: 'views/components/chapteritem.html'

})
export class ChapterItem implements OnChanges {
    @Input() chapterName: string;
    @Input() chapterNr: string;
    @Input() chapterId: string;
    @Input() documentId: string;
    @Output() toBeDeleted : EventEmitter<any> = new EventEmitter();

    constructor(private documentService: DocumentService) {}
    // TODO Make alert, sure you want to delete this chapter?
    delete(event, nr: any){
        event.stopPropagation();
        nr = this.chapterNr;
        this.toBeDeleted.emit(nr)
    }

    rename($event, chapterId, documentId){
        var newchapterName: string = $event.target.innerHTML
        this.documentService.sendDiff({newchapterName}, chapterId)
        $event.target.setAttribute("contenteditable", "false");
    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
        console.log("Something has Changed in chapterItem")
    }

    ondblclickChapter($event){
        console.log("ondblclickChapter")
        $event.target.setAttribute("contenteditable", "true");
    }
}
