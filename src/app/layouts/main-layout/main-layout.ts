import { Component, inject } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Cursor } from "../../Components/cursor/cursor";
import { StarsCanvas } from "../../Components/stars-canvas/stars-canvas";
import { Navbar } from "../../Components/navbar/navbar";
import { Footer } from "../../Components/footer/footer";
import { ConfigService } from '../../core/Services/config';


@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Cursor, StarsCanvas, Navbar, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
    configService = inject(ConfigService);

}
