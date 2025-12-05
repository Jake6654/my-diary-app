package com.mydiary.backend.diary;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryRepository diaryRepository;
    private final FluxIllustrationClient fluxIllustrationClient;


    @GetMapping("/ai-test")
    public String testAi() {
        String url = fluxIllustrationClient.generateImageUrl(
                "오늘은 스프링이랑 AI 서비스 연결 테스트를 했다!"
        );
        return url;
    }


    // Store
    @PostMapping
    public ResponseEntity<Diary> saveDiary(@RequestBody DiaryRequest request) {

        UUID userUuid = UUID.fromString(request.userId());
        LocalDate entryDate = request.entryDate();

        Optional<Diary> existing =
                diaryRepository.findByUserIdAndEntryDate(userUuid, entryDate);

        Diary diary = existing.orElseGet(Diary::new);

        diary.setUserId(userUuid);
        diary.setEntryDate(entryDate);
        diary.setContent(request.content());
        diary.setMood(request.mood() != null ? request.mood().toLowerCase() : null);
        diary.setTodo(request.todo());
        diary.setReflection(request.reflection());
        diary.setIllustrationUrl(request.illustrationUrl());

        // 프론트에서 직접 illustrationUrl을 보냈다면 우선 적용
        if (request.illustrationUrl() != null && !request.illustrationUrl().isBlank()) {
            diary.setIllustrationUrl(request.illustrationUrl());
        }

        String imageUrl;
        try {
            imageUrl = fluxIllustrationClient.generateImageUrl(diary.getContent());
        } catch (Exception e) {
            e.printStackTrace();
            imageUrl = null; // fallback
        }
        diary.setIllustrationUrl(imageUrl);


        // when there's no diary on a day
        LocalDateTime now = LocalDateTime.now();
        if (diary.getId() == null) {
            // 새 레코드일 때만 created_at 설정
            diary.setCreatedAt(String.valueOf(now));
        }
        diary.setUpdatedAt(String.valueOf(now));

        Diary saved = diaryRepository.save(diary);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public List<DiarySummaryResponse> getDiaries(@RequestParam String userId){
        return diaryRepository.findByUserIdOrderByEntryDateDesc(UUID.fromString(userId))
                .stream()
                .map(d -> new DiarySummaryResponse(
                        d.getId(),
                        d.getEntryDate(),
                        d.getMood(),
                        makeSummary(d.getContent())
                ))
                .toList();
    }

    private String makeSummary(String content){
        if (content == null) return "";
        return content.length() > 60 ? content.substring(0, 57) + "..." : content;
    }

    // get the diary for a specific date
    @GetMapping("/{date}")
    public ResponseEntity<Diary> getDiaryByDate(
            @PathVariable String date,
            @RequestParam  UUID userId
    ){
        return diaryRepository.findByUserIdAndEntryDate(userId, LocalDate.parse(date))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
