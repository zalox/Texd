import {ParseMap} from "../utils/parseMap.ts";
import {Component, ViewChild, Input, Output, Renderer, ElementRef} from 'angular2/core';
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Injectable, bind} from 'angular2/core';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Paragraph, Chapter} from '../domain/document.ts';

@Component({
  selector: 'my-app',
  templateUrl:'views/editor2.html'
})

@Injectable()
export class EditorController2 {

    public socket = new WebSocket('ws://localhost:3001');
    public document : Document = this.getDocumentMock(1);
    public current_chapter : number = 0;
    public senderId : string = "" + Math.random;
    public modifierKeyDown : boolean = false;
    public element : ElementRef;
    public documentHTML : string = "preview";

    private textParser : Parser = new Parser();
    private jsonParser : jsonToHtml = new jsonToHtml();

    // CTRL + P = parse
    // CTRL + N = new paragraph

    constructor(public http: Http, public currElement: ElementRef) {
        this.element = currElement;
    }

    // public changeName = function() {
    //     this.socket.send(JSON.stringify({ name: 'name', message: this.documentName, senderId: "hello" }));
    //     var headers = new Headers();
    //     headers.append('Content-Type', 'application/json');
    //     this.http.post('./document',
    //         JSON.stringify({ documentTitle: this.documentName}),
    //         {headers: headers}).subscribe(res => {
    //             console.log(res);
    //         }
    //     );
    // }

    public changeChapter = function(chapter_number : number) {
        this.current_chapter = chapter_number;
        var _this = this;
        setTimeout(function() {
            var elem = jQuery(_this.element.nativeElement).find('[id=para]').toArray();
            for (var i in elem) {
                _this.auto_grow(elem[i]);
            }
        }, 10);
    }

    public modifierKeyDownPress = function($event) {
        if($event.which === 17) {
            this.modifierKeyDown = true;
        }
    }

    public changeDocument = function($event, paragraphIndex : number) {
        this.auto_grow($event.target);
        // console.log($event.which);
        if ($event.which === 17) {
            this.modifierKeyDown = false;
        }
        else if ($event.which === 80 && this.modifierKeyDown) {
            console.log("parsing");
            var rawParagraphs = this.document.chapters[this.current_chapter].paragraphs;
            var documentJSON = this.textParser.getParsedJSON(rawParagraphs);
            this.documentHTML = this.jsonParser.getParsedHTML(documentJSON);
            // update previewFrame
            var doc = jQuery(this.element.nativeElement).find('#previewFrame')[0].contentWindow.document;
            doc.open();
            doc.write(this.documentHTML);
            doc.close();
        }
        else if ($event.which === 78 && this.modifierKeyDown) {
            console.log("ctrl+n");
            this.document.chapters[this.current_chapter].paragraphs.splice(paragraphIndex+1,0, new Paragraph("",[]));
            console.log("send new paragraph diff");
        }
        else {
            console.log("send diff");
            // this.document.chapters[this.current_chapter].paragraphs[paragraphIndex].raw = newValue;
        }
    }

    public auto_grow = function(element) {
        element.style.height = "5px";
        element.style.height = (element.scrollHeight)+"px";
    }

    ngAfterViewInit() {
        // this.getDocument();
        // this.socket.onmessage = message => {
        //     var parsed = JSON.parse(message.data);
        //     if (this.senderId != parsed.data.senderId) {
        //         console.log("You are not the sender");
        //         if (parsed.data.name == "name") {
        //             this.documentName = parsed.data.message;
        //         }
        //         if (parsed.data.name == "document") {
        //             this.documentText = parsed.data.message;
        //         }
        //       }
        //       else {
        //             console.log("You are the sender");
        //       }
        //   }
    }

    getDocument(){
        // this.http.get('./document').map((res: Response) => res.json()).subscribe(res => {
        //     this.documentText = res.text;
        //     this.documentName = res.title;
        //     this.documentJSON = this.textParser.getParsedJSON(this.documentText);
        //     this.documentHTML = this.jsonParser.getParsedHTML(this.documentJSON);
        // });
    }

    getPlugins(){
        // this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
        //     console.log(res);
        //     this.parseMap.generateParseMap(res);
        // });
    }

    public getDocumentMock(documentId: number){
        var paragraphs1: Paragraph[] = [];
        paragraphs1.push(new Paragraph("Hei #b bloggen1 # #h1 overskrift her # ", []));
        paragraphs1.push(new Paragraph("Hei #b bloggen2 # #h1 overskrift her # ", []));
        paragraphs1.push(new Paragraph("Hei #b <br> bloggen3 # #h1 overskrift her # ", []));
        paragraphs1.push(new Paragraph("Hei #b \n bloggen4 # #h1 overskrift her # ", []));
        var paragraphs2: Paragraph[] = [];
        paragraphs2.push(new Paragraph("Hei #b bloggen5 # #h1 overskrift her # ", []));
        paragraphs2.push(new Paragraph("Hei #b bloggen6 # #h1 overskrift her # ", []));
        paragraphs2.push(new Paragraph("Hei #b bloggen7 # #h1 overskrift her # ", []));
        paragraphs2.push(new Paragraph("Hei #b bloggen8 # #h1 overskrift her # ", []));
        var chapters: Chapter[] = [];
        chapters.push(new Chapter("Kapittel 1", paragraphs1));
        chapters.push(new Chapter("Kapittel 2", paragraphs2));
        return new Document("Test tittel", "Test navn", ["Borgar", "Jørgen", "bjørn"], chapters);
    }
}