import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
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
  ): Observable<CreateOrUpdateAssistantCommandResponse> {
    return this.httpClient.post<CreateOrUpdateAssistantCommandResponse>(
      `${environment.apiUrl}/assistants`,
      assistant,
    );
  }

  public GetAssistantsAsync(): Observable<CreateOrUpdateAssistantCommandResponse[]> {
    return this.httpClient.get<CreateOrUpdateAssistantCommandResponse[]>(
      `${environment.apiUrl}/assistants`,
    );
  }

  public deletedAssistantAsync(id: string) {
    return this.httpClient.delete(`${environment.apiUrl}/assistants/${id}`);
  }

  public updatePoliciesAsync(
    id: string,
    policies: PolicyEnum[],
  ): Observable<CreateOrUpdateAssistantCommandResponse> {
    return this.httpClient.patch<CreateOrUpdateAssistantCommandResponse>(
      `${environment.apiUrl}/assistants/${id}`,
      policies,
    );
  }
}
