using Application.Books.Commands.CreateBook;
using Contracts.Books;
using Mapster;

namespace Api.Common.Mapping;

public class BookMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<CreateBookRequest, CreateBookCommand>();
    }
}