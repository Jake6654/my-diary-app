package com.mydiary.backend.diary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DiaryRepository extends JpaRepository<Diary, String> {
    List<Diary> findByUserIdOrderByEntryDateDesc(UUID userId);
    Optional<Diary> findByUserIdAndEntryDate(UUID userId, LocalDate entryDate);


}
