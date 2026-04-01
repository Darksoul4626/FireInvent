type ValidationErrorBag = Record<string, string[] | undefined>;

type ProblemLike = {
    title?: unknown;
    detail?: unknown;
    code?: unknown;
    extensions?: { code?: unknown };
    errors?: unknown;
};

export type ParsedApiError = {
    message: string;
    fieldErrors: string[];
    code?: string;
};

function asString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseValidationErrors(value: unknown): string[] {
    if (!value || typeof value !== "object") {
        return [];
    }

    const bag = value as ValidationErrorBag;
    const lines: string[] = [];

    for (const [field, entries] of Object.entries(bag)) {
        if (!Array.isArray(entries) || entries.length === 0) {
            continue;
        }

        const fieldName = field === "$" ? "allgemein" : field;
        for (const entry of entries) {
            if (typeof entry === "string" && entry.trim().length > 0) {
                lines.push(`${fieldName}: ${entry.trim()}`);
            }
        }
    }

    return lines;
}

export async function parseApiError(response: Response, fallbackMessage: string): Promise<ParsedApiError> {
    const payload = (await response.json().catch(() => null)) as ProblemLike | null;
    if (!payload || typeof payload !== "object") {
        return { message: `${fallbackMessage} (${response.status}).`, fieldErrors: [] };
    }

    const detail = asString(payload.detail);
    const title = asString(payload.title);
    const code = asString(payload.code) ?? asString(payload.extensions?.code);
    const fieldErrors = parseValidationErrors(payload.errors);

    let message = detail ?? title ?? `${fallbackMessage} (${response.status}).`;
    if (code) {
        message = `${message} [${code}]`;
    }

    return { message, fieldErrors, code };
}
