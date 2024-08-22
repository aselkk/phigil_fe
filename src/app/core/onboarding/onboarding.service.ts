import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OnboardingService {
    private apiUrl =
        'https://onboard-lwdrsd6qmq-uc.a.run.app/predictions/onboard';

    constructor(
        private http: HttpClient,
        private firestore: Firestore
    ) {}

    createTeam(teamName: string): Promise<void> {
        const teamDocRef = doc(collection(this.firestore, 'teams'), teamName);
        return setDoc(teamDocRef, {});
    }

    addTeamMember(
        teamName: string,
        memberName: string,
        memberData: any,
        file: File
    ): Observable<any> {
        const memberDocRef = doc(
            collection(doc(this.firestore, 'teams', teamName), 'members'),
            memberName
        );
        const firestorePromise = setDoc(memberDocRef, memberData)
            .then(() => console.log(`Member ${memberName} added to Firestore`))
            .catch((error) =>
                console.error(`Error adding member to Firestore: ${error}`)
            );

        const formData: FormData = new FormData();
        formData.append('image', file, file.name);
        formData.append(
            'meta',
            new Blob([JSON.stringify(memberData)], { type: 'application/json' })
        );

        const apiCall$ = this.http.post(this.apiUrl, formData);

        return from(firestorePromise).pipe(switchMap(() => apiCall$));
    }
}
