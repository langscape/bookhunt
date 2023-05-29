using Application.Books.Commands.CreateBook;
using Contracts.Books;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ISender _mediator;

        public BooksController(
            IMapper mapper,
            ISender mediator)
        {
            _mapper = mapper;
            _mediator = mediator;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(Guid id)
        {
            return Ok(id);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBook(CreateBookRequest request)
        {
            var command = _mapper.Map<CreateBookCommand>(request);

            var response = await _mediator.Send(command);

            return Ok(response);
        }
    }
}