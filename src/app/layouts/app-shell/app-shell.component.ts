import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

/**
 * Wraps every authenticated route (dashboard + all 12 feature modules) in a
 * consistent sidebar + header shell, replacing the growing row of "Manage
 * X" buttons that had been living on the Gym Owner dashboard page as each
 * module was added. That page now only shows dashboard content; navigation
 * lives here, once, for every page.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {}
