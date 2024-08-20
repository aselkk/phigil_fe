import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    ViewChild,
} from '@angular/core';

@Component({
    selector: 'app-compare-result',
    templateUrl: './compare-result.component.html',
    styleUrls: ['./compare-result.component.scss'],
    standalone: true,
})
export class CompareResultComponent implements OnChanges {
    @Input() imageUrl: string = '';
    @Input() boxes: number[][] = [];
    @Input() names: string[] = [];

    @ViewChild('canvas', { static: false })
    canvas!: ElementRef<HTMLCanvasElement>;
    context: CanvasRenderingContext2D | null = null;

    ngOnChanges(): void {
        if (this.imageUrl) {
            this.drawBoxes();
        }
    }

    drawBoxes(): void {
        const canvas = this.canvas.nativeElement;
        const img = new Image();
        img.src = this.imageUrl;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            this.context = canvas.getContext('2d');
            if (this.context) {
                this.context.drawImage(img, 0, 0);

                this.boxes.forEach((box, index) => {
                    this.context!.beginPath();
                    this.context!.rect(
                        box[0],
                        box[1],
                        box[2] - box[0],
                        box[3] - box[1]
                    );
                    this.context!.lineWidth = 2;
                    this.context!.strokeStyle =
                        this.names[index] === 'NAN' ? 'red' : 'green';
                    this.context!.stroke();
                    this.context!.font = '16px Arial';
                    this.context!.fillStyle = 'yellow';
                    this.context!.fillText(
                        this.names[index] === 'NAN'
                            ? 'imposter'
                            : this.names[index],
                        box[0],
                        box[1] - 5
                    );
                });
            }
        };
    }
}
