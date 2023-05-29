namespace Domain.Models;

public abstract class Entity<TId>
    where TId : notnull
{
    public TId Id { get; set; }

    public Entity(TId id)
    {
        Id = id;
    }
}