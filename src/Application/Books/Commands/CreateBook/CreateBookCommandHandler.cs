using Application.Interfaces.Persistance;
using Contracts.Books;
using MapsterMapper;
using MediatR;

namespace Application.Books.Commands.CreateBook;

internal class CreateBookCommandHandler : IRequestHandler<CreateBookCommand, CreateBookResponse>
{
    private readonly IBookRepository _bookRepository;
    private readonly IMapper _mapper;

    public CreateBookCommandHandler(IBookRepository bookRepository, IMapper mapper)
    {
        _bookRepository = bookRepository;
        _mapper = mapper;
    }

    public Task<CreateBookResponse> Handle(CreateBookCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}