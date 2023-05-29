using Application.Common;

namespace Api.Common;

public static class DependencyInjection
{
    public static IServiceCollection AddApi(this IServiceCollection services)
    {
        services.AddApplication();
        return services;
    }
}