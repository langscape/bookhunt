using Domain.Models;

namespace Domain.Books.ValueObjects;

public sealed class Qr : ValueObject
{
    private const int QrLength = 12;

    private Qr()
    {
    }

    public static Qr Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length != QrLength)
            throw new ArgumentException("QR code is invalid.", nameof(value));

        return new Qr
        {
            Value = value
        };
    }

    public string Value { get; set; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}