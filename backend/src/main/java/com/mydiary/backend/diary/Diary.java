package com.mydiary.backend.diary;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDate;

import java.util.UUID;

@Entity
@Table(name = "diaries")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diary {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String mood;

    @Column(columnDefinition = "TEXT")
    private String todo;

    @Column(columnDefinition = "TEXT")
    private String reflection;

    @Column(name = "illustration_url")
    private String illustrationUrl;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
