import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooter } from "./Components/app-footer/app-footer";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,  AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Prisma.Client');
}