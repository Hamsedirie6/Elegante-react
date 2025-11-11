namespace RestRoutes;

public static class ContentTypeAliases
{
    private static readonly Dictionary<string, string> MAP = new(StringComparer.OrdinalIgnoreCase)
    {
        // Menu
        ["menu"] = "MenuItem",
        ["menus"] = "MenuItem",
        ["menuitem"] = "MenuItem",

        // Booking / Reservation
        ["booking"] = "Booking",
        ["bookings"] = "Booking",
        ["reservation"] = "Booking",
        ["reservations"] = "Booking",

        // Order
        ["order"] = "Order",
        ["orders"] = "Order",
    };

    public static string Canonicalize(string contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType)) return contentType;
        var key = contentType.Trim();
        if (MAP.TryGetValue(key, out var canonical)) return canonical;
        // Fallback: TitleCase first letter to match common Orchard naming, otherwise pass-through
        return char.IsLetter(key[0]) ? char.ToUpperInvariant(key[0]) + key.Substring(1) : key;
    }
}

