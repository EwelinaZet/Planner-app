package com.planner.planner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record TaskRequest(
        @NotBlank(message = "Nazwa zadania nie może być pusta") String title,
        @NotBlank(message = "Opis nie może być pusty") String description,
        @NotNull(message = "Podaj datę rozpoczęcia") Instant startDate,
        @NotNull(message = "Podaj datę zakończenia") Instant endDate,
        @NotNull(message = "Nie wybrano użytkownika") Long assignedUserId) {
}
