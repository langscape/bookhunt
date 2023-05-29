using Domain.Books.ValueObjects;
using Domain.Models;

namespace Domain.Books;

public sealed class Book : AggregateRoot<Guid>
{
    private List<Location> _locations = new();

    private Book(Guid id) : base(id)
    {
    }

    public Isbn Isbn { get; private set; }
    public Qr Qr { get; private set; }
    public string Title { get; private set; }
    public string Author { get; private set; }
    public Location LastLocation { get; private set; }
    public IReadOnlyList<Location> Locations => _locations.AsReadOnly();

    public static Book Create(
        string isbn,
        string title,
        string author
        )
    {
        if (string.IsNullOrWhiteSpace(isbn))
            throw new ArgumentException("ISBN is required.", nameof(isbn));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Name is required.", nameof(title));

        if (string.IsNullOrWhiteSpace(author))
            throw new ArgumentException("Author is required.", nameof(author));

        return new Book(Guid.NewGuid())
        {
            Isbn = Isbn.Create(isbn),
            Title = title,
            Author = author,
            _locations = new List<Location>()
        };
    }
}