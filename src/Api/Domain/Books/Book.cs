namespace Api.Domain.Books;

using ErrorOr;

internal class Book
{
    private List<BookSight> _sights = new();

    private Book(
        string title,
        string author,
        string isbn,
        string description)
    {
        Title = title;
        Author = author;
        Isbn = isbn;
        Description = description;
    }

    // A Private function that validates a book's ISBN number
    private static bool IsValidIsbn(string isbn)
    {
        if (isbn.Length != 10)
        {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 9; i++)
        {
            int digit = isbn[i] - '0';
            if (digit < 0 || digit > 9)
            {
                return false;
            }
            sum += (digit * (10 - i));
        }

        char last = isbn[9];
        if (last != 'X' && (last < '0' || last > '9'))
        {
            return false;
        }

        int checksum = last == 'X' ? 10 : (last - '0');
        return ((sum + checksum) % 11) == 0;
    }

    public static ErrorOr<Book> Create(
        string title,
        string author,
        string isbn,
        string description)
    {
        if (string.IsNullOrEmpty(title))
            return Error.Validation("Title is required.");

        if (string.IsNullOrEmpty(author))
            return Error.Validation("Title is required.");

        if (string.IsNullOrEmpty(isbn))
            return Error.Validation("Title is required.");

        if (string.IsNullOrEmpty(description))
            return Error.Validation("Title is required.");

        if (!IsValidIsbn(isbn))
            return Error.Validation("Title is required.");

        return new Book(title, author, isbn, description);
    }

    // A public method to add a BookSight to a Book
    public void AddSight(decimal latitude, decimal longitude, DateTime timestamp)
    {
        _sights.Add(BookSight.Create(latitude, longitude, timestamp));
    }

    public string Title { get; }
    public string Author { get; }
    public string Isbn { get; }
    public string Description { get; }
    public IEnumerable<BookSight> Sights { get => _sights; }
}