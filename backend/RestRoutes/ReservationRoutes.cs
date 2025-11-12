namespace RestRoutes;

using Microsoft.AspNetCore.Mvc;

public static class ReservationRoutes
{
    public static void MapReservationRoutes(this WebApplication app)
    {
        app.MapGet("api/my/reservations", async (
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            if (context.User?.Identity?.IsAuthenticated != true)
            {
                return Results.Json(new { error = "Unauthorized" }, statusCode: 401);
            }

            var owner = context.User.Identity!.Name ?? string.Empty;
            var contentType = ContentTypeAliases.Canonicalize("reservations");
            var items = await GetRoutes.FetchCleanContent(contentType, session, populate: false, owner: owner);
            return Results.Json(items ?? new List<Dictionary<string, object>>());
        });
    }
}

