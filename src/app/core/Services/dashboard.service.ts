import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { ApiResponse } from "../Models/ApiResponse";
import { DashboardResponse } from "../Models/Student/Dashboard.Models";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);
    getDashboard(): Observable<ApiResponse<DashboardResponse>> {
        return this.http.get<ApiResponse<DashboardResponse>>(`${environment.apiUrl}/student/dashboard/`)
    }
}