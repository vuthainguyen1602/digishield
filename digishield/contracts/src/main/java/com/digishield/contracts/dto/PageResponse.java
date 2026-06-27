package com.digishield.contracts.dto;

import java.util.List;

/**
 * Generic DTO used to return paginated results.
 *
 * @param items the list of elements on the current page
 * @param total the total number of elements across the entire result set
 * @param <T>   the type of the element
 */
public record PageResponse<T>(List<T> items, long total) {
}
