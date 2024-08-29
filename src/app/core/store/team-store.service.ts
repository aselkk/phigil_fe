import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    Injectable,
    Signal,
    WritableSignal,
    computed,
    signal,
} from '@angular/core';
import { UserService } from 'app/core/user/user.service';

@Injectable({
    providedIn: 'root',
})
export class TeamsStoreService {
    private apiUrl = 'https://phigil-team-management-bglcjkpr6a-uc.a.run.app';

    private teams: WritableSignal<string[]> = signal([]);
    private members: WritableSignal<{ [teamId: string]: string[] }> = signal(
        {}
    );

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

    getTeams(): Signal<string[]> {
        if (this.teams().length === 0) {
            const headers = this.getHeaders();
            this.http
                .get<{
                    code: number;
                    teams: string[];
                }>(`${this.apiUrl}/teams`, { headers })
                .subscribe((response) => {
                    this.teams.set(response.teams);
                });
        }
        return this.teams;
    }

    getTeamMembers(teamId: string): Signal<string[]> {
        const membersForTeam = computed(() => this.members()[teamId] || []);

        if (!this.members()[teamId]) {
            const headers = this.getHeaders();
            this.http
                .get<{
                    code: number;
                    usernames: string[];
                }>(`${this.apiUrl}/teams/${teamId}`, { headers })
                .subscribe((response) => {
                    const updatedMembers = {
                        ...this.members(),
                        [teamId]: response.usernames,
                    };
                    this.members.set(updatedMembers);
                });
        }

        return membersForTeam;
    }

    clearCache() {
        this.teams.set([]);
        this.members.set({});
    }
}
