using System.ComponentModel;
namespace Api.Domain.Books;

internal class BookSight {
    // Private Constructor
    private BookSight(       
        decimal latitude,
        decimal longitude,
        DateTime timestamp) {
        Latitude = latitude;
        Longitude = longitude;
        Timestamp = timestamp;
    }

    // Public Factory Method
    public static BookSight Create(
        decimal latitude,
        decimal longitude,
        DateTime timestamp) {
        if (latitude < -90 || latitude > 90) {
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90");
        }

        if (longitude < -180 || longitude > 180) {
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180");
        }

        return new BookSight(latitude, longitude, timestamp);
    }

    public decimal Latitude { get; private set; }
    public decimal Longitude { get; private set; }
    public DateTime Timestamp { get; private set; }
}