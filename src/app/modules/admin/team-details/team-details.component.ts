import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamsStoreService } from 'app/core/store/team-store.service';
import { FuseLoadingBarComponent } from '../../../../@fuse/components/loading-bar/loading-bar.component';

@Component({
    selector: 'app-team-details',
    templateUrl: './team-details.component.html',
    standalone: true,
    imports: [CommonModule, FuseLoadingBarComponent],
})
export class TeamDetailsComponent implements OnInit {
    teamId: string;
    usernames: Signal<string[]>;

    constructor(
        private route: ActivatedRoute,
        private teamsStoreService: TeamsStoreService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.teamId = params.get('teamId')!;
            this.usernames = this.teamsStoreService.getTeamMembers(this.teamId);
        });
    }
}
