using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(Guid id)
        {
            return Ok(id);
        }
    }
}