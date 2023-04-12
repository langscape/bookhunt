namespace Api.Interfaces.Repositories;

using Api.Domain.Books;

internal interface IBookRepository
{
    Task<Book> GetBook(Guid id);
    Task<IEnumerable<Book>> GetBooks();
    Task<Book> AddBook(Book book);
    Task<Book> UpdateBook(Book book);
    Task DeleteBook(Guid id);
}
