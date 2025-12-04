package com.mydiary.backend.diary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiaryRepository extends JpaRepository<Diary, String> {
    List<Diary> findByUserIdOrderByEntryDateDesc(String userId);
    Optional<Diary> findByUserIdAndEntryDate(String userId, LocalDate entryDate);


}
