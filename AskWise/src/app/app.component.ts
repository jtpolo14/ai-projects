import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav'
import { CustomSidenavComponent } from './components/custom-sidenav/custom-sidenav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, CustomSidenavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  title = 'ezFramework';
  appVersion = 1.0;
  appSupportTeam = 'jtpolo14'

  sidenavCollapsed = signal(false);
  sidenavWidth = computed(() => this.sidenavCollapsed() ? '65px' : '250px');
  sidenavFooterSize = computed(() => this.sidenavCollapsed() ? '7px' : 'small');
}
