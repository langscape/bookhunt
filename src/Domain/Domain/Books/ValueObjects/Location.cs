using Domain.Models;

namespace Domain.Books.ValueObjects;

public sealed class Location : ValueObject
{
    // A function that validates latitude and longitude values.
    // It returns true if the values are valid, otherwise false.
    private static readonly Func<decimal, decimal, bool> ValidateLocation = (latitude, longitude) =>
    {
        if (latitude < -90 || latitude > 90)
            return false;

        if (longitude < -180 || longitude > 180)
            return false;

        return true;
    };

    private Location(
        decimal latitude,
        decimal longitude,
        DateTime timestamp)
    {
        Latitude = latitude;
        Longitude = longitude;
    }

    public static Location Create(decimal latitude, decimal longitude, DateTime timestamp)
    {
        if (!ValidateLocation(latitude, longitude))
            throw new ArgumentException("Invalid location.", nameof(latitude));

        return new Location(latitude, longitude, timestamp);
    }

    public decimal Latitude { get; }
    public decimal Longitude { get; }
    public DateTime Timestamp { get; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Latitude;
        yield return Longitude;
        yield return Timestamp;
    }
}