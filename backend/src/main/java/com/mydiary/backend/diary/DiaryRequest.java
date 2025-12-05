package com.mydiary.backend.diary;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

public record DiaryRequest(
        String userId,
        LocalDate entryDate,
        String content,
        String mood,
        String todo,        // JSON 문자열 (프론트에서 JSON.stringify 한 값)
        String reflection,
        String illustrationUrl
        // boolean generateIllustration
) {}


