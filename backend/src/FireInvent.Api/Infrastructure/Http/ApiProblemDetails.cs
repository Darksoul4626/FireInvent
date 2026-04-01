using Microsoft.AspNetCore.Mvc;

namespace FireInvent.Api.Infrastructure.Http;

public static class ApiProblemDetails
{
    public static ProblemDetails Validation(string detail) =>
        Create(StatusCodes.Status400BadRequest, "Validation failed", detail, "validation_failed");

    public static ProblemDetails InternalError(string detail) =>
        Create(StatusCodes.Status500InternalServerError, "Unexpected server error", detail, "internal_error");

    public static ProblemDetails NotFound(string title, string detail, string code = "not_found") =>
        Create(StatusCodes.Status404NotFound, title, detail, code);

    public static ProblemDetails Conflict(string title, string detail, string code) =>
        Create(StatusCodes.Status409Conflict, title, detail, code);

    private static ProblemDetails Create(int status, string title, string detail, string code)
    {
        return new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = status,
            Extensions = { ["code"] = code }
        };
    }
}