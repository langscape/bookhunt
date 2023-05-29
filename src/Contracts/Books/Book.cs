namespace Contracts.Books;

public record CreateBookRequest(
    string ISBN,
    string Title,
    string Author);

public record CreateBookResponse(
    string Id,
    string ISBN,
    string Title,
    string Author,
    string QR,
    List<LocationResponse> Locations);

public record LocationResponse(
    decimal Latitude,
    decimal Longitude,
    DateTime Timestamp);