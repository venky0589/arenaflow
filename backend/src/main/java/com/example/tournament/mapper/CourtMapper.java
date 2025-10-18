package com.example.tournament.mapper;

import com.example.tournament.domain.Court;
import com.example.tournament.dto.request.CreateCourtRequest;
import com.example.tournament.dto.request.UpdateCourtRequest;
import com.example.tournament.dto.response.CourtResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Court entity and DTOs
 */
@Component
public class CourtMapper {

    /**
     * Convert CreateCourtRequest to Court entity
     */
    public Court toEntity(CreateCourtRequest request) {
        if (request == null) {
            return null;
        }

        Court court = new Court();
        court.setName(request.name());
        court.setLocationNote(request.locationNote());

        return court;
    }

    /**
     * Convert UpdateCourtRequest to Court entity
     * Note: This creates a partial entity for update operations
     */
    public Court toEntity(UpdateCourtRequest request) {
        if (request == null) {
            return null;
        }

        Court court = new Court();
        court.setName(request.name());
        court.setLocationNote(request.locationNote());

        return court;
    }

    /**
     * Convert Court entity to CourtResponse
     */
    public CourtResponse toResponse(Court court) {
        if (court == null) {
            return null;
        }

        return new CourtResponse(
                court.getId(),
                court.getName(),
                court.getLocationNote()
        );
    }
}
