import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/user/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor(private _userService: UserService) {}
    ngOnInit(): void {}
}
