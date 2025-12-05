package com.mydiary.backend.diary;

import com.mydiary.backend.diary.GenerateRequest;
import com.mydiary.backend.diary.GenerateResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class FluxIllustrationClient {

    private final WebClient fluxWebClient;

    public FluxIllustrationClient(WebClient fluxWebClient) {
        this.fluxWebClient = fluxWebClient;
    }

    public String generateImageUrl(String diaryText) {

        GenerateRequest req = new GenerateRequest(diaryText);

        GenerateResponse res = fluxWebClient.post()
                .uri("/generate")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(GenerateResponse.class)
                .block();

        return res != null ? res.image_url() : null;
    }
}
