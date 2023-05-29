using Contracts.Books;
using MediatR;

namespace Application.Books.Commands.CreateBook;

public record CreateBookCommand(
    string ISBN,
    string Title,
    string Author) : IRequest<CreateBookResponse>;