package com.mydiary.backend.diary;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryRepository diaryRepository;


    // Store
    @PostMapping
    public ResponseEntity<Diary> saveDiary(@RequestBody DiaryRequest request){
        Diary diary = Diary.builder()
                .userId(request.userId())
                .entryDate(request.entryDate())
                .content(request.content())
                .mood(request.mood())
                .todo(request.todo())
                .reflection(request.reflection())
                .illustrationUrl(request.illustrationUrl())
                .build();

        diaryRepository.save(diary);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<DiarySummaryResponse> getDiaries(@RequestParam String userId){
        return diaryRepository.findByUserIdOrderByEntryDateDesc(userId)
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
    public Diary getDiaryByDate(
            @PathVariable String date,
            @RequestParam String userID
    ){
        return diaryRepository.findByUserIdAndEntryDate(userID, LocalDate.parse(date)).orElseThrow();
    }


}
