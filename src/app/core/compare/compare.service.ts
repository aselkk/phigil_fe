import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FileCompareService {
    private apiUrl =
        'https://compare-bglcjkpr6a-uc.a.run.app/predictions/compare';

    constructor(private http: HttpClient) {}

    uploadFile(file: File, formData: any): Observable<any> {
        const formDataToSend: FormData = new FormData();
        formDataToSend.append('image', file, file.name);
        formDataToSend.append(
            'meta',
            new Blob([JSON.stringify(formData)], { type: 'application/json' })
        );

        return this.http.post(this.apiUrl, formDataToSend);
    }
}
