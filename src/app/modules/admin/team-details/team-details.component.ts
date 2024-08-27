import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamsService } from 'app/core/teams/teams.service';
import { Team } from 'app/modules/admin/team-details/team.types';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FuseLoadingBarComponent } from '../../../../@fuse/components/loading-bar/loading-bar.component';

@Component({
    selector: 'app-team-details',
    templateUrl: './team-details.component.html',
    standalone: true,
    imports: [CommonModule, FuseLoadingBarComponent],
})
export class TeamDetailsComponent implements OnInit {
    team$: Observable<Team>;
    members$: Observable<any[]>;

    constructor(
        private route: ActivatedRoute,
        private teamsService: TeamsService
    ) {}

    ngOnInit(): void {
        this.team$ = this.route.paramMap.pipe(
            switchMap((params) =>
                this.teamsService.getTeamById(params.get('teamId')!)
            )
        );

        this.members$ = this.route.paramMap.pipe(
            switchMap((params) =>
                this.teamsService.getTeamMembers(params.get('teamId')!)
            )
        );
    }
}
