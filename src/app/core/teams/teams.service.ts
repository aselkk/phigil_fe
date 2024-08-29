import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TeamsService {
    private apiUrl = 'https://phigil-team-management-bglcjkpr6a-uc.a.run.app';

    constructor(
        private http: HttpClient,
        private userService: UserService
    ) {}

    private getHeaders(): HttpHeaders {
        const uid = this.userService.getUid();
        if (!uid) {
            throw new Error('User not authenticated');
        }

        return new HttpHeaders({
            Identity: uid,
        });
    }

    getTeams(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.apiUrl}/teams`, { headers });
    }

    getTeamMembers(teamId: string): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.apiUrl}/teams/${teamId}`, { headers });
    }

    deleteTeamMember(teamId: string, memberId: string): Observable<any> {
        const headers = this.getHeaders();
        return this.http.delete(`${this.apiUrl}/teams/${teamId}/${memberId}`, {
            headers,
        });
    }
}
