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
        diary.setMood(request.mood());
        diary.setTodo(request.todo());
        diary.setReflection(request.reflection());
        diary.setIllustrationUrl(request.illustrationUrl());

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
