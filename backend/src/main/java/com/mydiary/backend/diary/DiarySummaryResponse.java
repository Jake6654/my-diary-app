package com.mydiary.backend.diary;

import java.time.LocalDate;

public record DiarySummaryResponse(
        String id,
        LocalDate entryDate,
        String mood,
        String summary
) {}