using Domain.Models;

namespace Domain.Books.ValueObjects;

public sealed class Isbn : ValueObject
{
    // A function to validate the ISBN-13 format.
    private static readonly Func<string, bool> IsValidIsbn = isbn =>
    {
        if (isbn.Length != 13)
        {
            return false;
        }

        var sum = 0;
        for (var i = 0; i < 12; i++)
        {
            sum += int.Parse(isbn[i].ToString()) * (i % 2 == 0 ? 1 : 3);
        }

        var remainder = sum % 10;
        var checkDigit = remainder == 0 ? 0 : 10 - remainder;
        return checkDigit == int.Parse(isbn[12].ToString());
    };

    private Isbn(string value)
    {
        Value = value;
    }

    public static Isbn Create(string value)
    {
        if (!IsValidIsbn(value))
            throw new ArgumentException("Invalid ISBN-13 format.");

        return new Isbn(value);
    }

    public string Value { get; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}