import { Service } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { AIChatRequest } from '../../models/ai-models';

@Service()
export class AiChatServices {
  public streamAiResponse(request: AIChatRequest): Observable<string> {
    return new Observable<string>((observer) => {
      const abortController = new AbortController();

      fetchEventSource(`${environment.apiUrl}/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortController.signal,

        // Triggered every time a complete SSE chunk is received
        onmessage(event) {
          // You receive clean parsed text data directly here!
          observer.next(event.data);
        },

        onclose() {
          observer.complete();
        },

        onerror(err) {
          observer.error(err);
        },
      });

      // Teardown: If the user leaves the page or cancels, abort the connection natively
      return () => {
        abortController.abort();
      };
    });
  }
}
