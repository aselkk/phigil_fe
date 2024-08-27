import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import {
    Storage,
    getDownloadURL,
    ref,
    uploadBytes,
} from '@angular/fire/storage';
import { Observable, catchError, from, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OnboardingService {
    constructor(
        private firestore: Firestore,
        private storage: Storage
    ) {}

    createTeam(userId: string, teamName: string): Promise<string> {
        const userTeamsCollectionRef = collection(
            this.firestore,
            `users/${userId}/teams`
        );
        const teamDocRef = doc(userTeamsCollectionRef); // Use Firestore's auto-generated ID
        return setDoc(teamDocRef, { name: teamName }).then(() => teamDocRef.id); // Return the document ID after creation
    }

    addTeamMember(
        userId: string,
        teamId: string,
        memberName: string,
        memberData: any,
        file: File
    ): Observable<any> {
        const fileRef = ref(
            this.storage,
            `users/${userId}/teams/${teamId}/members/${file.name}`
        );

        return from(uploadBytes(fileRef, file)).pipe(
            switchMap(() => getDownloadURL(fileRef)),
            switchMap((downloadURL) => {
                const memberDocRef = doc(
                    collection(
                        this.firestore,
                        `users/${userId}/teams/${teamId}/members`
                    )
                );
                return from(
                    setDoc(memberDocRef, {
                        ...memberData,
                        name: memberName,
                        imageUrl: downloadURL,
                    })
                );
            }),
            catchError((error) => {
                throw new Error(
                    'Error uploading file or saving data to Firestore'
                );
            })
        );
    }
}
