import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-compare-result',
    templateUrl: './compare-result.component.html',
    styleUrls: ['./compare-result.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
})
export class CompareResultComponent implements AfterViewInit {
    imageUrl: string;
    boxes: number[][];
    names: string[];

    @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('recognizedFaces')
    recognizedFacesContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('unrecognizedFaces')
    unrecognizedFacesContainer!: ElementRef<HTMLDivElement>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.imageUrl = data.imageUrl;
        this.boxes = data.boxes;
        this.names = data.names;
    }

    ngAfterViewInit(): void {
        if (this.imageUrl && this.boxes.length > 0 && this.names.length > 0) {
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

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(img, 0, 0);

                this.boxes.forEach((box, index) => {
                    context.beginPath();
                    context.rect(
                        box[0],
                        box[1],
                        box[2] - box[0],
                        box[3] - box[1]
                    );
                    context.lineWidth = 2;
                    context.strokeStyle =
                        this.names[index] === 'NAN' ? 'red' : 'green';
                    context.stroke();
                    context.font = '20px Arial';
                    context.fillStyle = 'yellow';
                    context.fillText(
                        this.names[index] === 'NAN'
                            ? 'imposter'
                            : this.names[index],
                        box[0],
                        box[1] - 5
                    );
                });

                this.showCroppedFaces(img);
            }
        };
    }

    showCroppedFaces(img: HTMLImageElement): void {
        const recognizedFacesContainer =
            this.recognizedFacesContainer.nativeElement;
        const unrecognizedFacesContainer =
            this.unrecognizedFacesContainer.nativeElement;

        recognizedFacesContainer.innerHTML = '';
        unrecognizedFacesContainer.innerHTML = '';

        this.boxes.forEach((box, index) => {
            const cropCanvas = document.createElement('canvas');
            const cropContext = cropCanvas.getContext('2d');

            if (cropContext) {
                cropCanvas.width = box[2] - box[0];
                cropCanvas.height = box[3] - box[1];

                cropContext.drawImage(
                    img,
                    box[0],
                    box[1],
                    cropCanvas.width,
                    cropCanvas.height,
                    0,
                    0,
                    cropCanvas.width,
                    cropCanvas.height
                );

                const croppedImage = document.createElement('img');
                croppedImage.src = cropCanvas.toDataURL();
                croppedImage.className = 'w-24 h-auto m-2 border-2 rounded';

                const label =
                    this.names[index] === 'NAN' ? '' : this.names[index];
                const labelDiv = document.createElement('div');
                labelDiv.textContent = label;
                labelDiv.className = 'text-center mt-2';

                if (this.names[index] === 'NAN') {
                    croppedImage.classList.add('border-red-500');
                    unrecognizedFacesContainer.appendChild(croppedImage);
                    unrecognizedFacesContainer.appendChild(labelDiv);
                } else {
                    croppedImage.classList.add('border-green-500');
                    recognizedFacesContainer.appendChild(croppedImage);
                    recognizedFacesContainer.appendChild(labelDiv);
                }
            }
        });
    }
}
