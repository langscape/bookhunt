using Domain.Books;

namespace Application.Interfaces.Persistance;

public interface IBookRepository
{
    void Add(Book book);
}