import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/Models/ApiResponse';
import {
  CreateAssistantCommand,
  CreateOrUpdateAssistantCommandResponse,
  PolicyEnum,
} from './assistants.model';

@Service()
export class MyAssistantsService {
  private readonly httpClient = inject(HttpClient);

  public AddAssistantAsync(
    assistant: CreateAssistantCommand,
  ): Observable<ApiResponse<CreateOrUpdateAssistantCommandResponse>> {
    return this.httpClient.post<ApiResponse<CreateOrUpdateAssistantCommandResponse>>(
      `${environment.apiUrl}/assistants`,
      assistant,
    );
  }

  public GetAssistantsAsync(): Observable<ApiResponse<CreateOrUpdateAssistantCommandResponse[]>> {
    return this.httpClient.get<ApiResponse<CreateOrUpdateAssistantCommandResponse[]>>(
      `${environment.apiUrl}/assistants`,
    );
  }

  public deletedAssistantAsync(id: string) {
    return this.httpClient.delete(`${environment.apiUrl}/assistants/${id}`);
  }

  public updatePoliciesAsync(
    id: string,
    policies: PolicyEnum[],
  ): Observable<ApiResponse<CreateOrUpdateAssistantCommandResponse>> {
    return this.httpClient.patch<ApiResponse<CreateOrUpdateAssistantCommandResponse>>(
      `${environment.apiUrl}/assistants/${id}`,
      policies,
    );
  }
}
