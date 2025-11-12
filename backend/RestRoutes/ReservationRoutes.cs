namespace RestRoutes;

using Microsoft.AspNetCore.Mvc;

public static class ReservationRoutes
{
    public static void MapReservationRoutes(this WebApplication app)
    {
        // Return only the current user's reservations (owner-filtered, clean, not populated)
        app.MapGet("api/my/reservations", async (
            [FromServices] YesSql.ISession session,
            HttpContext context) =>
        {
            if (context.User?.Identity?.IsAuthenticated != true)
            {
                return Results.Json(new { error = "Unauthorized" }, statusCode: 401);
            }

            var contentType = ContentTypeAliases.Canonicalize("reservations");
            var owner = context.User.Identity!.Name ?? string.Empty;
            var results = await GetRoutes.FetchCleanContent(contentType, session, populate: false, owner: owner);
            return Results.Json(results ?? new List<Dictionary<string, object>>());
        });
    }
}

