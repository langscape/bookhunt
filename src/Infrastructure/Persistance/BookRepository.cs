using Application.Interfaces.Persistance;
using Domain.Books;

namespace Infrastructure.Persistance;

internal class BookRepository : IBookRepository
{
    private static readonly List<Book> _books = new();

    public void Add(Book book)
    {
        _books.Add(book);
    }
}